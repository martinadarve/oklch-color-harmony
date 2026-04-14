import { ColorRamp, hexToOklch } from './oklch';

const STORAGE_KEY = 'oklch-color-ramps';

/**
 * Save color ramps to localStorage
 * Only saves ramps marked as isSaved: true
 */
export function saveRamps(ramps: ColorRamp[]): void {
    try {
        const savedRamps = ramps.filter(ramp => ramp.isSaved);
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            ramps: savedRamps.map(ramp => ({
                id: ramp.id,
                name: ramp.name,
                baseHex: ramp.baseHex,
                isSaved: ramp.isSaved,
                steps: ramp.steps.map(s => ({
                    step: s.step,
                    hex: s.hex,
                })),
            })),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save ramps to localStorage:', error);
    }
}

/**
 * Load color ramps from localStorage
 * Returns null if no saved data exists
 */
export function loadRamps(): ColorRamp[] | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);
        if (!data.ramps || !Array.isArray(data.ramps)) return null;

        // Reconstruct ColorRamp objects with OKLCH data

        return data.ramps.map((ramp: any) => ({
            id: ramp.id,
            name: ramp.name,
            baseHex: ramp.baseHex,
            isSaved: ramp.isSaved ?? true, // Default to saved if not specified
            steps: ramp.steps.map((s: any) => ({
                step: s.step,
                hex: s.hex,
                oklch: hexToOklch(s.hex),
            })),
        }));
    } catch (error) {
        console.error('Failed to load ramps from localStorage:', error);
        return null;
    }
}

/**
 * Clear all saved ramps from localStorage
 */
export function clearSavedRamps(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear saved ramps:', error);
    }
}
