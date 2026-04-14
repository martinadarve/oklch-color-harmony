import { ColorRamp, hexToOklch } from './oklch';

const URL_PARAM = 'palettes';

type SerializedRamp = {
  id: string;
  name: string;
  baseHex: string;
  isSaved?: boolean;
  steps: [number, string][];
};

function serializeRamps(ramps: ColorRamp[]): string {
  const compact: SerializedRamp[] = ramps.map((ramp) => ({
    id: ramp.id,
    name: ramp.name,
    baseHex: ramp.baseHex,
    isSaved: ramp.isSaved,
    steps: ramp.steps.map((step) => [step.step, step.hex]),
  }));

  const json = JSON.stringify(compact);
  // encodeURIComponent to keep non-ASCII safe; btoa expects latin1.
  return btoa(encodeURIComponent(json));
}

function deserializeRamps(encoded: string): ColorRamp[] | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return null;

    return data.map((ramp: SerializedRamp) => ({
      id: ramp.id || crypto.randomUUID(),
      name: ramp.name || 'Ramp',
      baseHex: ramp.baseHex || '#000000',
      isSaved: ramp.isSaved ?? false,
      steps: (ramp.steps || []).map(([step, hex]) => ({
        step,
        hex,
        oklch: hexToOklch(hex),
      })),
    }));
  } catch (error) {
    console.error('Failed to read palettes from URL', error);
    return null;
  }
}

export function readRampsFromUrl(): ColorRamp[] | null {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get(URL_PARAM);
  if (!encoded) return null;
  return deserializeRamps(encoded);
}

export function writeRampsToUrl(ramps: ColorRamp[]): void {
  try {
    const encoded = serializeRamps(ramps);
    const url = new URL(window.location.href);
    url.searchParams.set(URL_PARAM, encoded);
    window.history.replaceState({}, '', url.toString());
  } catch (error) {
    console.error('Failed to write palettes to URL', error);
  }
}

export function clearRampsFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(URL_PARAM);
    window.history.replaceState({}, '', url.toString());
  } catch (error) {
    console.error('Failed to clear palettes from URL', error);
  }
}
