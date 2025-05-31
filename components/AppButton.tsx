import React from 'react';
import {Text, TextProps, TouchableOpacity, TouchableOpacityProps, StyleSheet} from 'react-native';
import theme from '../Themes';

export const AppButton = ({
                              title,
                              style,
                              textStyle,
                              ...props
                          }: TouchableOpacityProps & { title: string; textStyle?: TextProps['style'] }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} {...props}>
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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