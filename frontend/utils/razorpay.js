import { Platform } from "react-native";
import { RAZORPAY_KEY_ID } from "../env";
import React from "react";
import { createRoot } from "react-dom/client";
import LoadingOverlay from "../components/LoadingOverlay";

let razorpayScriptLoaded = false;
let loadingContainer = null;
let loadingRoot = null;

const showLoadingOverlay = () => {
    if (Platform.OS !== "web") return;

    loadingContainer = document.createElement("div");
    document.body.appendChild(loadingContainer);
    loadingRoot = createRoot(loadingContainer);
    loadingRoot.render(
        <LoadingOverlay message="Initializing payment gateway..." />
    );
};

const hideLoadingOverlay = () => {
    if (Platform.OS !== "web" || !loadingContainer) return;

    if (loadingRoot) {
        loadingRoot.unmount();
        loadingRoot = null;
    }
    loadingContainer.remove();
    loadingContainer = null;
};

export const loadRazorpayScript = () => {
    if (Platform.OS !== "web") return Promise.resolve(false);

    if (razorpayScriptLoaded) {
        return Promise.resolve(true);
    }

    showLoadingOverlay();

    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => {
            razorpayScriptLoaded = true;
            hideLoadingOverlay();
            resolve(true);
        };

        script.onerror = () => {
            console.error("Failed to load Razorpay script");
            hideLoadingOverlay();
            resolve(false);
        };

        document.body.appendChild(script);
    });
};

export const initializeRazorpayPayment = async (options) => {
    if (Platform.OS === "web") {
        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                throw new Error("Failed to load Razorpay payment gateway");
            }

            return new Promise((resolve, reject) => {
                try {
                    const rzp = new window.Razorpay({
                        ...options,
                        key: RAZORPAY_KEY_ID,
                        handler: function (response) {
                            resolve(response);
                        },
                        modal: {
                            ondismiss: function () {
                                reject(new Error("Payment cancelled by user"));
                            },
                        },
                    });
                    rzp.on("payment.failed", function (response) {
                        reject(
                            new Error(
                                "Payment failed: " + response.error.description
                            )
                        );
                    });
                    rzp.open();
                } catch (error) {
                    console.error("Razorpay initialization error:", error);
                    reject(error);
                }
            });
        } catch (error) {
            console.error("Razorpay setup error:", error);
            throw error;
        }
    } else {
        const RazorpayCheckout = require("react-native-razorpay").default;
        return RazorpayCheckout.open(options);
    }
};
