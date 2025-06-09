import { db } from '../connection';

export interface Settings {
    id?: number;
    currencyCode: string;
    distanceUnit: string;
    volumeUnit: string;
    avgConsumption: string;
}

export async function insertSettings(settings: Omit<Settings, 'id'>): Promise<number> {
    const sql = `
        INSERT INTO settings (
            currency_code,
            distance_unit,
            volume_unit,
            avg_consumption
        ) VALUES (?, ?, ?, ?)
    `;
    const params = [
        settings.currencyCode,
        settings.distanceUnit,
        settings.volumeUnit,
        settings.avgConsumption
    ];
    const result = await db.executeUpdate(sql, params);
    return result.insertId!;
}

export async function getSettings(): Promise<Settings | null> {
    const sql = `
        SELECT
            id,
            currency_code as currencyCode,
            distance_unit as distanceUnit,
            volume_unit as volumeUnit,
            avg_consumption as avgConsumption
        FROM settings
        LIMIT 1
    `;
    const result = await db.executeQuery(sql);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows.item(0) as Settings;
}

export async function updateSettings(id: number, settings: Partial<Omit<Settings, 'id'>>): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];

    if (settings.currencyCode !== undefined) {
        fields.push('currency_code = ?');
        params.push(settings.currencyCode);
    }
    if (settings.distanceUnit !== undefined) {
        fields.push('distance_unit = ?');
        params.push(settings.distanceUnit);
    }
    if (settings.volumeUnit !== undefined) {
        fields.push('volume_unit = ?');
        params.push(settings.volumeUnit);
    }
    if (settings.avgConsumption !== undefined) {
        fields.push('avg_consumption = ?');
        params.push(settings.avgConsumption);
    }

    if (fields.length === 0) {
        return;
    }

    params.push(id);

    const sql = `UPDATE settings SET ${fields.join(', ')} WHERE id = ?`;
    await db.executeUpdate(sql, params);
}