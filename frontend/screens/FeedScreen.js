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
    Dimensions,
} from "react-native";
import axios from "axios";
import { API_URL } from "../env";
import Markdown from "react-native-markdown-display";
import * as FileSystem from "expo-file-system";

const isDesktop = Platform.OS === "web" && Dimensions.get("window").width > 768;

export default function FeedScreen({ navigation }) {
    const { userToken, userInfo } = useContext(AuthContext);

    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            console.log(`Fetching feed from: ${API_URL}/feed`);
            const response = await axios.get(`${API_URL}/feed`);
            console.log("Feed data received:", response.data);
            setFeed(response.data);
        } catch (error) {
            console.error("Error fetching feed:", error);
            console.error("Error details:", error.response?.data);
            Alert.alert("Error", "Failed to fetch feed. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch feed when component mounts
    useEffect(() => {
        console.log("FeedScreen mounted - fetching feed data");
        fetchFeed();
    }, []);

    // Fetch feed when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log("Feed screen focused - refreshing data");
            fetchFeed();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchFeed();
    };

    const downloadImage = async (url, filename) => {
        try {
            if (Platform.OS === "web") {
                return url; // On web, just return the URL
            }

            const fileUri = `${FileSystem.documentDirectory}${filename}`;
            const downloadResult = await FileSystem.downloadAsync(url, fileUri);

            if (downloadResult.status === 200) {
                return fileUri;
            } else {
                throw new Error("Download failed");
            }
        } catch (error) {
            console.error("Error downloading image:", error);
            throw error;
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

    const removeFromFeed = async (id) => {
        if (!userToken) {
            Alert.alert(
                "Error",
                "You must be logged in to remove items from the feed"
            );
            return;
        }

        try {
            const response = await axios.delete(`${API_URL}/feed/${id}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (response.data.success) {
                Alert.alert("Success", "Item removed from feed successfully");
                fetchFeed(); // Refresh the feed
            }
        } catch (error) {
            console.error("Error removing from feed:", error);
            Alert.alert(
                "Error",
                error.response?.data?.error || "Failed to remove item from feed"
            );
        }
    };

    const renderFeedItem = ({ item }) => {
        const userEmail = item.user ? item.user.email : "Unknown User";
        const canRemove =
            userInfo &&
            (userInfo.isAdmin || (item.user && item.user._id === userInfo.id));

        return (
            <View
                style={[styles.feedItem, isDesktop && styles.desktopFeedItem]}
            >
                <TouchableOpacity
                    style={styles.feedItemHeader}
                    onPress={() => toggleItemDetails(item)}
                >
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.convertedImageUrl }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={styles.feedItemInfo}>
                        <Text style={styles.feedItemTitle}>
                            {item.style} Style
                        </Text>
                        <Text style={styles.feedItemDate}>
                            {new Date(item.createdAt).toLocaleString()}
                        </Text>
                        <Text style={styles.feedItemUser}>By: {userEmail}</Text>
                    </View>
                </TouchableOpacity>

                {selectedItem && selectedItem._id === item._id && (
                    <View style={styles.detailsContainer}>
                        <View style={styles.imagesContainer}>
                            <View style={styles.imageWrapper}>
                                <Text style={styles.imageLabel}>Original</Text>
                                <Image
                                    source={{ uri: item.originalImageUrl }}
                                    style={styles.detailImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.imageWrapper}>
                                <Text style={styles.imageLabel}>Converted</Text>
                                <Image
                                    source={{ uri: item.convertedImageUrl }}
                                    style={styles.detailImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        {item.prompt && (
                            <View style={styles.promptContainer}>
                                <Text style={styles.promptLabel}>Prompt:</Text>
                                <Text style={styles.promptText}>
                                    {item.prompt}
                                </Text>
                            </View>
                        )}

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() =>
                                    shareImage(
                                        item.convertedImageUrl,
                                        `Check out this ${item.style} style art created with Sketch2ArtAI!`
                                    )
                                }
                            >
                                <Text style={styles.actionButtonText}>
                                    Share
                                </Text>
                            </TouchableOpacity>

                            {canRemove && (
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.deleteButton,
                                    ]}
                                    onPress={() => {
                                        Alert.alert(
                                            "Remove from Feed",
                                            "Are you sure you want to remove this item from the public feed?",
                                            [
                                                {
                                                    text: "Cancel",
                                                    style: "cancel",
                                                },
                                                {
                                                    text: "Remove",
                                                    onPress: () =>
                                                        removeFromFeed(
                                                            item._id
                                                        ),
                                                    style: "destructive",
                                                },
                                            ]
                                        );
                                    }}
                                >
                                    <Text style={styles.actionButtonText}>
                                        Remove from Feed
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Loading feed...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Community Feed</Text>
            </View>

            {feed.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No items in the feed yet
                    </Text>
                    <Text style={styles.emptySubText}>
                        Be the first to share your creations!
                    </Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={handleRefresh}
                    >
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={feed}
                    renderItem={renderFeedItem}
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
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
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
        marginBottom: 10,
    },
    emptySubText: {
        fontSize: 16,
        color: "#888",
        marginBottom: 20,
        textAlign: "center",
    },
    refreshButton: {
        backgroundColor: "#4a90e2",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    refreshButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    listContainer: {
        paddingBottom: 20,
    },
    feedItem: {
        backgroundColor: "white",
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    desktopFeedItem: {
        maxWidth: 800,
        marginHorizontal: "auto",
    },
    feedItemHeader: {
        flexDirection: "row",
        padding: 15,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#f0f0f0",
    },
    thumbnail: {
        width: "100%",
        height: "100%",
    },
    feedItemInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: "center",
    },
    feedItemTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    feedItemDate: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    feedItemUser: {
        fontSize: 14,
        color: "#4a90e2",
    },
    detailsContainer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    imagesContainer: {
        flexDirection: isDesktop ? "row" : "column",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    imageWrapper: {
        flex: 1,
        marginBottom: 15,
        alignItems: "center",
    },
    imageLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    detailImage: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
    },
    promptContainer: {
        marginBottom: 15,
    },
    promptLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    promptText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    actionButton: {
        backgroundColor: "#4a90e2",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        minWidth: 100,
        alignItems: "center",
    },
    deleteButton: {
        backgroundColor: "#e74c3c",
    },
    actionButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
