import * as DatabaseMigrations from './migration';
import * as VehicleModel from './models/vehicle';
import * as RefuelModel from './models/refuel';
import * as RefuelQueries from './queries/refuel';

let initialized = false;

/**
 * Initializes the database and runs migrations if needed.
 * Ensures initialization runs only once.
 */
export async function initializeDatabase(): Promise<void> {
    if (!initialized) {
        await DatabaseMigrations.initializeMigrations();
        initialized = true;
    }
}

// Vehicle operations
export const vehicles = {
    create: VehicleModel.createVehicle,
    findAll: VehicleModel.findAllVehicles,
    findById: VehicleModel.findVehicleById,
    update: VehicleModel.updateVehicle,
    delete: VehicleModel.deleteVehicle,
    getCount: VehicleModel.getVehicleCount,
    search: VehicleModel.searchVehicles,
};

// Refuel operations
export const refuels = {
    create: RefuelModel.createRefuel,
    findAll: RefuelModel.findAllRefuels,
    findById: RefuelModel.findRefuelById,
    findByVehicle: RefuelModel.findRefuelsByVehicle,
    update: RefuelModel.updateRefuel,
    delete: RefuelModel.deleteRefuel,
    deleteByVehicle: RefuelModel.deleteRefuelsByVehicle,
    findByDateRange: RefuelModel.findRefuelsByDateRange,
    getLastForVehicle: RefuelModel.getLastRefuelForVehicle,
};

// Query operations for statistics and analytics
export const queries = {
    getOverallStatistics: RefuelQueries.getOverallStatistics,
    getPriceAnalysis: RefuelQueries.getPriceAnalysis,
    getRecentRefuels: RefuelQueries.getRecentRefuels,
    getStatisticsByDateRange: RefuelQueries.getStatisticsByDateRange,
    getVehicleRefuelSummary: RefuelQueries.getVehicleRefuelSummary,
    getMonthlyRefuelData: RefuelQueries.getMonthlyRefuelData,
    calculateFuelConsumption: RefuelQueries.calculateFuelConsumption,
    getTopExpensiveRefuels: RefuelQueries.getTopExpensiveRefuels,
};

// Migration operations
export const migrations = {
    initialize: DatabaseMigrations.initializeMigrations,
    addMigration: DatabaseMigrations.addMigration,
    getCurrentVersion: DatabaseMigrations.getCurrentVersion,
    runMigrations: DatabaseMigrations.runMigrations,
};

// Re-export types for convenience
export type {
    Vehicle,
    CreateVehicleData,
    UpdateVehicleData
} from './models/vehicle';

export type {
    RefuelLog,
    CreateRefuelLogData,
    UpdateRefuelLogData
} from './models/refuel';

export type {
    RefuelStatistics,
    VehicleRefuelSummary,
    MonthlyRefuelData
} from './queries/refuel';

// Re-export connection types
export type { QueryResult, DatabaseQuery } from './connection';

// Initialize database when module is imported (optional - you might want to call this manually)
// initializeDatabase().catch(console.error);

// Default export for convenience
export default {
    initializeDatabase,
    vehicles,
    refuels,
    queries,
    migrations,
};