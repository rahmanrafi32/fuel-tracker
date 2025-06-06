import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface AppTextProps extends TextProps {
    variant?: 'body' | 'title' | 'subtitle' | 'caption';
}

export const AppText: React.FC<AppTextProps> = ({
                                                    children,
                                                    style,
                                                    variant = 'body',
                                                    ...props
                                                }) => {
    const { theme } = useTheme();

    const getVariantStyle = () => {
        switch (variant) {
            case 'title':
                return styles(theme).title;
            case 'subtitle':
                return styles(theme).subtitle;
            case 'caption':
                return styles(theme).caption;
            case 'body':
            default:
                return styles(theme).body;
        }
    };

    return (
        <Text
            style={[getVariantStyle(), style]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = (theme: any) => StyleSheet.create({
    body: {
        fontSize: theme.FontSizes.medium,
        color: theme.Colors.textPrimary,
    },
    title: {
        fontSize: theme.FontSizes.large,
        fontWeight: theme.FontWeight.bold,
        color: theme.Colors.textPrimary,
    },
    subtitle: {
        fontSize: theme.FontSizes.medium,
        fontWeight: theme.FontWeight.medium,
        color: theme.Colors.textSecondary,
    },
    caption: {
        fontSize: theme.FontSizes.small,
        color: theme.Colors.textSecondary,
    },
});