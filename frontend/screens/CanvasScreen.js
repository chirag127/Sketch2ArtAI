import React, { useRef, useState, useCallback } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Canvas, Path, useCanvasRef, Skia } from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const CANVAS_WIDTH = width - 40;
const CANVAS_HEIGHT = height * 0.6;

export default function CanvasScreen() {
    const navigation = useNavigation();
    const canvasRef = useCanvasRef();
    const pathRef = useRef(Skia.Path.Make());
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const [color, setColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [saving, setSaving] = useState(false);

    const onDrawingStart = useCallback(
        (x, y) => {
            pathRef.current = Skia.Path.Make();
            pathRef.current.moveTo(x, y);
            setCurrentPath({
                path: pathRef.current,
                color,
                strokeWidth,
            });
        },
        [color, strokeWidth]
    );

    const onDrawingActive = useCallback(
        (x, y) => {
            if (currentPath) {
                pathRef.current.lineTo(x, y);
                setCurrentPath({
                    path: pathRef.current,
                    color,
                    strokeWidth,
                });
            }
        },
        [currentPath, color, strokeWidth]
    );

    const onDrawingEnd = useCallback(() => {
        if (currentPath) {
            setPaths((prevPaths) => [...prevPaths, currentPath]);
            setCurrentPath(null);
        }
    }, [currentPath]);

    // Handle touch events manually
    const handleTouchStart = (event) => {
        const { locationX, locationY } = event.nativeEvent;
        onDrawingStart(locationX, locationY);
    };

    const handleTouchMove = (event) => {
        const { locationX, locationY } = event.nativeEvent;
        onDrawingActive(locationX, locationY);
    };

    const handleTouchEnd = () => {
        onDrawingEnd();
    };

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
            const image = canvasRef.current?.makeImageSnapshot();

            if (image) {
                const bytes = image.encodeToBytes();
                const base64 = Buffer.from(bytes).toString("base64");

                const filePath = `${
                    FileSystem.cacheDirectory
                }sketch_${Date.now()}.png`;
                await FileSystem.writeAsStringAsync(filePath, base64, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                // Navigate back to HomeScreen with the sketch URI
                navigation.navigate("Home", { sketchUri: filePath });
            } else {
                Alert.alert("Error", "Failed to capture canvas");
            }
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

            <View style={styles.canvasContainer}>
                <View
                    style={styles.canvasWrapper}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <Canvas ref={canvasRef} style={styles.canvas}>
                        {paths.map((p, index) => (
                            <Path
                                key={index}
                                path={p.path}
                                color={p.color}
                                style="stroke"
                                strokeWidth={p.strokeWidth}
                            />
                        ))}
                        {currentPath && (
                            <Path
                                path={currentPath.path}
                                color={currentPath.color}
                                style="stroke"
                                strokeWidth={currentPath.strokeWidth}
                            />
                        )}
                    </Canvas>
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
    },
    canvas: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
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
