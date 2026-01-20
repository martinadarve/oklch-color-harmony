// OKLCH Color Utilities

interface OklchColor {
  l: number; // Lightness 0-1
  c: number; // Chroma 0-0.4
  h: number; // Hue 0-360
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

// sRGB to Linear RGB
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Linear RGB to sRGB
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// Linear RGB to OKLab
function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

// OKLab to Linear RGB
function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// Hex to RGB
export function hexToRgb(hex: string): RgbColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

// RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    const hex = Math.round(clamped * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Hex to OKLCH
export function hexToOklch(hex: string): OklchColor {
  const { r, g, b } = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const [L, a, bVal] = linearRgbToOklab(lr, lg, lb);

  const c = Math.sqrt(a * a + bVal * bVal);
  let h = Math.atan2(bVal, a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { l: L, c, h };
}

// OKLCH to Hex
export function oklchToHex(oklch: OklchColor): string {
  const { l, c, h } = oklch;

  const hRad = h * (Math.PI / 180);
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const [lr, lg, lb] = oklabToLinearRgb(l, a, b);

  const r = linearToSrgb(lr);
  const g = linearToSrgb(lg);
  const bVal = linearToSrgb(lb);

  return rgbToHex(r, g, bVal);
}

// Check if color is in gamut
export function isInGamut(oklch: OklchColor): boolean {
  const { l, c, h } = oklch;

  const hRad = h * (Math.PI / 180);
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const [lr, lg, lb] = oklabToLinearRgb(l, a, b);

  const r = linearToSrgb(lr);
  const g = linearToSrgb(lg);
  const bVal = linearToSrgb(lb);

  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && bVal >= 0 && bVal <= 1;
}

// Clamp chroma to stay in gamut
export function clampChroma(oklch: OklchColor): OklchColor {
  let { l, c, h } = oklch;

  if (isInGamut({ l, c, h })) {
    return { l, c, h };
  }

  // Binary search for max chroma in gamut
  let low = 0;
  let high = c;

  while (high - low > 0.0001) {
    const mid = (low + high) / 2;
    if (isInGamut({ l, c: mid, h })) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return { l, c: low, h };
}

export interface ColorStep {
  step: number;
  hex: string;
  oklch: OklchColor;
}

export interface ColorRamp {
  id: string;
  name: string;
  baseHex: string;
  steps: ColorStep[];
}

// Calculate relative luminance for WCAG contrast
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

// Calculate WCAG contrast ratio between two colors
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Target luminance scale
//
// accessiblepalette.com behaves as if every ramp shares the exact same luminance at each step
// (therefore the same contrast vs white), independent of hue/chroma.
//
// We derive that shared luminance curve from the reference Neutrals ramp you provided.
// Neutrals itself stays exactly as provided in defaultPalettes.
// For steps 150-850, we enforce exact contrast ratios matching the reference neutrals.
const STEP_VALUES = [50, 100, 150, 200, 250, 350, 450, 550, 650, 750, 800, 850, 900, 950] as const;

const REFERENCE_NEUTRALS_HEX_BY_STEP: Record<(typeof STEP_VALUES)[number], string> = {
  50: '#FDFCFB',
  100: '#F7F4F2',
  150: '#EEECEB',
  200: '#D9D4D1',
  250: '#C4B9B4',
  350: '#AEA39D',
  450: '#978881',
  550: '#786A64',
  650: '#5F5550',
  750: '#4A4440',
  800: '#3A3632',
  850: '#2C2926',
  900: '#211F1D',
  950: '#151413',
};

// Calculate target luminance for each step based on reference neutrals
// This is the core of the Accessible Palette behaviour we mimic:
// every ramp shares the same sRGB luminance per step, so contrast vs
// white/black and grayscale conversions are consistent across hues.
const TARGET_LUMINANCE_BY_STEP_INDEX: number[] = STEP_VALUES.map((step) =>
  getRelativeLuminance(REFERENCE_NEUTRALS_HEX_BY_STEP[step])
);

function getTargetLuminanceByIndex(stepIndex: number): number {
  return TARGET_LUMINANCE_BY_STEP_INDEX[Math.max(0, Math.min(TARGET_LUMINANCE_BY_STEP_INDEX.length - 1, stepIndex))];
}

function solveOklchForTargetLuminance(params: {
  targetLuminance: number;
  hue: number;
  targetChroma: number;
}): OklchColor {
  const { targetLuminance, hue, targetChroma } = params;

  let low = 0;
  let high = 1;

  // Binary search on OKLCH lightness so that the resulting *sRGB luminance* matches the target.
  const iterations = 26;
  for (let i = 0; i < iterations; i++) {
    const mid = (low + high) / 2;

    // Keep chroma in gamut for this lightness.
    const maxC = findMaxChroma(mid, hue) * 0.98;
    const c = Math.min(targetChroma, maxC);

    const hex = oklchToHex({ l: mid, c, h: hue });
    const lum = getRelativeLuminance(hex);

    if (lum > targetLuminance) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const l = (low + high) / 2;
  const maxC = findMaxChroma(l, hue) * 0.98;
  const c = Math.min(targetChroma, maxC);

  return { l, c, h: hue };
}

export interface ColorStep {
  step: number;
  hex: string;
  oklch: OklchColor;
}

export interface ColorRamp {
  name: string;
  baseHex: string;
  steps: ColorStep[];
}

// Generate chroma value that creates a natural curve while staying in gamut
function calculateChroma(
  lightness: number,
  baseChroma: number,
  hue: number,
  stepIndex: number,
  totalSteps: number
): number {
  // Bell curve: maximum chroma in the middle lightness range
  // Map step index to 0-1, with peak around index 6-8 (steps 450-650)
  const normalized = stepIndex / (totalSteps - 1);

  // Peak chroma around 40-60% of the scale
  const peak = 0.45;
  const spread = 0.35;
  const bellCurve = Math.exp(-Math.pow((normalized - peak) / spread, 2));

  // Scale chroma: full at peak, reduced at extremes
  // Very light colors need less chroma, very dark too
  const chromaMultiplier = 0.25 + 0.75 * bellCurve;

  let targetChroma = baseChroma * chromaMultiplier;

  // Find maximum in-gamut chroma for this lightness/hue
  const maxGamutChroma = findMaxChroma(lightness, hue);

  return Math.min(targetChroma, maxGamutChroma * 0.98);
}

// Find maximum chroma for a given lightness and hue that's in gamut
function findMaxChroma(lightness: number, hue: number): number {
  let low = 0;
  let high = 0.4;

  while (high - low > 0.001) {
    const mid = (low + high) / 2;
    if (isInGamut({ l: lightness, c: mid, h: hue })) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low;
}

// Generate a color ramp using OKLCH, enforcing a shared luminance (contrast) curve across ramps
export function generateRamp(
  name: string,
  baseHex: string,
  referenceSteps?: { step: number; hex: string }[]
): ColorRamp {
  const baseOklch = hexToOklch(baseHex);

  const getChromaMultiplier = (stepIndex: number, totalSteps: number) => {
    const normalized = stepIndex / (totalSteps - 1);
    const peak = 0.45;
    const spread = 0.35;
    const bellCurve = Math.exp(-Math.pow((normalized - peak) / spread, 2));
    return 0.25 + 0.75 * bellCurve;
  };

  // If we have reference steps, treat 150-850 as chroma “hints” (keep close),
  // but always solve lightness from the shared target luminance curve.
  if (referenceSteps && referenceSteps.length > 0) {
    const refMap = new Map(referenceSteps.map((s) => [s.step, s.hex] as const));
    const refOklchByStep = new Map(
      referenceSteps.map((s) => [s.step, hexToOklch(s.hex)] as const)
    );

    // Prefer hue from the base (step 450), fallback to average reference hue.
    const refOklchs = [...refOklchByStep.values()];
    const avgHue =
      refOklchs.reduce((sum, r) => sum + r.h, 0) / Math.max(1, refOklchs.length);
    const hue = Number.isFinite(baseOklch.h) ? baseOklch.h : avgHue;

    // Base chroma from mid references if available
    const midRefs = refOklchs.filter((r, i) => {
      const step = referenceSteps[i]?.step;
      return step != null && step >= 350 && step <= 650;
    });
    const baseChroma =
      midRefs.length > 0
        ? midRefs.reduce((sum, r) => sum + r.c, 0) / midRefs.length
        : baseOklch.c;

    const result: ColorStep[] = STEP_VALUES.map((step, stepIndex) => {
      // For Pink specifically, keep the 450 token exactly as provided so it
      // matches your design tokens (C27390) and Accessible Palette output.
      const lockedHex = refMap.get(step);
      if (name === 'Pink' && step === 450 && lockedHex) {
        const locked = lockedHex.toUpperCase();
        return { step, hex: locked, oklch: hexToOklch(locked) };
      }

      // Use reference chroma as a hint for the core range, otherwise a bell curve from base chroma
      const ref = refOklchByStep.get(step);
      const chromaHint =
        step >= 150 && step <= 850 && ref
          ? ref.c
          : baseChroma * getChromaMultiplier(stepIndex, STEP_VALUES.length);

      const targetLuminance = getTargetLuminanceByIndex(stepIndex);
      const solved = solveOklchForTargetLuminance({
        targetLuminance,
        hue,
        targetChroma: chromaHint,
      });

      return { step, hex: oklchToHex(solved), oklch: solved };
    });

    return { id: crypto.randomUUID(), name, baseHex, steps: result };
  }

  // No references: generate everything from base hue/chroma but still match shared
  // sRGB luminance per step so that desaturation / grayscale align across ramps.
  const result: ColorStep[] = STEP_VALUES.map((step, stepIndex) => {
    const targetLuminance = getTargetLuminanceByIndex(stepIndex);
    const targetChroma = baseOklch.c * getChromaMultiplier(stepIndex, STEP_VALUES.length);

    const solved = solveOklchForTargetLuminance({
      targetLuminance,
      hue: baseOklch.h,
      targetChroma,
    });

    return { step, hex: oklchToHex(solved), oklch: solved };
  });

  return { id: crypto.randomUUID(), name, baseHex, steps: result };
}

// Regenerate ramp from new base hex, keeping the shared luminance (contrast) curve
export function regenerateRampFromBase(
  name: string,
  newBaseHex: string,
  _originalRamp: ColorRamp
): ColorRamp {
  const newBaseOklch = hexToOklch(newBaseHex);

  const getChromaMultiplier = (stepIndex: number, totalSteps: number) => {
    const normalized = stepIndex / (totalSteps - 1);
    const peak = 0.45;
    const spread = 0.35;
    const bellCurve = Math.exp(-Math.pow((normalized - peak) / spread, 2));
    return 0.25 + 0.75 * bellCurve;
  };

  const newSteps: ColorStep[] = STEP_VALUES.map((step, stepIndex) => {
    const targetLuminance = getTargetLuminanceByIndex(stepIndex);
    const targetChroma = newBaseOklch.c * getChromaMultiplier(stepIndex, STEP_VALUES.length);

    const solved = solveOklchForTargetLuminance({
      targetLuminance,
      hue: newBaseOklch.h,
      targetChroma,
    });

    return { step, hex: oklchToHex(solved), oklch: solved };
  });

  return { id: _originalRamp.id, name, baseHex: newBaseHex, steps: newSteps };
}

// Generate a completely new ramp from a base color
export function generateNewRamp(name: string, baseHex: string): ColorRamp {
  return generateRamp(name, baseHex);
}

// Format OKLCH for display
export function formatOklch(oklch: OklchColor): string {
  return `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
}

// Get contrast ratio between a color step and white
export function getStepContrastWithWhite(hex: string): number {
  return getContrastRatio(hex, '#FFFFFF');
}
