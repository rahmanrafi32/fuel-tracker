import { Tabs } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function MainLayout() {
    const { theme, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.Colors.primary,
                tabBarInactiveTintColor: theme.Colors.gray,
                tabBarStyle: {
                    backgroundColor: theme.Colors.background,
                    borderTopColor: isDark ? '#333' : '#ddd',
                },
            }}
        >
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Fuel Log',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="local-gas-station" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings/index"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}