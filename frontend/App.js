import React, { useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./screens/HomeScreen";
import BasicCanvasScreen from "./screens/BasicCanvasScreen";
import HistoryScreen from "./screens/HistoryScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { AuthProvider, AuthContext } from "./context/AuthContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === "HomeTab") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "HistoryTab") {
                        iconName = focused ? "time" : "time-outline";
                    } else if (route.name === "ProfileTab") {
                        iconName = focused ? "person" : "person-outline";
                    }

                    // You can return any component here
                    return (
                        <Ionicons name={iconName} size={size} color={color} />
                    );
                },
                tabBarActiveTintColor: "#4a90e2",
                tabBarInactiveTintColor: "gray",
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{ title: "Home" }}
            />
            <Tab.Screen
                name="HistoryTab"
                component={HistoryScreen}
                options={{ title: "History" }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ title: "Profile" }}
            />
        </Tab.Navigator>
    );
}

// Home stack navigator
function HomeStack() {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Canvas"
                component={BasicCanvasScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

// Auth stack navigator
function AuthStack() {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        </Stack.Navigator>
    );
}

// App container with authentication flow
function AppContainer() {
    const { isLoading, userToken, isVerifying } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a90e2" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            {userToken ? (
                <MainTabs />
            ) : isVerifying ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                        name="VerifyEmail"
                        component={VerifyEmailScreen}
                    />
                </Stack.Navigator>
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContainer />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
});
