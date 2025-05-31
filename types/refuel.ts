import { FuelType } from './vehicle';

export interface RefuelLog {
    id: number;
    vehicleId: number;
    date: string;
    odometer: number;
    liters: number;
    cost: number;
    pricePerLiter: number;
    fuelType: FuelType;
    location?: string;
    notes?: string;
    isFullTank: boolean;
    createdAt: string;
    updatedAt: string;
    // Joined fields from vehicle table
    vehicleName?: string;
    vehicleMake?: string;
    vehicleModel?: string;
}

export interface CreateRefuelLogData {
    vehicleId: number;
    date: string;
    odometer: number;
    liters: number;
    cost: number;
    fuelType: FuelType;
    location?: string;
    notes?: string;
    isFullTank?: boolean;
}

export interface UpdateRefuelLogData {
    vehicleId?: number;
    date?: string;
    odometer?: number;
    liters?: number;
    cost?: number;
    fuelType?: FuelType;
    location?: string;
    notes?: string;
    isFullTank?: boolean;
}

export interface RefuelFormData {
    vehicleId: string;
    date: string;
    odometer: string;
    liters: string;
    cost: string;
    fuelType: FuelType;
    location: string;
    notes: string;
    isFullTank: boolean;
}

export interface RefuelListItem extends RefuelLog {
    distanceTraveled?: number;
    efficiency?: number; // km per liter
    daysSinceLastRefuel?: number;
}

// Validation types
export interface RefuelValidationError {
    field: keyof RefuelFormData;
    message: string;
}

export interface RefuelValidationResult {
    isValid: boolean;
    errors: RefuelValidationError[];
}

// Filter and sort types
export interface RefuelFilter {
    vehicleId?: number;
    startDate?: string;
    endDate?: string;
    minCost?: number;
    maxCost?: number;
    fuelType?: FuelType;
    location?: string;
}

export type RefuelSortBy =
    | 'date'
    | 'odometer'
    | 'cost'
    | 'liters'
    | 'pricePerLiter'
    | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface RefuelSortOptions {
    sortBy: RefuelSortBy;
    order: SortOrder;
}