import * as SQLite from 'expo-sqlite';

type QueryResult<T = any> = {
    rows: T[];
    changes: number;
    lastInsertRowId: number;
};

type DatabaseQuery = {
    sql: string;
    params?: any[];
};

const database: SQLite.SQLiteDatabase = SQLite.openDatabaseSync('fuel_tracker.db');

// Initialize tables
const initializeDatabase = async (): Promise<void> => {
    try {
        await database.execAsync(`
            CREATE TABLE IF NOT EXISTS vehicles (
                                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                    name TEXT NOT NULL,
                                                    make TEXT,
                                                    model TEXT,
                                                    year INTEGER,
                                                    license_plate TEXT,
                                                    fuel_type TEXT NOT NULL DEFAULT 'petrol',
                                                    tank_capacity REAL,
                                                    odometer_unit TEXT DEFAULT 'miles',
                                                    initial_odometer REAL DEFAULT 0,
                                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await database.execAsync(`
            CREATE TABLE IF NOT EXISTS refuel_logs (
                                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       vehicle_id INTEGER NOT NULL,
                                                       date TEXT NOT NULL,
                                                       odometer REAL NOT NULL,
                                                       liters REAL NOT NULL,
                                                       cost REAL NOT NULL,
                                                       price_per_liter REAL GENERATED ALWAYS AS (cost / liters) STORED,
                fuel_type TEXT NOT NULL DEFAULT 'petrol',
                location TEXT,
                notes TEXT,
                is_full_tank INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
                );
        `);

        // Create indexes for better performance
        await database.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_refuel_logs_vehicle_id ON refuel_logs(vehicle_id);
        `);

        await database.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_refuel_logs_date ON refuel_logs(date);
        `);

    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};

const executeQuery = async <T = any>(sql: string, params: any[] = []): Promise<{ rows: { length: number; item: (index: number) => T; _array: T[] } }> => {
    try {
        const statement = await database.prepareAsync(sql);
        const result = await statement.executeAsync(params);
        const rows = await result.getAllAsync();
        await statement.finalizeAsync();

        // Return in the format expected by the models
        return {
            rows: {
                length: rows.length,
                item: (index: number) => rows[index] as T,
                _array: rows as T[]
            }
        };
    } catch (error) {
        console.error('Query execution failed:', error);
        throw error;
    }
};

const executeSingleQuery = async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
    try {
        const statement = await database.prepareAsync(sql);
        const result = await statement.executeAsync(params);
        const row = await result.getFirstAsync();
        await statement.finalizeAsync();
        return (row as T) || null;
    } catch (error) {
        console.error('Single query execution failed:', error);
        throw error;
    }
};

const executeUpdate = async (
    sql: string,
    params: any[] = []
): Promise<{ insertId?: number; rowsAffected: number }> => {
    try {
        const statement = await database.prepareAsync(sql);
        const result = await statement.executeAsync(params);
        await statement.finalizeAsync();

        const info = result.changes;
        const insertId = result.lastInsertRowId;

        return {
            insertId: insertId > 0 ? insertId : undefined,
            rowsAffected: info
        };
    } catch (error) {
        console.error('Update execution failed:', error);
        throw error;
    }
};

const executeTransaction = async (queries: DatabaseQuery[]): Promise<void> => {
    try {
        await database.withTransactionAsync(async () => {
            for (const query of queries) {
                const statement = await database.prepareAsync(query.sql);
                await statement.executeAsync(query.params || []);
                await statement.finalizeAsync();
            }
        });
    } catch (error) {
        console.error('Transaction execution failed:', error);
        throw error;
    }
};

initializeDatabase().catch((error: Error) => {
    console.error('Failed to initialize database:', error);
});

export const db = {
    executeQuery,
    executeSingleQuery,
    executeUpdate,
    executeTransaction,
};

// Also export as dbConnection for backward compatibility
export const dbConnection = db;

export type { QueryResult, DatabaseQuery };