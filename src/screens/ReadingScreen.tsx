// src/screens/ReadingScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ReadingDTO } from '../types/types';

const ReadingScreen: React.FC = () => {
    const [reading, setReading] = useState<ReadingDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Initial fetch of reading data
        const fetchReadingData = async () => {
            try {
                const response = await fetch('http://192.168.50.170:8081/readings/r/1'); // Replace with your IP
                const data: ReadingDTO = await response.json();
                setReading(data);
                setLoading(false);
                console.log("Fetched initial reading data:", data);
            } catch (error) {
                console.error('Error fetching reading data:', error);
                setLoading(false);
            }
        };

        fetchReadingData();

        // WebSocket connection for real-time updates
        const ws = new WebSocket('ws://192.168.50.170:8082'); // Replace with your IP

        ws.onopen = () => {
            console.log('Connected to WebSocket for reading updates');
        };

        ws.onmessage = (event) => {
            try {
                const updatedReading: ReadingDTO = JSON.parse(event.data);
                console.log("Received updated reading data:", updatedReading);
                setReading(updatedReading);
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

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            {reading ? (
                <>
                    <Text style={styles.label}>Reading ID: {reading.id}</Text>
                    <Text style={styles.label}>Date: {reading.date}</Text>
                    <Text style={styles.label}>Temperature: {reading.temperature}°C</Text>
                    <Text style={styles.label}>Humidity: {reading.humidity}%</Text>
                    <Text style={styles.label}>Terrarium ID: {reading.terrarium_id}</Text>
                </>
            ) : (
                <Text style={styles.errorText}>No data available</Text>
            )}
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
        fontWeight: '500',
        color: '#333',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});

export default ReadingScreen;
