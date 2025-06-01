const Colors = {
    primary: '#f97316',
    background: '#f3f4f6',
    white: '#ffffff',
    black: '#000000',
    gray: '#6b7280',

    cardBackground: '#ffffff',
    badgeLight: '#fee2e2',

    textPrimary: '#000000',
    textSecondary: '#6b7280',
    textHeader: '#f97316',

    distanceOrange: '#ea580c',
    volumeYellow: '#facc15',
    costGreen: '#22c55e',
    rateGray: '#6b7280',
    error: '#C10F0FFF'
};

const FontSizes = {
    small: 12,
    medium: 16,
    large: 20,
    xl: 24,
    xxl: 32,
};

const FontFamily = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

const FontWeight = {
    regular: "400",
    medium: "500",
    bold: "700",
} as const;

const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
}

export default {
    Colors,
    FontSizes,
    FontFamily,
    Spacing,
    FontWeight,
    BorderRadius
};
