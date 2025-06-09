import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useTheme } from '@/context/ThemeContext';

export interface MenuItem {
    id: number;
    title: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    onPress?: () => void;
    isPremium?: boolean;
    isLogout?: boolean;
    hasToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (value: boolean) => void;
}

export default function ProfileSettingsScreen() {
    const router = useRouter();
    const { theme, isDark, setThemeType } = useTheme();

    const handleDarkModeToggle = (value: boolean) => {
        setThemeType(value ? 'dark' : 'light');
    };

    const menuItems: MenuItem[] = [
        {
            id: 1,
            title: 'Edit vehicles',
            icon: 'car-outline',
            onPress: () => router.push({ pathname: '../allVehicles' }),
        },
        {
            id: 2,
            title: 'Dark Mode',
            icon: 'moon-outline',
            hasToggle: true,
            toggleValue: isDark,
            onToggle: handleDarkModeToggle,
        },
    ];

    const renderMenuItem = (item: MenuItem) => (
        <TouchableOpacity
            key={item.id}
            style={styles(theme).menuItem}
            onPress={item.hasToggle ? undefined : item.onPress}
            activeOpacity={item.hasToggle ? 1 : 0.7}
            disabled={item.hasToggle}
        >
            <View style={styles(theme).menuItemLeft}>
                <View style={styles(theme).iconContainer}>
                    <Ionicons
                        name={item.icon}
                        size={20}
                        color={theme.Colors.gray}
                    />
                </View>
                <Text style={styles(theme).menuItemText}>
                    {item.title}
                </Text>
            </View>
            {item.hasToggle ? (
                <Switch
                    value={item.toggleValue}
                    onValueChange={item.onToggle}
                    trackColor={{
                        false: theme.Colors.background,
                        true: theme.Colors.primary + '40'
                    }}
                    thumbColor={item.toggleValue ? theme.Colors.primary : theme.Colors.gray}
                />
            ) : (
                <Ionicons
                    name="chevron-forward-outline"
                    size={18}
                    color={theme.Colors.gray}
                />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles(theme).container}>
            {/* Header */}
            <View style={styles(theme).newHeader}>
                <TouchableOpacity
                    style={styles(theme).backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.Colors.primary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles(theme).headerTitle}>Settings</Text>
                    <Text style={styles(theme).headerSubtitle}>Manage your preferences</Text>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles(theme).contentContainer}>
                {/* Settings List */}
                <ScrollView
                    style={styles(theme).scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles(theme).scrollContent}
                >
                    <View style={styles(theme).menuContainer}>
                        {menuItems.map(renderMenuItem)}
                    </View>
                </ScrollView>

                {/* Version at the bottom */}
                <View style={styles(theme).versionContainer}>
                    <Text style={styles(theme).versionText}>Version 1.0.0</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.Colors.background,
    },
    contentContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    newHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: theme.Spacing.md,
        paddingTop: theme.Spacing.lg,
        paddingBottom: theme.Spacing.md,
        backgroundColor: theme.Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: theme.Spacing.sm,
        marginRight: theme.Spacing.md,
        borderRadius: theme.BorderRadius.sm,
    },
    headerTitle: {
        fontSize: theme.FontSizes.xl,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.primary,
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
    },
    menuContainer: {
        marginTop: theme.Spacing.lg,
        backgroundColor: theme.Colors.white,
        paddingHorizontal: theme.Spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.Colors.background,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.Spacing.md,
    },
    menuItemText: {
        fontSize: theme.FontSizes.medium,
        fontWeight: '500',
        color: theme.Colors.textPrimary,
        flex: 1,
    },
    versionContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    versionText: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
    },
});