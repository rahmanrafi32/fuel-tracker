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
    Alert
} from 'react-native';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import theme from '@/Themes';
import { refuels } from '@/config/Database';
import type { RefuelLog, UpdateRefuelLogData } from '@/config/Database';

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

type RouteParams = {
    editFuel: {  // Changed from 'EditFuelEntry' to match your route name
        entryId: string | number;  // Made more flexible for different ID types
    };
};

export default function EditFuelEntryScreen() {
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

    // Add error state for debugging
    const [loadError, setLoadError] = useState<string | null>(null);

    const distanceUnits: DistanceUnit[] = ['KM', 'Miles'];
    const volumeUnits: VolumeUnit[] = ['L', 'Gallon (US)', 'Gallon (UK)'];

    // Load existing entry data
    useEffect(() => {
        if (entryId) {
            loadEntryData();
        } else {
            setLoadError('No entry ID provided');
            setIsLoading(false);
        }
    }, [entryId]);

    const loadEntryData = async () => {
        try {
            setIsLoading(true);
            setLoadError(null);

            // Convert entryId to number if it's a string
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
                Alert.alert('Error', 'Entry not found');
                navigation.goBack();
            }
        } catch (error: any) {
            setLoadError(`Failed to load entry: ${error.message}`);
            Alert.alert('Error', 'Failed to load entry data');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const convertToStandardUnits = () => {
        let liters = Number(fuelVolume);
        let odometerReading = Number(odometer);

        // Convert volume to liters
        if (volumeUnit === 'Gallon (US)') {
            liters = liters * 3.78541; // US gallon to liters
        } else if (volumeUnit === 'Gallon (UK)') {
            liters = liters * 4.54609; // UK gallon to liters
        }

        // Convert distance to kilometers (if needed)
        if (distanceUnit === 'Miles') {
            odometerReading = odometerReading * 1.60934; // Miles to kilometers
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
            

            // Show success message
            Alert.alert(
                'Success',
                'Entry updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.goBack();
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Error updating refuel data:', error);
            Alert.alert(
                'Error',
                'Failed to update entry. Please try again.',
                [{ text: 'OK' }]
            );
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
            Alert.alert(
                'Success',
                'Entry deleted successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.goBack();
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Error deleting refuel data:', error);
            Alert.alert(
                'Error',
                'Failed to delete entry. Please try again.',
                [{ text: 'OK' }]
            );
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

    const DropdownModal: React.FC<DropdownModalProps> = ({
                                                             visible,
                                                             options,
                                                             selectedValue,
                                                             onSelect,
                                                             onClose,
                                                             title
                                                         }) => (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.dropdownModal}>
                    <Text style={styles.dropdownTitle}>{title}</Text>
                    {options.map((option: string) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.dropdownOption,
                                selectedValue === option && styles.selectedOption
                            ]}
                            onPress={() => {
                                onSelect(option);
                                onClose();
                            }}
                        >
                            <Text style={[
                                styles.dropdownOptionText,
                                selectedValue === option && styles.selectedOptionText
                            ]}>
                                {option}
                            </Text>
                            {selectedValue === option && (
                                <Ionicons name="checkmark" size={20} color={theme.Colors.primary}/>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    // Enhanced loading state with debug info
    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text>Loading entry {entryId}...</Text>
                {loadError && <Text style={{color: 'red', marginTop: 10}}>{loadError}</Text>}
            </View>
        );
    }

    // Show error state if there's an issue
    if (loadError) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={{color: 'red', textAlign: 'center', marginBottom: 20}}>
                    Error: {loadError}
                </Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
                {/* Date Picker */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.fieldRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="calendar" size={20} color={theme.Colors.primary}/>
                    </View>
                    <View style={styles.fieldContent}>
                        <Text style={styles.label}>Fueling date</Text>
                        <View style={styles.dateDisplay}>
                            <Text style={styles.dateValue}>{formatDate(fuelDate)}</Text>
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
                <View style={styles.fieldRow}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="speed" size={20} color={theme.Colors.primary}/>
                    </View>
                    <View style={styles.fieldContent}>
                        <Text style={styles.label}>Current odometer</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                placeholder="Enter reading"
                                style={styles.input}
                                keyboardType="numeric"
                                value={odometer}
                                onChangeText={(text: string) => setOdometer(text)}
                            />
                            <TouchableOpacity
                                style={styles.unitSelector}
                                onPress={() => setShowDistanceDropdown(true)}
                            >
                                <Text style={styles.unitText}>{distanceUnit}</Text>
                                <Ionicons name="chevron-down" size={14} color={theme.Colors.white}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Fuel Volume */}
                <View style={styles.fieldRow}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="local-gas-station" size={20} color={theme.Colors.primary}/>
                    </View>
                    <View style={styles.fieldContent}>
                        <Text style={styles.label}>Fuel volume</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                placeholder="Enter volume"
                                style={styles.input}
                                keyboardType="numeric"
                                value={fuelVolume}
                                onChangeText={(text: string) => setFuelVolume(text)}
                            />
                            <TouchableOpacity
                                style={styles.unitSelector}
                                onPress={() => setShowVolumeDropdown(true)}
                            >
                                <Text style={styles.unitText}>{volumeUnit}</Text>
                                <Ionicons name="chevron-down" size={14} color={theme.Colors.white}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Fuel Unit Price */}
                <View style={styles.fieldRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="pricetag" size={20} color={theme.Colors.primary}/>
                    </View>
                    <View style={styles.fieldContent}>
                        <Text style={styles.label}>Fuel unit price</Text>
                        <TextInput
                            placeholder="Price per unit"
                            style={styles.input}
                            keyboardType="numeric"
                            value={fuelUnitPrice}
                            onChangeText={(text: string) => setFuelUnitPrice(text)}
                        />
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.fieldRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="document-text" size={20} color={theme.Colors.primary}/>
                    </View>
                    <View style={styles.fieldContent}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            placeholder="Add any notes..."
                            style={[styles.input, styles.multilineInput]}
                            value={notes}
                            onChangeText={(text: string) => setNotes(text)}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Switches */}
                <View style={styles.switchSection}>
                    <View style={styles.switchRow}>
                        <View style={styles.switchContent}>
                            <Ionicons name="car" size={18} color={theme.Colors.gray} style={styles.switchIcon}/>
                            <Text style={styles.switchLabel}>Full tank</Text>
                        </View>
                        <Switch
                            value={fullTank}
                            onValueChange={(value: boolean) => setFullTank(value)}
                            trackColor={{false: theme.Colors.gray, true: theme.Colors.primary}}
                            thumbColor={fullTank ? theme.Colors.white : theme.Colors.background}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View style={styles.switchContent}>
                            <Ionicons name="alert-circle" size={18} color={theme.Colors.gray}
                                      style={styles.switchIcon}/>
                            <Text style={styles.switchLabel}>Previous fuelling missed</Text>
                        </View>
                        <Switch
                            value={missedLastFuel}
                            onValueChange={(value: boolean) => setMissedLastFuel(value)}
                            trackColor={{false: theme.Colors.gray, true: theme.Colors.primary}}
                            thumbColor={missedLastFuel ? theme.Colors.white : theme.Colors.background}
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        disabled={isSaving || isDeleting}
                    >
                        <Ionicons name="arrow-back" size={16} color={theme.Colors.primary}/>
                        <Text style={styles.backButtonText}>BACK</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        disabled={isSaving || isDeleting}
                    >
                        <Ionicons name="trash" size={16} color={theme.Colors.white}/>
                        <Text style={styles.deleteButtonText}>
                            {isDeleting ? 'DELETING...' : 'DELETE'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEdit}
                        disabled={isSaving || isDeleting}
                    >
                        <Ionicons name="checkmark-circle" size={16} color={theme.Colors.white}/>
                        <Text style={styles.editButtonText}>
                            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                        </Text>
                    </TouchableOpacity>
                </View>
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
    );
}

const styles = StyleSheet.create({
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
});