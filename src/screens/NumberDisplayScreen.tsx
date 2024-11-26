// src/screens/NumberDisplayScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const NumberDisplayScreen: React.FC = () => {
    const [number, setNumber] = useState<number | null>(null);  // State for the fetched number
    const [loading, setLoading] = useState<boolean>(true);      // State for loading status

    useEffect(() => {
        // Fetch data from localhost
        fetch('http://192.168.50.1:8081/readings/t/1')
            .then((response) => response.text())  // Fetch as text since it's a plain integer
            .then((data) => {
                setNumber(parseInt(data, 10));  // Parse the integer from the response text
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
            ) : (
                <Text style={styles.numberText}>Fetched Number: {number}</Text>
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
    numberText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default NumberDisplayScreen;
