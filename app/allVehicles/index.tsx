import {useCallback, useState} from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from "@/context/ThemeContext";
import { AppText } from '@/components/AppText';
import { vehicles } from '@/config/Database';
import {CreateVehicleData} from "@/types/vehicle";

export default function VehiclesScreen() {
    const { theme } = useTheme();
    const [allVehicles, setVehicles] = useState<CreateVehicleData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const vehicleData = await vehicles.findAll();
            setVehicles(vehicleData);
        } catch (error) {
            console.error('Failed to load vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadVehicles();
        }, [])
    );

    const handleVehiclePress = (vehicleId: number) => {
        router.push({
            pathname: '/editVehicle',
            params: { id: vehicleId.toString() },
        });
    };

    const handleAddVehicle = () => {
        router.push('../addVehicle');
    };

    const getVehicleIcon = (type: string | undefined) => {
        switch (type?.toLowerCase()) {
            case 'motorcycle':
            case 'bike':
                return 'two-wheeler';
            case 'truck':
                return 'local-shipping';
            case 'suv':
            case 'car':
                return 'directions-car';
            default:
                return 'directions-car';
        }
    };

    const getVehicleColor = (index: number, theme: any) => {
        const colors = [
            theme.Colors.primary,
            theme.Colors.distanceOrange,
            theme.Colors.costGreen,
            theme.Colors.volumeYellow,
            theme.Colors.rateGray,
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <SafeAreaView style={styles(theme).safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={theme.Colors.background} />
                <View style={[styles(theme).container, styles(theme).centerContent]}>
                    <ActivityIndicator size="large" color={theme.Colors.primary} />
                    <AppText style={styles(theme).loadingText}>Loading your vehicles...</AppText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles(theme).safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.Colors.background} />
            <View style={styles(theme).container}>
                <View style={styles(theme).header}>
                    <View style={styles(theme).headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles(theme).backButton}>
                            <MaterialIcons name="arrow-back" size={24} color={theme.Colors.primary} />
                        </TouchableOpacity>
                        <AppText style={styles(theme).title}>My Vehicles</AppText>
                    </View>
                </View>

                {allVehicles.length === 0 ? (
                    <View style={[styles(theme).centerContent, styles(theme).emptyState]}>
                        <MaterialIcons name="directions-car" size={80} color={theme.Colors.gray} />
                        <AppText style={styles(theme).emptyTitle}>No Vehicles Yet</AppText>
                        <AppText style={styles(theme).emptySubtitle}>
                            Start by adding your first vehicle to track expenses.
                        </AppText>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles(theme).scrollContent}>
                        {allVehicles.map((vehicle, index) => (
                            <TouchableOpacity
                                key={vehicle.id}
                                style={[styles(theme).vehicleCard, { borderLeftColor: getVehicleColor(index, theme) }]}
                                onPress={() => handleVehiclePress(vehicle.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles(theme).iconCircle, { backgroundColor: getVehicleColor(index, theme) }]}>
                                    <MaterialIcons name={getVehicleIcon(vehicle.vehicleType)} size={28} color="#fff" />
                                </View>
                                <View style={styles(theme).info}>
                                    <AppText style={styles(theme).name}>{vehicle.name}</AppText>
                                    <AppText style={styles(theme).details}>
                                        {vehicle.make} {vehicle.model}
                                    </AppText>
                                    <View style={styles(theme).meta}>
                                        <AppText style={styles(theme).metaText}>{vehicle.year}</AppText>
                                        <AppText style={styles(theme).metaDot}>·</AppText>
                                        <AppText style={styles(theme).metaText}>{vehicle.fuelType}</AppText>
                                    </View>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color={theme.Colors.gray} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Floating Action Button */}
                <TouchableOpacity style={styles(theme).fab} onPress={handleAddVehicle}>
                    <AppText style={styles(theme).fabIcon}>+</AppText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.Colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: theme.Spacing.lg,
        paddingTop: theme.Spacing.xl,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.Colors.textSecondary,
    },
    header: {
        marginBottom: theme.Spacing.xl,
    },
    title: {
        fontSize: theme.FontSizes.xl,
        fontWeight: 'bold',
        color: theme.Colors.textHeader,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.Colors.textPrimary,
    },
    details: {
        fontSize: 14,
        color: theme.Colors.textSecondary,
        marginTop: 2,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    metaText: {
        fontSize: 13,
        color: theme.Colors.textSecondary,
    },
    metaDot: {
        marginHorizontal: 6,
        fontSize: 13,
        color: theme.Colors.textSecondary,
    },
    emptyState: {
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.Colors.textPrimary,
        marginTop: 24,
    },
    emptySubtitle: {
        fontSize: 15,
        color: theme.Colors.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
        padding: 4
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: theme.Colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: theme.Colors.white,
    },
});