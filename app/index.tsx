import {Redirect} from 'expo-router';
import {useEffect, useState} from "react";
import {initializeDatabase} from "@/config/Database";
import {StatusBar} from "expo-status-bar";
import {View} from "react-native";
import {AppText} from "@/components/AppText";

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
            <View>
                <AppText>
                    {dbError ? `Database Error: ${dbError}` : 'Initializing Database...'}
                </AppText>
                <StatusBar style="auto"/>
            </View>
        );
    }
    let user = true;
    if (user) {
        return <Redirect href="/(main)/home"/>;
    } else {
        return <Redirect href="/(auth)/Login"/>;
    }
}
