import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface Reading {
    id: number;
    date: string; // e.g., "2024-11-02 13:00:00"
    temperature: number;
    humidity: number;
    terrarium_id: number;
}

const ReadingUpdate: React.FC<{ terrariumId: number }> = ({ terrariumId }) => {
    const [reading, setReading] = useState<Reading | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Function to fetch the latest reading
    const fetchReading = async () => {
        try {
            console.log("Fetching latest reading...");
            const response = await fetch(`http://192.168.0.100:8081/readings/t/${terrariumId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch latest reading");
            }
            const data: Reading = await response.json();
            setReading(data);
            console.log("Fetched reading:", data);
        } catch (error) {
            console.error("Error fetching latest reading:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch the initial reading on component mount
        fetchReading();

        // Setup WebSocket connection
        const ws = new WebSocket('ws://192.168.0.100:8082');

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                fetchReading()
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.log(`WebSocket disconnected: Code ${event.code}, Reason: ${event.reason}`);
        };

        // Cleanup WebSocket connection on component unmount
        return () => {
            ws.close();
        };
    }, [terrariumId]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!reading) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No data available</Text>
            </View>
        );
    }

    // Convert the timestamp into a Date object
    const dateObject = new Date(reading.date);

    // Extract the date and time separately
    const formattedDate = dateObject.toLocaleDateString(); // e.g., "11/2/2024"
    const formattedTime = dateObject.toLocaleTimeString(); // e.g., "1:00 PM"

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Terrarium ID: {reading.terrarium_id}</Text>
            <Text style={styles.label}>Temperature: {reading.temperature}°C</Text>
            <Text style={styles.label}>Humidity: {reading.humidity}%</Text>
            <Text style={styles.label}>Date: {formattedDate}</Text>
            <Text style={styles.label}>Time: {formattedTime}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    label: {
        fontSize: 18,
        marginVertical: 8,
        color: '#333',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
});

export default ReadingUpdate;
