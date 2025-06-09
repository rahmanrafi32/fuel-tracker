import { db } from '../connection';

export interface RefuelLog {
    id: number;
    vehicleId: number;
    date: string;
    odometer: number;
    liters: number;
    cost: number;
    pricePerLiter: number;
    fuelType: string;
    location?: string;
    notes?: string;
    isFullTank: boolean;
    createdAt: string;
    updatedAt: string;
    vehicleName?: string;
    vehicleMake?: string;
    vehicleModel?: string;
}

export interface CreateRefuelLogData {
    vehicleId: string;
    date: string;
    odometer: number;
    liters: number;
    cost: number;
    fuelType: string;
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
    fuelType?: string;
    location?: string;
    notes?: string;
    isFullTank?: boolean;
}

export async function createRefuel(refuelData: CreateRefuelLogData): Promise<number> {
    const sql = `
        INSERT INTO refuel_logs (
            vehicle_id, date, odometer, liters, cost, fuel_type,
            location, notes, is_full_tank
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        refuelData.vehicleId,
        refuelData.date,
        refuelData.odometer,
        refuelData.liters,
        refuelData.cost,
        refuelData.fuelType,
        refuelData.location || null,
        refuelData.notes || null,
        refuelData.isFullTank ?? true
    ];

    const result = await db.executeUpdate(sql, params);
    return result.insertId!;
}

export async function findAllRefuels(vehicleId?: number): Promise<RefuelLog[]> {
    let sql = `
        SELECT
            rl.id,
            rl.vehicle_id as vehicleId,
            rl.date,
            rl.odometer,
            rl.liters,
            rl.cost,
            rl.price_per_liter as pricePerLiter,
            rl.fuel_type as fuelType,
            rl.location,
            rl.notes,
            rl.is_full_tank as isFullTank,
            rl.created_at as createdAt,
            rl.updated_at as updatedAt,
            v.name as vehicleName,
            v.make as vehicleMake,
            v.model as vehicleModel
        FROM refuel_logs rl
                 LEFT JOIN vehicles v ON rl.vehicle_id = v.id
    `;

    const params: any[] = [];

    if (vehicleId) {
        sql += ' WHERE rl.vehicle_id = ?';
        params.push(vehicleId);
    }

    sql += ' ORDER BY rl.date DESC, rl.created_at DESC';

    const result = await db.executeQuery(sql, params);
    return result.rows._array as RefuelLog[];
}

export async function findRefuelById(id: number): Promise<RefuelLog | null> {
    const sql = `
        SELECT
            rl.id,
            rl.vehicle_id as vehicleId,
            rl.date,
            rl.odometer,
            rl.liters,
            rl.cost,
            rl.price_per_liter as pricePerLiter,
            rl.fuel_type as fuelType,
            rl.location,
            rl.notes,
            rl.is_full_tank as isFullTank,
            rl.created_at as createdAt,
            rl.updated_at as updatedAt,
            v.name as vehicleName,
            v.make as vehicleMake,
            v.model as vehicleModel
        FROM refuel_logs rl
                 LEFT JOIN vehicles v ON rl.vehicle_id = v.id
        WHERE rl.id = ?
    `;

    const result = await db.executeQuery(sql, [id]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows.item(0) as RefuelLog;
}

export async function findRefuelsByVehicle(vehicleId: number, limit?: number): Promise<RefuelLog[]> {
    let sql = `
        SELECT
            rl.id,
            rl.vehicle_id as vehicleId,
            rl.date,
            rl.odometer,
            rl.liters,
            rl.cost,
            rl.price_per_liter as pricePerLiter,
            rl.fuel_type as fuelType,
            rl.location,
            rl.notes,
            rl.is_full_tank as isFullTank,
            rl.created_at as createdAt,
            rl.updated_at as updatedAt
        FROM refuel_logs rl
        WHERE rl.vehicle_id = ?
        ORDER BY rl.date DESC, rl.created_at DESC
    `;

    const params = [vehicleId];

    if (limit) {
        sql += ' LIMIT ?';
        params.push(limit);
    }

    const result = await db.executeQuery(sql, params);
    return result.rows._array as RefuelLog[];
}

export async function updateRefuel(id: number, refuelData: UpdateRefuelLogData): Promise<void> {
    const fields = [];
    const params = [];

    if (refuelData.vehicleId !== undefined) {
        fields.push('vehicle_id = ?');
        params.push(refuelData.vehicleId);
    }
    if (refuelData.date !== undefined) {
        fields.push('date = ?');
        params.push(refuelData.date);
    }
    if (refuelData.odometer !== undefined) {
        fields.push('odometer = ?');
        params.push(refuelData.odometer);
    }
    if (refuelData.liters !== undefined) {
        fields.push('liters = ?');
        params.push(refuelData.liters);
    }
    if (refuelData.cost !== undefined) {
        fields.push('cost = ?');
        params.push(refuelData.cost);
    }
    if (refuelData.fuelType !== undefined) {
        fields.push('fuel_type = ?');
        params.push(refuelData.fuelType);
    }
    if (refuelData.location !== undefined) {
        fields.push('location = ?');
        params.push(refuelData.location);
    }
    if (refuelData.notes !== undefined) {
        fields.push('notes = ?');
        params.push(refuelData.notes);
    }
    if (refuelData.isFullTank !== undefined) {
        fields.push('is_full_tank = ?');
        params.push(refuelData.isFullTank);
    }

    if (fields.length === 0) {
        return; 
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE refuel_logs SET ${fields.join(', ')} WHERE id = ?`;
    await db.executeUpdate(sql, params);
}

export async function deleteRefuel(id: number): Promise<void> {
    const sql = 'DELETE FROM refuel_logs WHERE id = ?';
    await db.executeUpdate(sql, [id]);
}

export async function deleteRefuelsByVehicle(vehicleId: number): Promise<void> {
    const sql = 'DELETE FROM refuel_logs WHERE vehicle_id = ?';
    await db.executeUpdate(sql, [vehicleId]);
}

export async function findRefuelsByDateRange(
    vehicleId: number,
    startDate: string,
    endDate: string
): Promise<RefuelLog[]> {
    const sql = `
        SELECT
            rl.id,
            rl.vehicle_id as vehicleId,
            rl.date,
            rl.odometer,
            rl.liters,
            rl.cost,
            rl.price_per_liter as pricePerLiter,
            rl.fuel_type as fuelType,
            rl.location,
            rl.notes,
            rl.is_full_tank as isFullTank,
            rl.created_at as createdAt,
            rl.updated_at as updatedAt
        FROM refuel_logs rl
        WHERE rl.vehicle_id = ? AND rl.date BETWEEN ? AND ?
        ORDER BY rl.date DESC
    `;

    const result = await db.executeQuery(sql, [vehicleId, startDate, endDate]);
    return result.rows._array as RefuelLog[];
}

export async function getLastRefuelForVehicle(vehicleId: number): Promise<RefuelLog | null> {
    const sql = `
        SELECT
            rl.id,
            rl.vehicle_id as vehicleId,
            rl.date,
            rl.odometer,
            rl.liters,
            rl.cost,
            rl.price_per_liter as pricePerLiter,
            rl.fuel_type as fuelType,
            rl.location,
            rl.notes,
            rl.is_full_tank as isFullTank,
            rl.created_at as createdAt,
            rl.updated_at as updatedAt
        FROM refuel_logs rl
        WHERE rl.vehicle_id = ?
        ORDER BY rl.date DESC, rl.created_at DESC
        LIMIT 1
    `;

    const result = await db.executeQuery(sql, [vehicleId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows.item(0) as RefuelLog;
}