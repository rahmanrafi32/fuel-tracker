import { db } from './connection';

const CURRENT_VERSION = 2;

export async function initializeMigrations(): Promise<void> {
    try {
        // Check if migrations table exists
        await createMigrationsTable();

        // Get current database version
        const currentVersion = await getCurrentVersion();

        // Run migrations if needed
        if (currentVersion < CURRENT_VERSION) {
            await runMigrations(currentVersion);
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

async function createMigrationsTable(): Promise<void> {
    const sql = `
        CREATE TABLE IF NOT EXISTS migrations
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER NOT NULL,
            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await db.executeQuery(sql);
}

async function getCurrentVersion(): Promise<number> {
    try {
        const result = await db.executeQuery(
            'SELECT MAX(version) as version FROM migrations'
        );
        // db.executeQuery returns an object with rows property
        if (result && result.rows.length > 0) {
            return result.rows.item(0).version || 0;
        }
        return 0;
    } catch {
        return 0;
    }
}

async function runMigrations(fromVersion: number): Promise<void> {
    const migrations = [
        {
            version: 1,
            queries: [
                // Vehicles table
                `CREATE TABLE IF NOT EXISTS vehicles
                 (
                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     make TEXT NOT NULL,
                     model TEXT NOT NULL,
                     year INTEGER NOT NULL,
                     license_plate TEXT,
                     fuel_type TEXT NOT NULL DEFAULT 'petrol',
                     tank_capacity REAL,
                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                 );`,

                // Refuel logs table
                `CREATE TABLE IF NOT EXISTS refuel_logs
                 (
                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                     vehicle_id INTEGER NOT NULL,
                     date TEXT NOT NULL,
                     odometer INTEGER NOT NULL,
                     liters REAL NOT NULL,
                     cost REAL NOT NULL,
                     price_per_liter REAL GENERATED ALWAYS AS (cost / liters) STORED,
                     fuel_type TEXT NOT NULL DEFAULT 'petrol',
                     location TEXT,
                     notes TEXT,
                     is_full_tank BOOLEAN DEFAULT TRUE,
                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                     FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
                 );`,

                // Create indexes for better performance
                `CREATE INDEX IF NOT EXISTS idx_refuel_logs_vehicle_id ON refuel_logs(vehicle_id);`,
                `CREATE INDEX IF NOT EXISTS idx_refuel_logs_date ON refuel_logs(date);`,

                // Insert migration record
                `INSERT INTO migrations (version) VALUES (1);`
            ]
        },
        {
            version: 2,
            queries: [
                `CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    currency_code TEXT NOT NULL,
                    distance_unit TEXT NOT NULL,
                    volume_unit TEXT NOT NULL,
                    avg_consumption REAL NOT NULL
                );`,
                // Insert migration record
                `INSERT INTO migrations (version) VALUES (2);`
            ]
        }
    ];

    for (const migration of migrations) {
        if (migration.version > fromVersion) {
            console.log(`Running migration version ${migration.version}`);
            await db.executeTransaction(
                migration.queries.map(sql => ({ sql }))
            );
        }
    }
}

/**
 * Add a new migration with a given version and SQL queries.
 * @param version Migration version number
 * @param queries Array of SQL statements to run
 */
export async function addMigration(version: number, queries: string[]): Promise<void> {
    try {
        await db.executeTransaction([
            ...queries.map(sql => ({ sql })),
            { sql: 'INSERT INTO migrations (version) VALUES (?)', params: [version] }
        ]);
        console.log(`Migration version ${version} completed`);
    } catch (error) {
        console.error(`Migration version ${version} failed:`, error);
        throw error;
    }
}

// Export getCurrentVersion and runMigrations if needed elsewhere
export { getCurrentVersion, runMigrations };