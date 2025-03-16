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
} from "react-native";
import Svg, { Path } from "react-native-svg";
import * as FileSystem from "expo-file-system";
import ViewShot from "react-native-view-shot";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const CANVAS_WIDTH = width - 40;
const CANVAS_HEIGHT = height * 0.6;

export default function SimpleCanvasScreen() {
    const navigation = useNavigation();
    const viewShotRef = useRef();
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const [color, setColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [saving, setSaving] = useState(false);

    // Create a simple path representation
    const createPath = (points, color, strokeWidth) => {
        return {
            points,
            color,
            strokeWidth,
        };
    };

    // Convert our simple path to an SVG path string
    const getSvgPath = (points) => {
        if (points.length === 0) return "";

        const start = points[0];
        let svgPath = `M ${start.x} ${start.y}`;

        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            svgPath += ` L ${point.x} ${point.y}`;
        }

        return svgPath;
    };

    // Set up pan responder for touch handling
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (event) => {
                const { locationX, locationY } = event.nativeEvent;
                const newPath = createPath(
                    [{ x: locationX, y: locationY }],
                    color,
                    strokeWidth
                );
                setCurrentPath(newPath);
            },
            onPanResponderMove: (event) => {
                const { locationX, locationY } = event.nativeEvent;

                if (currentPath) {
                    const newPoints = [
                        ...currentPath.points,
                        { x: locationX, y: locationY },
                    ];
                    setCurrentPath({
                        ...currentPath,
                        points: newPoints,
                    });
                }
            },
            onPanResponderRelease: () => {
                if (currentPath) {
                    setPaths([...paths, currentPath]);
                    setCurrentPath(null);
                }
            },
        })
    ).current;

    const clearCanvas = () => {
        setPaths([]);
        setCurrentPath(null);
    };

    const saveCanvas = async () => {
        if (paths.length === 0) {
            Alert.alert("Empty Canvas", "Please draw something first");
            return;
        }

        try {
            setSaving(true);

            // Capture the canvas as an image
            const uri = await viewShotRef.current.capture();

            // Navigate back to HomeScreen with the sketch URI
            navigation.navigate("Home", { sketchUri: uri });
        } catch (error) {
            console.error("Error saving canvas:", error);
            Alert.alert("Error", "Failed to save canvas");
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
        <View style={styles.container}>
            <Text style={styles.title}>Draw Your Sketch</Text>

            <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 0.9 }}
                style={styles.canvasContainer}
            >
                <View
                    style={styles.canvasWrapper}
                    {...panResponder.panHandlers}
                >
                    <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
                        {paths.map((path, index) => (
                            <Path
                                key={index}
                                d={getSvgPath(path.points)}
                                stroke={path.color}
                                strokeWidth={path.strokeWidth}
                                fill="none"
                            />
                        ))}
                        {currentPath && (
                            <Path
                                d={getSvgPath(currentPath.points)}
                                stroke={currentPath.color}
                                strokeWidth={currentPath.strokeWidth}
                                fill="none"
                            />
                        )}
                    </Svg>
                </View>
            </ViewShot>

            <View style={styles.toolsContainer}>
                <Text style={styles.toolTitle}>Colors:</Text>
                <View style={styles.colorOptions}>
                    {colorOptions.map((option) => (
                        <TouchableOpacity
                            key={option.color}
                            style={[
                                styles.colorOption,
                                { backgroundColor: option.color },
                                color === option.color && styles.selectedOption,
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
                            <Text style={styles.strokeText}>{option.name}</Text>
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
    canvasContainer: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    canvasWrapper: {
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
