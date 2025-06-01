import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@/Themes';

export default function MainLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.Colors.primary,
                tabBarInactiveTintColor: theme.Colors.gray,
                tabBarStyle: {
                    backgroundColor: theme.Colors.background,
                    borderTopColor: '#ddd',
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
                name="allVehicles/index"
                options={{
                    title: 'Vehicles',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="directions-car" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile/index"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}