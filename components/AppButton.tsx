import React from 'react';
import {Text, TextProps, TouchableOpacity, TouchableOpacityProps, StyleSheet} from 'react-native';
import {useTheme} from "@/context/ThemeContext";

export const AppButton = ({
                              title,
                              style,
                              textStyle,
                              ...props
                          }: TouchableOpacityProps & { title: string; textStyle?: TextProps['style'] }) => {
    const { theme } = useTheme();
    return (
        <TouchableOpacity style={[styles(theme).button, style]} {...props}>
            <Text style={[styles(theme).buttonText, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = (theme: any) => StyleSheet.create({
    text: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
        fontFamily: theme.FontFamily.regular,
    },
    button: {
        backgroundColor: theme.Colors.primary,
        padding: theme.Spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.Colors.background,
        fontSize: theme.FontSizes.medium,
        fontWeight: 'bold',
    },
});