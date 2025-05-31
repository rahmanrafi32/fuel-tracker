import { db } from '../connection';

export interface Vehicle {
    id: number;
    name: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
    fuelType: string;
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
    fuelType: string;
    tankCapacity?: number;
}

export interface UpdateVehicleData {
    name?: string;
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    fuelType?: string;
    tankCapacity?: number;
}

export async function createVehicle(vehicleData: CreateVehicleData): Promise<number> {
    const sql = `
        INSERT INTO vehicles (name, make, model, year, license_plate, fuel_type, tank_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        vehicleData.name,
        vehicleData.make,
        vehicleData.model,
        vehicleData.year,
        vehicleData.licensePlate || null,
        vehicleData.fuelType,
        vehicleData.tankCapacity || null
    ];

    const result = await db.executeUpdate(sql, params);
    return result.insertId!;
}

export async function findAllVehicles(): Promise<Vehicle[]> {
    const sql = `
        SELECT
            id,
            name,
            make,
            model,
            year,
            license_plate as licensePlate,
            fuel_type as fuelType,
            tank_capacity as tankCapacity,
            created_at as createdAt,
            updated_at as updatedAt
        FROM vehicles
        ORDER BY created_at DESC
    `;
    const result = await db.executeQuery(sql);
    return result.rows._array as Vehicle[];
}

export async function findVehicleById(id: number): Promise<Vehicle | null> {
    const sql = `
        SELECT
            id,
            name,
            make,
            model,
            year,
            license_plate as licensePlate,
            fuel_type as fuelType,
            tank_capacity as tankCapacity,
            created_at as createdAt,
            updated_at as updatedAt
        FROM vehicles
        WHERE id = ?
    `;
    const result = await db.executeQuery(sql, [id]);
    if (!result.rows.length) {
        return null;
    }
    return result.rows.item(0) as Vehicle;
}

export async function updateVehicle(id: number, vehicleData: UpdateVehicleData): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];

    if (vehicleData.name !== undefined) {
        fields.push('name = ?');
        params.push(vehicleData.name);
    }
    if (vehicleData.make !== undefined) {
        fields.push('make = ?');
        params.push(vehicleData.make);
    }
    if (vehicleData.model !== undefined) {
        fields.push('model = ?');
        params.push(vehicleData.model);
    }
    if (vehicleData.year !== undefined) {
        fields.push('year = ?');
        params.push(vehicleData.year);
    }
    if (vehicleData.licensePlate !== undefined) {
        fields.push('license_plate = ?');
        params.push(vehicleData.licensePlate);
    }
    if (vehicleData.fuelType !== undefined) {
        fields.push('fuel_type = ?');
        params.push(vehicleData.fuelType);
    }
    if (vehicleData.tankCapacity !== undefined) {
        fields.push('tank_capacity = ?');
        params.push(vehicleData.tankCapacity);
    }

    if (fields.length === 0) {
        return; // Nothing to update
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`;
    await db.executeUpdate(sql, params);
}

export async function deleteVehicle(id: number): Promise<void> {
    const sql = 'DELETE FROM vehicles WHERE id = ?';
    await db.executeUpdate(sql, [id]);
}

export async function getVehicleCount(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM vehicles';
    const result = await db.executeQuery(sql);
    return result.rows.item(0).count;
}

export async function searchVehicles(searchTerm: string): Promise<Vehicle[]> {
    const sql = `
        SELECT
            id,
            name,
            make,
            model,
            year,
            license_plate as licensePlate,
            fuel_type as fuelType,
            tank_capacity as tankCapacity,
            created_at as createdAt,
            updated_at as updatedAt
        FROM vehicles
        WHERE name LIKE ? OR make LIKE ? OR model LIKE ? OR license_plate LIKE ?
        ORDER BY created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    const result = await db.executeQuery(sql, [
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
    ]);
    return result.rows._array as Vehicle[];
}