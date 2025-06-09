import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    SafeAreaView,
    GestureResponderEvent,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {useTheme} from '@/context/ThemeContext';
import {settings as dbSettings} from '@/config/Database';
import AppAlertModal, {AlertType} from '@/components/AppAlertModal';

type CurrencyOption = {
    value: string;
    label: string;
    symbol: string;
};
type DistanceOption = {
    value: string;
    label: string;
};
type VolumeOption = {
    value: string;
    label: string;
};
type ConsumptionOption = {
    value: string;
    label: string;
};

type SettingOption = CurrencyOption | DistanceOption | VolumeOption | ConsumptionOption;

interface SettingBase<T extends SettingOption> {
    title: string;
    description: string;
    icon: string;
    options: T[];
    current: string;
    color: string;
}

interface SettingsState {
    currency: SettingBase<CurrencyOption>;
    distance: SettingBase<DistanceOption>;
    volume: SettingBase<VolumeOption>;
    avgConsumption: SettingBase<ConsumptionOption>;
}

type SettingKey = keyof SettingsState;

const SettingsScreen: React.FC = () => {
    const router = useRouter();
    const {theme} = useTheme();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [currentSetting, setCurrentSetting] = useState<SettingKey | ''>('');
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [settingsState, setSettingsState] = useState<SettingsState>({
        currency: {
            title: 'Currency Code',
            description: 'Default currency for calculations',
            icon: 'card-outline',
            options: [
                {value: 'USD', label: 'US Dollar (USD)', symbol: '$'},
                {value: 'BDT', label: 'Bangladeshi Taka (BDT)', symbol: '৳'},
                {value: 'EUR', label: 'Euro (EUR)', symbol: '€'},
                {value: 'GBP', label: 'British Pound (GBP)', symbol: '£'},
                {value: 'JPY', label: 'Japanese Yen (JPY)', symbol: '¥'},
                {value: 'CAD', label: 'Canadian Dollar (CAD)', symbol: 'C$'},
                {value: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$'}
            ],
            current: 'USD',
            color: theme.Colors.costGreen
        },
        distance: {
            title: 'Distance Unit',
            description: 'Measurement unit for distances',
            icon: 'speedometer-outline',
            options: [
                {value: 'KM', label: 'Kilometers (KM)'},
                {value: 'Miles', label: 'Miles (MI)'}
            ],
            current: 'KM',
            color: theme.Colors.distanceOrange
        },
        volume: {
            title: 'Volume Unit',
            description: 'Unit for fuel volume',
            icon: 'water-outline',
            options: [
                {value: 'Liters', label: 'Liters (L)'},
                {value: 'Gallons', label: 'Gallons (GAL)'}
            ],
            current: 'Liters',
            color: theme.Colors.volumeYellow
        },
        avgConsumption: {
            title: 'Average Consumption',
            description: 'Preferred fuel consumption unit',
            icon: 'analytics-outline',
            options: [
                {value: 'L/100km', label: 'Liters per 100km (L/100km)'},
                {value: 'KM/L', label: 'Kilometers per Liter (KM/L)'},
                {value: 'L/Mile', label: 'Liters per Mile (L/Mile)'}
            ],
            current: 'L/100km',
            color: theme.Colors.rateGray
        }
    });

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<AlertType>('success');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const dbData = await dbSettings.get();
                if (dbData) {
                    setSettingsState(prev => ({
                        ...prev,
                        currency: {...prev.currency, current: dbData.currencyCode},
                        distance: {...prev.distance, current: dbData.distanceUnit},
                        volume: {...prev.volume, current: dbData.volumeUnit},
                        avgConsumption: {...prev.avgConsumption, current: dbData.avgConsumption},
                    }));
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        };
        loadSettings();
    }, []);

    const openModal = (settingType: SettingKey) => {
        setCurrentSetting(settingType);
        setSelectedValue(settingsState[settingType].current);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const confirmSelection = () => {
        if (selectedValue && currentSetting) {
            setSettingsState(prev => ({
                ...prev,
                [currentSetting]: {
                    ...prev[currentSetting],
                    current: selectedValue
                }
            }));
        }
        closeModal();
    };

    interface SettingItemProps {
        settingKey: SettingKey;
        setting: SettingBase<any>;
    }

    const SettingItem: React.FC<SettingItemProps> = ({settingKey, setting}) => (
        <TouchableOpacity
            style={styles(theme).settingItem}
            onPress={() => openModal(settingKey)}
            activeOpacity={0.7}
        >
            <View style={styles(theme).settingLeft}>
                <View
                    style={[styles(theme).settingIcon, {backgroundColor: setting.color}]}
                >
                    <Ionicons name={setting.icon as any} size={24} color={theme.Colors.white}/>
                </View>
                <View style={styles(theme).settingInfo}>
                    <Text style={styles(theme).settingTitle}>{setting.title}</Text>
                    <Text style={styles(theme).settingDescription}>{setting.description}</Text>
                </View>
            </View>
            <View style={styles(theme).settingRight}>
                <Text style={styles(theme).settingValue}>{setting.current}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.Colors.gray}/>
            </View>
        </TouchableOpacity>
    );

    interface OptionItemProps {
        option: SettingOption;
        isSelected: boolean;
        onPress: (event: GestureResponderEvent) => void;
    }

    const OptionItem: React.FC<OptionItemProps> = ({option, isSelected, onPress}) => (
        <TouchableOpacity
            style={[styles(theme).optionItem, isSelected && styles(theme).optionItemSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles(theme).optionText, isSelected && styles(theme).optionTextSelected]}>
                {option.label}
            </Text>
            {isSelected && (
                <Ionicons name="checkmark" size={20} color={theme.Colors.primary}/>
            )}
        </TouchableOpacity>
    );

    function getCurrentOptions(): SettingOption[] {
        if (!currentSetting) return [];
        return settingsState[currentSetting].options;
    }

    const getSettingsPayload = () => ({
        currencyCode: settingsState.currency.current,
        distanceUnit: settingsState.distance.current,
        volumeUnit: settingsState.volume.current,
        avgConsumption: settingsState.avgConsumption.current,
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = getSettingsPayload();
            const existing = await dbSettings.get();
            if (existing && existing.id) {
                await dbSettings.update(existing.id, payload);
            } else {
                await dbSettings.insert(payload);
            }
            setAlertType('success');
            setAlertTitle('Settings Saved');
            setAlertMessage('Your settings have been saved successfully.');
            setAlertVisible(true);
        } catch (error) {
            setAlertType('error');
            setAlertTitle('Save Failed');
            setAlertMessage('Failed to save settings. Please try again.');
            setAlertVisible(true);
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles(theme).container}>
            {/* Fixed Header */}
            <View style={styles(theme).header}>
                <TouchableOpacity
                    style={styles(theme).backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.Colors.primary}/>
                </TouchableOpacity>
                <View style={styles(theme).headerContent}>
                    <Text style={styles(theme).headerTitle}>Settings</Text>
                    <Text style={styles(theme).headerSubtitle}>Customize your preferences</Text>
                </View>
            </View>

            {/* Content Area */}
            <View style={styles(theme).contentContainer}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles(theme).scrollContainer}
                    style={styles(theme).scrollView}
                >
                    {/* Settings Items - NO dividers */}
                    <View style={styles(theme).sectionContainer}>
                        <SettingItem settingKey="currency" setting={settingsState.currency}/>
                        <SettingItem settingKey="distance" setting={settingsState.distance}/>
                        <SettingItem settingKey="volume" setting={settingsState.volume}/>
                        <SettingItem settingKey="avgConsumption" setting={settingsState.avgConsumption}/>
                    </View>
                </ScrollView>

                {/* Fixed Save Button at Bottom */}
                <View style={styles(theme).saveButtonContainer}>
                    <TouchableOpacity
                        style={styles(theme).saveButton}
                        activeOpacity={0.8}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles(theme).saveButtonText}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles(theme).modalOverlay}>
                    <View style={styles(theme).modalContent}>
                        <View style={styles(theme).modalHeader}>
                            <Text style={styles(theme).modalTitle}>
                                {currentSetting ? settingsState[currentSetting]?.title : ''}
                            </Text>
                            <Text style={styles(theme).modalDescription}>
                                {currentSetting ? settingsState[currentSetting]?.description : ''}
                            </Text>
                        </View>

                        <ScrollView style={styles(theme).optionsList} showsVerticalScrollIndicator={false}>
                            {getCurrentOptions().map((option, index) => (
                                <OptionItem
                                    key={index}
                                    option={option}
                                    isSelected={selectedValue === option.value}
                                    onPress={() => setSelectedValue(option.value)}
                                />
                            ))}
                        </ScrollView>

                        <View style={styles(theme).modalButtons}>
                            <TouchableOpacity
                                style={[styles(theme).modalButton, styles(theme).cancelButton]}
                                onPress={closeModal}
                                activeOpacity={0.7}
                            >
                                <Text style={styles(theme).cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles(theme).modalButton, styles(theme).confirmButton]}
                                onPress={confirmSelection}
                                activeOpacity={0.7}
                            >
                                <View style={styles(theme).confirmButtonBackground}>
                                    <Text style={styles(theme).confirmButtonText}>Confirm</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <AppAlertModal
                visible={alertVisible}
                type={alertType}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
                autoClose={true}
                autoCloseDelay={2500}
            />
        </SafeAreaView>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.Colors.white,
    },
    header: {
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: theme.Spacing.sm,
        marginRight: theme.Spacing.sm,
        borderRadius: theme.BorderRadius.sm
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: theme.FontSizes.xl,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textHeader,
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: theme.Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: theme.Spacing.md,
    },
    sectionContainer: {
        flex: 1,
        backgroundColor: theme.Colors.white,
        paddingVertical: theme.Spacing.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.md,
        backgroundColor: theme.Colors.white,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        width: 35,
        height: 35,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.Spacing.md,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.medium,
        color: theme.Colors.textPrimary,
        marginBottom: theme.Spacing.xs,
    },
    settingDescription: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
        fontWeight: theme.FontWeight.regular,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.medium,
        color: theme.Colors.primary,
        marginRight: theme.Spacing.sm,
    },
    saveButtonContainer: {
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.md,
        backgroundColor: theme.Colors.white,
    },
    saveButton: {
        backgroundColor: theme.Colors.primary,
        borderRadius: theme.BorderRadius.md,
        paddingVertical: theme.Spacing.md,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.medium,
        color: theme.Colors.white,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.Spacing.lg
    },
    modalContent: {
        backgroundColor: theme.Colors.white,
        borderRadius: theme.BorderRadius.lg,
        padding: theme.Spacing.lg,
        width: '100%',
        maxHeight: '70%',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: theme.Spacing.lg,
    },
    modalTitle: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
        marginBottom: theme.Spacing.xs,
    },
    modalDescription: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textSecondary,
        textAlign: 'center',
    },
    optionsList: {
        maxHeight: 300,
        marginBottom: theme.Spacing.lg,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.md,
        borderRadius: theme.BorderRadius.sm,
        marginBottom: theme.Spacing.sm,
    },
    optionItemSelected: {
        backgroundColor: theme.Colors.badgeLight,
    },
    optionText: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
        fontWeight: theme.FontWeight.regular,
    },
    optionTextSelected: {
        color: theme.Colors.primary,
        fontWeight: theme.FontWeight.medium,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: theme.Spacing.md,
    },
    modalButton: {
        flex: 1,
        borderRadius: theme.BorderRadius.sm,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: theme.Colors.background,
        paddingVertical: theme.Spacing.md,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.medium,
        color: theme.Colors.textSecondary,
    },
    confirmButton: {
        overflow: 'hidden',
    },
    confirmButtonBackground: {
        backgroundColor: theme.Colors.primary,
        paddingVertical: theme.Spacing.md,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.medium,
        color: theme.Colors.white,
    },
});

export default SettingsScreen;