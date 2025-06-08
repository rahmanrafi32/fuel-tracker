import {MaterialIcons} from "@expo/vector-icons";
import {NativeSyntheticEvent, TextInputFocusEventData} from "react-native";

export interface Vehicle {
    id: number;
    name: string;
    make: string;
    model: string;
    year: string;
    vehicleType: vehicleType;
    fuelType: FuelType;
    tankCapacity?: string;
    createdAt: string;
    updatedAt: string;
}

export interface VehicleFormData {
    name: string;
    make: string;
    model: string;
    year: string;
    vehicleType: vehicleType;
    fuelType: FuelType;
    tankCapacity: string;
}

export interface CreateVehicleData {
    id: number;
    name: string;
    make: string;
    model: string;
    year: number;
    vehicleType: vehicleType;
    fuelType: FuelType;
    tankCapacity?: number;
}

export interface UpdateVehicleData {
    name?: string;
    make?: string;
    model?: string;
    year?: number;
    vehicleType: vehicleType;
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

export type vehicleType = "car" | 'bike'

export const VEHICLE_TYPE_LABELS: Record<vehicleType, string> = {
    car: "Car",
    bike: "Bike"
};

export interface VehicleWithStats extends Vehicle {
    totalRefuels?: number;
    totalLiters?: number;
    totalCost?: number;
    lastRefuelDate?: string;
    averageFuelConsumption?: number;
}

export interface DropdownModalProps {
    visible: boolean;
    options: Record<string, string>;
    selectedValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    title: string;
}

export interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    required?: boolean;
    icon: keyof typeof MaterialIcons.glyphMap;
    returnKeyType?: "done" | "next" | "search" | "go" | "send";
    onSubmitEditing?: () => void;
    blurOnSubmit?: boolean;
    onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}