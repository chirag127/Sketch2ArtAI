import React, { useState, useEffect } from "react";
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
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/history`);
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching history:", error);
            Alert.alert("Error", "Failed to fetch history. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const deleteHistoryItem = async (id) => {
        try {
            await axios.delete(`${API_URL}/history/${id}`);
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
            <Text style={styles.title}>Conversion History</Text>

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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: "center",
        width: "48%",
    },
    shareButton: {
        backgroundColor: "#4a90e2",
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
