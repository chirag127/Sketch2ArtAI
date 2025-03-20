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
import axios from "axios";
import { API_URL } from "../env";
import Markdown from "react-native-markdown-display";
import * as FileSystem from "expo-file-system";

export default function HistoryScreen({ navigation }) {
    const { userToken, userInfo } = useContext(AuthContext);

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            // console.log("Fetching history from:", `${API_URL}/history`);
            const response = await axios.get(`${API_URL}/history`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            // console.log("History data received:", response.data);
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching history:", error);
            Alert.alert("Error", "Failed to fetch history. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
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
        fetchHistory();
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
            Alert.alert("Success", "History item deleted successfully");
        } catch (error) {
            console.error("Error deleting history item:", error);
            Alert.alert("Error", "Failed to delete history item");
        }
    };

    const confirmDelete = (id) => {
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

            Alert.alert("Success", `Image saved to ${uri}`);
            return uri;
        } catch (error) {
            console.error("Error downloading image:", error);
            Alert.alert("Error", "Failed to download image");
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
            Alert.alert("Error", "Failed to share image");
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

        // Find the history item to check its current status
        const historyItem = history.find((item) => item._id === id);
        if (!historyItem) {
            Alert.alert("Error", "Item not found in your history");
            return;
        }

        const isInFeed = historyItem.isSharedToFeed;
        const action = isInFeed ? "remove from" : "share to";

        try {
            // Simple alert to confirm the function is running
            Alert.alert("Processing", `Attempting to ${action} feed...`);

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

            // Refresh the history list
            fetchHistory();
        } catch (error) {
            console.error("Error in toggleFeedStatus function:", error);
            console.error("Error details:", error.response?.data);

            // Show a simple error message
            const errorAction = isInFeed ? "remove from" : "share to";
            Alert.alert(
                "Error",
                `Failed to ${errorAction} feed. Please try again.`
            );
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
                        </View>

                        <View style={styles.imageWrapper}>
                            <Text style={styles.imageLabel}>Converted</Text>
                            <Image
                                source={{ uri: item.convertedImageUrl }}
                                style={styles.detailImage}
                                resizeMode="contain"
                            />
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
                            onPress={() => {
                                console.log("Toggle Feed button pressed");
                                Alert.alert(
                                    "Button Pressed",
                                    item.isSharedToFeed
                                        ? "Removing from feed..."
                                        : "Sharing to feed..."
                                );
                                toggleFeedStatus(item._id);
                            }}
                        >
                            <Text style={styles.actionButtonText}>
                                {item.isSharedToFeed
                                    ? "Remove from Feed"
                                    : "Share to Feed"}
                            </Text>
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

    return (
        <View style={styles.container}>
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

            {history.length === 0 ? (
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
                <FlatList
                    data={history}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            )}
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
        marginBottom: 10,
    },
    downloadButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: "center",
    },
    downloadButtonText: {
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
});
