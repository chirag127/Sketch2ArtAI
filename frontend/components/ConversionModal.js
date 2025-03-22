import React, { useState } from "react";
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
} from "react-native";

const ConversionModal = ({
    visible,
    onClose,
    onConvert,
    isConverting,
    imageType,
}) => {
    const [selectedStyle, setSelectedStyle] = useState("Anime");
    const [customPrompt, setCustomPrompt] = useState("");

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

    const handleConvert = () => {
        onConvert(selectedStyle, customPrompt);
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
                        Convert {imageType === "original" ? "Original" : "Converted"} Image
                    </Text>

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
                                    selectedStyle === option && styles.selectedStyleButton,
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

                    <Text style={styles.sectionTitle}>Custom Prompt (Optional)</Text>
                    <TextInput
                        style={styles.customPromptInput}
                        placeholder="Enter custom instructions for the AI..."
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
                            disabled={isConverting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.convertButton, isConverting && styles.disabledButton]}
                            onPress={handleConvert}
                            disabled={isConverting}
                        >
                            {isConverting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.convertButtonText}>
                                    {customPrompt.trim()
                                        ? "Convert with Custom Prompt"
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
});

export default ConversionModal;
