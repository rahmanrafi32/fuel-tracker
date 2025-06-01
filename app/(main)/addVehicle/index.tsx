import React, { useState, useCallback, useRef, ForwardedRef, JSX, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    NativeSyntheticEvent,
    TextInputFocusEventData,
    Dimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import theme from "@/Themes";
import type { CreateVehicleData } from "@/config/Database/models/vehicle";
import { FUEL_TYPES, FuelType } from "@/types/vehicle";

interface VehicleFormData {
    name: string;
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    fuelType: FuelType;
    tankCapacity: string;
}

interface DropdownModalProps {
    visible: boolean;
    options: Record<string, string>;
    selectedValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    title: string;
}

interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    required?: boolean;
    icon: keyof typeof MaterialIcons.glyphMap;
    returnKeyType?: "done" | "next" | "search" | "go" | "send";
    onSubmitEditing?: () => void;
    blurOnSubmit?: boolean;
    onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

const InputField = React.forwardRef<TextInput, InputFieldProps>(
    (
        {
            label,
            value,
            onChangeText,
            placeholder,
            keyboardType = "default",
            required = false,
            icon,
            returnKeyType = "next",
            onSubmitEditing,
            blurOnSubmit,
            onFocus,
        },
        ref: ForwardedRef<TextInput>
    ) => {
        const [isFocused, setIsFocused] = useState(false);

        return (
            <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                    <MaterialIcons
                        name={icon}
                        size={22}
                        color={isFocused ? theme.Colors.primary : theme.Colors.gray}
                    />
                    <Text
                        style={[
                            styles.inputLabel,
                            { color: isFocused ? theme.Colors.primary : theme.Colors.textPrimary },
                        ]}
                    >
                        {label}
                        {required && <Text style={styles.required}>*</Text>}
                    </Text>
                </View>
                <View
                    style={[
                        styles.inputWrapper,
                        isFocused && styles.inputWrapperFocused,
                        (value && isFocused) && styles.inputWrapperFilled,
                    ]}
                >
                    <TextInput
                        ref={ref}
                        style={styles.textInput}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={theme.Colors.gray}
                        keyboardType={keyboardType}
                        onFocus={(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
                            setIsFocused(true);
                            onFocus && onFocus(e);
                        }}
                        onBlur={() => setIsFocused(false)}
                        autoCorrect={false}
                        autoCapitalize={keyboardType === "default" ? "words" : "none"}
                        returnKeyType={returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                        blurOnSubmit={blurOnSubmit}
                    />
                </View>
            </View>
        );
    }
);

InputField.displayName = 'InputField';

const DropdownModal: React.FC<DropdownModalProps> = ({
                                                         visible,
                                                         options,
                                                         selectedValue,
                                                         onSelect,
                                                         onClose,
                                                         title,
                                                     }) => {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={theme.Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {Object.entries(options).map(([value, label]) => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles.modalOption,
                                    selectedValue === value && styles.selectedOption,
                                ]}
                                onPress={() => {
                                    onSelect(value);
                                    onClose();
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        selectedValue === value && styles.selectedOptionText,
                                    ]}
                                >
                                    {label}
                                </Text>
                                {selectedValue === value && (
                                    <View style={styles.checkIconContainer}>
                                        <MaterialIcons name="check" size={20} color={theme.Colors.white} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default function AddVehicleScreen(): JSX.Element {
    const navigation = useNavigation();
    const [formData, setFormData] = useState<VehicleFormData>({
        name: "",
        make: "",
        model: "",
        year: "",
        licensePlate: "",
        fuelType: "octane",
        tankCapacity: "",
    });

    const [fuelTypeModalVisible, setFuelTypeModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const scrollViewRef = useRef<ScrollView>(null);
    const nameRef = useRef<TextInput>(null);
    const makeRef = useRef<TextInput>(null);
    const modelRef = useRef<TextInput>(null);
    const yearRef = useRef<TextInput>(null);
    const licensePlateRef = useRef<TextInput>(null);
    const tankCapacityRef = useRef<TextInput>(null);

    // Enhanced keyboard listeners
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardWillShowListener?.remove();
            keyboardWillHideListener?.remove();
        };
    }, []);

    const handleInputChange = useCallback(
        (field: keyof VehicleFormData, value: string) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );
    const scrollToInput = useCallback((ref: React.RefObject<TextInput | null>) => {
        if (!ref.current || !scrollViewRef.current) return;
        const delay = Platform.OS === 'ios' ? 300 : 150;

        setTimeout(() => {
            if (ref.current && scrollViewRef.current) {
                ref.current.measureInWindow((x, y, width, height) => {
                    if (scrollViewRef.current) {
                        const screenHeight = Dimensions.get('window').height;
                        const headerHeight = 120;
                        const effectiveKeyboardHeight = keyboardHeight || 280;
                        const safetyPadding = 40;
                        const availableHeight = screenHeight - headerHeight - effectiveKeyboardHeight - safetyPadding;
                        const targetPosition = headerHeight + (availableHeight * 0.5);
                        const scrollOffset = Math.max(0, y - targetPosition);

                        scrollViewRef.current.scrollTo({
                            y: scrollOffset,
                            animated: true
                        });
                    }
                });
            }
        }, delay);
    }, [keyboardHeight]);
    
    const focusNextField = useCallback((nextRef: React.RefObject<TextInput | null>) => {
        setTimeout(() => {
            nextRef.current?.focus();
            scrollToInput(nextRef);
        }, 100);
    }, [scrollToInput]);

    const handleSave = async () => {
        Keyboard.dismiss();

        if (!formData.name.trim()) {
            Alert.alert("Error", "Vehicle name is required");
            nameRef.current?.focus();
            scrollToInput(nameRef);
            return;
        }
        if (!formData.make.trim()) {
            Alert.alert("Error", "Vehicle make is required");
            makeRef.current?.focus();
            scrollToInput(makeRef);
            return;
        }
        if (!formData.model.trim()) {
            Alert.alert("Error", "Vehicle model is required");
            modelRef.current?.focus();
            scrollToInput(modelRef);
            return;
        }

        if (!formData.year.trim()) {
            Alert.alert("Error", "Vehicle year is required");
            yearRef.current?.focus();
            scrollToInput(yearRef);
            return;
        }

        const year = parseInt(formData.year, 10);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
            Alert.alert("Error", "Please enter a valid year");
            yearRef.current?.focus();
            scrollToInput(yearRef);
            return;
        }

        try {
            setIsSubmitting(true);

            const vehicleData: CreateVehicleData = {
                name: formData.name.trim(),
                make: formData.make.trim(),
                model: formData.model.trim(),
                year,
                fuelType: formData.fuelType,
                licensePlate: formData.licensePlate.trim() || undefined,
                tankCapacity: formData.tankCapacity
                    ? parseFloat(formData.tankCapacity)
                    : undefined,
            };

            console.log("Vehicle data to save:", vehicleData);

            Alert.alert("Success", "Vehicle added successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error("Error saving vehicle:", error);
            Alert.alert("Error", "Failed to save vehicle");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Add New Vehicle</Text>
                    <Text style={styles.headerSubtitle}>Fill in the details below</Text>
                </View>
            </View>

            {/* Form with KeyboardAvoidingView */}
            <KeyboardAvoidingView
                style={styles.formWrapper}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.formContainer}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingBottom: keyboardHeight > 0
                                ? keyboardHeight + 100  // Extra space when keyboard is open
                                : theme.Spacing.xl * 2
                        }
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                >
                    <View style={styles.formSection}>
                        <InputField
                            ref={nameRef}
                            label="Vehicle Name"
                            value={formData.name}
                            onChangeText={(text) => handleInputChange("name", text)}
                            placeholder="e.g. My Car"
                            required
                            icon="drive-file-rename-outline"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextField(makeRef)}
                            blurOnSubmit={false}
                            onFocus={() => scrollToInput(nameRef)}
                        />

                        <InputField
                            ref={makeRef}
                            label="Make"
                            value={formData.make}
                            onChangeText={(text) => handleInputChange("make", text)}
                            placeholder="e.g. Toyota"
                            required
                            icon="business"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextField(modelRef)}
                            blurOnSubmit={false}
                            onFocus={() => scrollToInput(makeRef)}
                        />

                        <InputField
                            ref={modelRef}
                            label="Model"
                            value={formData.model}
                            onChangeText={(text) => handleInputChange("model", text)}
                            placeholder="e.g. Corolla"
                            required
                            icon="car-repair"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextField(yearRef)}
                            blurOnSubmit={false}
                            onFocus={() => scrollToInput(modelRef)}
                        />

                        <InputField
                            ref={yearRef}
                            label="Year"
                            value={formData.year}
                            onChangeText={(text) => handleInputChange("year", text)}
                            placeholder={`e.g. ${new Date().getFullYear()}`}
                            keyboardType="numeric"
                            required
                            icon="calendar-today"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextField(licensePlateRef)}
                            blurOnSubmit={false}
                            onFocus={() => scrollToInput(yearRef)}
                        />

                        <InputField
                            ref={licensePlateRef}
                            label="License Plate"
                            value={formData.licensePlate}
                            onChangeText={(text) => handleInputChange("licensePlate", text)}
                            placeholder="e.g. ABC123"
                            icon="credit-card"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextField(tankCapacityRef)}
                            blurOnSubmit={false}
                            onFocus={() => scrollToInput(licensePlateRef)}
                        />

                        <InputField
                            ref={tankCapacityRef}
                            label="Tank Capacity (liters)"
                            value={formData.tankCapacity}
                            onChangeText={(text) => handleInputChange("tankCapacity", text)}
                            placeholder="e.g. 50"
                            keyboardType="numeric"
                            icon="opacity"
                            returnKeyType="done"
                            blurOnSubmit={true}
                            onFocus={() => {
                                // Special handling for last field - extra scroll
                                setTimeout(() => scrollToInput(tankCapacityRef), 100);
                            }}
                            onSubmitEditing={() => Keyboard.dismiss()}
                        />

                        <View style={styles.inputContainer}>
                            <View style={styles.labelContainer}>
                                <MaterialIcons
                                    name="local-gas-station"
                                    size={22}
                                    color={theme.Colors.primary}
                                />
                                <Text style={[styles.inputLabel, { color: theme.Colors.textPrimary }]}>
                                    Fuel Type
                                    <Text style={styles.required}>*</Text>
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setFuelTypeModalVisible(true);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.dropdownButtonText}>
                                    {FUEL_TYPES[formData.fuelType]}
                                </Text>
                                <MaterialIcons
                                    name="keyboard-arrow-down"
                                    size={24}
                                    color={theme.Colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveButton, isSubmitting && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSubmitting ? "Saving..." : "Add Vehicle"}
                            </Text>
                            {!isSubmitting && (
                                <MaterialIcons name="add" size={20} color={theme.Colors.white} />
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <DropdownModal
                visible={fuelTypeModalVisible}
                options={FUEL_TYPES}
                selectedValue={formData.fuelType}
                onSelect={(value) => handleInputChange("fuelType", value as FuelType)}
                onClose={() => setFuelTypeModalVisible(false)}
                title="Select Fuel Type"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.Colors.background,
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
        shadowOffset: { width: 0, height: 2 },
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
    formWrapper: {
        flex: 1,
    },
    formContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: theme.Spacing.md,
    },
    formSection: {
        paddingHorizontal: theme.Spacing.md,
    },
    inputContainer: {
        marginBottom: theme.Spacing.lg,
    },
    labelContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.Spacing.sm,
    },
    inputLabel: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.medium,
        marginLeft: theme.Spacing.sm,
    },
    required: {
        color: theme.Colors.error,
        marginLeft: 2,
    },
    inputWrapper: {
        borderWidth: 2,
        borderColor: "#e2e8f0",
        borderRadius: theme.BorderRadius.md,
        backgroundColor: theme.Colors.white,
        minHeight: 56,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    inputWrapperFocused: {
        borderColor: theme.Colors.primary,
        shadowColor: theme.Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    inputWrapperFilled: {
        borderColor: theme.Colors.primary,
    },
    textInput: {
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.md,
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
        minHeight: 24,
    },
    dropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e2e8f0",
        borderRadius: theme.BorderRadius.md,
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.md,
        backgroundColor: theme.Colors.white,
        minHeight: 56,
    },
    dropdownButtonText: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
        fontWeight: theme.FontWeight.medium,
    },
    actionContainer: {
        flexDirection: "row",
        paddingHorizontal: theme.Spacing.md,
        paddingTop: theme.Spacing.xl,
        paddingBottom: theme.Spacing.xl,
        marginTop: theme.Spacing.lg,
        gap: theme.Spacing.sm,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: theme.Colors.gray,
        borderRadius: theme.BorderRadius.md,
        paddingVertical: theme.Spacing.md,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 56,
    },
    cancelButtonText: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.medium,
        color: theme.Colors.gray,
    },
    saveButton: {
        flex: 2,
        backgroundColor: theme.Colors.primary,
        borderRadius: theme.BorderRadius.md,
        paddingVertical: theme.Spacing.md,
        paddingHorizontal: theme.Spacing.lg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        minHeight: 56,
        shadowColor: theme.Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveButtonText: {
        color: theme.Colors.white,
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.bold,
        marginRight: theme.Spacing.xs,
    },
    disabledButton: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: theme.Colors.white,
        borderTopLeftRadius: theme.BorderRadius.lg,
        borderTopRightRadius: theme.BorderRadius.lg,
        paddingBottom: theme.Spacing.lg,
        maxHeight: "70%",
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: theme.Colors.gray,
        borderRadius: 2,
        alignSelf: "center",
        marginTop: theme.Spacing.sm,
        marginBottom: theme.Spacing.sm,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: theme.Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    modalTitle: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
    },
    closeButton: {
        padding: theme.Spacing.sm,
        borderRadius: theme.BorderRadius.sm,
        backgroundColor: theme.Colors.background,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: "#f8fafc",
    },
    selectedOption: {
        backgroundColor: `${theme.Colors.primary}20`,
    },
    modalOptionText: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
    },
    selectedOptionText: {
        color: theme.Colors.primary,
        fontWeight: theme.FontWeight.medium,
    },
    checkIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
});