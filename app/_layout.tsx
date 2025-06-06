import {Stack} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {StyleSheet} from "react-native";
import {ThemeProvider} from '@/context/ThemeContext';

export default function RootLayout() {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ThemeProvider>
                <Stack screenOptions={{headerShown: false}}/>
            </ThemeProvider>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    }
});