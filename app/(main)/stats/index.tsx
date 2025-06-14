import React, {useEffect, useState} from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Text
} from 'react-native';
import {useTheme} from '@/context/ThemeContext';
import {
    getOverallStatistics,
    getPriceAnalysis,
    getTopExpensiveRefuels,
    getVehicleRefuelSummary,
    RefuelStatistics
} from '@/config/Database/queries/refuel';
import {AppText} from '@/components/AppText';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import Svg, {Circle, Rect, Text as SvgText, Line, G, Path} from 'react-native-svg';
import {ChartCardProps, MetricCardProps, PriceStats, TopRefuel, VehicleStat} from "@/types/stats";

const {width: screenWidth} = Dimensions.get('window');

export default function StatisticsScreen() {
    const {theme} = useTheme();
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [overallStats, setOverallStats] = useState<RefuelStatistics | null>(null);
    const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
    const [vehicleStats, setVehicleStats] = useState<VehicleStat[]>([]);
    const [topRefuels, setTopRefuels] = useState<TopRefuel[]>([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [overall, price, vehicleSummary, expensiveRefuels] = await Promise.all([
                    getOverallStatistics(),
                    getPriceAnalysis(),
                    getVehicleRefuelSummary(),
                    getTopExpensiveRefuels(5),
                ]);

                setOverallStats(overall as RefuelStatistics);
                setPriceStats(price as PriceStats);
                setVehicleStats(vehicleSummary as VehicleStat[]);
                setTopRefuels(expensiveRefuels as TopRefuel[]);
            } catch (err) {
                console.error('Error loading statistics:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const handleBack = (): void => {
        router.back();
    };

    if (loading) {
        return (
            <View style={styles(theme).loadingContainer}>
                <ActivityIndicator size="large" color={theme.Colors.primary}/>
                <AppText style={styles(theme).loadingText}>Loading Statistics...</AppText>
            </View>
        );
    }

    if (!overallStats || !priceStats) {
        return (
            <View style={styles(theme).loadingContainer}>
                <Ionicons name="analytics-outline" size={64} color={theme.Colors.gray}/>
                <AppText style={styles(theme).noDataText}>No statistics available</AppText>
                <AppText style={styles(theme).noDataSubtext}>Start adding some refuel records!</AppText>
            </View>
        );
    }

    return (
        <View style={styles(theme).container}>
            {/* Header */}
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={handleBack} style={styles(theme).headerBackButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.Colors.primary}/>
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Statistics</Text>
                <View style={styles(theme).headerPlaceholder}/>
            </View>

            <ScrollView
                style={styles(theme).scrollView}
                contentContainerStyle={styles(theme).scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Stats Cards */}
                <View style={styles(theme).metricsGrid}>
                    <MetricCard
                        title="Total Spent"
                        value={`${overallStats.totalCost.toLocaleString()} BDT`}
                        icon="card-outline"
                        color="#ef4444"
                        subtitle="All time"
                    />
                    <MetricCard
                        title="Total Fuel"  
                        value={`${overallStats.totalLiters.toFixed(0)} L`}
                        icon="car-outline"
                        color="#10b981"
                        subtitle={`${overallStats.totalRefuels} refuels`}
                    />
                    <MetricCard
                        title="Avg. Price"
                        value={`${overallStats.averageCostPerLiter.toFixed(1)} BDT/L`}
                        icon="trending-up-outline"
                        color="#f59e0b"
                        subtitle="Per liter"
                    />
                    <MetricCard
                        title="Avg. Mileage"
                        value={`${overallStats.averageLitersPerRefuel.toFixed(1)} L`}
                        icon="speedometer-outline"
                        color="#8b5cf6"
                        subtitle="Per session"
                    />
                </View>

                {/* Price Analysis Chart */}
                <ChartCard title="💰 Price Analysis" height={300}>
                    <PriceBarChart
                        lowPrice={priceStats.lowestPrice}
                        avgPrice={priceStats.averagePrice}
                        highPrice={priceStats.highestPrice}
                        width={screenWidth - 60}
                        height={220}
                        theme={theme}
                    />
                </ChartCard>

                {/* Vehicle Distribution */}
                {vehicleStats.length > 0 && (
                    <ChartCard title="🚗 Vehicle Cost Distribution" height={350}>
                        <VehiclePieChart
                            vehicles={vehicleStats}
                            width={screenWidth - 60}
                            height={270}
                            theme={theme}
                        />
                    </ChartCard>
                )}

                {/* Top Refuels Chart */}
                {topRefuels.length > 0 && (
                    <ChartCard title="📊 Most Expensive Refuels" height={300}>
                        <TopRefuelsChart
                            refuels={topRefuels.slice(0, 5)}
                            width={screenWidth - 60}
                            height={220}
                            theme={theme}
                        />
                    </ChartCard>
                )}

                {/* Vehicle Details */}
                <View style={styles(theme).sectionContainer}>
                    <AppText style={styles(theme).sectionTitle}>🚙 Vehicle Summary</AppText>
                    {vehicleStats.map((vehicle, index) => (
                        <View key={index} style={styles(theme).vehicleCard}>
                            <View style={styles(theme).vehicleHeader}>
                                <View style={styles(theme).vehicleIcon}>
                                    <Ionicons name="car" size={20} color={theme.Colors.primary}/>
                                </View>
                                <View style={styles(theme).vehicleInfo}>
                                    <AppText style={styles(theme).vehicleName}>{vehicle.vehicleName}</AppText>
                                    <AppText style={styles(theme).vehicleModel}>
                                        {vehicle.vehicleMake} {vehicle.vehicleModel}
                                    </AppText>
                                </View>
                                <View style={styles(theme).vehicleStats}>
                                    <AppText style={styles(theme).vehicleCost}>
                                        {vehicle.totalCost.toLocaleString()} BDT
                                    </AppText>
                                    <AppText style={styles(theme).vehicleRefuels}>
                                        {vehicle.refuelCount} refuels
                                    </AppText>
                                </View>
                            </View>

                            <View style={styles(theme).vehicleDetails}>
                                <View style={styles(theme).detailItem}>
                                    <Ionicons name="water-outline" size={16} color={theme.Colors.textSecondary}/>
                                    <AppText style={styles(theme).detailText}>
                                        {vehicle.totalLiters.toFixed(1)} L total
                                    </AppText>
                                </View>
                                <View style={styles(theme).detailItem}>
                                    <Ionicons name="time-outline" size={16} color={theme.Colors.textSecondary}/>
                                    <AppText style={styles(theme).detailText}>
                                        Last: {vehicle.lastRefuelDate}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Recent Top Refuels */}
                <View style={styles(theme).sectionContainer}>
                    <AppText style={styles(theme).sectionTitle}>⛽ Recent Top Refuels</AppText>
                    {topRefuels.slice(0, 3).map((refuel, index) => (
                        <View key={refuel.id} style={styles(theme).refuelCard}>
                            <View style={styles(theme).refuelHeader}>
                                <View style={styles(theme).refuelRank}>
                                    <AppText style={styles(theme).rankText}>#{index + 1}</AppText>
                                </View>
                                <View style={styles(theme).refuelInfo}>
                                    <AppText style={styles(theme).refuelVehicle}>{refuel.vehicleName}</AppText>
                                    <AppText style={styles(theme).refuelDate}>{refuel.date}</AppText>
                                </View>
                                <View style={styles(theme).refuelAmount}>
                                    <AppText style={styles(theme).refuelCost}>{refuel.cost.toFixed(0)} BDT</AppText>
                                    <AppText style={styles(theme).refuelLiters}>{refuel.liters.toFixed(1)} L</AppText>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

// Custom Chart Components (unchanged from your original implementation)
function PriceBarChart({lowPrice, avgPrice, highPrice, width, height, theme}: any) {
    const data = [
        {label: 'Low', value: lowPrice, color: '#10b981'},
        {label: 'Average', value: avgPrice, color: '#f59e0b'},
        {label: 'High', value: highPrice, color: '#ef4444'},
    ];

    const maxValue = Math.max(lowPrice, avgPrice, highPrice);
    const barWidth = (width - 100) / 3;
    const chartHeight = height - 80;

    return (
        <View style={{alignItems: 'center'}}>
            <Svg width={width} height={height}>
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * chartHeight;
                    const x = 50 + index * (barWidth + 20);
                    const y = height - 60 - barHeight;

                    return (
                        <G key={index}>
                            <Rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={item.color}
                                rx={6}
                                opacity={0.9}
                            />
                            <SvgText
                                x={x + barWidth / 2}
                                y={y - 8}
                                textAnchor="middle"
                                fontSize="12"
                                fill={theme.Colors.textPrimary}
                                fontWeight="600"
                            >
                                {`৳ ${item.value.toFixed(1)}`}
                            </SvgText>
                            <SvgText
                                x={x + barWidth / 2}
                                y={height - 25}
                                textAnchor="middle"
                                fontSize="12"
                                fill={theme.Colors.textSecondary}
                            >
                                {item.label}
                            </SvgText>
                        </G>
                    );
                })}
                <Line
                    x1="40"
                    y1={height - 60}
                    x2={width - 20}
                    y2={height - 60}
                    stroke={theme.Colors.gray}
                    strokeWidth="1"
                    opacity={0.3}
                />
            </Svg>
        </View>
    );
}

function VehiclePieChart({vehicles, width, height, theme}: any) {
    const colors = ['#3b82f6', '#8b5cf6', '#06d6a0', '#f72585', '#fb8500'];
    const totalCost = vehicles.reduce((sum: number, v: any) => sum + v.totalCost, 0);

    const data = vehicles.map((vehicle: any, index: number) => ({
        name: vehicle.vehicleName,
        value: vehicle.totalCost,
        percentage: (vehicle.totalCost / totalCost) * 100,
        color: colors[index % colors.length],
    }));

    const centerX = width / 2;
    const centerY = (height - 80) / 2;
    const radius = Math.min(width, height - 80) / 3;

    let currentAngle = -Math.PI / 2; // Start from top

    return (
        <View style={{alignItems: 'center'}}>
            <Svg width={width} height={height - 80}>
                {data.map((item: any, index: number) => {
                    const angle = (item.percentage / 100) * 2 * Math.PI;
                    const x1 = centerX + radius * Math.cos(currentAngle);
                    const y1 = centerY + radius * Math.sin(currentAngle);
                    const x2 = centerX + radius * Math.cos(currentAngle + angle);
                    const y2 = centerY + radius * Math.sin(currentAngle + angle);

                    const largeArcFlag = angle > Math.PI ? 1 : 0;

                    const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');

                    currentAngle += angle;

                    return (
                        <Path
                            key={index}
                            d={pathData}
                            fill={item.color}
                            opacity={0.9}
                        />
                    );
                })}

                <Circle
                    cx={centerX}
                    cy={centerY}
                    r={radius * 0.5}
                    fill={theme.Colors.cardBackground}
                />
            </Svg>

            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 16,
                justifyContent: 'center',
                paddingHorizontal: 10
            }}>
                {data.map((item: any, index: number) => (
                    <View key={index} style={{flexDirection: 'row', alignItems: 'center', margin: 6, minWidth: '45%'}}>
                        <View style={{
                            width: 12,
                            height: 12,
                            backgroundColor: item.color,
                            marginRight: 8,
                            borderRadius: 2
                        }}/>
                        <AppText style={{fontSize: 11, color: theme.Colors.textSecondary, flex: 1}}>
                            {item.name} ({item.percentage.toFixed(1)}%)
                        </AppText>
                    </View>
                ))}
            </View>
        </View>
    );
}

function TopRefuelsChart({refuels, width, height, theme}: any) {
    const maxValue = Math.max(...refuels.map((r: any) => r.cost));
    const barWidth = (width - 100) / refuels.length;
    const chartHeight = height - 80;

    return (
        <View style={{alignItems: 'center'}}>
            <Svg width={width} height={height}>
                {refuels.map((refuel: any, index: number) => {
                    const barHeight = (refuel.cost / maxValue) * chartHeight;
                    const x = 50 + index * (barWidth + 10);
                    const y = height - 60 - barHeight;

                    return (
                        <G key={index}>
                            <Rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="#ef4444"
                                rx={4}
                                opacity={0.9}
                            />
                            <SvgText
                                x={x + barWidth / 2}
                                y={y - 8}
                                textAnchor="middle"
                                fontSize="10"
                                fill={theme.Colors.textPrimary}
                                fontWeight="600"
                            >
                                {`৳ ${refuel.cost.toFixed(0)}`}
                            </SvgText>
                            <SvgText
                                x={x + barWidth / 2}
                                y={height - 25}
                                textAnchor="middle"
                                fontSize="10"
                                fill={theme.Colors.textSecondary}
                            >
                                #{index + 1}
                            </SvgText>
                        </G>
                    );
                })}
                <Line
                    x1="40"
                    y1={height - 60}
                    x2={width - 20}
                    y2={height - 60}
                    stroke={theme.Colors.gray}
                    strokeWidth="1"
                    opacity={0.3}
                />
            </Svg>
        </View>
    );
}

function MetricCard({title, value, icon, color, subtitle}: MetricCardProps) {
    const {theme} = useTheme();

    return (
        <View style={styles(theme).metricCard}>
            <View style={[styles(theme).metricIcon, {backgroundColor: `${color}15`}]}>
                <Ionicons name={icon as any} size={24} color={color}/>
            </View>
            <AppText style={styles(theme).metricValue}>{value}</AppText>
            <AppText style={styles(theme).metricTitle}>{title}</AppText>
            {subtitle && <AppText style={styles(theme).metricSubtitle}>{subtitle}</AppText>}
        </View>
    );
}

function ChartCard({title, children, height = 200}: ChartCardProps) {
    const {theme} = useTheme();

    return (
        <View style={[styles(theme).chartCard, {minHeight: height}]}>
            <AppText style={styles(theme).chartTitle}>{title}</AppText>
            <View style={styles(theme).chartContainer}>
                {children}
            </View>
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.Spacing.lg,
        paddingVertical: theme.Spacing.md,
        backgroundColor: theme.Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerBackButton: {
        padding: theme.Spacing.sm,
        marginRight: theme.Spacing.sm,
    },
    headerTitle: {
        fontSize: theme.FontSizes.xl,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textHeader,
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.Colors.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textSecondary,
    },
    noDataText: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
        marginTop: 16,
    },
    noDataSubtext: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textSecondary,
        marginTop: 8,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        marginTop: 10,
        gap: 12,
    },
    metricCard: {
        width: (screenWidth - 56) / 2,
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 2},
        elevation: 3,
    },
    metricIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricValue: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
        textAlign: 'center',
    },
    metricTitle: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    metricSubtitle: {
        fontSize: theme.FontSizes.xsmall,
        color: theme.Colors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    chartCard: {
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 2},
        elevation: 3,
    },
    chartTitle: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
        marginBottom: 16,
    },
    vehicleCard: {
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: {width: 0, height: 2},
        elevation: 2,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vehicleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${theme.Colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleName: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
    },
    vehicleModel: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
        marginTop: 2,
    },
    vehicleStats: {
        alignItems: 'flex-end',
    },
    vehicleCost: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.primary,
    },
    vehicleRefuels: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
        marginTop: 2,
    },
    vehicleDetails: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: `${theme.Colors.gray}30`,
        gap: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: theme.FontSizes.xsmall,
        color: theme.Colors.textSecondary,
    },
    refuelCard: {
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: theme.Colors.primary,
    },
    refuelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    refuelRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        fontSize: theme.FontSizes.small,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.white,
    },
    refuelInfo: {
        flex: 1,
    },
    refuelVehicle: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.semibold,
        color: theme.Colors.textPrimary,
    },
    refuelDate: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
        marginTop: 2,
    },
    refuelAmount: {
        alignItems: 'flex-end',
    },
    refuelCost: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.primary,
    },
    refuelLiters: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
        marginTop: 2,
    },
});