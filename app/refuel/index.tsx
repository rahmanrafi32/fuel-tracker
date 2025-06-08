import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Modal,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { refuels } from '@/config/Database';
import type { CreateRefuelLogData } from '@/config/Database';
import {useTheme} from "@/context/ThemeContext";

interface FuelEntryData {
    fuelDate: Date;
    odometer: string;
    fuelVolume: string;
    fuelUnitPrice: string;
    notes: string;
    fullTank: boolean;
    missedLastFuel: boolean;
    distanceUnit: DistanceUnit;
    volumeUnit: VolumeUnit;
}

type DistanceUnit = 'KM' | 'Miles';
type VolumeUnit = 'L' | 'Gallon (US)' | 'Gallon (UK)';

interface DropdownModalProps {
    visible: boolean;
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    title: string;
}

interface FuelEntryScreenProps {
    onBack?: () => void;
    onSave?: (data: FuelEntryData) => void;
}

export default function FuelEntryScreen({ onSave }: Omit<FuelEntryScreenProps, 'onBack'>) {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<any>>();
    const vehicleId = route.params?.vehicleId;

    const [fuelDate, setFuelDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [odometer, setOdometer] = useState<string>('');
    const [fuelVolume, setFuelVolume] = useState<string>('');
    const [fuelUnitPrice, setFuelUnitPrice] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [fullTank, setFullTank] = useState<boolean>(true);
    const [missedLastFuel, setMissedLastFuel] = useState<boolean>(false);

    const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('KM');
    const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('L');
    const [showDistanceDropdown, setShowDistanceDropdown] = useState<boolean>(false);
    const [showVolumeDropdown, setShowVolumeDropdown] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');

    const distanceUnits: DistanceUnit[] = ['KM', 'Miles'];
    const volumeUnits: VolumeUnit[] = ['L', 'Gallon (US)', 'Gallon (UK)'];

    const convertToStandardUnits = () => {
        let liters = Number(fuelVolume);
        let odometerReading = Number(odometer);

        // Convert volume to liters
        if (volumeUnit === 'Gallon (US)') {
            liters = liters * 3.78541;
        } else if (volumeUnit === 'Gallon (UK)') {
            liters = liters * 4.54609;
        }

        if (distanceUnit === 'Miles') {
            odometerReading = odometerReading * 1.60934;
        }

        return { liters, odometerReading };
    };

    const handleSave = async (): Promise<void> => {
        try {
            setIsSaving(true);

            // TODO: Add validation if needed

            const { liters, odometerReading } = convertToStandardUnits();
            const totalCost = liters * Number(fuelUnitPrice);

            const refuelData: CreateRefuelLogData = {
                vehicleId,
                date: fuelDate.toISOString().split('T')[0],
                odometer: odometerReading,
                liters: liters,
                cost: totalCost,
                fuelType: 'petrol',
                notes: notes.trim() || undefined,
                isFullTank: fullTank,
            };

            const refuelId = await refuels.create(refuelData);

            console.log('Refuel saved successfully with ID:', refuelId);

            if (onSave) {
                const formData: FuelEntryData = {
                    fuelDate,
                    odometer,
                    fuelVolume,
                    fuelUnitPrice,
                    notes,
                    fullTank,
                    missedLastFuel,
                    distanceUnit,
                    volumeUnit,
                };
                onSave(formData);
            }

            setAlertTitle('Success');
            setAlertMessage('Refuel data saved successfully!');
            setAlertType('success');
            setAlertVisible(true);
        } catch (error) {
            console.error('Error saving refuel data:', error);
            setAlertTitle('Error');
            setAlertMessage('Failed to save refuel data. Please try again.');
            setAlertType('error');
            setAlertVisible(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = (): void => {
        navigation.goBack();
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFuelDate(selectedDate);
        }
    };

    const DropdownModal: React.FC<DropdownModalProps> = ({
                                                             visible,
                                                             options,
                                                             selectedValue,
                                                             onSelect,
                                                             onClose,
                                                             title,
                                                         }) => (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={styles(theme).modalOverlay} onPress={onClose} activeOpacity={1}>
                <View style={styles(theme).dropdownModal}>
                    <Text style={styles(theme).dropdownTitle}>{title}</Text>
                    {options.map((option: string) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles(theme).dropdownOption, selectedValue === option && styles(theme).selectedOption]}
                            onPress={() => {
                                onSelect(option);
                                onClose();
                            }}
                        >
                            <Text
                                style={[
                                    styles(theme).dropdownOptionText,
                                    selectedValue === option && styles(theme).selectedOptionText,
                                ]}
                            >
                                {option}
                            </Text>
                            {selectedValue === option && (
                                <Ionicons name="checkmark" size={20} color={theme.Colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const CustomAlertModal = () => (
        <Modal visible={alertVisible} transparent animationType="fade">
            <View style={styles(theme).alertOverlay}>
                <View
                    style={[
                        styles(theme).alertContainer,
                        alertType === 'success'
                            ? { borderColor: theme.Colors.costGreen }
                            : { borderColor: theme.Colors.error },
                    ]}
                >
                    <Text
                        style={[
                            styles(theme).alertTitle,
                            alertType === 'success'
                                ? { color: theme.Colors.costGreen }
                                : { color: theme.Colors.error },
                        ]}
                    >
                        {alertTitle}
                    </Text>
                    <Text style={styles(theme).alertMessage}>{alertMessage}</Text>
                    <TouchableOpacity
                        style={[
                            styles(theme).alertButton,
                            alertType === 'success'
                                ? { backgroundColor: theme.Colors.costGreen }
                                : { backgroundColor: theme.Colors.error },
                        ]}
                        onPress={() => {
                            setAlertVisible(false);
                            if (alertType === 'success') {
                                handleBack();
                            }
                        }}
                    >
                        <Text style={styles(theme).alertButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.Colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            {/* Header */}
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={handleBack} style={styles(theme).headerBackButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.Colors.primary} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Add Fuel</Text>
                <View style={styles(theme).headerPlaceholder} />
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles(theme).container}
                >
                    {/* Date Picker */}
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles(theme).fieldRow}>
                        <View style={styles(theme).iconContainer}>
                            <Ionicons name="calendar" size={20} color={theme.Colors.primary} />
                        </View>
                        <View style={styles(theme).fieldContent}>
                            <Text style={styles(theme).label}>Fueling date</Text>
                            <View style={styles(theme).dateDisplay}>
                                <Text style={styles(theme).dateValue}>{formatDate(fuelDate)}</Text>
                                <Ionicons name="chevron-down" size={16} color={theme.Colors.gray} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={fuelDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}

                    {/* Odometer */}
                    <View style={styles(theme).fieldRow}>
                        <View style={styles(theme).iconContainer}>
                            <MaterialIcons name="speed" size={20} color={theme.Colors.primary} />
                        </View>
                        <View style={styles(theme).fieldContent}>
                            <Text style={styles(theme).label}>Current odometer</Text>
                            <View style={styles(theme).inputRow}>
                                <TextInput
                                    placeholder="Enter reading"
                                    placeholderTextColor={theme.Colors.textSecondary}
                                    style={styles(theme).input}
                                    keyboardType="numeric"
                                    value={odometer}
                                    onChangeText={(text: string) => setOdometer(text)}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    style={styles(theme).unitSelector}
                                    onPress={() => setShowDistanceDropdown(true)}
                                >
                                    <Text style={styles(theme).unitText}>{distanceUnit}</Text>
                                    <Ionicons name="chevron-down" size={14} color={theme.Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Fuel Volume */}
                    <View style={styles(theme).fieldRow}>
                        <View style={styles(theme).iconContainer}>
                            <MaterialIcons name="local-gas-station" size={20} color={theme.Colors.primary} />
                        </View>
                        <View style={styles(theme).fieldContent}>
                            <Text style={styles(theme).label}>Fuel volume</Text>
                            <View style={styles(theme).inputRow}>
                                <TextInput
                                    placeholder="Enter volume"
                                    placeholderTextColor={theme.Colors.textSecondary}
                                    style={styles(theme).input}
                                    keyboardType="numeric"
                                    value={fuelVolume}
                                    onChangeText={(text: string) => setFuelVolume(text)}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    style={styles(theme).unitSelector}
                                    onPress={() => setShowVolumeDropdown(true)}
                                >
                                    <Text style={styles(theme).unitText}>{volumeUnit}</Text>
                                    <Ionicons name="chevron-down" size={14} color={theme.Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Fuel Unit Price */}
                    <View style={styles(theme).fieldRow}>
                        <View style={styles(theme).iconContainer}>
                            <Ionicons name="pricetag" size={20} color={theme.Colors.primary} />
                        </View>
                        <View style={styles(theme).fieldContent}>
                            <Text style={styles(theme).label}>Fuel unit price</Text>
                            <TextInput
                                placeholder="Price per unit"
                                placeholderTextColor={theme.Colors.textSecondary}
                                style={styles(theme).input}
                                keyboardType="numeric"
                                value={fuelUnitPrice}
                                onChangeText={(text: string) => setFuelUnitPrice(text)}
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    {/* Notes */}
                    <View style={styles(theme).fieldRow}>
                        <View style={styles(theme).iconContainer}>
                            <Ionicons name="document-text" size={20} color={theme.Colors.primary} />
                        </View>
                        <View style={styles(theme).fieldContent}>
                            <Text style={styles(theme).label}>Notes</Text>
                            <TextInput
                                placeholder="Add any notes..."
                                placeholderTextColor={theme.Colors.textSecondary}
                                style={[styles(theme).input, styles(theme).multilineInput]}
                                value={notes}
                                onChangeText={(text: string) => setNotes(text)}
                                multiline
                                numberOfLines={3}
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    {/* Switches */}
                    <View style={styles(theme).switchSection}>
                        <View style={styles(theme).switchRow}>
                            <View style={styles(theme).switchContent}>
                                <Ionicons
                                    name="car"
                                    size={18}
                                    color={theme.Colors.gray}
                                    style={styles(theme).switchIcon}
                                />
                                <Text style={styles(theme).switchLabel}>Full tank</Text>
                            </View>
                            <Switch
                                value={fullTank}
                                onValueChange={(value: boolean) => setFullTank(value)}
                                trackColor={{ false: theme.Colors.gray, true: theme.Colors.primary }}
                                thumbColor={fullTank ? theme.Colors.white : theme.Colors.background}
                            />
                        </View>

                        <View style={styles(theme).switchRow}>
                            <View style={styles(theme).switchContent}>
                                <Ionicons
                                    name="alert-circle"
                                    size={18}
                                    color={theme.Colors.gray}
                                    style={styles(theme).switchIcon}
                                />
                                <Text style={styles(theme).switchLabel}>Previous fuelling missed</Text>
                            </View>
                            <Switch
                                value={missedLastFuel}
                                onValueChange={(value: boolean) => setMissedLastFuel(value)}
                                trackColor={{ false: theme.Colors.gray, true: theme.Colors.primary }}
                                thumbColor={missedLastFuel ? theme.Colors.white : theme.Colors.background}
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <View style={styles(theme).buttonContainer}>
                        <TouchableOpacity style={styles(theme).saveButton} onPress={handleSave} disabled={isSaving}>
                            <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={theme.Colors.white}
                                style={styles(theme).buttonIcon}
                            />
                            <Text style={styles(theme).saveButtonText}>SAVE ENTRY</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Dropdowns */}
                    <DropdownModal
                        visible={showDistanceDropdown}
                        options={distanceUnits}
                        selectedValue={distanceUnit}
                        onSelect={(value: string) => setDistanceUnit(value as DistanceUnit)}
                        onClose={() => setShowDistanceDropdown(false)}
                        title="Select Distance Unit"
                    />

                    <DropdownModal
                        visible={showVolumeDropdown}
                        options={volumeUnits}
                        selectedValue={volumeUnit}
                        onSelect={(value: string) => setVolumeUnit(value as VolumeUnit)}
                        onClose={() => setShowVolumeDropdown(false)}
                        title="Select Volume Unit"
                    />
                </ScrollView>
            </TouchableWithoutFeedback>

            {/* Loading overlay */}
            {isSaving && (
                <Modal transparent animationType="fade">
                    <View style={styles(theme).loadingOverlay}>
                        <ActivityIndicator size="large" color={theme.Colors.primary} />
                    </View>
                </Modal>
            )}

            {/* Custom Alert Modal */}
            <CustomAlertModal />
        </KeyboardAvoidingView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: theme.Spacing.lg,
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
    },
    headerTitle: {
        fontSize: theme.FontSizes.xl,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.primary,
    },
    headerPlaceholder: {
        width: 40,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.Spacing.lg,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.Spacing.md,
    },
    fieldContent: {
        flex: 1,
    },
    label: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textSecondary,
        marginBottom: theme.Spacing.sm,
        fontWeight: theme.FontWeight.medium,
    },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.Spacing.sm,
        paddingHorizontal: theme.Spacing.md,
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: theme.BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dateValue: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
        fontWeight: theme.FontWeight.medium,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: theme.BorderRadius.sm,
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.sm,
        fontSize: theme.FontSizes.medium,
        backgroundColor: theme.Colors.cardBackground,
        color: theme.Colors.textPrimary,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    unitSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: theme.Spacing.sm,
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.sm,
        backgroundColor: theme.Colors.primary,
        borderRadius: theme.BorderRadius.sm,
        minWidth: 60,
        justifyContent: 'center',
    },
    unitText: {
        color: theme.Colors.white,
        fontSize: theme.FontSizes.small,
        fontWeight: theme.FontWeight.medium,
        marginRight: theme.Spacing.xs,
    },
    switchSection: {
        marginBottom: theme.Spacing.lg,
        paddingTop: theme.Spacing.sm,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.Spacing.sm,
    },
    switchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    switchIcon: {
        marginRight: theme.Spacing.sm,
    },
    switchLabel: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
        fontWeight: theme.FontWeight.medium,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: theme.Colors.primary,
        paddingVertical: theme.Spacing.md,
        paddingHorizontal: theme.Spacing.xl,
        borderRadius: theme.BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        minWidth: 200,
        shadowColor: theme.Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    buttonIcon: {
        marginRight: theme.Spacing.sm,
    },
    saveButtonText: {
        color: theme.Colors.white,
        fontWeight: theme.FontWeight.bold,
        fontSize: theme.FontSizes.medium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.Spacing.lg,
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
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.Spacing.lg,
    },
    alertContainer: {
        width: '80%',
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: theme.BorderRadius.lg,
        padding: theme.Spacing.lg,
        borderWidth: 3,
        shadowColor: theme.Colors.black,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 10,
        alignItems: 'center',
    },
    alertTitle: {
        fontSize: theme.FontSizes.xl,
        fontWeight: theme.FontWeight.bold,
        marginBottom: theme.Spacing.md,
    },
    alertMessage: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
        textAlign: 'center',
        marginBottom: theme.Spacing.lg,
    },
    alertButton: {
        paddingVertical: theme.Spacing.md,
        paddingHorizontal: theme.Spacing.xl,
        borderRadius: theme.BorderRadius.md,
    },
    alertButtonText: {
        color: theme.Colors.white,
        fontWeight: theme.FontWeight.bold,
        fontSize: theme.FontSizes.medium,
    },
});