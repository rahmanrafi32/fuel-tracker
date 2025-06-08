import React, { useState, ForwardedRef } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    NativeSyntheticEvent,
    TextInputFocusEventData,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

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
            onFocus,
            blurOnSubmit = false,
        },
        ref: ForwardedRef<TextInput>
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const { theme } = useTheme();

        return (
            <View style={styles(theme).inputContainer}>
                <View style={styles(theme).labelContainer}>
                    <MaterialIcons
                        name={icon}
                        size={22}
                        color={isFocused ? theme.Colors.primary : theme.Colors.gray}
                    />
                    <Text
                        style={[
                            styles(theme).inputLabel,
                            { color: isFocused ? theme.Colors.primary : theme.Colors.textPrimary },
                        ]}
                    >
                        {label}
                        {required && <Text style={styles(theme).required}>*</Text>}
                    </Text>
                </View>
                <View
                    style={[
                        styles(theme).inputWrapper,
                        isFocused && styles(theme).inputWrapperFocused,
                        (value && isFocused) && styles(theme).inputWrapperFilled,
                    ]}
                >
                    <TextInput
                        ref={ref}
                        style={styles(theme).textInput}
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

const styles = (theme: any) => StyleSheet.create({
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
});

export default InputField;