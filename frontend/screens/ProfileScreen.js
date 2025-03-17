import React, { useContext } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthContext from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
    const { userInfo, logout, isLoading } = useContext(AuthContext);

    const handleLogout = async () => {
        Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                onPress: async () => {
                    await logout();
                },
                style: "destructive",
            },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.profileContainer}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={100} color="#4a90e2" />
                </View>

                <Text style={styles.emailText}>{userInfo?.email}</Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Account Status</Text>
                        <View style={styles.statusContainer}>
                            <View
                                style={[
                                    styles.statusDot,
                                    {
                                        backgroundColor: userInfo?.isVerified
                                            ? "#4CAF50"
                                            : "#FFC107",
                                    },
                                ]}
                            />
                            <Text style={styles.statusText}>
                                {userInfo?.isVerified
                                    ? "Verified"
                                    : "Pending Verification"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("HistoryTab")}
                >
                    <Ionicons name="time-outline" size={24} color="#4a90e2" />
                    <Text style={styles.actionText}>View History</Text>
                    <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                        Alert.alert(
                            "Coming Soon",
                            "This feature will be available in a future update."
                        )
                    }
                >
                    <Ionicons
                        name="settings-outline"
                        size={24}
                        color="#4a90e2"
                    />
                    <Text style={styles.actionText}>Settings</Text>
                    <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                        Alert.alert(
                            "Coming Soon",
                            "This feature will be available in a future update."
                        )
                    }
                >
                    <Ionicons
                        name="help-circle-outline"
                        size={24}
                        color="#4a90e2"
                    />
                    <Text style={styles.actionText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={isLoading}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Sketch2ArtAI v1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
    },
    profileContainer: {
        backgroundColor: "#fff",
        padding: 20,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    avatarContainer: {
        marginBottom: 15,
    },
    emailText: {
        fontSize: 18,
        color: "#333",
        marginBottom: 20,
    },
    infoContainer: {
        width: "100%",
        marginTop: 10,
    },
    infoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    infoLabel: {
        fontSize: 16,
        color: "#666",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        color: "#333",
    },
    actionsContainer: {
        backgroundColor: "#fff",
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        marginLeft: 15,
    },
    logoutButton: {
        marginTop: 30,
        marginHorizontal: 20,
        backgroundColor: "#f44336",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    versionContainer: {
        alignItems: "center",
        marginTop: 30,
        marginBottom: 40,
    },
    versionText: {
        color: "#999",
        fontSize: 14,
    },
});
