export interface Vehicle {
    id: number;
    name: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
    fuelType: FuelType;
    type?:string;
    tankCapacity?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVehicleData {
    name: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
    fuelType: FuelType;
    tankCapacity?: number;
}

export interface UpdateVehicleData {
    name?: string;
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    fuelType?: FuelType;
    tankCapacity?: number;
}

export type FuelType = 
    'octane'
    | 'petrol'
    | 'diesel'
    | 'hybrid'
    | 'electric'
    | 'lpg'
    | 'cng';

export const FUEL_TYPES: Record<FuelType, string> = {
    petrol: 'Petrol',
    octane: 'Octane',
    diesel: 'Diesel',
    hybrid: 'Hybrid',
    electric: 'Electric',
    lpg: 'LPG',
    cng: 'CNG'
};

export interface VehicleWithStats extends Vehicle {
    totalRefuels?: number;
    totalLiters?: number;
    totalCost?: number;
    lastRefuelDate?: string;
    averageFuelConsumption?: number;
}