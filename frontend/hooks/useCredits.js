import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../env";

export const useCredits = () => {
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCredits = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_URL}/credits/balance`);
            setCredits(response.data.balance);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch credits");
            console.error("Error fetching credits:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const hasEnoughCredits = useCallback(
        (required = 1) => {
            return credits >= required;
        },
        [credits]
    );

    const isLowCredits = useCallback(
        (threshold = 5) => {
            return credits < threshold;
        },
        [credits]
    );

    useEffect(() => {
        fetchCredits();
    }, []);

    return {
        credits,
        loading,
        error,
        fetchCredits,
        hasEnoughCredits,
        isLowCredits,
    };
};
