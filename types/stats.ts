import React from "react";

export interface PriceStats {
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    priceVariance: number;
}

export interface VehicleStat {
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: string;
    totalLiters: number;
    totalCost: number;
    refuelCount: number;
    lastRefuelDate: string;
}

export interface TopRefuel {
    id: string;
    date: string;
    vehicleName: string;
    cost: number;
    liters: number;
    pricePerLiter: number;
}

export interface MetricCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
    subtitle?: string;
}

export interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    height?: number;
}