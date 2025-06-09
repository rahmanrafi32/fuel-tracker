import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/context/ThemeContext';
import {DropdownModalProps} from "@/types/refuel";

const FuelDropDownModal: React.FC<DropdownModalProps> = ({
                                                         visible,
                                                         options,
                                                         selectedValue,
                                                         onSelect,
                                                         onClose,
                                                         title,
                                                         maxHeight = "70%"
                                                     }) => {
    const {theme} = useTheme();

    const getOptionsArray = () => {
        if (Array.isArray(options)) {
            return options.map(option => ({key: option, label: option}));
        } else {
            return Object.entries(options).map(([key, label]) => ({key, label}));
        }
    };

    const optionsArray = getOptionsArray();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity
                style={styles(theme).modalOverlay}
                onPress={onClose}
                activeOpacity={1}
            >
                <View style={[styles(theme).dropdownModal, {maxHeight}]}>
                    {/* Modal Header */}
                    <View style={styles(theme).modalHeader}>
                        <Text style={styles(theme).dropdownTitle}>{title}</Text>
                        <TouchableOpacity
                            style={styles(theme).closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={24} color={theme.Colors.textSecondary}/>
                        </TouchableOpacity>
                    </View>

                    {/* Handle for visual consistency */}
                    <View style={styles(theme).modalHandle}/>

                    {/* Options List */}
                    <ScrollView
                        style={styles(theme).optionsContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {optionsArray.map(({key, label}) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles(theme).dropdownOption,
                                    selectedValue === key && styles(theme).selectedOption
                                ]}
                                onPress={() => {
                                    onSelect(key);
                                    onClose();
                                }}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles(theme).dropdownOptionText,
                                        selectedValue === key && styles(theme).selectedOptionText,
                                    ]}
                                >
                                    {label}
                                </Text>
                                {selectedValue === key && (
                                    <View style={styles(theme).checkIconContainer}>
                                        <Ionicons name="checkmark" size={16} color={theme.Colors.white}/>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = (theme: any) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.Spacing.lg,
    },
    dropdownModal: {
        backgroundColor: theme.Colors.cardBackground || theme.Colors.white,
        borderRadius: theme.BorderRadius.lg,
        width: '90%',
        maxWidth: 400,
        shadowColor: theme.Colors.black,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 5},
        elevation: 10,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.Spacing.lg,
        paddingVertical: theme.Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: theme.Colors.white,
    },
    dropdownTitle: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
        flex: 1,
    },
    closeButton: {
        padding: theme.Spacing.xs,
        borderRadius: theme.BorderRadius.sm,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: theme.Colors.gray,
        borderRadius: 2,
        alignSelf: 'center',
        marginVertical: theme.Spacing.sm,
    },
    optionsContainer: {
        maxHeight: 300,
        paddingHorizontal: theme.Spacing.md,
        paddingBottom: theme.Spacing.md,
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.Spacing.md,
        paddingHorizontal: theme.Spacing.md,
        borderRadius: theme.BorderRadius.sm,
        marginBottom: theme.Spacing.xs,
    },
    selectedOption: {
        backgroundColor: `${theme.Colors.primary}20`,
    },
    dropdownOptionText: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
        flex: 1,
    },
    selectedOptionText: {
        color: theme.Colors.primary,
        fontWeight: theme.FontWeight.medium,
    },
    checkIconContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.Spacing.sm,
    },
});

export default FuelDropDownModal;