import { Tabs } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function MainLayout() {
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.Colors.primary,
                tabBarInactiveTintColor: theme.Colors.gray,
                tabBarStyle: {
                    backgroundColor: theme.Colors.background,
                    borderTopWidth: 0, 
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Fuel Log',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="local-gas-station" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats/index"
                options={{
                    title: 'Statistics',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="query-stats" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings/index"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <Feather name="settings" size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}