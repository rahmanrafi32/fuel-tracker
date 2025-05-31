import { dbConnection } from '../connection';

export interface RefuelStatistics {
    totalLiters: number;
    totalCost: number;
    averageCostPerLiter: number;
    totalRefuels: number;
    averageLitersPerRefuel: number;
    averageCostPerRefuel: number;
}

export interface VehicleRefuelSummary {
    vehicleId: number;
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: string;
    totalLiters: number;
    totalCost: number;
    refuelCount: number;
    lastRefuelDate: string;
    averageFuelConsumption?: number; // km per liter
}

export interface MonthlyRefuelData {
    month: string;
    year: number;
    totalLiters: number;
    totalCost: number;
    refuelCount: number;
    averagePricePerLiter: number;
}

export async function getOverallStatistics(vehicleId?: number): Promise<RefuelStatistics> {
    let sql = `
        SELECT
            COALESCE(SUM(liters), 0) as totalLiters,
            COALESCE(SUM(cost), 0) as totalCost,
            COALESCE(AVG(price_per_liter), 0) as averageCostPerLiter,
            COUNT(*) as totalRefuels,
            COALESCE(AVG(liters), 0) as averageLitersPerRefuel,
            COALESCE(AVG(cost), 0) as averageCostPerRefuel
        FROM refuel_logs
    `;

    const params: any[] = [];

    if (vehicleId) {
        sql += ' WHERE vehicle_id = ?';
        params.push(vehicleId);
    }

    const result = await dbConnection.executeQuery(sql, params);
    return result.rows.item(0);
}

export async function getPriceAnalysis(vehicleId?: number): Promise<{
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    priceVariance: number;
}> {
    let sql = `
        SELECT
            MIN(price_per_liter) as lowestPrice,
            MAX(price_per_liter) as highestPrice,
            AVG(price_per_liter) as averagePrice,
            (MAX(price_per_liter) - MIN(price_per_liter)) as priceVariance
        FROM refuel_logs
    `;

    const params: any[] = [];

    if (vehicleId) {
        sql += ' WHERE vehicle_id = ?';
        params.push(vehicleId);
    }

    const result = await dbConnection.executeQuery(sql, params);
    return result.rows.item(0);
}

export async function getRecentRefuels(limit: number = 5, vehicleId?: number): Promise<any[]> {
    let sql = `
        SELECT
            rl.id,
            rl.date,
            rl.cost,
            rl.liters,
            rl.price_per_liter as pricePerLiter,
            rl.location,
            rl.odometer,
            v.name as vehicleName
        FROM refuel_logs rl
        LEFT JOIN vehicles v ON rl.vehicle_id = v.id
    `;

    const params: any[] = [];

    if (vehicleId) {
        sql += ' WHERE rl.vehicle_id = ?';
        params.push(vehicleId);
    }

    sql += ' ORDER BY rl.date DESC, rl.created_at DESC LIMIT ?';
    params.push(limit);

    const result = await dbConnection.executeQuery(sql, params);
    const recentRefuels: any[] = [];
    for (let i = 0; i < result.rows.length; i++) {
        recentRefuels.push(result.rows.item(i));
    }
    return recentRefuels;
}

export async function getStatisticsByDateRange(
    startDate: string,
    endDate: string,
    vehicleId?: number
): Promise<RefuelStatistics> {
    let sql = `
        SELECT
            COALESCE(SUM(liters), 0) as totalLiters,
            COALESCE(SUM(cost), 0) as totalCost,
            COALESCE(AVG(price_per_liter), 0) as averageCostPerLiter,
            COUNT(*) as totalRefuels,
            COALESCE(AVG(liters), 0) as averageLitersPerRefuel,
            COALESCE(AVG(cost), 0) as averageCostPerRefuel
        FROM refuel_logs
        WHERE date BETWEEN ? AND ?
    `;

    const params = [startDate, endDate];

    if (vehicleId) {
        sql += ' AND vehicle_id = ?';
        params.push(vehicleId);
    }

    const result = await dbConnection.executeQuery(sql, params);
    return result.rows.item(0);
}

