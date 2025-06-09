import {Stack} from "expo-router";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {StyleSheet} from "react-native";
import {ThemeProvider, useTheme} from '@/context/ThemeContext';
import {StatusBar} from "expo-status-bar";
import React from "react";

export default function RootLayout() {
    const { theme, isDark } = useTheme();
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <StatusBar
                    style={isDark ? "light" : "dark"}
                    backgroundColor={theme.Colors.white}
                />
                <ThemeProvider>
                    <Stack screenOptions={{headerShown: false}}/>
                </ThemeProvider>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    }
});