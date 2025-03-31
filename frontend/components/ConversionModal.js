import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Platform,
    Alert,
} from "react-native";
import axios from "axios";
// C:\AM\Github\Sketch2ArtAI\frontend\env.js
import { API_URL } from "../env"; // Adjust the import path as necessary

const ConversionModal = ({
    visible,
    onClose,
    onConvert,
    isConverting,
    imageType,
}) => {
    const [selectedStyle, setSelectedStyle] = useState("Anime");
    const [customPrompt, setCustomPrompt] = useState(
        "Create a detailed and creative image"
    );
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchCredits();
        }
    }, [visible]);

    const fetchCredits = async () => {
        try {
            const response = await axios.get(`${API_URL}/credits/balance`);
            setCredits(response.data.balance);
        } catch (error) {
            console.error("Error fetching credits:", error);
            Alert.alert("Error", "Failed to fetch credit balance");
        }
    };

    const styleOptions = [
        "Custom Prompt Only", // Added option for custom prompt without style
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

    const handleConvert = async () => {
        // Check if no prompt is provided - now required for all styles
        if (!customPrompt.trim()) {
            Alert.alert(
                "Prompt Required",
                "Please enter a prompt to describe what you want to create"
            );
            return;
        }

        if (credits < 1) {
            Alert.alert(
                "Insufficient Credits",
                "You need at least 1 credit to generate an image. Would you like to purchase more credits?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Buy Credits",
                        onPress: () => {
                            onClose();
                            // Navigate to credit wallet screen
                            navigation.navigate("CreditWallet");
                        },
                    },
                ]
            );
            return;
        }

        setLoading(true);
        try {
            await onConvert(selectedStyle, customPrompt);
            // Update credits after successful conversion
            fetchCredits();
        } catch (error) {
            Alert.alert("Error", "Failed to generate image");
        } finally {
            setLoading(false);
        }
    };

    const renderCreditWarning = () => {
        if (credits < 5) {
            return (
                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>
                        Low Credits! You have {credits} credit
                        {credits !== 1 ? "s" : ""} remaining.
                    </Text>
                    <TouchableOpacity
                        style={styles.buyCreditsButton}
                        onPress={() => {
                            onClose();
                            navigation.navigate("CreditWallet");
                        }}
                    >
                        <Text style={styles.buyCreditsText}>
                            Buy More Credits
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        Convert{" "}
                        {imageType === "original" ? "Original" : "Converted"}{" "}
                        Image
                    </Text>

                    <View style={styles.creditInfo}>
                        <Text style={styles.creditBalance}>
                            Credits: {credits}
                        </Text>
                        <Text style={styles.creditCost}>
                            Cost: 1 credit per image
                        </Text>
                    </View>

                    {renderCreditWarning()}

                    <Text style={styles.sectionTitle}>Select Art Style</Text>
                    <ScrollView
                        style={styles.styleScrollView}
                        contentContainerStyle={styles.styleContainer}
                    >
                        {styleOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.styleButton,
                                    selectedStyle === option &&
                                        styles.selectedStyleButton,
                                ]}
                                onPress={() => setSelectedStyle(option)}
                            >
                                <Text
                                    style={[
                                        styles.styleButtonText,
                                        selectedStyle === option &&
                                            styles.selectedStyleButtonText,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.sectionTitle}>Prompt (Required)</Text>
                    <TextInput
                        style={styles.customPromptInput}
                        placeholder="Describe what you want to create (required)"
                        placeholderTextColor="#999"
                        value={customPrompt}
                        onChangeText={setCustomPrompt}
                        multiline
                        numberOfLines={3}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={isConverting || loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.convertButton,
                                (isConverting || loading) &&
                                    styles.disabledButton,
                            ]}
                            onPress={handleConvert}
                            disabled={isConverting || loading || credits < 1}
                        >
                            {isConverting || loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.convertButtonText}>
                                    {selectedStyle === "Custom Prompt Only"
                                        ? "Generate with Prompt"
                                        : `Convert to ${selectedStyle}`}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        width: Platform.OS === "web" ? "80%" : "90%",
        maxWidth: 500,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    creditsText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    costText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 15,
        marginBottom: 10,
    },
    styleScrollView: {
        maxHeight: 200,
    },
    styleContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
    },
    styleButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        margin: 5,
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
    customPromptInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        textAlignVertical: "top",
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        flex: 1,
        marginRight: 10,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#666",
        fontWeight: "600",
    },
    convertButton: {
        backgroundColor: "#4a90e2",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 2,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#a0c4e9",
    },
    convertButtonText: {
        color: "white",
        fontWeight: "600",
    },
    creditInfo: {
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    creditBalance: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#007AFF",
        marginBottom: 4,
    },
    creditCost: {
        fontSize: 14,
        color: "#666",
    },
    warningContainer: {
        backgroundColor: "#fff3cd",
        borderColor: "#ffeeba",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    warningText: {
        color: "#856404",
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    buyCreditsButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    buyCreditsText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default ConversionModal;
