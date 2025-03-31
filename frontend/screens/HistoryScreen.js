import React, { useState, useEffect, useCallback, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Share,
    Platform,
} from "react-native";
import { showAlert, showDeleteConfirmDialog } from "../utils/dialog";
import axios from "axios";
import { API_URL } from "../env";
import Markdown from "react-native-markdown-display";
import * as FileSystem from "expo-file-system";
import ConversionModal from "../components/ConversionModal";

export default function HistoryScreen({ navigation }) {
    const { userToken, userInfo } = useContext(AuthContext);

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loadingItemId, setLoadingItemId] = useState(null); // Track which item is being processed
    const [conversionModalVisible, setConversionModalVisible] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [imageToConvert, setImageToConvert] = useState(null); // URL of the image to convert
    const [imageType, setImageType] = useState(null); // 'original' or 'converted'
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreItems, setHasMoreItems] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchHistory = async (page = 1, append = false) => {
        try {
            if (page === 1) {
                setLoading(true);
            } else if (append) {
                setLoadingMore(true);
            }

            console.log(
                `Fetching history page ${page} from: ${API_URL}/history`
            );
            const response = await axios.get(`${API_URL}/history`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                params: {
                    page,
                    limit: 10,
                },
            });

            console.log("History data received:", response.data);

            // Update state based on whether we're appending or replacing
            if (append) {
                setHistory((prevHistory) => [
                    ...prevHistory,
                    ...response.data.history,
                ]);
            } else {
                setHistory(response.data.history);
            }

            // Update pagination state
            setCurrentPage(page);
            setHasMoreItems(response.data.pagination.hasMore);
        } catch (error) {
            console.error("Error fetching history:", error);
            if (Platform.OS === "web") {
                showAlert(
                    "Error",
                    "Failed to fetch history. Please try again."
                );
            } else {
                Alert.alert(
                    "Error",
                    "Failed to fetch history. Please try again."
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    // Fetch history when component mounts
    useEffect(() => {
        fetchHistory();
    }, []);

    // Fetch history when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log("History screen focused - refreshing data");
            fetchHistory();
            return () => {
                // Cleanup function when screen loses focus (optional)
                console.log("History screen unfocused");
            };
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        fetchHistory(1, false);
    };

    // Function to load more history items
    const loadMoreHistory = () => {
        if (hasMoreItems && !loadingMore) {
            const nextPage = currentPage + 1;
            fetchHistory(nextPage, true);
        }
    };

    const deleteHistoryItem = async (id) => {
        try {
            console.log("Deleting history item with ID:", id);
            await axios.delete(`${API_URL}/history/${id}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            setHistory(history.filter((item) => item._id !== id));
            if (Platform.OS === "web") {
                showAlert("Success", "History item deleted successfully");
            } else {
                Alert.alert("Success", "History item deleted successfully");
            }
        } catch (error) {
            console.error("Error deleting history item:", error);
            if (Platform.OS === "web") {
                showAlert("Error", "Failed to delete history item");
            } else {
                Alert.alert("Error", "Failed to delete history item");
            }
        }
    };

    const confirmDelete = (id) => {
        if (Platform.OS === "web") {
            showDeleteConfirmDialog(
                "Confirm Delete",
                "Are you sure you want to delete this item?",
                () => deleteHistoryItem(id)
            );
        } else {
            Alert.alert(
                "Confirm Delete",
                "Are you sure you want to delete this item?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        onPress: () => deleteHistoryItem(id),
                        style: "destructive",
                    },
                ]
            );
        }
    };

    const downloadImage = async (url, filename) => {
        if (Platform.OS === "web") {
            // For web, open the image in a new tab
            window.open(url, "_blank");
            return;
        }

        try {
            const localUri = FileSystem.documentDirectory + filename;
            const { uri } = await FileSystem.downloadAsync(url, localUri);

            if (Platform.OS === "web") {
                showAlert("Success", `Image saved to ${uri}`);
            } else {
                Alert.alert("Success", `Image saved to ${uri}`);
            }
            return uri;
        } catch (error) {
            console.error("Error downloading image:", error);
            if (Platform.OS === "web") {
                showAlert("Error", "Failed to download image");
            } else {
                Alert.alert("Error", "Failed to download image");
            }
            return null;
        }
    };

    const shareImage = async (url, text) => {
        try {
            if (Platform.OS === "web") {
                // For web, open the image in a new tab
                window.open(url, "_blank");
                return;
            }

            // For native platforms, download and share
            const filename = `sketch2art_${Date.now()}.png`;
            const uri = await downloadImage(url, filename);

            if (uri) {
                await Share.share({
                    url: uri,
                    message: text || "Check out this image from Sketch2ArtAI!",
                });
            }
        } catch (error) {
            console.error("Error sharing image:", error);
            if (Platform.OS === "web") {
                showAlert("Error", "Failed to share image");
            } else {
                Alert.alert("Error", "Failed to share image");
            }
        }
    };

    const toggleItemDetails = (item) => {
        setSelectedItem(
            selectedItem && selectedItem._id === item._id ? null : item
        );
    };

    const toggleFeedStatus = async (id) => {
        console.log("toggleFeedStatus function called with id:", id);

        if (!userToken) {
            console.log("No user token available");
            Alert.alert("Error", "You must be logged in to manage feed items");
            return;
        }

        // Set loading state for this item
        setLoadingItemId(id);

        // Find the history item to check its current status
        const historyItem = history.find((item) => item._id === id);
        if (!historyItem) {
            Alert.alert("Error", "Item not found in your history");
            setLoadingItemId(null);
            return;
        }

        const isInFeed = historyItem.isSharedToFeed;
        const action = isInFeed ? "remove from" : "share to";

        try {
            console.log(`Attempting to ${action} feed for item ${id}`);

            let response;

            if (isInFeed) {
                // First, we need to get the feed item ID
                console.log(
                    "Fetching feed items to find the corresponding feed item ID"
                );
                const feedResponse = await axios.get(`${API_URL}/feed`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                });

                console.log(
                    "Feed items fetched, searching for matching history item"
                );
                console.log("Feed data:", feedResponse.data);

                // Find the feed item that references this history item
                console.log(
                    "Looking for feed item with historyItem matching:",
                    id
                );
                let feedItem = null;

                // Loop through feed items to find a match
                for (const item of feedResponse.data) {
                    console.log(
                        `Checking feed item: ${item._id}, historyItem: ${item.historyItem}`
                    );
                    if (
                        item.historyItem === id ||
                        item.historyItem._id === id
                    ) {
                        feedItem = item;
                        console.log("Found matching feed item!");
                        break;
                    }
                }

                if (!feedItem) {
                    console.error(
                        "Could not find feed item for history item:",
                        id
                    );

                    // Try a different approach - look through all feed items
                    console.log(
                        "Trying alternative approach to find feed item"
                    );

                    // Make a direct API call to remove the item using the history ID
                    console.log(
                        `Attempting direct removal with history ID: ${API_URL}/feed/byhistory/${id}`
                    );
                    response = await axios({
                        method: "delete",
                        url: `${API_URL}/feed/byhistory/${id}`,
                        headers: {
                            Authorization: `Bearer ${userToken}`,
                            "Content-Type": "application/json",
                        },
                    });
                } else {
                    const feedItemId = feedItem._id;
                    console.log(`Found feed item ID: ${feedItemId}`);
                    console.log(
                        `API URL for removal: ${API_URL}/feed/${feedItemId}`
                    );

                    // Now remove the feed item using its ID
                    response = await axios({
                        method: "delete",
                        url: `${API_URL}/feed/${feedItemId}`,
                        headers: {
                            Authorization: `Bearer ${userToken}`,
                            "Content-Type": "application/json",
                        },
                    });
                }
            } else {
                // If not in feed, add it
                console.log(`API URL for sharing: ${API_URL}/feed/share/${id}`);
                response = await axios({
                    method: "post",
                    url: `${API_URL}/feed/share/${id}`,
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "application/json",
                    },
                });
            }

            console.log("API call completed");
            console.log("Response status:", response.status);
            console.log("Response data:", response.data);

            // Show success message
            const successMessage = isInFeed
                ? "Item removed from public feed successfully"
                : "Item shared to public feed successfully";
            Alert.alert("Success", successMessage);

            // Update the local state instead of fetching from server again
            setHistory((prevHistory) => {
                return prevHistory.map((histItem) => {
                    if (histItem._id === id) {
                        // Toggle the isSharedToFeed status
                        return { ...histItem, isSharedToFeed: !isInFeed };
                    }
                    return histItem;
                });
            });
        } catch (error) {
            console.error("Error in toggleFeedStatus function:", error);
            console.error("Error details:", error.response?.data);

            // Show a simple error message
            const errorAction = isInFeed ? "remove from" : "share to";
            Alert.alert(
                "Error",
                `Failed to ${errorAction} feed. Please try again.`
            );

            // Keep the selected item expanded
            if (selectedItem && selectedItem._id === id) {
                // Make sure the selected item stays selected
                console.log("Keeping item expanded after error");
            }
        } finally {
            // Clear loading state
            setLoadingItemId(null);
        }
    };

    // No additional handler functions needed as we're directly using toggleFeedStatus

    const renderHistoryItem = ({ item }) => (
        <View style={styles.historyItem}>
            <TouchableOpacity
                style={styles.historyItemHeader}
                onPress={() => toggleItemDetails(item)}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.convertedImageUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.historyItemInfo}>
                    <Text style={styles.historyItemTitle}>
                        {item.style} Style
                    </Text>
                    <Text style={styles.historyItemDate}>
                        {new Date(item.createdAt).toLocaleString()}
                    </Text>
                </View>
            </TouchableOpacity>

            {selectedItem && selectedItem._id === item._id && (
                <View style={styles.historyItemDetails}>
                    <View style={styles.imagesContainer}>
                        <View style={styles.imageWrapper}>
                            <Text style={styles.imageLabel}>Original</Text>
                            <Image
                                source={{ uri: item.originalImageUrl }}
                                style={styles.detailImage}
                                resizeMode="contain"
                            />
                            <View style={styles.imageButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.downloadButton}
                                    onPress={() =>
                                        downloadImage(
                                            item.originalImageUrl,
                                            `original_${Date.now()}.png`
                                        )
                                    }
                                >
                                    <Text style={styles.downloadButtonText}>
                                        Download
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.convertButton}
                                    onPress={() =>
                                        handleOpenConversionModal(
                                            item.originalImageUrl,
                                            "original"
                                        )
                                    }
                                >
                                    <Text style={styles.convertButtonText}>
                                        Convert Again
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.imageWrapper}>
                            <Text style={styles.imageLabel}>Converted</Text>
                            <Image
                                source={{ uri: item.convertedImageUrl }}
                                style={styles.detailImage}
                                resizeMode="contain"
                            />
                            <View style={styles.imageButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.downloadButton}
                                    onPress={() =>
                                        downloadImage(
                                            item.convertedImageUrl,
                                            `converted_${Date.now()}.png`
                                        )
                                    }
                                >
                                    <Text style={styles.downloadButtonText}>
                                        Download
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.convertButton}
                                    onPress={() =>
                                        handleOpenConversionModal(
                                            item.convertedImageUrl,
                                            "converted"
                                        )
                                    }
                                >
                                    <Text style={styles.convertButtonText}>
                                        Convert Again
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {item.prompt && (
                        <View style={styles.promptContainer}>
                            <Text style={styles.promptLabel}>Prompt:</Text>
                            <Text style={styles.promptText}>{item.prompt}</Text>
                        </View>
                    )}

                    {item.responseText && (
                        <View style={styles.responseContainer}>
                            <Text style={styles.responseLabel}>
                                AI Response:
                            </Text>
                            <View style={styles.markdownContainer}>
                                <Markdown>{item.responseText}</Markdown>
                            </View>
                        </View>
                    )}

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.shareButton]}
                            onPress={() =>
                                shareImage(
                                    item.convertedImageUrl,
                                    item.responseText
                                )
                            }
                        >
                            <Text style={styles.actionButtonText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.feedButtonLarge,
                                item.isSharedToFeed
                                    ? styles.removeFromFeedButton
                                    : styles.feedButton,
                            ]}
                            activeOpacity={0.5}
                            disabled={loadingItemId === item._id}
                            onPress={() => {
                                console.log("Toggle Feed button pressed");
                                toggleFeedStatus(item._id);
                            }}
                        >
                            {loadingItemId === item._id ? (
                                <>
                                    <ActivityIndicator
                                        color="white"
                                        size="small"
                                    />
                                    <Text
                                        style={[
                                            styles.actionButtonText,
                                            styles.loadingText,
                                        ]}
                                    >
                                        {item.isSharedToFeed
                                            ? "Removing..."
                                            : "Sharing..."}
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.actionButtonText}>
                                    {item.isSharedToFeed
                                        ? "Remove from Feed"
                                        : "Share to Feed"}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => confirmDelete(item._id)}
                        >
                            <Text style={styles.actionButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Loading history...</Text>
            </View>
        );
    }

    // Function to handle opening the conversion modal
    const handleOpenConversionModal = (imageUrl, type) => {
        setImageToConvert(imageUrl);
        setImageType(type);
        setConversionModalVisible(true);
    };

    // Function to split custom prompt by line breaks and commas
    const splitCustomPrompt = (prompt) => {
        if (!prompt || !prompt.trim()) return [];

        // First split by line breaks
        const lineSegments = prompt.split(/\r?\n/);

        // Then split each line by commas and flatten the array
        const allSegments = lineSegments.flatMap((line) => {
            // Skip empty lines
            if (!line.trim()) return [];
            // Split by comma and trim each segment
            return line
                .split(",")
                .map((segment) => segment.trim())
                .filter((segment) => segment);
        });

        return allSegments;
    };

    // Function to handle the conversion
    const handleConvertImage = async (style, customPrompt) => {
        if (!imageToConvert) return;

        setIsConverting(true);

        // Check if we need to process multiple prompts
        const prompts = splitCustomPrompt(customPrompt);
        const hasMultiplePrompts = prompts.length > 0;

        if (hasMultiplePrompts) {
            try {
                // Show a message to the user
                if (Platform.OS === "web") {
                    showAlert(
                        "Processing Multiple Prompts",
                        `Converting your image with ${prompts.length} different prompts. This may take a while.`
                    );
                } else {
                    Alert.alert(
                        "Processing Multiple Prompts",
                        `Converting your image with ${prompts.length} different prompts. This may take a while.`
                    );
                }

                // Process each prompt
                let successCount = 0;
                for (const prompt of prompts) {
                    console.log(`Converting with prompt: "${prompt}"`);
                    await processConversion(style, prompt);
                    successCount++;
                    // Small delay to avoid overwhelming the server
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                // Show completion message
                if (Platform.OS === "web") {
                    showAlert(
                        "Conversion Complete",
                        `Successfully converted with ${successCount} out of ${prompts.length} prompts. Check your history.`
                    );
                } else {
                    Alert.alert(
                        "Conversion Complete",
                        `Successfully converted with ${successCount} out of ${prompts.length} prompts. Check your history.`
                    );
                }

                // Close modal and refresh history
                setConversionModalVisible(false);
                fetchHistory();
            } catch (error) {
                console.error("Error processing multiple prompts:", error);
                if (Platform.OS === "web") {
                    showAlert("Error", "Failed to process all prompts");
                } else {
                    Alert.alert("Error", "Failed to process all prompts");
                }
            } finally {
                setIsConverting(false);
            }
            return;
        }

        // If no multiple prompts, process normally
        await processConversion(style, customPrompt);
    };

    // Function to process a single conversion
    const processConversion = async (style, customPrompt) => {
        // Check if "Custom Prompt Only" is selected but no prompt is provided
        if (style === "Custom Prompt Only" && !customPrompt.trim()) {
            if (Platform.OS === "web") {
                showAlert(
                    "Custom Prompt Required",
                    "Please enter a custom prompt when 'Custom Prompt Only' style is selected"
                );
            } else {
                Alert.alert(
                    "Custom Prompt Required",
                    "Please enter a custom prompt when 'Custom Prompt Only' style is selected"
                );
            }
            return false;
        }
        try {
            // Create form data
            const formData = new FormData();

            // For web platform, we need to handle base64 data
            if (Platform.OS === "web") {
                // Fetch the image and convert to base64
                const response = await fetch(imageToConvert);
                const blob = await response.blob();

                const reader = new FileReader();
                reader.readAsDataURL(blob);

                await new Promise((resolve) => {
                    reader.onloadend = () => {
                        // Get base64 data without the prefix
                        const base64data = reader.result.split(",")[1];
                        formData.append("base64Data", base64data);
                        formData.append("mimeType", blob.type);
                        resolve();
                    };
                });
            } else {
                // For native platforms, download the image first
                const filename = `temp_${Date.now()}.png`;
                const localUri = FileSystem.documentDirectory + filename;
                await FileSystem.downloadAsync(imageToConvert, localUri);

                // Append the file to form data
                formData.append("sketch", {
                    uri: localUri,
                    name: filename,
                    type: "image/png",
                });
            }

            // Add style and custom prompt
            formData.append("style", style);
            if (customPrompt.trim()) {
                formData.append("customPrompt", customPrompt.trim());
            }

            // Send to backend
            const response = await axios.post(API_URL + "/convert", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (response.data && response.data.success) {
                // For single prompt conversions, show success message and close modal
                if (!splitCustomPrompt(customPrompt).length) {
                    // Close modal and refresh history
                    setConversionModalVisible(false);
                    fetchHistory();

                    if (Platform.OS === "web") {
                        showAlert("Success", "Image converted successfully");
                    } else {
                        Alert.alert("Success", "Image converted successfully");
                    }
                }
                return true;
            } else {
                if (Platform.OS === "web") {
                    showAlert("Error", "Failed to convert image");
                } else {
                    Alert.alert("Error", "Failed to convert image");
                }
                return false;
            }
        } catch (error) {
            console.error("Error converting image:", error);
            if (Platform.OS === "web") {
                showAlert("Error", "Failed to convert image");
            } else {
                Alert.alert("Error", "Failed to convert image");
            }
            return false;
        } finally {
            // Only set isConverting to false if we're not in a batch process
            if (!splitCustomPrompt(customPrompt).length) {
                setIsConverting(false);
            }
        }
    };

    const renderAdminButtons = () => {
        if (userInfo?.isAdmin) {
            return (
                <View style={styles.adminButtonsContainer}>
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => navigation.navigate("AdminHistory")}
                    >
                        <Text style={styles.adminButtonText}>
                            View All Users' History
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => navigation.navigate("AdminCredits")}
                    >
                        <Text style={styles.adminButtonText}>
                            Manage User Credits
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {renderAdminButtons()}
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Conversion History</Text>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => {
                        console.log("Test button pressed");
                        Alert.alert("Test", "Button click is working!");
                    }}
                >
                    <Text style={styles.testButtonText}>Test</Text>
                </TouchableOpacity>

                {userInfo && userInfo.isAdmin && (
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => navigation.navigate("AdminHistory")}
                    >
                        <Text style={styles.adminButtonText}>Admin View</Text>
                    </TouchableOpacity>
                )}
            </View>

            {history.length === 0 && !loading ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No history found</Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={handleRefresh}
                    >
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={history}
                        renderItem={renderHistoryItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContainer}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        onEndReached={loadMoreHistory}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={() =>
                            hasMoreItems ? (
                                <View style={styles.loadMoreContainer}>
                                    {loadingMore ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#4a90e2"
                                        />
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.loadMoreButton}
                                            onPress={loadMoreHistory}
                                        >
                                            <Text
                                                style={
                                                    styles.loadMoreButtonText
                                                }
                                            >
                                                Load More
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : null
                        }
                    />
                </>
            )}

            {/* Conversion Modal */}
            <ConversionModal
                visible={conversionModalVisible}
                onClose={() => setConversionModalVisible(false)}
                onConvert={handleConvertImage}
                isConverting={isConverting}
                imageType={imageType}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginTop: 40,
        marginBottom: 20,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        position: "relative",
    },
    adminButton: {
        position: "absolute",
        right: 0,
        backgroundColor: "#ff6b6b",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    adminButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    testButton: {
        position: "absolute",
        left: 0,
        backgroundColor: "#4CAF50",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    testButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 18,
        color: "#666",
        marginBottom: 20,
    },
    refreshButton: {
        backgroundColor: "#4a90e2",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    refreshButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    listContainer: {
        paddingBottom: 20,
    },
    historyItem: {
        backgroundColor: "white",
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden",
        elevation: 2,
        boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
    },
    historyItemHeader: {
        flexDirection: "row",
        padding: 15,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 5,
        overflow: "hidden",
        marginRight: 15,
    },
    thumbnail: {
        width: "100%",
        height: "100%",
    },
    historyItemInfo: {
        flex: 1,
        justifyContent: "center",
    },
    historyItemTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    historyItemDate: {
        fontSize: 14,
        color: "#666",
    },
    historyItemDetails: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    imagesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    imageWrapper: {
        width: "48%",
    },
    imageLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        marginBottom: 5,
    },
    detailImage: {
        width: "100%",
        height: 150,
        borderRadius: 5,
        marginBottom: 5,
    },
    imageButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    downloadButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: "center",
        flex: 1,
        marginRight: 5,
    },
    downloadButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    convertButton: {
        backgroundColor: "#9c27b0",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: "center",
        flex: 1,
        marginLeft: 5,
    },
    convertButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    promptContainer: {
        marginBottom: 15,
    },
    promptLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        marginBottom: 5,
    },
    promptText: {
        fontSize: 14,
        color: "#333",
    },
    responseContainer: {
        marginBottom: 15,
    },
    responseLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        marginBottom: 5,
    },
    markdownContainer: {
        backgroundColor: "#f9f9f9",
        borderRadius: 5,
        padding: 10,
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: "center",
        width: "31%",
        marginBottom: 8,
    },
    shareButton: {
        backgroundColor: "#4a90e2",
    },
    feedButton: {
        backgroundColor: "#9c27b0",
    },
    feedButtonLarge: {
        padding: 15,
        marginVertical: 5,
        ...(Platform.OS === "web" && {
            minWidth: 150,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        }),
    },
    feedButtonDisabled: {
        backgroundColor: "#d0a6e0",
        opacity: 0.7,
    },
    removeFromFeedButton: {
        backgroundColor: "#ff9800", // Orange color for remove action
    },
    deleteButton: {
        backgroundColor: "#f44336",
    },
    actionButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    loadingText: {
        marginTop: 5,
        fontSize: 12,
    },
    loadMoreContainer: {
        paddingVertical: 20,
        alignItems: "center",
    },
    loadMoreButton: {
        backgroundColor: "#4a90e2",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    loadMoreButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    adminButtonsContainer: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-around",
        flexWrap: "wrap",
        gap: 10,
    },
    adminButton: {
        backgroundColor: "#4a90e2",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 2,
    },
    adminButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});
