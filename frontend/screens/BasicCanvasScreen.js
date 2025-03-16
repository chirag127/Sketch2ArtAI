import React, { useState, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
    PanResponder,
    ScrollView,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";

const { width, height } = Dimensions.get("window");
const CANVAS_WIDTH = width - 40;
const CANVAS_HEIGHT = height * 0.6;

export default function BasicCanvasScreen({ navigation }) {
    const [paths, setPaths] = useState([]);
    const [currentPoints, setCurrentPoints] = useState([]);
    const [color, setColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [saving, setSaving] = useState(false);

    const canvasRef = useRef(null);

    // Convert points to SVG path
    const pointsToSvgPath = (points) => {
        if (points.length < 2) return "";

        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x},${points[i].y}`;
        }
        return path;
    };

    // PanResponder for handling touch events
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt, gestureState) => {
            // Get the location relative to the canvas
            const { locationX, locationY } = evt.nativeEvent;
            setCurrentPoints([{ x: locationX, y: locationY }]);
        },
        onPanResponderMove: (evt, gestureState) => {
            // Get the location relative to the canvas
            const { locationX, locationY } = evt.nativeEvent;
            // Only add the point if it's within the canvas bounds
            if (
                locationX >= 0 &&
                locationX <= CANVAS_WIDTH &&
                locationY >= 0 &&
                locationY <= CANVAS_HEIGHT
            ) {
                setCurrentPoints((prevPoints) => [
                    ...prevPoints,
                    { x: locationX, y: locationY },
                ]);
            }
        },
        onPanResponderRelease: () => {
            if (currentPoints.length > 1) {
                setPaths((prevPaths) => [
                    ...prevPaths,
                    { points: currentPoints, color, strokeWidth },
                ]);
            }
            setCurrentPoints([]);
        },
    });

    const clearCanvas = () => {
        setPaths([]);
        setCurrentPoints([]);
    };

    const saveCanvas = async () => {
        if (paths.length === 0) {
            Alert.alert("Empty Canvas", "Please draw something first");
            return;
        }

        try {
            setSaving(true);

            // Capture the canvas view
            const uri = await captureRef(canvasRef, {
                format: "png",
                quality: 1,
                result: "file",
            });

            console.log("Canvas captured:", uri);

            // Navigate back to HomeScreen with the sketch URI
            navigation.navigate("Home", { sketchUri: uri });
        } catch (error) {
            console.error("Error saving canvas:", error);
            Alert.alert("Error", "Failed to save canvas: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const colorOptions = [
        { color: "#000000", name: "Black" },
        { color: "#FF0000", name: "Red" },
        { color: "#0000FF", name: "Blue" },
        { color: "#008000", name: "Green" },
    ];

    const strokeOptions = [
        { width: 2, name: "Thin" },
        { width: 5, name: "Medium" },
        { width: 10, name: "Thick" },
        { width: 15, name: "Extra Thick" },
    ];

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Draw Your Sketch</Text>

                <View style={styles.canvasContainer}>
                    <View
                        ref={canvasRef}
                        style={styles.canvas}
                        {...panResponder.panHandlers}
                    >
                        <Svg
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            style={{ backgroundColor: "#ffffff" }}
                        >
                            {/* Background rectangle to ensure the entire canvas is captured */}
                            <Path
                                d={`M 0,0 H ${CANVAS_WIDTH} V ${CANVAS_HEIGHT} H 0 Z`}
                                fill="#ffffff"
                                stroke="none"
                            />

                            {/* Render completed paths */}
                            {paths.map((path, index) => (
                                <Path
                                    key={index}
                                    d={pointsToSvgPath(path.points)}
                                    stroke={path.color}
                                    strokeWidth={path.strokeWidth}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ))}

                            {/* Render current path being drawn */}
                            {currentPoints.length > 1 && (
                                <Path
                                    d={pointsToSvgPath(currentPoints)}
                                    stroke={color}
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                        </Svg>
                    </View>
                </View>

                <View style={styles.toolsContainer}>
                    <Text style={styles.toolTitle}>Colors:</Text>
                    <View style={styles.colorOptions}>
                        {colorOptions.map((option) => (
                            <TouchableOpacity
                                key={option.color}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: option.color },
                                    color === option.color &&
                                        styles.selectedOption,
                                ]}
                                onPress={() => setColor(option.color)}
                            />
                        ))}
                    </View>

                    <Text style={styles.toolTitle}>Stroke Width:</Text>
                    <View style={styles.strokeOptions}>
                        {strokeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.width}
                                style={[
                                    styles.strokeOption,
                                    strokeWidth === option.width &&
                                        styles.selectedOption,
                                ]}
                                onPress={() => setStrokeWidth(option.width)}
                            >
                                <Text style={styles.strokeText}>
                                    {option.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearCanvas}
                    >
                        <Text style={styles.buttonText}>Clear</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveCanvas}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
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
    canvasContainer: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    canvas: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: "#fff",
    },
    toolsContainer: {
        marginTop: 20,
    },
    toolTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    colorOptions: {
        flexDirection: "row",
        marginBottom: 15,
    },
    colorOption: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 15,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    strokeOptions: {
        flexDirection: "row",
        marginBottom: 15,
    },
    strokeOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 10,
        backgroundColor: "#e0e0e0",
    },
    strokeText: {
        fontSize: 12,
    },
    selectedOption: {
        borderWidth: 2,
        borderColor: "#4a90e2",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
    },
    clearButton: {
        backgroundColor: "#f44336",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 3,
    },
    saveButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 3,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});
