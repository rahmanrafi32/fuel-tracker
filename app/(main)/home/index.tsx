import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Animated,
    SafeAreaView
} from 'react-native';
import {useRouter} from 'expo-router';
import {AppText} from '@/components/AppText';
import theme from '@/Themes';
import {MaterialIcons} from '@expo/vector-icons';
import React, {JSX, useEffect, useRef} from 'react';

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

interface EntryCardProps {
    entry: FuelEntry;
    index: number;
}

export default function FuelLogScreen(): JSX.Element {
    const router = useRouter();

    const fuelEntries: FuelEntry[] = [
        {
            id: 1,
            odometer: '13,559',
            date: '29-05-2025',
            distance: '106 km',
            volume: '4 l',
            cost: '500.00 BDT',
            rate: '125.0 BDT/l',
            mileage: '26.5',
            efficiency: 'excellent'
        },
        {
            id: 2,
            odometer: '13,453',
            date: '06-05-2025',
            distance: '148 km',
            volume: '4 l',
            cost: '500.00 BDT',
            rate: '125.0 BDT/l',
            mileage: '37.0',
            efficiency: 'excellent'
        },
        {
            id: 3,
            odometer: '13,305',
            date: '18-04-2025',
            distance: '66 km',
            volume: '4 l',
            cost: '500.22 BDT',
            rate: '126.0 BDT/l',
            mileage: '16.5',
            efficiency: 'poor'
        },
        {
            id: 4,
            odometer: '13,239',
            date: '09-04-2025',
            distance: '---',
            volume: '4 l',
            cost: '500.22 BDT',
            rate: '126.0 BDT/l',
            mileage: '---',
            efficiency: 'unknown'
        },
    ];

    const getEfficiencyColor = (efficiency: FuelEntry['efficiency']): string => {
        switch(efficiency) {
            case 'excellent': return '#4CAF50';
            case 'good': return '#FF9800';
            case 'poor': return '#F44336';
            default: return theme.Colors.gray;
        }
    };

    type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

    const getEfficiencyIcon = (efficiency: FuelEntry['efficiency']): MaterialIconName => {
        switch(efficiency) {
            case 'excellent': return 'eco';
            case 'good': return 'warning';
            case 'poor': return 'error';
            default: return 'help';
        }
    };

    const EntryCard: React.FC<EntryCardProps> = ({entry, index}) => {
        const cardAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        return (
            <Animated.View
                style={[
                    styles.cardWrapper,
                    {
                        opacity: cardAnim,
                        transform: [{
                            translateY: cardAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            })
                        }]
                    }
                ]}
            >
                <View style={styles.entryCard}>
                    <View style={styles.headerRow}>
                        <View style={styles.badgeContainer}>
                            <View style={styles.badge}>
                                <MaterialIcons name="local-gas-station" size={14} color="white" />
                                <AppText style={styles.badgeText}>Fueling</AppText>
                            </View>
                        </View>
                        <View style={styles.odometerContainer}>
                            <AppText style={styles.odometerText}>
                                <AppText style={styles.bold}>{entry.odometer} km</AppText>
                            </AppText>
                            <AppText style={styles.dateText}>{entry.date}</AppText>
                        </View>
                    </View>

                    <View style={styles.mileageRow}>
                        <View style={styles.mileageContainer}>
                            <AppText style={styles.mileageValue}>{entry.mileage}</AppText>
                            <AppText style={styles.mileageUnit}>km/l</AppText>
                            <MaterialIcons
                                name={getEfficiencyIcon(entry.efficiency)}
                                size={16}
                                color={getEfficiencyColor(entry.efficiency)}
                                style={styles.efficiencyIcon}
                            />
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={[styles.statDot, {backgroundColor: theme.Colors.distanceOrange}]} />
                            <View style={styles.statContent}>
                                <AppText style={styles.statLabel}>Distance</AppText>
                                <AppText style={styles.statValue}>{entry.distance}</AppText>
                            </View>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statDot, {backgroundColor: theme.Colors.volumeYellow}]} />
                            <View style={styles.statContent}>
                                <AppText style={styles.statLabel}>Volume</AppText>
                                <AppText style={styles.statValue}>{entry.volume}</AppText>
                            </View>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statDot, {backgroundColor: theme.Colors.costGreen}]} />
                            <View style={styles.statContent}>
                                <AppText style={styles.statLabel}>Cost</AppText>
                                <AppText style={styles.statValue}>{entry.cost}</AppText>
                            </View>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statDot, {backgroundColor: '#9C27B0'}]} />
                            <View style={styles.statContent}>
                                <AppText style={styles.statLabel}>Rate</AppText>
                                <AppText style={styles.statValue}>{entry.rate}</AppText>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <AppText style={styles.title}>Fuel Log</AppText>

                <View style={styles.vehicleCard}>
                    <MaterialIcons name="two-wheeler" size={24} color={theme.Colors.white} style={styles.vehicleIcon}/>
                    <AppText style={styles.vehicleText}>KPR</AppText>
                </View>

                <AppText style={styles.detailsTitle}>Recent Entries</AppText>

                <ScrollView
                    style={styles.entriesContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {fuelEntries.map((entry, index) => (
                        <EntryCard key={entry.id} entry={entry} index={index} />
                    ))}
                </ScrollView>

                <TouchableOpacity style={styles.fab} onPress={() => router.push('/refuel')}>
                    <AppText style={styles.fabIcon}>+</AppText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        shadowOpacity: 0.15, // Increased opacity
        shadowOffset: {width: 0, height: 6}, // Increased offset
        shadowRadius: 16, // Increased radius
        elevation: 8, // Increased elevation for Android
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
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: theme.Colors.white,
    },
});