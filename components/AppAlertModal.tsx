import React, {useCallback, useEffect, useRef} from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Dimensions,
    StyleSheet
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'destructive' | 'cancel';
}

interface AppAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    type?: AlertType;
    buttons?: AlertButton[];
    onClose?: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

const AppAlertModal: React.FC<AppAlertModalProps> = ({
                                                         visible,
                                                         title,
                                                         message,
                                                         type = 'info',
                                                         buttons = [{ text: 'OK' }],
                                                         onClose,
                                                         autoClose = false,
                                                         autoCloseDelay = 3000,
                                                     }) => {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [opacityAnim, scaleAnim, visible]);

    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose?.();
        });
    }, [onClose, scaleAnim, opacityAnim]);

    useEffect(() => {
        if (visible && autoClose) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [visible, autoClose, autoCloseDelay, handleClose]);

    const getIconAndColors = () => {
        switch (type) {
            case 'success':
                return {
                    icon: '✓',
                    primaryColor: theme.Colors.costGreen || '#10B981',
                    lightColor: '#D1FAE5',
                };
            case 'error':
                return {
                    icon: '✕',
                    primaryColor: theme.Colors.error || '#EF4444',
                    lightColor: '#FEE2E2',
                };
            case 'warning':
                return {
                    icon: '!',
                    primaryColor: '#F59E0B',
                    lightColor: '#FEF3C7',
                };
            case 'info':
            default:
                return {
                    icon: 'i',
                    primaryColor: theme.Colors.primary || '#3B82F6',
                    lightColor: '#DBEAFE',
                };
        }
    };

    const getButtonStyle = (buttonStyle: AlertButton['style'] = 'default') => {
        const { primaryColor } = getIconAndColors();

        switch (buttonStyle) {
            case 'destructive':
                return {
                    backgroundColor: theme.Colors.error || '#EF4444',
                    textColor: '#FFFFFF',
                };
            case 'cancel':
                return {
                    backgroundColor: 'transparent',
                    textColor: theme.Colors.textSecondary || '#6B7280',
                    borderWidth: 1,
                    borderColor: theme.Colors.gray || '#D1D5DB',
                };
            case 'default':
            default:
                return {
                    backgroundColor: primaryColor,
                    textColor: '#FFFFFF',
                };
        }
    };

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        } else {
            handleClose();
        }
    };

    if (!visible) return null;

    const { icon, primaryColor, lightColor } = getIconAndColors();

    return (
        <Modal visible={visible} transparent animationType="none">
            <Animated.View
                style={[
                    styles(theme).alertOverlay,
                    { opacity: opacityAnim }
                ]}
            >
                <Animated.View
                    style={[
                        styles(theme).alertContainer,
                        {
                            backgroundColor: theme.Colors.cardBackground || theme.Colors.white || '#FFFFFF',
                            transform: [
                                { scale: scaleAnim },
                                {
                                    translateY: scaleAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {/* Icon Container */}
                    <View style={[styles(theme).iconContainer, { backgroundColor: lightColor }]}>
                        <View style={[styles(theme).iconCircle, { backgroundColor: primaryColor }]}>
                            <Text style={styles(theme).iconText}>{icon}</Text>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles(theme).contentContainer}>
                        <Text style={[
                            styles(theme).alertTitle,
                            { color: theme.Colors.textPrimary || '#1F2937' }
                        ]}>
                            {title}
                        </Text>
                        <Text style={[
                            styles(theme).alertMessage,
                            { color: theme.Colors.textSecondary || '#6B7280' }
                        ]}>
                            {message}
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View style={[
                        styles(theme).buttonContainer,
                        buttons.length > 1 && styles(theme).multipleButtons
                    ]}>
                        {buttons.map((button, index) => {
                            const buttonStyle = getButtonStyle(button.style);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles(theme).alertButton,
                                        {
                                            backgroundColor: buttonStyle.backgroundColor,
                                            borderWidth: buttonStyle.borderWidth || 0,
                                            borderColor: buttonStyle.borderColor,
                                        },
                                        buttons.length > 1 && styles(theme).multipleButton
                                    ]}
                                    onPress={() => handleButtonPress(button)}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles(theme).alertButtonText,
                                            { color: buttonStyle.textColor }
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = (theme: any) => StyleSheet.create({
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    alertContainer: {
        borderRadius: 24,
        paddingVertical: 32,
        paddingHorizontal: 24,
        width: width * 0.85,
        maxWidth: 350,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    alertMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    multipleButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    alertButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    multipleButton: {
        flex: 1,
        minWidth: 0,
    },
    alertButtonText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
});

export default AppAlertModal;