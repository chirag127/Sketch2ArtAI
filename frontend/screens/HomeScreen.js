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
import * as Sharing from "expo-sharing";
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
            const fileInfo = await FileSystem.getInfoAsync(sketch);

            // Get file extension
            const fileExtension = sketch.split(".").pop();
            const mimeType =
                fileExtension === "png" ? "image/png" : "image/jpeg";

            formData.append("sketch", {
                uri: sketch,
                name: `sketch.${fileExtension}`,
                type: mimeType,
            });

            formData.append("style", style);

            // Add custom prompt if provided
            if (customPrompt.trim()) {
                formData.append("customPrompt", customPrompt.trim());
            }

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
            Alert.alert("Error", "Failed to convert sketch. Please try again.");
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
            // Save base64 image to temporary file
            const base64Data = convertedArt.split(",")[1];
            const tempFilePath =
                FileSystem.cacheDirectory + "converted_art.png";
            await FileSystem.writeAsStringAsync(tempFilePath, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Share the file
            await Sharing.shareAsync(tempFilePath, {
                mimeType: "image/png",
                dialogTitle: "Share your converted art",
            });
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
    // Van Gogh Oil Painting (swirling textures, bold brushstrokes)

    // Watercolor Wash (soft, translucent layers)

    // Charcoal Sketch (high-contrast, gritty textures)

    // Impressionist (light-focused, blended colors)

    // Pointillism (stippled dots creating images)

    // Modern & Pop Culture
    // Cyberpunk Neon (glowing futuristic cityscapes)

    // Anime/Cel-Shaded (vibrant, clean-lined characters)

    // Glitch Art (digital distortion, RGB splits)

    // Retro Pixel Art (8-bit/16-bit game aesthetics)

    // Pop Art (Warhol-style bold colors, halftones)

    // Thematic & Fantasy
    // Steampunk Machinery (gears, brass, Victorian tech)

    // Fantasy RPG (magic runes, epic landscapes)

    // Gothic Horror (haunted shadows, eerie fog)

    // Sci-Fi Alien (bioluminescent textures, alien flora)

    // Surrealism (dreamlike, impossible landscapes)

    // Cultural & Historical
    // Japanese Ukiyo-e (woodblock prints, e.g., Hokusai waves)

    // Renaissance Fresco (cracked murals, gold accents)

    // Aztec Carvings (geometric patterns, tribal motifs)

    // Art Deco (symmetrical, metallic elegance)

    // Indian Miniature (intricate Mughal-era details)


    const styleOptions = [
               "Cyberpunk Neon",
        "Anime",
        "Watercolor Wash",
         "Retro Pixel Art",
"Van Gogh Oil Painting",
        "Charcoal Sketch",
        "Impressionist",
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
