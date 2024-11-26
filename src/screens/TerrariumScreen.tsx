// src/screens/TerrariumScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TerrariumDTO } from '../types/types'; // Importing the TerrariumDTO type

const TerrariumScreen: React.FC = () => {
    const [terrarium, setTerrarium] = useState<TerrariumDTO | null>(null); // State to hold the fetched terrarium data
    const [loading, setLoading] = useState<boolean>(true);                 // State to manage loading

    useEffect(() => {
        // Fetch data from the specified URL
        fetch('http://192.168.1.12:8081/terrariums/1')
            .then((response) => response.json())
            .then((data: TerrariumDTO) => {
                setTerrarium(data); // Assuming the response matches the TerrariumDTO type
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : terrarium ? (
                <Text style={styles.nameText}>Terrarium Name: {terrarium.name}</Text>
            ) : (
                <Text style={styles.errorText}>Failed to load terrarium data.</Text>
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
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});

export default TerrariumScreen;
