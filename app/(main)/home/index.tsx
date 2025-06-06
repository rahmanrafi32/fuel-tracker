import React, { JSX, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    View,
    StyleSheet,
    Modal,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {AppText}  from '@/components/AppText';
import type { RefuelLog } from '@/config/Database';
import { refuels, vehicles } from '@/config/Database';
import {useTheme} from "@/context/ThemeContext";

interface FuelEntry {
    id: number;
    odometer: string;
    date: string;
    distance: string;
    volume: string;
    cost: string;
    rate: string;
    mileage: string;
    efficiency: 'excellent' | 'good' | 'poor' | 'unknown';
}

interface Vehicle {
    id: number;
    name: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
    fuelType: string;
    tankCapacity?: number;
}

interface EntryCardProps {
    entry: FuelEntry;
}

export default function FuelLogScreen(): JSX.Element {
    const { theme, isDark } = useTheme();
    const router = useRouter();

    const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>();
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
    const [vehicleDropdownVisible, setVehicleDropdownVisible] = useState<boolean>(false);
    const [vehicleLoading, setVehicleLoading] = useState<boolean>(false);

    const transformRefuelLogToFuelEntry = useCallback((refuelLogs: RefuelLog[]): FuelEntry[] => {
        return refuelLogs.map((log, index) => {
            const prevLog = refuelLogs[index + 1];

            let distance = '---';
            let mileage = '---';
            let efficiency: FuelEntry['efficiency'] = 'unknown';

            if (prevLog && log.odometer > prevLog.odometer) {
                const distanceKm = log.odometer - prevLog.odometer;
                distance = `${distanceKm.toFixed(0)} km`;

                const kmPerLiter = distanceKm / log.liters;
                mileage = kmPerLiter.toFixed(1);

                if (kmPerLiter >= 35) {
                    efficiency = 'excellent';
                } else if (kmPerLiter >= 25) {
                    efficiency = 'good';
                } else {
                    efficiency = 'poor';
                }
            }

            return {
                id: log.id,
                odometer: log.odometer.toLocaleString(),
                date: new Date(log.date).toLocaleDateString('en-GB'),
                distance,
                volume: `${log.liters.toFixed(1)} l`,
                cost: `${log.cost.toFixed(2)} BDT`,
                rate: `${log.pricePerLiter.toFixed(1)} BDT/l`,
                mileage,
                efficiency,
            };
        });
    }, []);

    const fetchFuelEntries = useCallback(
        async (vehicleId: number) => {
            try {
                setVehicleLoading(true);
                const refuelLogs = await refuels.findAll(vehicleId);
                const transformedEntries = transformRefuelLogToFuelEntry(refuelLogs);
                setFuelEntries(transformedEntries);
            } catch (err) {
                console.error('Error fetching fuel entries:', err);
                setError('Failed to load fuel entries');
                Alert.alert('Error', 'Failed to load fuel entries. Please try again.');
                setFuelEntries([]);
            } finally {
                setVehicleLoading(false);
            }
        },
        [transformRefuelLogToFuelEntry]
    );

    const fetchVehicles = useCallback(async () => {
        try {
            setVehicleLoading(true);
            const vehiclesData = await vehicles.findAll();
            setAvailableVehicles(vehiclesData);

            if (vehiclesData.length > 0) {
                const currentVehicleExists = vehiclesData.some(v => v.id === selectedVehicleId);

                if (!selectedVehicleId || !currentVehicleExists) {
                    const newSelectedId = vehiclesData[vehiclesData.length - 1].id;
                    setSelectedVehicleId(newSelectedId);
                    await fetchFuelEntries(newSelectedId);
                } else if (selectedVehicleId) {
                    await fetchFuelEntries(selectedVehicleId);
                }
            } else {
                setSelectedVehicleId(undefined);
                setFuelEntries([]);
            }
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('Failed to load vehicles');
            Alert.alert('Error', 'Failed to load vehicles. Please try again.', [{ text: 'OK' }]);
        } finally {
            setVehicleLoading(false);
        }
    }, [selectedVehicleId, fetchFuelEntries]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        await fetchVehicles();
        setLoading(false);
    }, [fetchVehicles]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // This effect will run every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchVehicles();
        }, [fetchVehicles])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchVehicles().then(() => setRefreshing(false));
    }, [fetchVehicles]);

    const handleAddRefuel = () => {
        if (!selectedVehicleId) return;
        router.push({
            pathname: '/refuel',
            params: { vehicleId: selectedVehicleId.toString() },
        });
    };

    const handleAddVehicle = () => {
        setVehicleDropdownVisible(false);
        router.push('../addVehicle');
    };

    const onSelectVehicle = useCallback((vehicleId: number | 'add_vehicle') => {
        if (vehicleId === 'add_vehicle') {
            handleAddVehicle();
        } else {
            setSelectedVehicleId(vehicleId);
            setVehicleDropdownVisible(false);
            fetchFuelEntries(vehicleId);
        }
    }, [fetchFuelEntries]);

    const getEfficiencyColor = (efficiency: FuelEntry['efficiency']): string => {
        switch (efficiency) {
            case 'excellent':
                return '#4CAF50';
            case 'good':
                return '#FF9800';
            case 'poor':
                return '#F44336';
            default:
                return theme.Colors.gray;
        }
    };

    type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

    const getEfficiencyIcon = (efficiency: FuelEntry['efficiency']): MaterialIconName => {
        switch (efficiency) {
            case 'excellent':
                return 'eco';
            case 'good':
                return 'warning';
            case 'poor':
                return 'error';
            default:
                return 'help';
        }
    };

    const EntryCard: React.FC<EntryCardProps> = ({ entry }) => {
        const router = useRouter();

        const handleEntryPress = () => {
            router.push({
                pathname: '../editFuel',
                params: { entryId: entry.id },
            });
        };

        return (
            <View style={styles(theme).cardWrapper}>
                <TouchableOpacity style={styles(theme).entryCard} onPress={handleEntryPress}>
                    <View style={styles(theme).headerRow}>
                        <View style={styles(theme).badgeContainer}>
                            <View style={styles(theme).badge}>
                                <MaterialIcons name="local-gas-station" size={14} color="white" />
                                <AppText style={styles(theme).badgeText}>Fueling</AppText>
                            </View>
                        </View>
                        <View style={styles(theme).odometerContainer}>
                            <AppText style={styles(theme).odometerText}>
                                <AppText style={styles(theme).bold}>{entry.odometer} km</AppText>
                            </AppText>
                            <AppText style={styles(theme).dateText}>{entry.date}</AppText>
                        </View>
                    </View>

                    <View style={styles(theme).mileageRow}>
                        <View style={styles(theme).mileageContainer}>
                            <AppText style={styles(theme).mileageValue}>{entry.mileage}</AppText>
                            <AppText style={styles(theme).mileageUnit}>km/l</AppText>
                            <MaterialIcons
                                name={getEfficiencyIcon(entry.efficiency)}
                                size={16}
                                color={getEfficiencyColor(entry.efficiency)}
                                style={styles(theme).efficiencyIcon}
                            />
                        </View>
                    </View>

                    <View style={styles(theme).statsGrid}>
                        <View style={styles(theme).statItem}>
                            <View style={[styles(theme).statDot, { backgroundColor: theme.Colors.distanceOrange }]} />
                            <View style={styles(theme).statContent}>
                                <AppText style={styles(theme).statLabel}>Distance</AppText>
                                <AppText style={styles(theme).statValue}>{entry.distance}</AppText>
                            </View>
                        </View>

                        <View style={styles(theme).statItem}>
                            <View style={[styles(theme).statDot, { backgroundColor: theme.Colors.volumeYellow }]} />
                            <View style={styles(theme).statContent}>
                                <AppText style={styles(theme).statLabel}>Volume</AppText>
                                <AppText style={styles(theme).statValue}>{entry.volume}</AppText>
                            </View>
                        </View>

                        <View style={styles(theme).statItem}>
                            <View style={[styles(theme).statDot, { backgroundColor: theme.Colors.costGreen }]} />
                            <View style={styles(theme).statContent}>
                                <AppText style={styles(theme).statLabel}>Cost</AppText>
                                <AppText style={styles(theme).statValue}>{entry.cost}</AppText>
                            </View>
                        </View>

                        <View style={styles(theme).statItem}>
                            <View style={[styles(theme).statDot, { backgroundColor: '#9C27B0' }]} />
                            <View style={styles(theme).statContent}>
                                <AppText style={styles(theme).statLabel}>Rate</AppText>
                                <AppText style={styles(theme).statValue}>{entry.rate}</AppText>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const VehicleDropdownModal: React.FC<{
        visible: boolean;
        vehicles: Vehicle[];
        selectedVehicleId?: number;
        onSelect: (id: number | 'add_vehicle') => void;
        onClose: () => void;
    }> = ({ visible, vehicles, selectedVehicleId, onSelect, onClose }) => (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <TouchableOpacity style={styles(theme).modalTouchable} onPress={onClose} activeOpacity={1}>
                <View style={styles(theme).dropdownModal}>
                    <AppText style={styles(theme).dropdownTitle}>Select Vehicle</AppText>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {vehicles.map((vehicle) => (
                            <TouchableOpacity
                                key={vehicle.id}
                                style={[
                                    styles(theme).dropdownOption,
                                    selectedVehicleId === vehicle.id && styles(theme).selectedOption,
                                ]}
                                onPress={() => onSelect(vehicle.id)}
                            >
                                <AppText
                                    style={[
                                        styles(theme).dropdownOptionText,
                                        selectedVehicleId === vehicle.id && styles(theme).selectedOptionText,
                                    ]}
                                >
                                    {vehicle.name}
                                </AppText>
                                {selectedVehicleId === vehicle.id && (
                                    <MaterialIcons name="check" size={20} color={theme.Colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles(theme).dropdownOption, { borderTopWidth: 1, borderTopColor: '#ddd' }]}
                            onPress={() => onSelect('add_vehicle')}
                        >
                            <AppText style={[styles(theme).dropdownOptionText, { color: theme.Colors.primary }]}>
                                + Add Vehicle
                            </AppText>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles(theme).safeArea}>
                <View style={[styles(theme).container, styles(theme).centerContent]}>
                    <ActivityIndicator size="large" color={theme.Colors.primary} />
                    <AppText style={styles(theme).loadingText}>Loading data...</AppText>
                </View>
            </SafeAreaView>
        );
    }

    if (!loading && availableVehicles.length === 0) {
        return (
            <SafeAreaView style={styles(theme).safeArea}>
                <View style={styles(theme).container}>
                    <AppText style={styles(theme).title}>Fuel Log</AppText>

                    <View style={[styles(theme).container, styles(theme).centerContent]}>
                        <MaterialIcons name="directions-car" size={64} color={theme.Colors.gray} />
                        <AppText style={styles(theme).emptyTitle}>No Vehicles Available</AppText>
                        <AppText style={styles(theme).emptySubtitle}>
                            Add a vehicle to start tracking fuel consumption
                        </AppText>
                        <TouchableOpacity style={styles(theme).emptyButton} onPress={handleAddVehicle}>
                            <AppText style={styles(theme).emptyButtonText}>Add Vehicle</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles(theme).safeArea}>
            <View style={styles(theme).container}>
                <AppText style={styles(theme).title}>Fuel Log</AppText>

                <TouchableOpacity
                    style={styles(theme).vehicleCard}
                    onPress={() => setVehicleDropdownVisible(true)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="two-wheeler"
                        size={24}
                        color={theme.Colors.white}
                        style={styles(theme).vehicleIcon}
                    />
                    <AppText style={styles(theme).vehicleText}>
                        {availableVehicles.find((v) => v.id === selectedVehicleId)?.name || 'Vehicle'}
                    </AppText>
                    <MaterialIcons
                        name="arrow-drop-down"
                        size={24}
                        color={theme.Colors.white}
                        style={{ marginLeft: 'auto' }}
                    />
                </TouchableOpacity>

                {vehicleLoading ? (
                    <View style={[styles(theme).container, styles(theme).centerContent]}>
                        <ActivityIndicator size="large" color={theme.Colors.primary} />
                        <AppText style={styles(theme).loadingText}>Loading vehicle data...</AppText>
                    </View>
                ) : fuelEntries.length === 0 ? (
                    <View style={[styles(theme).container, styles(theme).centerContent]}>
                        <MaterialIcons name="local-gas-station" size={64} color={theme.Colors.gray} />
                        <AppText style={styles(theme).emptyTitle}>No Fuel Entries</AppText>
                        <AppText style={styles(theme).emptySubtitle}>
                            Start tracking your fuel consumption by adding your first entry
                        </AppText>
                        <TouchableOpacity style={styles(theme).emptyButton} onPress={handleAddRefuel}>
                            <AppText style={styles(theme).emptyButtonText}>Add First Entry</AppText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <AppText style={styles(theme).detailsTitle}>Recent Entries ({fuelEntries.length})</AppText>

                        <ScrollView
                            style={styles(theme).entriesContainer}
                            contentContainerStyle={styles(theme).scrollContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={[theme.Colors.primary]}
                                    tintColor={theme.Colors.primary}
                                />
                            }
                        >
                            {fuelEntries.map((entry) => (
                                <EntryCard key={entry.id} entry={entry} />
                            ))}
                        </ScrollView>
                    </>
                )}

                {fuelEntries.length > 0 && (
                    <TouchableOpacity style={styles(theme).fab} onPress={handleAddRefuel}>
                        <AppText style={styles(theme).fabIcon}>+</AppText>
                    </TouchableOpacity>
                )}

                <VehicleDropdownModal
                    visible={vehicleDropdownVisible}
                    vehicles={availableVehicles}
                    selectedVehicleId={selectedVehicleId}
                    onSelect={onSelectVehicle}
                    onClose={() => setVehicleDropdownVisible(false)}
                />
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
        paddingHorizontal: theme.Spacing.md,
        backgroundColor: theme.Colors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.Colors.primary,
        marginBottom: theme.Spacing.sm,
        paddingTop: theme.Spacing.sm,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.Colors.primary,
        padding: theme.Spacing.sm,
        borderRadius: 12,
        marginBottom: theme.Spacing.md,
    },
    vehicleIcon: {
        marginRight: theme.Spacing.sm,
    },
    vehicleText: {
        color: theme.Colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    detailsTitle: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.primary,
        marginBottom: theme.Spacing.md,
    },
    entriesContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    cardWrapper: {
        marginHorizontal: 4,
        marginBottom: theme.Spacing.md,
    },
    entryCard: {
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: 20,
        padding: theme.Spacing.lg,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.Spacing.md,
    },
    badgeContainer: {
        flex: 1,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.Colors.primary,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: theme.Colors.white,
        fontWeight: '600',
        fontSize: 12,
        marginLeft: 4,
    },
    odometerContainer: {
        alignItems: 'flex-end',
        flex: 1,
    },
    odometerText: {
        fontSize: 16,
        color: theme.Colors.textPrimary,
    },
    dateText: {
        fontSize: 14,
        color: theme.Colors.textSecondary,
        marginTop: 2,
    },
    bold: {
        fontWeight: '700',
    },
    mileageRow: {
        alignItems: 'center',
        marginBottom: theme.Spacing.md,
    },
    mileageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    mileageValue: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.Colors.primary,
    },
    mileageUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.Colors.textSecondary,
        marginLeft: 4,
    },
    efficiencyIcon: {
        marginLeft: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: theme.Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.6)',
        padding: 12,
        borderRadius: 12,
    },
    statDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: theme.Colors.textSecondary,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 14,
        color: theme.Colors.textPrimary,
        fontWeight: '600',
        marginTop: 2,
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.Colors.gray,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.Colors.textPrimary,
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.Colors.gray,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    emptyButton: {
        backgroundColor: theme.Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    emptyButtonText: {
        color: theme.Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalTouchable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModal: {
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: theme.BorderRadius.lg,
        padding: theme.Spacing.lg,
        width: '80%',
        maxWidth: 300,
        shadowColor: theme.Colors.black,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 10,
    },
    dropdownTitle: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
        marginBottom: theme.Spacing.md,
        textAlign: 'center',
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.Spacing.sm,
        paddingHorizontal: theme.Spacing.md,
        borderRadius: theme.BorderRadius.sm,
        marginBottom: theme.Spacing.xs,
    },
    selectedOption: {
        backgroundColor: '#fff7ed',
    },
    dropdownOptionText: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
    },
    selectedOptionText: {
        color: theme.Colors.primary,
        fontWeight: theme.FontWeight.medium,
    },
});