import { Redirect } from 'expo-router';
import { useEffect, useState } from "react";
import { initializeDatabase } from "@/config/Database";
import { View, ActivityIndicator } from "react-native";
import { AppText } from "@/components/AppText";
import theme from '@/Themes';

export default function Index() {
    const [isDbReady, setIsDbReady] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        const setupDatabase = async () => {
            try {
                await initializeDatabase();
                console.log('Database initialized successfully!');
                setIsDbReady(true);
            } catch (error) {
                console.error('Failed to initialize database:', error);
                setDbError(error instanceof Error ? error.message : 'Unknown database error');
            }
        };

        setupDatabase().then();
    }, []);
    
    if (!isDbReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.Colors.primary} />
                <AppText style={{ marginTop: 16 }}>
                    {dbError ? `Database Error: ${dbError}` : 'Initializing Database...'}
                </AppText>
            </View>
        );
    }

    return <Redirect href="/(main)/home" />;
}