export async function getVehicleRefuelSummary(): Promise<VehicleRefuelSummary[]> {
    const sql = `
        SELECT
            v.id as vehicleId,
            v.name as vehicleName,
            v.make as vehicleMake,
            v.model as vehicleModel,
            COALESCE(SUM(rl.liters), 0) as totalLiters,
            COALESCE(SUM(rl.cost), 0) as totalCost,
            COUNT(rl.id) as refuelCount,
            MAX(rl.date) as lastRefuelDate
        FROM vehicles v
        LEFT JOIN refuel_logs rl ON v.id = rl.vehicle_id
        GROUP BY v.id, v.name, v.make, v.model
        ORDER BY refuelCount DESC, lastRefuelDate DESC
    `;

    const result = await dbConnection.executeQuery(sql);
    const summaries: VehicleRefuelSummary[] = [];
    for (let i = 0; i < result.rows.length; i++) {
        summaries.push(result.rows.item(i));
    }
    return summaries;
}

export async function getMonthlyRefuelData(vehicleId?: number, year?: number): Promise<MonthlyRefuelData[]> {
    let sql = `
        SELECT
            strftime('%m', date) as month,
            strftime('%Y', date) as year,
            SUM(liters) as totalLiters,
            SUM(cost) as totalCost,
            COUNT(*) as refuelCount,
            AVG(price_per_liter) as averagePricePerLiter
        FROM refuel_logs
        WHERE 1=1
    `;

    const params: any[] = [];

    if (vehicleId) {
        sql += ' AND vehicle_id = ?';
        params.push(vehicleId);
    }

    if (year) {
        sql += ' AND strftime("%Y", date) = ?';
        params.push(year.toString());
    }

    sql += `
        GROUP BY strftime('%Y-%m', date)
        ORDER BY year DESC, month DESC
    `;

    const result = await dbConnection.executeQuery(sql, params);
    const monthlyData: MonthlyRefuelData[] = [];
    for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        monthlyData.push({
            month: row.month,
            year: parseInt(row.year),
            totalLiters: row.totalLiters,
            totalCost: row.totalCost,
            refuelCount: row.refuelCount,
            averagePricePerLiter: row.averagePricePerLiter
        });
    }
    return monthlyData;
}

export async function calculateFuelConsumption(vehicleId: number): Promise<number | null> {
    const sql = `
        SELECT
            odometer,
            liters,
            date
        FROM refuel_logs
        WHERE vehicle_id = ? AND is_full_tank = 1
        ORDER BY date ASC, created_at ASC
        LIMIT 10
    `;

    const result = await dbConnection.executeQuery(sql, [vehicleId]);

    if (result.rows.length < 2) {
        return null; // Need at least 2 full tank records
    }

    let totalKm = 0;
    let totalLiters = 0;

    for (let i = 1; i < result.rows.length; i++) {
        const current = result.rows.item(i);
        const previous = result.rows.item(i - 1);

        const kmDriven = current.odometer - previous.odometer;
        if (kmDriven > 0) {
            totalKm += kmDriven;
            totalLiters += current.liters;
        }
    }

    return totalLiters > 0 ? totalKm / totalLiters : null;
}

export async function getTopExpensiveRefuels(limit: number = 10, vehicleId?: number): Promise<any[]> {
    let sql = `
        SELECT
            rl.id,
            rl.date,
            rl.cost,
            rl.liters,
            rl.price_per_liter as pricePerLiter,
            rl.location,
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

    sql += ' ORDER BY rl.cost DESC LIMIT ?';
    params.push(limit);

    const result = await dbConnection.executeQuery(sql, params);
    const expensiveRefuels: any[] = [];
    for (let i = 0; i < result.rows.length; i++) {
        expensiveRefuels.push(result.rows.item(i));
    }
    return expensiveRefuels;
}