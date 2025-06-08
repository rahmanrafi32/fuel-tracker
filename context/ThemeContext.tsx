import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lightTheme from '@/Themes';

const darkTheme = {
    ...lightTheme,
    Colors: {
        ...lightTheme.Colors,
        background: '#121212',
        cardBackground: '#1E1E1E',
        textPrimary: '#FFFFFF',
        textSecondary: '#f3f0f0',
        textHeader: '#FFFFFF',
        white: '#1E1E1E',
        black: '#FFFFFF',
        primary: lightTheme.Colors.primary,
        gray: '#9CA3AF',
        badgeLight: '#7F1D1D',
        distanceOrange: lightTheme.Colors.distanceOrange,
        volumeYellow: lightTheme.Colors.volumeYellow,
        costGreen: lightTheme.Colors.costGreen,
        rateGray: lightTheme.Colors.rateGray,
        error: lightTheme.Colors.error
    },
};

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: typeof lightTheme;
    themeType: ThemeType;
    isDark: boolean;
    setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    themeType: 'system',
    isDark: false,
    setThemeType: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>('system');
    const isDark =
        themeType === 'dark' ||
        (themeType === 'system' && systemColorScheme === 'dark');
    
    const theme = isDark ? darkTheme : lightTheme;
    
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('themePreference');
                if (savedTheme) {
                    setThemeType(savedTheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            }
        };

        loadThemePreference().then();
    }, []);
    
    const handleThemeChange = async (newThemeType: ThemeType) => {
        setThemeType(newThemeType);
        try {
            await AsyncStorage.setItem('themePreference', newThemeType);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themeType,
                isDark,
                setThemeType: handleThemeChange
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};