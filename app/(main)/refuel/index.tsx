import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Modal
} from 'react-native';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import theme from '@/Themes';

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

export default function FuelEntryScreen({onSave}: Omit<FuelEntryScreenProps, 'onBack'>) {
    const navigation = useNavigation();
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

    const distanceUnits: DistanceUnit[] = ['KM', 'Miles'];
    const volumeUnits: VolumeUnit[] = ['L', 'Gallon (US)', 'Gallon (UK)'];

    const handleSave = (): void => {
        const data: FuelEntryData = {
            fuelDate,
            odometer,
            fuelVolume,
            fuelUnitPrice,
            notes,
            fullTank,
            missedLastFuel,
            distanceUnit,
            volumeUnit
        };

        console.log(data);

        if (onSave) {
            onSave(data);
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
                    <TouchableOpacity style={styles.backButtonSecondary} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color={theme.Colors.primary} style={styles.buttonIcon}/>
                        <Text style={styles.backButtonText}>BACK</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Ionicons name="checkmark-circle" size={20} color={theme.Colors.white}
                                  style={styles.buttonIcon}/>
                        <Text style={styles.saveButtonText}>SAVE ENTRY</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.Spacing.lg,
        paddingBottom: theme.Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: theme.Spacing.sm,
        borderRadius: theme.BorderRadius.sm,
        backgroundColor: '#fff7ed',
    },
    headerTitle: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
    },
    headerSpacer: {
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
        gap: theme.Spacing.md,
    },
    backButtonSecondary: {
        backgroundColor: theme.Colors.background,
        paddingVertical: theme.Spacing.md,
        paddingHorizontal: theme.Spacing.lg,
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
        fontSize: theme.FontSizes.medium,
    },
    saveButton: {
        backgroundColor: theme.Colors.primary,
        paddingVertical: theme.Spacing.md,
        paddingHorizontal: theme.Spacing.lg,
        borderRadius: theme.BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 2,
        shadowColor: theme.Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 4},
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