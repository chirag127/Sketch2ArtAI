import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * A reusable password input component with visibility toggle
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Current password value
 * @param {Function} props.onChangeText - Function to call when text changes
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} props.style - Additional style for the TextInput
 * @param {Object} props.containerStyle - Additional style for the container
 * @param {Object} props.inputProps - Additional props for the TextInput
 */
const PasswordInput = ({
    value,
    onChangeText,
    placeholder = "Enter your password",
    style,
    containerStyle,
    ...inputProps
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <TextInput
                style={[styles.input, style]}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!isPasswordVisible}
                {...inputProps}
            />
            <TouchableOpacity
                style={styles.iconContainer}
                onPress={togglePasswordVisibility}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        position: "relative",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        width: "100%",
        paddingRight: 50, // Make room for the icon
    },
    iconContainer: {
        position: "absolute",
        right: 12,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default PasswordInput;
