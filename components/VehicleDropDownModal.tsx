import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface DropdownModalProps {
    visible: boolean;
    options: Record<string, string>;
    selectedValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    title: string;
}

const VehicleDropDownModal: React.FC<DropdownModalProps> = ({
                                                         visible,
                                                         options,
                                                         selectedValue,
                                                         onSelect,
                                                         onClose,
                                                         title,
                                                     }) => {
    const { theme } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles(theme).modalOverlay}>
                <View style={styles(theme).modalContent}>
                    <View style={styles(theme).modalHandle} />
                    <View style={styles(theme).modalHeader}>
                        <Text style={styles(theme).modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles(theme).closeButton}>
                            <MaterialIcons name="close" size={24} color={theme.Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {Object.entries(options).map(([value, label]) => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles(theme).modalOption,
                                    selectedValue === value && styles(theme).selectedOption,
                                ]}
                                onPress={() => {
                                    onSelect(value);
                                    onClose();
                                }}
                            >
                                <Text
                                    style={[
                                        styles(theme).modalOptionText,
                                        selectedValue === value && styles(theme).selectedOptionText,
                                    ]}
                                >
                                    {label}
                                </Text>
                                {selectedValue === value && (
                                    <View style={styles(theme).checkIconContainer}>
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

const styles = (theme: any) => StyleSheet.create({
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

export default VehicleDropDownModal;