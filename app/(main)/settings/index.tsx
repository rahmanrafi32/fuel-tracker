import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/Themes';

export interface MenuItem {
    id: number;
    title: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
    isPremium?: boolean;
    isLogout?: boolean;
}

export default function ProfileSettingsScreen(){
    const menuItems: MenuItem[] = [
        {
            id: 1,
            title: 'Edit vehicles',
            icon: 'car-outline',
            onPress: () => console.log('Edit vehicles pressed'),
        },
        {
            id: 2,
            title: 'Settings',
            icon: 'settings-outline',
            onPress: () => console.log('Settings pressed'),
        }
    ];

    const bottomMenuItems: MenuItem[] = [
        {
            id: 4,
            title: 'Help in translations',
            icon: 'language-outline',
            onPress: () => console.log('Help in translations pressed'),
        },
        {
            id: 5,
            title: 'Privacy policy',
            icon: 'shield-checkmark-outline',
            onPress: () => console.log('Privacy policy pressed'),
        },
        {
            id: 6,
            title: 'Rate',
            icon: 'star-outline',
            onPress: () => console.log('Rate pressed'),
        },
        {
            id: 7,
            title: 'Logout',
            icon: 'log-out-outline',
            isLogout: true,
            onPress: () => console.log('Logout pressed'),
        },
    ];

    const renderMenuItem = (item: MenuItem) => (
        <TouchableOpacity
            key={item.id}
            style={[
                styles.menuItem,
                item.isPremium && styles.premiumItem,
                item.isLogout && styles.logoutItem,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <View style={[
                    styles.iconContainer,
                    item.isPremium && styles.premiumIconContainer,
                    item.isLogout && styles.logoutIconContainer,
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
                    styles.menuItemText,
                    item.isPremium && styles.premiumText,
                    item.isLogout && styles.logoutText,
                ]}>
                    {item.title}
                </Text>
                {item.isPremium && (
                    <View style={styles.premiumBadge}>
                        <Ionicons name="diamond" size={12} color={theme.Colors.primary} />
                    </View>
                )}
            </View>
            <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={theme.Colors.gray}
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.Colors.background} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>MR</Text>
                        </View>
                    </View>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>Minhazur Rahman Rafi</Text>
                        <Text style={styles.userSubtitle}>Manage your account</Text>
                    </View>
                </View>

                {/* Main Menu Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.menuContainer}>
                        {menuItems.map(renderMenuItem)}
                    </View>
                </View>

                {/* Support & Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support & Information</Text>
                    <View style={styles.menuContainer}>
                        {bottomMenuItems.map(renderMenuItem)}
                    </View>
                </View>

                {/* Version Info */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: theme.Colors.white,
        marginBottom: theme.Spacing.md,
    },
    avatarContainer: {
        marginBottom: theme.Spacing.md,
    },
    avatar: {
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
    avatarText: {
        fontSize: theme.FontSizes.xl,
        fontWeight: '700',
        color: theme.Colors.white,
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: theme.FontSizes.large,
        fontWeight: '600',
        color: theme.Colors.textPrimary,
        marginBottom: theme.Spacing.xs,
    },
    userSubtitle: {
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