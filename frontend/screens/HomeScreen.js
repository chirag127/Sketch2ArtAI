import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
    Alert,
    TextInput,
} from "react-native";
import * as ImagePickerExpo from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import {
    getFileInfo,
    getFileExtension,
    getMimeType,
    shareImage as platformShareImage,
} from "../utils/platformUtils";
import axios from "axios";

// Change this to your computer's IP address when testing on a physical device
// const API_URL = "http://10.0.2.2:5000/api"; // 10.0.2.2 is the special IP for Android emulator to access host

import { API_URL } from "../env";

export default function HomeScreen({ navigation, route }) {
    const [sketch, setSketch] = useState(null);
    const [convertedArt, setConvertedArt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [style, setStyle] = useState("Anime");
    const [customPrompt, setCustomPrompt] = useState("");

    // Handle sketch from Canvas screen
    useEffect(() => {
        if (route.params?.sketchUri) {
            setSketch(route.params.sketchUri);
            setConvertedArt(null);
            // Clear the route params to avoid setting the sketch again on re-render
            navigation.setParams({ sketchUri: undefined });
        }
    }, [route.params?.sketchUri]);

    const pickImage = async () => {
        try {
            const result = await ImagePickerExpo.launchImageLibraryAsync({
                mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSketch(result.assets[0].uri);
                setConvertedArt(null);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const takePhoto = async () => {
        try {
            const { status } =
                await ImagePickerExpo.requestCameraPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission needed",
                    "Camera permission is required"
                );
                return;
            }

            const result = await ImagePickerExpo.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSketch(result.assets[0].uri);
                setConvertedArt(null);
            }
        } catch (error) {
            console.error("Error taking photo:", error);
            Alert.alert("Error", "Failed to take photo");
        }
    };

    const convertSketch = async () => {
        if (!sketch) {
            Alert.alert("No sketch", "Please select or create a sketch first");
            return;
        }

        setLoading(true);

        try {
            // Create form data
            const formData = new FormData();

            // Get file info in a platform-compatible way
            const fileInfo = await getFileInfo(sketch);

            // Get file extension in a platform-compatible way
            const fileExtension = getFileExtension(sketch);
            const mimeType = getMimeType(fileExtension);

            // Handle data URIs for web platform
            if (Platform.OS === "web" && sketch.startsWith("data:")) {
                try {
                    // Extract the base64 data from the data URI
                    const dataUriParts = sketch.split(",");
                    const mimeMatch = dataUriParts[0].match(/:(.*?);/);
                    const mime = mimeMatch ? mimeMatch[1] : "image/png";
                    const base64Data = dataUriParts[1];

                    // For web, send base64 data directly
                    formData.append("base64Data", base64Data);
                    formData.append("mimeType", mime);

                    console.log("Sending base64 data directly (web platform)");
                } catch (error) {
                    console.error("Error processing data URI:", error);
                    throw new Error("Failed to process the sketch image");
                }
            } else {
                // For native platforms, use the normal approach
                formData.append("sketch", {
                    uri: sketch,
                    name: `sketch.${fileExtension}`,
                    type: mimeType,
                });

                console.log("Sending file data (native platform)");
            }

            formData.append("style", style);

            // Add custom prompt if provided
            if (customPrompt.trim()) {
                formData.append("customPrompt", customPrompt.trim());
            }

            console.log("Sending request to:", API_URL + "/convert");
            console.log("FormData keys:", [...formData.keys()]);

            // Send to backend
            const response = await axios.post(API_URL + "/convert", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data && response.data.imageData) {
                setConvertedArt(response.data.imageData);
            } else {
                Alert.alert("Error", "Failed to convert sketch");
            }
        } catch (error) {
            console.error("Error converting sketch:", error);

            // More detailed error logging
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);

                Alert.alert(
                    "Error",
                    `Failed to convert sketch: ${
                        error.response.status
                    } - ${JSON.stringify(error.response.data)}`
                );
            } else if (error.request) {
                // The request was made but no response was received
                console.error("Error request:", error.request);
                Alert.alert(
                    "Error",
                    "No response from server. Please check your connection."
                );
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error message:", error.message);
                Alert.alert(
                    "Error",
                    `Failed to convert sketch: ${error.message}`
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const shareImage = async () => {
        if (!convertedArt) {
            Alert.alert("No image", "Please convert a sketch first");
            return;
        }

        try {
            // Extract base64 data from the data URI
            const base64Data = convertedArt.split(",")[1];

            // Use our platform-specific sharing function
            await platformShareImage(convertedArt, base64Data);
        } catch (error) {
            console.error("Error sharing image:", error);
            Alert.alert("Error", "Failed to share image");
        }
    };

    const cleanupFiles = async () => {
        try {
            setLoading(true);
            // Get the base URL from the API_URL
            const baseUrl = API_URL;
            const cleanupUrl = `${baseUrl}/cleanup`;

            const response = await axios.post(cleanupUrl);

            if (response.data && response.data.success) {
                Alert.alert(
                    "Success",
                    "Temporary files cleaned up successfully"
                );
            } else {
                Alert.alert("Error", "Failed to clean up temporary files");
            }
        } catch (error) {
            console.error("Error cleaning up files:", error);
            Alert.alert("Error", "Failed to clean up temporary files");
        } finally {
            setLoading(false);
        }
    };

    const styleOptions = [
        "Cyberpunk Neon",
        "Watercolor Wash",
        "Retro Pixel Art",
        "Van Gogh Oil Painting",
        "Charcoal Sketch",
        "Impressionist",
        "Anime",
        "Pointillism",
        "Glitch Art",
        "Pop Art",
        "Steampunk Machinery",
        "Fantasy RPG",
        "Gothic Horror",
        "Sci-Fi Alien",
        "Surrealism",
        "Japanese Ukiyo-e",
        "Renaissance Fresco",
        "Aztec Carvings",
        "Art Deco",
        "Indian Miniature",
        "Modern Abstract",
        "Minimalism",
        "Expressionism",
        "Hyperrealism",
    ];

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Sketch2ArtAI</Text>
                <Text style={styles.subtitle}>
                    Transform your sketches into beautiful art
                </Text>

                <View style={styles.imageContainer}>
                    {sketch ? (
                        <Image source={{ uri: sketch }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, styles.placeholder]}>
                            <Text style={styles.placeholderText}>
                                No sketch selected
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={pickImage}>
                        <Text style={styles.buttonText}>Pick Sketch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={takePhoto}>
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.drawButton]}
                        onPress={() => navigation.navigate("Canvas")}
                    >
                        <Text style={styles.buttonText}>Draw Sketch</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Select Art Style</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.styleContainer}
                >
                    {styleOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.styleButton,
                                style === option && styles.selectedStyleButton,
                            ]}
                            onPress={() => setStyle(option)}
                        >
                            <Text
                                style={[
                                    styles.styleButtonText,
                                    style === option &&
                                        styles.selectedStyleButtonText,
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>
                    Custom Prompt (Optional)
                </Text>
                <View style={styles.customPromptContainer}>
                    <TextInput
                        style={styles.customPromptInput}
                        placeholder="Enter custom instructions for the AI..."
                        placeholderTextColor="#999"
                        value={customPrompt}
                        onChangeText={setCustomPrompt}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.convertButton,
                        !sketch && styles.disabledButton,
                    ]}
                    onPress={convertSketch}
                    disabled={!sketch || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.convertButtonText}>
                            {customPrompt.trim()
                                ? "Convert with Custom Prompt"
                                : `Convert to ${style}`}
                        </Text>
                    )}
                </TouchableOpacity>

                {convertedArt && (
                    <>
                        <Text style={styles.sectionTitle}>Converted Art</Text>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: convertedArt }}
                                style={styles.image}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={shareImage}
                        >
                            <Text style={styles.shareButtonText}>Share</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity
                    style={styles.cleanupButton}
                    onPress={cleanupFiles}
                >
                    <Text style={styles.cleanupButtonText}>
                        Clean Up Temporary Files
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginTop: 40,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 15,
        backgroundColor: "#e0e0e0",
    },
    placeholder: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#ccc",
        borderStyle: "dashed",
    },
    placeholderText: {
        color: "#999",
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        marginBottom: 30,
    },
    button: {
        backgroundColor: "#4a90e2",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 3,
        margin: 5,
    },
    drawButton: {
        backgroundColor: "#9c27b0",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        color: "#333",
    },
    styleContainer: {
        flexDirection: "row",
        marginBottom: 25,
    },
    styleButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: "#e0e0e0",
    },
    selectedStyleButton: {
        backgroundColor: "#4a90e2",
    },
    styleButtonText: {
        fontSize: 14,
        color: "#333",
    },
    selectedStyleButtonText: {
        color: "white",
        fontWeight: "600",
    },
    customPromptContainer: {
        marginBottom: 25,
        width: "100%",
    },
    customPromptInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        textAlignVertical: "top",
        minHeight: 80,
    },
    convertButton: {
        backgroundColor: "#5cb85c",
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        marginBottom: 30,
        elevation: 3,
    },
    disabledButton: {
        backgroundColor: "#cccccc",
    },
    convertButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    shareButton: {
        backgroundColor: "#f0ad4e",
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 15,
        elevation: 3,
    },
    shareButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    cleanupButton: {
        backgroundColor: "#d9534f",
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 30,
        marginBottom: 20,
        elevation: 3,
    },
    cleanupButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});
