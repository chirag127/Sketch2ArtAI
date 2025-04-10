import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../env";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState("");
    const [isResettingPassword, setIsResettingPassword] = useState(false);

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
        let registerResult = { success: false, error: null };

        try {
            // Don't set isLoading for failed registration attempts
            // This prevents screen reloads when there's an error

            const response = await axios.post(`${API_URL}/auth/register`, {
                email,
                password,
            });

            // Set verification state
            setVerificationEmail(email);
            setIsVerifying(true);

            registerResult = { success: true, data: response.data };
        } catch (error) {
            console.log(
                "Registration error:",
                error.response?.data || error.message
            );
            registerResult = {
                success: false,
                error:
                    error.response?.data?.error ||
                    "Registration failed. Please try again.",
            };
        }

        return registerResult;
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
        let loginResult = { success: false, error: null };

        try {
            // Make the API call to login
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            // Check if email needs verification
            if (response.data.needsVerification) {
                // Set verification state and return result
                setVerificationEmail(email);
                setIsVerifying(true);
                return {
                    success: false,
                    needsVerification: true,
                    message: "Email verification required",
                };
            }

            // Set loading state for successful login
            setIsLoading(true);

            const { token, user } = response.data;

            // Store auth data
            await AsyncStorage.setItem("userToken", token);
            await AsyncStorage.setItem("userInfo", JSON.stringify(user));

            // Update state
            setUserToken(token);
            setUserInfo(user);

            // Set auth header for all future requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Reset loading state after a short delay to allow navigation to occur
            setTimeout(() => {
                setIsLoading(false);
            }, 500);

            loginResult = { success: true };
        } catch (error) {
            console.log("Login error:", error.response?.data || error.message);

            // Get the specific error message from the server response
            let errorMessage = "Login failed. Please check your credentials.";

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;

                // Add more helpful context to the error message if needed
                if (
                    errorMessage === "No account found with this email address"
                ) {
                    errorMessage =
                        "No account found with this email address. Please check your email or register.";
                } else if (errorMessage === "Incorrect password") {
                    errorMessage =
                        "Incorrect password. Please try again or use 'Forgot Password'.";
                }
            }

            loginResult = {
                success: false,
                error: errorMessage,
            };
        }

        return loginResult;
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

    // Forgot password - request reset code
    const forgotPassword = async (email) => {
        console.log(
            `Sending forgot password request to ${API_URL}/auth/forgot-password for email: ${email}`
        );
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/auth/forgot-password`,
                {
                    email,
                }
            );

            console.log("Forgot password response:", response.data);
            setIsResettingPassword(true);
            setVerificationEmail(email);
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("Forgot password error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
                config: error.config,
            });

            // More specific error handling
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx

                // If the error is "Email already verified", we should ignore it for password reset
                // This error comes from a different endpoint and shouldn't affect password reset
                if (error.response.data?.error === "Email already verified") {
                    console.log(
                        "Ignoring 'Email already verified' error for password reset"
                    );
                    // Return success anyway since this error is not relevant for password reset
                    setIsResettingPassword(true);
                    setVerificationEmail(email);
                    return {
                        success: true,
                        message:
                            "Password reset code sent successfully. Please check your email.",
                    };
                }

                return {
                    success: false,
                    error:
                        error.response.data?.error ||
                        `Server error: ${error.response.status}`,
                };
            } else if (error.request) {
                // The request was made but no response was received
                console.error("No response received:", error.request);
                return {
                    success: false,
                    error: "No response from server. Please check your internet connection and try again.",
                };
            } else {
                // Something happened in setting up the request that triggered an Error
                return {
                    success: false,
                    error: "Failed to process password reset request. Please try again.",
                };
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Reset password with verification code
    const resetPassword = async (email, code, newPassword) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/auth/reset-password`,
                {
                    email,
                    code,
                    newPassword,
                }
            );

            setIsVerifying(false);
            setIsResettingPassword(false);
            setVerificationEmail("");
            return { success: true, message: response.data.message };
        } catch (error) {
            console.log(
                "Reset password error:",
                error.response?.data || error.message
            );
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    "Failed to reset password. Please try again.",
            };
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
                isResettingPassword,
                verificationEmail,
                register,
                login,
                logout,
                verifyEmail,
                resendVerificationCode,
                forgotPassword,
                resetPassword,
                setIsVerifying,
                setIsResettingPassword,
                setVerificationEmail,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
