// src/screens/TerrariumListScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { TerrariumDTO } from '../types/types';

const TerrariumListScreen: React.FC = () => {
    const [terrariums, setTerrariums] = useState<TerrariumDTO[]>([]);
    const [readings, setReadings] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Fetch all terrariums
        fetch('http://192.168.1.12:8081/terrariums/all')
            .then((response) => response.json())
            .then((data: TerrariumDTO[]) => {
                setTerrariums(data);
                setLoading(false);
                // Fetch readings for each terrarium
                data.forEach((terrarium) => {
                    fetch(`http://192.168.1.12:8081/readings/t/${terrarium.id}`)
                        .then((response) => response.text())
                        .then((reading) => {
                            setReadings((prevReadings) => ({
                                ...prevReadings,
                                [terrarium.id]: parseInt(reading, 10),
                            }));
                        })
                        .catch((error) => console.error(`Error fetching reading for terrarium ${terrarium.id}:`, error));
                });
            })
            .catch((error) => {
                console.error('Error fetching terrariums:', error);
                setLoading(false);
            });
    }, []);

    const renderTerrarium = ({ item }: { item: TerrariumDTO }) => (
        <View style={styles.terrariumContainer}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.readingText}>
                Temperature Reading: {readings[item.id] !== undefined ? readings[item.id] : 'Loading...'}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={terrariums}
                    keyExtractor={(item) => item.id.toString()}
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

export default TerrariumListScreen;
