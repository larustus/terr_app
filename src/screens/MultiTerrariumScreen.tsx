import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';

const user_id = 1;

interface TerrariumData {
    id: number;
    name: string;
}

interface Reading {
    id: number;
    date: string;
    temperature: number;
    humidity: number;
    terrarium_id: number;
}

interface User {
    id: number;
    username: string;
    password_hash: string;
    terrariumData: TerrariumData[];
}

const MultiTerrariumScreen: React.FC = () => {
    const [terrariumsWithReadings, setTerrariumsWithReadings] = useState<
        { terrarium: TerrariumData; reading: Reading | null }[]
    >([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch readings for all terrariums
    const fetchReadings = async (terrariumIds: number[]) => {
        try {
            console.log("Fetching readings for all terrariums...");
            const readingsPromises = terrariumIds.map(async (terrariumId) => {
                const response = await fetch(`http://192.168.0.100:8081/readings/t/${terrariumId}`);
                if (!response.ok) throw new Error(`Failed to fetch reading for terrarium ${terrariumId}`);
                const reading: Reading = await response.json();
                return { terrariumId, reading };
            });

            const readings = await Promise.all(readingsPromises);

            setTerrariumsWithReadings((prev) =>
                prev.map((item) => {
                    const updatedReading = readings.find((r) => r.terrariumId === item.terrarium.id);
                    return updatedReading ? { terrarium: item.terrarium, reading: updatedReading.reading } : item;
                })
            );
        } catch (error) {
            console.error("Error fetching readings:", error);
        }
    };

    // Fetch user data to get terrariums
    const fetchUserData = async () => {
        try {
            console.log("Fetching user data...");
            const response = await fetch(`http://192.168.0.100:8081/users/${user_id}`);
            if (!response.ok) throw new Error("Failed to fetch user data");
            const user: User = await response.json();

            // Initialize terrariums with placeholders for readings
            const initialTerrariumsWithReadings = user.terrariumData.map((terrarium) => ({
                terrarium,
                reading: null,
            }));
            setTerrariumsWithReadings(initialTerrariumsWithReadings);

            // Fetch readings for all terrariums
            const terrariumIds = user.terrariumData.map((terrarium) => terrarium.id);
            await fetchReadings(terrariumIds);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();

        const ws = new WebSocket('ws://192.168.0.100:8082');

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const updatedReading: Reading = JSON.parse(event.data);
                console.log("WebSocket message received:", updatedReading);

                // Update the reading for the specific terrarium
                setTerrariumsWithReadings((prev) =>
                    prev.map((item) =>
                        item.terrarium.id === updatedReading.terrarium_id
                            ? { terrarium: item.terrarium, reading: updatedReading }
                            : item
                    )
                );
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            ws.close();
        };
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={terrariumsWithReadings}
                keyExtractor={(item) => item.terrarium.id.toString()}
                renderItem={({ item }) => {
                    const { terrarium, reading } = item;

                    if (!reading) {
                        return (
                            <View style={styles.terrariumContainer}>
                                <Text style={styles.nameText}>{terrarium.name}</Text>
                                <Text style={styles.errorText}>No data available for this terrarium</Text>
                            </View>
                        );
                    }

                    const dateObject = new Date(reading.date);
                    const formattedDate = dateObject.toLocaleDateString();
                    const formattedTime = dateObject.toLocaleTimeString();

                    return (
                        <View style={styles.terrariumContainer}>
                            <Text style={styles.nameText}>Terrarium: {terrarium.name}</Text>
                            <Text style={styles.label}>Temperature: {reading.temperature}°C</Text>
                            <Text style={styles.label}>Humidity: {reading.humidity}%</Text>
                            <Text style={styles.label}>Date: {formattedDate}</Text>
                            <Text style={styles.label}>Time: {formattedTime}</Text>
                        </View>
                    );
                }}
                contentContainerStyle={styles.listContent}
            />
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
    listContent: {
        paddingBottom: 20,
    },
    terrariumContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        width: '100%',
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginTop: 5,
    },
});

export default MultiTerrariumScreen;
