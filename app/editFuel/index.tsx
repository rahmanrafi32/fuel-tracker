import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Modal,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useTheme} from "@/context/ThemeContext";
import { refuels } from '@/config/Database';
import type { UpdateRefuelLogData } from '@/config/Database';
import FuelDropDownModal from "@/components/FuelDropDownModal";
import AppAlertModal from "@/components/AppAlertModal";

type DistanceUnit = 'KM' | 'Miles';
type VolumeUnit = 'L' | 'Gallon (US)' | 'Gallon (UK)';
type RouteParams = {
    editFuel: {
        entryId: string | number;
    };
};

export default function EditFuelEntryScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'editFuel'>>();
    const entryId = route.params?.entryId;

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
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const distanceUnits: DistanceUnit[] = ['KM', 'Miles'];
    const volumeUnits: VolumeUnit[] = ['L', 'Gallon (US)', 'Gallon (UK)'];

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const loadEntryData = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);

                const id = typeof entryId === 'string' ? parseInt(entryId, 10) : entryId;
                const entry = await refuels.findById(id);

                if (entry) {
                    setFuelDate(new Date(entry.date));
                    setOdometer(entry.odometer.toString());
                    setFuelVolume(entry.liters.toString());
                    setFuelUnitPrice((entry.cost / entry.liters).toFixed(2));
                    setNotes(entry.notes || '');
                    setFullTank(entry.isFullTank || false);

                } else {
                    setLoadError('Entry not found');
                    setAlertTitle('Error');
                    setAlertMessage('Entry not found');
                    setAlertType('error');
                    setAlertVisible(true);
                }
            } catch (error: any) {
                setLoadError(`Failed to load entry: ${error.message}`);
                setAlertTitle('Error');
                setAlertMessage('Failed to load entry data');
                setAlertType('error');
                setAlertVisible(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (entryId) {
            loadEntryData();
        } else {
            setLoadError('No entry ID provided');
            setIsLoading(false);
        }
    }, [entryId]);

    const convertToStandardUnits = () => {
        let liters = Number(fuelVolume);
        let odometerReading = Number(odometer);

        // Convert volume to liters
        if (volumeUnit === 'Gallon (US)') {
            liters = liters * 3.78541;
        } else if (volumeUnit === 'Gallon (UK)') {
            liters = liters * 4.54609;
        }

        // Convert distance to kilometers (if needed)
        if (distanceUnit === 'Miles') {
            odometerReading = odometerReading * 1.60934;
        }

        return { liters, odometerReading };
    };

    const handleEdit = async (): Promise<void> => {
        try {
            setIsSaving(true);

            // Convert units and prepare data
            const { liters, odometerReading } = convertToStandardUnits();
            const totalCost = liters * Number(fuelUnitPrice);

            const updateData: UpdateRefuelLogData = {
                date: fuelDate.toISOString().split('T')[0],
                odometer: odometerReading,
                liters: liters,
                cost: totalCost,
                fuelType: 'petrol',
                notes: notes.trim() || undefined,
                isFullTank: fullTank
            };

            const id = typeof entryId === 'string' ? parseInt(entryId, 10) : entryId;

            await refuels.update(id, updateData);

            setAlertTitle('Success');
            setAlertMessage('Entry updated successfully!');
            setAlertType('success');
            setAlertVisible(true);

        } catch (error) {
            console.error('Error updating refuel data:', error);
            setAlertTitle('Error');
            setAlertMessage('Failed to update entry. Please try again.');
            setAlertType('error');
            setAlertVisible(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (): void => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this entry? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete
                }
            ]
        );
    };

    const confirmDelete = async (): Promise<void> => {
        try {
            setIsDeleting(true);
            const id = typeof entryId === 'string' ? parseInt(entryId, 10) : entryId;
            await refuels.delete(id);

            setAlertTitle('Success');
            setAlertMessage('Entry deleted successfully!');
            setAlertType('success');
            setAlertVisible(true);

        } catch (error) {
            console.error('Error deleting refuel data:', error);
            setAlertTitle('Error');
            setAlertMessage('Failed to delete entry. Please try again.');
            setAlertType('error');
            setAlertVisible(true);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBack = (): void => {
        navigation.goBack();
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFuelDate(selectedDate);
        }
    };

    if (isLoading) {
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
                    <Text style={styles(theme).headerTitle}>Edit Fuel</Text>
                    <View style={styles(theme).headerPlaceholder} />
                </View>

                <View style={[styles(theme).container, styles(theme).centerContent]}>
                    <ActivityIndicator size="large" color={theme.Colors.primary} />
                    <Text style={styles(theme).loadingText}>Loading entry...</Text>
                    {loadError && <Text style={styles(theme).errorText}>{loadError}</Text>}
                </View>
            </KeyboardAvoidingView>
        );
    }

    if (loadError) {
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
                    <Text style={styles(theme).headerTitle}>Edit Fuel</Text>
                    <View style={styles(theme).headerPlaceholder} />
                </View>

                <View style={[styles(theme).container, styles(theme).centerContent]}>
                    <Text style={styles(theme).errorText}>Error: {loadError}</Text>
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.Colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            {/* Header - Only Back Button and Title */}
            <View style={styles(theme).header}>
                <TouchableOpacity onPress={handleBack} style={styles(theme).headerBackButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.Colors.primary} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Edit Fuel</Text>
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
                            <Ionicons name="calendar" size={20} color={theme.Colors.primary}/>
                        </View>
                        <View style={styles(theme).fieldContent}>
                            <Text style={styles(theme).label}>Fueling date</Text>
                            <View style={styles(theme).dateDisplay}>
                                <Text style={styles(theme).dateValue}>{formatDate(fuelDate)}</Text>
                                <Ionicons name="chevron-down" size={16} color={theme.Colors.gray}/>
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
                            <MaterialIcons name="speed" size={20} color={theme.Colors.primary}/>
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
                                    <Ionicons name="chevron-down" size={14} color={theme.Colors.white}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Fuel Volume */}
                    <View style={styles(theme).fieldRow}>
                        <View style={styles(theme).iconContainer}>
                            <MaterialIcons name="local-gas-station" size={20} color={theme.Colors.primary}/>
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
                                    <Ionicons name="chevron-down" size={14} color={theme.Colors.white}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Fuel Unit Price */}
                    <View style={styles(theme).fieldRow}>
                        <View style={styles(theme).iconContainer}>
                            <Ionicons name="pricetag" size={20} color={theme.Colors.primary}/>
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
                            <Ionicons name="document-text" size={20} color={theme.Colors.primary}/>
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
                                <Ionicons name="car" size={18} color={theme.Colors.gray} style={styles(theme).switchIcon}/>
                                <Text style={styles(theme).switchLabel}>Full tank</Text>
                            </View>
                            <Switch
                                value={fullTank}
                                onValueChange={(value: boolean) => setFullTank(value)}
                                trackColor={{false: theme.Colors.gray, true: theme.Colors.primary}}
                                thumbColor={fullTank ? theme.Colors.white : theme.Colors.background}
                            />
                        </View>

                        <View style={styles(theme).switchRow}>
                            <View style={styles(theme).switchContent}>
                                <Ionicons name="alert-circle" size={18} color={theme.Colors.gray}
                                          style={styles(theme).switchIcon}/>
                                <Text style={styles(theme).switchLabel}>Previous fuelling missed</Text>
                            </View>
                            <Switch
                                value={missedLastFuel}
                                onValueChange={(value: boolean) => setMissedLastFuel(value)}
                                trackColor={{false: theme.Colors.gray, true: theme.Colors.primary}}
                                thumbColor={missedLastFuel ? theme.Colors.white : theme.Colors.background}
                            />
                        </View>
                    </View>

                    {/* Bottom Button Container - Save Changes and Delete */}
                    <View style={styles(theme).buttonContainer}>
                        <TouchableOpacity
                            style={styles(theme).deleteButton}
                            onPress={handleDelete}
                            disabled={isSaving || isDeleting}
                        >
                            <Ionicons
                                name="trash"
                                size={20}
                                color={theme.Colors.white}
                                style={styles(theme).buttonIcon}
                            />
                            <Text style={styles(theme).deleteButtonText}>
                                {isDeleting ? 'DELETING...' : 'DELETE'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles(theme).saveButton}
                            onPress={handleEdit}
                            disabled={isSaving || isDeleting}
                        >
                            <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={theme.Colors.white}
                                style={styles(theme).buttonIcon}
                            />
                            <Text style={styles(theme).saveButtonText}>
                                {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Dropdowns */}
                    <FuelDropDownModal
                        visible={showDistanceDropdown}
                        options={distanceUnits}
                        selectedValue={distanceUnit}
                        onSelect={(value: string) => setDistanceUnit(value as DistanceUnit)}
                        onClose={() => setShowDistanceDropdown(false)}
                        title="Select Distance Unit"
                    />

                    <FuelDropDownModal
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
            {(isSaving || isDeleting) && (
                <Modal transparent animationType="fade">
                    <View style={styles(theme).loadingOverlay}>
                        <ActivityIndicator size="large" color={theme.Colors.primary} />
                        <Text style={styles(theme).loadingText}>
                            {isSaving ? 'Saving...' : 'Deleting...'}
                        </Text>
                    </View>
                </Modal>
            )}

            {/* Custom Alert Modal */}
            <AppAlertModal
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                onClose={() => {
                    setAlertVisible(false);
                    if (alertType === 'success') {
                        handleBack();
                    }
                }}
                autoClose={false}
                autoCloseDelay={3000}
            />
        </KeyboardAvoidingView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: {
        padding: theme.Spacing.lg,
        paddingBottom: theme.Spacing.xl,
        backgroundColor: theme.Colors.background,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    form: {
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: theme.BorderRadius.lg,
        padding: theme.Spacing.lg,
        shadowColor: theme.Colors.black,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 4},
        elevation: 4,
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
        backgroundColor: theme.Colors.background,
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
        backgroundColor: theme.Colors.background,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.Spacing.sm,
    },
    backButton: {
        backgroundColor: theme.Colors.background,
        paddingVertical: theme.Spacing.sm,
        paddingHorizontal: theme.Spacing.md,
        borderRadius: theme.BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1,
        borderWidth: 1,
        borderColor: theme.Colors.primary,
    },
    backButtonText: {
        color: theme.Colors.primary,
        fontWeight: theme.FontWeight.bold,
        fontSize: theme.FontSizes.small,
        marginLeft: 4,
    },
    deleteButton: {
        backgroundColor: '#F44336',
        paddingVertical: theme.Spacing.sm,
        paddingHorizontal: theme.Spacing.md,
        borderRadius: theme.BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1,
    },
    deleteButtonText: {
        color: theme.Colors.white,
        fontWeight: theme.FontWeight.bold,
        fontSize: theme.FontSizes.small,
        marginLeft: 4,
    },
    editButton: {
        backgroundColor: theme.Colors.primary,
        paddingVertical: theme.Spacing.sm,
        paddingHorizontal: theme.Spacing.md,
        borderRadius: theme.BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1.5,
        shadowColor: theme.Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 4},
        elevation: 4,
    },
    editButtonText: {
        color: theme.Colors.white,
        fontWeight: theme.FontWeight.bold,
        fontSize: theme.FontSizes.small,
        marginLeft: 4,
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
        shadowOffset: {width: 0, height: 5},
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
        borderRadius: theme.BorderRadius.sm,
    },
    headerTitle: {
        fontSize: theme.FontSizes.xl,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.primary,
    },
    headerPlaceholder: {
        width: 40,
    },
    loadingText: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textSecondary,
        marginTop: theme.Spacing.sm,
        textAlign: 'center',
    },
    errorText: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.error,
        textAlign: 'center',
        marginTop: theme.Spacing.sm,
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
    saveButtonText: {
        color: theme.Colors.white,
        fontWeight: theme.FontWeight.bold,
        fontSize: theme.FontSizes.small,
        marginLeft: 4,
    },
    buttonIcon: {
        marginRight: theme.Spacing.xs,
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.Spacing.lg,
    },
    alertContainer: {
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: theme.BorderRadius.lg,
        padding: theme.Spacing.lg,
        width: '80%',
        maxWidth: 300,
        shadowColor: theme.Colors.black,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 5},
        elevation: 10,
        borderWidth: 2,
    },
    alertTitle: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        textAlign: 'center',
        marginBottom: theme.Spacing.sm,
    },
    alertMessage: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.Spacing.lg,
        lineHeight: 20,
    },
    alertButton: {
        paddingVertical: theme.Spacing.sm,
        paddingHorizontal: theme.Spacing.lg,
        borderRadius: theme.BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertButtonText: {
        color: theme.Colors.white,
        fontWeight: theme.FontWeight.bold,
        fontSize: theme.FontSizes.medium,
    },
});