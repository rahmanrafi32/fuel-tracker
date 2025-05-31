import {Stack} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {StyleSheet} from "react-native";

export default function RootLayout() {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <Stack screenOptions={{headerShown: false}}/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    }
});