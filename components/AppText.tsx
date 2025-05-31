
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import theme from '../Themes';

export const AppText = ({ style, children, ...props }: TextProps) => {
    return (
        <Text style={[styles.text, style]} {...props}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.text,
        fontFamily: theme.FontFamily.regular,
    }
});