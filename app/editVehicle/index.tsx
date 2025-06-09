import React, { useState, useCallback, useRef, JSX, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { findVehicleById, updateVehicle, deleteVehicle } from "@/config/Database/models/vehicle";
import { FUEL_TYPES, FuelType, VEHICLE_TYPE_LABELS, VehicleFormData } from "@/types/vehicle";
import VehicleInputField from "@/components/VehicleInputField";
import VehicleDropDownModal from "@/components/VehicleDropDownModal";

export default function EditVehicleScreen(): JSX.Element {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<VehicleFormData>({
        name: "",
        make: "",
        model: "",
        year: "",
        vehicleType: "car",
        fuelType: "octane",
        tankCapacity: "",
    });

    const [fuelTypeModalVisible, setFuelTypeModalVisible] = useState(false);
    const [vehicleTypeModalVisible, setVehicleTypeModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const scrollViewRef = useRef<ScrollView>(null);
    const nameRef = useRef<TextInput>(null);
    const makeRef = useRef<TextInput>(null);
    const modelRef = useRef<TextInput>(null);
    const yearRef = useRef<TextInput>(null);
    const tankCapacityRef = useRef<TextInput>(null);

    useEffect(() => {
        const loadVehicle = async () => {
            if (!id) {
                navigation.goBack();
                return;
            }

            try {
                const vehicle = await findVehicleById(Number(id));
                if (vehicle) {
                    setFormData({
                        name: vehicle.name || "",
                        make: vehicle.make || "",
                        model: vehicle.model || "",
                        year: vehicle.year ? vehicle.year.toString() : "",
                        vehicleType: vehicle.vehicleType || "car",
                        fuelType: vehicle.fuelType || "octane",
                        tankCapacity: vehicle.tankCapacity ? vehicle.tankCapacity.toString() : "",
                    });
                } else {
                    Alert.alert("Error", "Vehicle not found");
                    navigation.goBack();
                }
            } catch (error) {
                console.error("Error loading vehicle:", error);
                Alert.alert("Error", "Failed to load vehicle details");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadVehicle();
    }, [id, navigation]);

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
                ref.current.measureInWindow((_, y, __, ___) => {
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

            const vehicleData = {
                name: formData.name.trim(),
                make: formData.make.trim(),
                model: formData.model.trim(),
                year,
                fuelType: formData.fuelType,
                vehicleType: formData.vehicleType,
                tankCapacity: formData.tankCapacity
                    ? parseFloat(formData.tankCapacity)
                    : undefined,
            };

            await updateVehicle(Number(id), vehicleData);
            console.log("Vehicle updated successfully");

            Alert.alert("Success", "Vehicle updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error("Error updating vehicle:", error);
            Alert.alert("Error", "Failed to update vehicle");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this vehicle? This action cannot be undone and will delete all associated fuel records.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: confirmDelete
                }
            ]
        );
    };

    const confirmDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteVehicle(Number(id));
            Alert.alert(
                "Success",
                "Vehicle deleted successfully",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            Alert.alert("Error", "Failed to delete vehicle");
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles(theme).container, styles(theme).loadingContainer]}>
                <ActivityIndicator size="large" color={theme.Colors.primary} />
                <Text style={styles(theme).loadingText}>Loading vehicle details...</Text>
            </View>
        );
    }

    return (
        <View style={styles(theme).container}>
            {/* Fixed Header */}
            <View style={styles(theme).header}>
                <TouchableOpacity
                    style={styles(theme).backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    disabled={isSubmitting || isDeleting}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.Colors.primary} />
                </TouchableOpacity>
                <View style={styles(theme).headerContent}>
                    <Text style={styles(theme).headerTitle}>Edit Vehicle</Text>
                    <Text style={styles(theme).headerSubtitle}>Update vehicle details</Text>
                </View>
            </View>

            {/* Form with KeyboardAvoidingView */}
            <KeyboardAvoidingView
                style={styles(theme).formWrapper}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles(theme).formContainer}
                    contentContainerStyle={[
                        styles(theme).scrollContent,
                        {
                            paddingBottom: keyboardHeight > 0
                                ? keyboardHeight + 100 
                                : theme.Spacing.xl * 2
                        }
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                >
                    <View style={styles(theme).formSection}>
                        <VehicleInputField
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

                        <VehicleInputField
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

                        <VehicleInputField
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

                        <VehicleInputField
                            ref={yearRef}
                            label="Year"
                            value={formData.year}
                            onChangeText={(text) => handleInputChange("year", text)}
                            placeholder={`e.g. ${new Date().getFullYear()}`}
                            keyboardType="numeric"
                            required
                            icon="calendar-today"
                            returnKeyType="next"
                            onSubmitEditing={() => setVehicleTypeModalVisible(true)}
                            blurOnSubmit={false}
                            onFocus={() => scrollToInput(yearRef)}
                        />

                        {/* Vehicle Type Dropdown */}
                        <View style={styles(theme).inputContainer}>
                            <View style={styles(theme).labelContainer}>
                                <MaterialIcons
                                    name="directions-car"
                                    size={22}
                                    color={theme.Colors.gray}
                                />
                                <Text style={[styles(theme).inputLabel, { color: theme.Colors.textPrimary }]}>
                                    Vehicle Type
                                    <Text style={styles(theme).required}>*</Text>
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles(theme).dropdownButton}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setVehicleTypeModalVisible(true);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles(theme).dropdownButtonText}>
                                    {VEHICLE_TYPE_LABELS[formData.vehicleType]}
                                </Text>
                                <MaterialIcons
                                    name="keyboard-arrow-down"
                                    size={24}
                                    color={theme.Colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <VehicleInputField
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
                                setTimeout(() => scrollToInput(tankCapacityRef), 100);
                            }}
                            onSubmitEditing={() => Keyboard.dismiss()}
                        />

                        {/* Fuel Type Dropdown */}
                        <View style={styles(theme).inputContainer}>
                            <View style={styles(theme).labelContainer}>
                                <MaterialIcons
                                    name="local-gas-station"
                                    size={22}
                                    color={theme.Colors.gray}
                                />
                                <Text style={[styles(theme).inputLabel, { color: theme.Colors.textPrimary }]}>
                                    Fuel Type
                                    <Text style={styles(theme).required}>*</Text>
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles(theme).dropdownButton}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setFuelTypeModalVisible(true);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles(theme).dropdownButtonText}>
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

                    <View style={styles(theme).actionContainer}>
                        <TouchableOpacity
                            style={[styles(theme).deleteButton, isDeleting && styles(theme).disabledButton]}
                            onPress={handleDelete}
                            disabled={isDeleting || isSubmitting}
                            activeOpacity={0.7}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color={theme.Colors.white} />
                            ) : (
                                <>
                                    <MaterialIcons name="delete" size={20} color={theme.Colors.white} />
                                    <Text style={styles(theme).deleteButtonText}>Delete</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles(theme).saveButton, isSubmitting && styles(theme).disabledButton]}
                            onPress={handleSave}
                            disabled={isSubmitting || isDeleting}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={theme.Colors.white} />
                            ) : (
                                <>
                                    <MaterialIcons name="save" size={20} color={theme.Colors.white} />
                                    <Text style={styles(theme).saveButtonText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Vehicle Type Modal */}
            <VehicleDropDownModal
                visible={vehicleTypeModalVisible}
                options={VEHICLE_TYPE_LABELS}
                selectedValue={formData.vehicleType}
                onSelect={(value) => handleInputChange("vehicleType", value)}
                onClose={() => setVehicleTypeModalVisible(false)}
                title="Select Vehicle Type"
            />

            {/* Fuel Type Modal */}
            <VehicleDropDownModal
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

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.Colors.background,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.Spacing.md,
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textSecondary,
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
        backgroundColor: theme.Colors.white,
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
        borderWidth: 1.5,
        borderColor: theme.Colors.gray,
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
        borderWidth: 1.5,
        borderColor: theme.Colors.gray,
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
        paddingTop: theme.Spacing.sm,
        paddingBottom: theme.Spacing.sm,
        marginTop: theme.Spacing.lg,
        gap: theme.Spacing.sm,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: theme.Colors.error,
        borderRadius: theme.BorderRadius.md,
        paddingVertical: theme.Spacing.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        minHeight: 56,
        shadowColor: theme.Colors.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    deleteButtonText: {
        color: theme.Colors.white,
        fontWeight: theme.FontWeight.bold,
        fontSize: theme.FontSizes.medium,
        marginLeft: theme.Spacing.xs,
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
        marginLeft: theme.Spacing.xs,
    },
    disabledButton: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end"
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
        borderRadius: theme.BorderRadius.sm
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.Spacing.md,
        paddingVertical: theme.Spacing.md
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