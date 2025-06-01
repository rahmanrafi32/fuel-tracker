import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import theme from '@/Themes';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const router = useRouter();

    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    const handleLogin = () => {
        emailInputRef.current?.blur();
        passwordInputRef.current?.blur();

        let valid = true;

        if (!email) {
            setEmailError('Email is required');
            valid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            valid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else if (!validatePassword(password)) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        } else {
            setPasswordError('');
        }

        if (!valid) {
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.replace('/(main)/home');
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Login to your account</Text>
                </View>
                
                <View style={styles.card}>
                    <View style={styles.inputContainer}>
                        <MaterialIcons
                            name="email"
                            size={20}
                            color={
                                emailError
                                    ? theme.Colors.error
                                    : emailFocused
                                        ? theme.Colors.primary
                                        : theme.Colors.gray
                            }
                            style={styles.inputIcon}
                        />
                        <TextInput
                            ref={emailInputRef}
                            placeholder="Email"
                            placeholderTextColor={theme.Colors.gray}
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                        />
                    </View>
                    {emailError ? (
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}
                    
                    <View style={styles.inputContainer}>
                        <MaterialIcons
                            name="lock"
                            size={20}
                            color={
                                passwordError
                                    ? theme.Colors.error
                                    : passwordFocused
                                        ? theme.Colors.primary
                                        : theme.Colors.gray
                            }
                            style={styles.inputIcon}
                        />
                        <TextInput
                            ref={passwordInputRef}
                            placeholder="Password"
                            placeholderTextColor={theme.Colors.gray}
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons
                                name={showPassword ? 'visibility-off' : 'visibility'}
                                size={20}
                                color={
                                    passwordError
                                        ? theme.Colors.error
                                        : passwordFocused
                                            ? theme.Colors.primary
                                            : theme.Colors.gray
                                }
                            />
                        </TouchableOpacity>
                    </View>
                    {passwordError ? (
                        <Text style={styles.errorText}>{passwordError}</Text>
                    ) : null}
                    
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={theme.Colors.white} />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>
                    
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>
                    
                    <TouchableOpacity style={styles.socialButton}>
                        <AntDesign
                            name="google"
                            size={20}
                            color="#EA4335"
                            style={styles.socialIcon}
                        />
                        <Text style={styles.socialButtonText}>Continue with Google</Text>
                    </TouchableOpacity>
                </View>

                {/* Signup Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don&#39;t have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/Register')}>
                        <Text style={styles.footerLink}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.Colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.Spacing.lg,
    },
    header: {
        marginBottom: theme.Spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: theme.FontSizes.xxl,
        fontFamily: theme.FontFamily.bold,
        color: theme.Colors.textPrimary,
        marginBottom: theme.Spacing.sm,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: theme.FontSizes.medium,
        fontFamily: theme.FontFamily.regular,
        color: theme.Colors.textSecondary,
    },
    card: {
        backgroundColor: theme.Colors.cardBackground,
        borderRadius: theme.BorderRadius.lg,
        padding: theme.Spacing.lg,
        shadowColor: theme.Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.Colors.white,
        borderWidth: 1,
        borderColor: theme.Colors.gray,
        borderRadius: theme.BorderRadius.md,
        paddingHorizontal: theme.Spacing.md,
        marginBottom: theme.Spacing.sm,
    },
    inputIcon: {
        marginRight: theme.Spacing.sm,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: theme.FontSizes.medium,
        fontFamily: theme.FontFamily.regular,
        color: theme.Colors.textPrimary,
    },
    eyeIcon: {
        padding: theme.Spacing.sm,
    },
    loginButton: {
        backgroundColor: theme.Colors.primary,
        borderRadius: theme.BorderRadius.md,
        paddingVertical: theme.Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.Spacing.md,
        height: 50,
        shadowColor: theme.Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    loginButtonText: {
        fontSize: theme.FontSizes.medium,
        fontFamily: theme.FontFamily.bold,
        color: theme.Colors.white,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.Colors.gray,
    },
    dividerText: {
        fontSize: theme.FontSizes.medium,
        fontFamily: theme.FontFamily.medium,
        color: theme.Colors.textSecondary,
        marginHorizontal: theme.Spacing.md,
    },
    socialButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.Colors.white,
        borderRadius: theme.BorderRadius.md,
        padding: theme.Spacing.md,
        borderWidth: 1,
        borderColor: theme.Colors.gray,
        shadowColor: theme.Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    socialIcon: {
        marginRight: theme.Spacing.sm,
    },
    socialButtonText: {
        fontSize: theme.FontSizes.medium,
        fontFamily: theme.FontFamily.medium,
        color: theme.Colors.textPrimary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.Spacing.lg,
    },
    footerText: {
        fontSize: theme.FontSizes.medium,
        fontFamily: theme.FontFamily.regular,
        color: theme.Colors.textSecondary,
    },
    footerLink: {
        fontSize: theme.FontSizes.medium,
        fontFamily: theme.FontFamily.medium,
        color: theme.Colors.primary,
    },
    errorText: {
        color: theme.Colors.error,
        fontSize: theme.FontSizes.small,
        fontFamily: theme.FontFamily.regular,
        marginTop: 4,
        marginLeft: theme.Spacing.sm,
        marginBottom: theme.Spacing.sm,
    },
});