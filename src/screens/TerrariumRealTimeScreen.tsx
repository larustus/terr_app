// src/screens/TerrariumRealTimeScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { UserDTO } from '../types/types';
import { TerrariumDTO } from '../types/types';
import { ReadingDTO } from '../types/types';
import { TerrariumWithReading } from '../types/types';

const TerrariumRealTimeScreen: React.FC = () => {
    const [terrariumsWithReadings, setTerrariumsWithReadings] = useState<TerrariumWithReading[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserTerrariumsData = async () => {
            try {
                console.log("Fetching user terrariums...");

                // Fetch UserDTO to get terrarium IDs
                const userResponse = await fetch('http://192.168.50.170:8081/users/1');
                const user: UserDTO = await userResponse.json();
                console.log("Fetched user data:", user);

                // For each terrarium in user.terrariumData, fetch TerrariumDTO and ReadingDTO
                const terrariumsWithReadings = await Promise.all(
                    user.terrariumData.map(async (terrariumData) => {
                        try {
                            const terrariumResponse = await fetch(`http://192.168.50.170:8081/terrariums/${terrariumData.id}`);
                            const terrarium: TerrariumDTO = await terrariumResponse.json();

                            const readingResponse = await fetch(`http://192.168.50.170:8081/readings/${terrariumData.id}`);
                            const reading: ReadingDTO = await readingResponse.json();

                            return { terrarium, reading };
                        } catch (error) {
                            console.error(`Error fetching data for terrarium ID ${terrariumData.id}:`, error);
                            return null; // Return null for any failed fetches
                        }
                    })
                );

                // Filter out any null entries
                setTerrariumsWithReadings(terrariumsWithReadings.filter((item) => item !== null));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching terrarium and reading data:', error);
                setLoading(false);
            }
        };

        fetchUserTerrariumsData(); // Initial data fetch

        const ws = new WebSocket('ws://192.168.50.170:8082');

        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.onmessage = async (event) => {
            try {
                const updatedTerrariumsData: { id: number; name: string }[] = JSON.parse(event.data);
                console.log("Received updated terrarium data from WebSocket:", updatedTerrariumsData);

                const updatedTerrariumsWithReadings = await Promise.all(
                    updatedTerrariumsData.map(async (terrariumData) => {
                        try {
                            const terrariumResponse = await fetch(`http://192.168.50.170:8081/terrariums/${terrariumData.id}`);
                            const terrarium: TerrariumDTO = await terrariumResponse.json();

                            const readingResponse = await fetch(`http://192.168.50.170:8081/readings/${terrariumData.id}`);
                            const reading: ReadingDTO = await readingResponse.json();

                            return { terrarium, reading };
                        } catch (error) {
                            console.error(`Error fetching updated data for terrarium ID ${terrariumData.id}:`, error);
                            return null; // Return null for any failed fetches
                        }
                    })
                );

                // Filter out any null entries and update the state
                setTerrariumsWithReadings(updatedTerrariumsWithReadings.filter((item) => item !== null));
                console.log("Updated terrariums with readings:", updatedTerrariumsWithReadings);
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
        };

        // Cleanup WebSocket on component unmount
        return () => ws.close();
    }, []);

    const renderTerrarium = ({ item }: { item: TerrariumWithReading }) => {
        // Check if item and its properties are defined before rendering
        if (!item?.terrarium || !item.reading) return null;

        return (
            <View style={styles.terrariumContainer}>
                <Text style={styles.nameText}>Name: {item.terrarium.name}</Text>
                <Text style={styles.readingText}>
                    Temperature Goal: {item.terrarium.temperature_goal}°C
                </Text>
                <Text style={styles.readingText}>
                    Current Temperature: {item.reading.temperature}°C
                </Text>
                <Text style={styles.readingText}>
                    Humidity: {item.reading.humidity}%
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={terrariumsWithReadings.filter((item) => item?.terrarium && item.reading)}
                    keyExtractor={(item) => item.terrarium.id.toString()}
                    renderItem={renderTerrarium}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    terrariumContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
    },
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    readingText: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
    },
});

export default TerrariumRealTimeScreen;
