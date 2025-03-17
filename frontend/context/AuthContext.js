import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../env";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState("");

    // Initialize auth state from storage
    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("userToken");
                const storedUserInfo = await AsyncStorage.getItem("userInfo");

                if (storedToken && storedUserInfo) {
                    setUserToken(storedToken);
                    setUserInfo(JSON.parse(storedUserInfo));

                    // Set auth header for all future requests
                    axios.defaults.headers.common[
                        "Authorization"
                    ] = `Bearer ${storedToken}`;
                }
            } catch (error) {
                console.log("Error loading auth data from storage:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredData();
    }, []);

    // Register a new user
    const register = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                email,
                password,
            });

            setIsVerifying(true);
            setVerificationEmail(email);
            return { success: true, data: response.data };
        } catch (error) {
            console.log(
                "Registration error:",
                error.response?.data || error.message
            );
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    "Registration failed. Please try again.",
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Verify email with code
    const verifyEmail = async (email, code) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/verify`, {
                email,
                code,
            });

            const { token, user } = response.data;

            // Store auth data
            await AsyncStorage.setItem("userToken", token);
            await AsyncStorage.setItem("userInfo", JSON.stringify(user));

            // Update state
            setUserToken(token);
            setUserInfo(user);
            setIsVerifying(false);
            setVerificationEmail("");

            // Set auth header for all future requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return { success: true };
        } catch (error) {
            console.log(
                "Verification error:",
                error.response?.data || error.message
            );
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    "Verification failed. Please try again.",
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Resend verification code
    const resendVerificationCode = async (email) => {
        try {
            const response = await axios.post(
                `${API_URL}/auth/resend-verification`,
                {
                    email,
                }
            );

            return { success: true, message: response.data.message };
        } catch (error) {
            console.log(
                "Resend verification error:",
                error.response?.data || error.message
            );
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    "Failed to resend verification code. Please try again.",
            };
        }
    };

    // Login user
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            // Check if email needs verification
            if (response.data.needsVerification) {
                setIsVerifying(true);
                setVerificationEmail(email);
                return {
                    success: false,
                    needsVerification: true,
                    message: "Email verification required",
                };
            }

            const { token, user } = response.data;

            // Store auth data
            await AsyncStorage.setItem("userToken", token);
            await AsyncStorage.setItem("userInfo", JSON.stringify(user));

            // Update state
            setUserToken(token);
            setUserInfo(user);

            // Set auth header for all future requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return { success: true };
        } catch (error) {
            console.log("Login error:", error.response?.data || error.message);
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    "Login failed. Please check your credentials.",
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout user
    const logout = async () => {
        console.log("Logout function called");
        setIsLoading(true);
        try {
            console.log("Removing auth data from storage");
            // Remove auth data from storage
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userInfo");

            console.log("Updating state");
            // Update state
            setUserToken(null);
            setUserInfo(null);

            console.log("Removing auth header");
            // Remove auth header
            delete axios.defaults.headers.common["Authorization"];

            console.log("Logout completed successfully");
            return true; // Return success status
        } catch (error) {
            console.error("Logout error:", error);
            throw error; // Rethrow the error to be caught by the caller
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                userToken,
                userInfo,
                isVerifying,
                verificationEmail,
                register,
                login,
                logout,
                verifyEmail,
                resendVerificationCode,
                setIsVerifying,
                setVerificationEmail,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
