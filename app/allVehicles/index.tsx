import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@/Themes';

export default function VehiclesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Vehicles Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.Colors.background,
    },
    text: {
        fontSize: 24,
        color: theme.Colors.primary,
    },
});