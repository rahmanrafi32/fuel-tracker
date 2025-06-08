import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
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
            onPress: () => router.push({
                pathname: '../allVehicles',
            }),
        },
        {
            id: 2,
            title: 'Dark Mode',
            icon: 'moon-outline',
            hasToggle: true,
            toggleValue: isDark,
            onToggle: handleDarkModeToggle,
        },
        // {
        //     id: 3,
        //     title: 'Settings',
        //     icon: 'settings-outline',
        //     onPress: () => console.log('Settings pressed'),
        // }
    ];

    // will integrate later. 
    // const bottomMenuItems: MenuItem[] = [
    //     {
    //         id: 4,
    //         title: 'Help in translations',
    //         icon: 'language-outline',
    //         onPress: () => console.log('Help in translations pressed'),
    //     },
    //     {
    //         id: 5,
    //         title: 'Privacy policy',
    //         icon: 'shield-checkmark-outline',
    //         onPress: () => console.log('Privacy policy pressed'),
    //     },
    //     {
    //         id: 6,
    //         title: 'Rate',
    //         icon: 'star-outline',
    //         onPress: () => console.log('Rate pressed'),
    //     },
    //     {
    //         id: 7,
    //         title: 'About',
    //         icon: 'information-circle-outline',
    //         onPress: () => console.log('About pressed'),
    //     },
    // ];

    const renderMenuItem = (item: MenuItem) => (
        <TouchableOpacity
            key={item.id}
            style={[
                styles(theme).menuItem,
                item.isPremium && styles(theme).premiumItem,
                item.isLogout && styles(theme).logoutItem,
            ]}
            onPress={item.hasToggle ? undefined : item.onPress}
            activeOpacity={item.hasToggle ? 1 : 0.7}
            disabled={item.hasToggle}
        >
            <View style={styles(theme).menuItemLeft}>
                <View style={[
                    styles(theme).iconContainer,
                    item.isPremium && styles(theme).premiumIconContainer,
                    item.isLogout && styles(theme).logoutIconContainer,
                ]}>
                    <Ionicons
                        name={item.icon}
                        size={20}
                        color={
                            item.isPremium
                                ? theme.Colors.primary
                                : item.isLogout
                                    ? theme.Colors.error
                                    : theme.Colors.gray
                        }
                    />
                </View>
                <Text style={[
                    styles(theme).menuItemText,
                    item.isPremium && styles(theme).premiumText,
                    item.isLogout && styles(theme).logoutText,
                ]}>
                    {item.title}
                </Text>
                {item.isPremium && (
                    <View style={styles(theme).premiumBadge}>
                        <Ionicons name="diamond" size={12} color={theme.Colors.primary} />
                    </View>
                )}
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
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={theme.Colors.background}
            />

            <ScrollView style={styles(theme).scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles(theme).header}>
                    {/* App Icon */}
                    <View style={styles(theme).appIconContainer}>
                        <View style={styles(theme).appIcon}>
                            <Ionicons name="car" size={32} color={theme.Colors.white} />
                        </View>
                    </View>

                    {/* App Info */}
                    <View style={styles(theme).appInfo}>
                        <Text style={styles(theme).appName}>Vehicle Manager</Text>
                        <Text style={styles(theme).appSubtitle}>Manage your settings and preferences</Text>
                    </View>
                </View>

                {/* Main Menu Section */}
                <View style={styles(theme).section}>
                    <Text style={styles(theme).sectionTitle}>Settings</Text>
                    <View style={styles(theme).menuContainer}>
                        {menuItems.map(renderMenuItem)}
                    </View>
                </View>

                {/* Support & Info Section */}
                {/*<View style={styles(theme).section}>*/}
                {/*    <Text style={styles(theme).sectionTitle}>Support & Information</Text>*/}
                {/*    <View style={styles(theme).menuContainer}>*/}
                {/*        {bottomMenuItems.map(renderMenuItem)}*/}
                {/*    </View>*/}
                {/*</View>*/}

                {/* Version Info */}
                <View style={styles(theme).versionContainer}>
                    <Text style={styles(theme).versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: theme.Spacing.xl,
        paddingHorizontal: theme.Spacing.lg,
        backgroundColor: theme.Colors.cardBackground,
        marginBottom: theme.Spacing.md,
    },
    appIconContainer: {
        marginBottom: theme.Spacing.md,
    },
    appIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: theme.Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    appInfo: {
        alignItems: 'center',
    },
    appName: {
        fontSize: theme.FontSizes.large,
        fontWeight: '600',
        color: theme.Colors.textPrimary,
        marginBottom: theme.Spacing.xs,
    },
    appSubtitle: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textSecondary,
    },
    section: {
        marginBottom: theme.Spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.FontSizes.medium,
        fontWeight: '600',
        color: theme.Colors.textHeader,
        marginBottom: theme.Spacing.sm,
        marginHorizontal: theme.Spacing.lg,
    },
    menuContainer: {
        backgroundColor: theme.Colors.cardBackground,
        marginHorizontal: theme.Spacing.md,
        borderRadius: theme.BorderRadius.md,
        elevation: 2,
        shadowColor: theme.Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.Spacing.md,
        paddingHorizontal: theme.Spacing.lg,
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
    premiumIconContainer: {
        backgroundColor: theme.Colors.badgeLight,
    },
    logoutIconContainer: {
        backgroundColor: '#fef2f2',
    },
    menuItemText: {
        fontSize: theme.FontSizes.medium,
        fontWeight: '500',
        color: theme.Colors.textPrimary,
        flex: 1,
    },
    premiumText: {
        color: theme.Colors.primary,
        fontWeight: '600',
    },
    logoutText: {
        color: theme.Colors.error,
        fontWeight: '500',
    },
    premiumItem: {
        backgroundColor: '#fff7ed',
    },
    logoutItem: {
        backgroundColor: '#fef2f2',
    },
    premiumBadge: {
        marginLeft: theme.Spacing.sm,
        backgroundColor: theme.Colors.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: theme.Spacing.lg,
        marginBottom: theme.Spacing.xl,
    },
    versionText: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
    },
});