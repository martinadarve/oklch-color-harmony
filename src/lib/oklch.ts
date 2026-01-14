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

// OKLCH lightness to approximate relative luminance
// This is a simplified approximation - L in OKLCH correlates with perceived lightness
function oklchLToLuminance(L: number): number {
  // OKLCH L is perceptually uniform, roughly correlates with luminance^(1/3)
  return Math.pow(L, 3);
}

// Luminance to OKLCH lightness
function luminanceToOklchL(luminance: number): number {
  return Math.pow(Math.max(0, Math.min(1, luminance)), 1/3);
}

// Generate lightness values that produce equal contrast ratios between each step
function generateEqualContrastLightnessScale(stepCount: number): number[] {
  // Define target luminance range
  const whiteLum = 1.0; // White reference
  const minLum = 0.015; // Darkest luminance (around step 950)
  const maxLum = 0.95;  // Lightest luminance (around step 50)
  
  // We want equal contrast ratio jumps from white to each successive step
  // Contrast ratio = (L1 + 0.05) / (L2 + 0.05)
  // For equal perceptual steps, we use logarithmic spacing of contrast ratios
  
  const maxContrast = (whiteLum + 0.05) / (minLum + 0.05);
  const minContrast = (whiteLum + 0.05) / (maxLum + 0.05);
  
  // Logarithmic interpolation of contrast ratios
  const logMin = Math.log(minContrast);
  const logMax = Math.log(maxContrast);
  
  const lightnessValues: number[] = [];
  
  for (let i = 0; i < stepCount; i++) {
    const t = i / (stepCount - 1);
    // Logarithmic interpolation for perceptually uniform contrast steps
    const logContrast = logMin + t * (logMax - logMin);
    const contrast = Math.exp(logContrast);
    
    // Solve for luminance: contrast = (1 + 0.05) / (lum + 0.05)
    const luminance = (whiteLum + 0.05) / contrast - 0.05;
    
    // Convert luminance to OKLCH L
    const oklchL = luminanceToOklchL(Math.max(0.01, luminance));
    lightnessValues.push(oklchL);
  }
  
  return lightnessValues;
}

// Standard step values
const STEP_VALUES = [50, 100, 150, 200, 250, 350, 450, 550, 650, 750, 800, 850, 900, 950];

// Pre-calculated equal contrast lightness scale for 14 steps
const EQUAL_CONTRAST_LIGHTNESS = generateEqualContrastLightnessScale(14);

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

// Generate a color ramp using OKLCH with equal contrast ratio between steps
export function generateRamp(
  name: string,
  baseHex: string,
  referenceSteps?: { step: number; hex: string }[]
): ColorRamp {
  // If we have reference steps, use them for 150-850 range
  if (referenceSteps && referenceSteps.length > 0) {
    const refMap = new Map(referenceSteps.map(s => [s.step, s.hex]));
    
    // Parse reference colors
    const refOklch = referenceSteps.map(s => ({
      step: s.step,
      oklch: hexToOklch(s.hex)
    }));
    
    // Calculate consistent hue from references
    const avgHue = refOklch.reduce((sum, r) => sum + r.oklch.h, 0) / refOklch.length;
    
    // Find base chroma from references (around step 450-550)
    const midRefs = refOklch.filter(r => r.step >= 350 && r.step <= 650);
    const baseChroma = midRefs.length > 0
      ? midRefs.reduce((sum, r) => sum + r.oklch.c, 0) / midRefs.length
      : hexToOklch(baseHex).c;
    
    const result: ColorStep[] = STEP_VALUES.map((step, stepIndex) => {
      // Use reference values for 150-850
      if (refMap.has(step)) {
        const hex = refMap.get(step)!;
        return { step, hex, oklch: hexToOklch(hex) };
      }
      
      // For extrapolated steps (50, 100, 900, 950), use equal contrast curve
      const l = EQUAL_CONTRAST_LIGHTNESS[stepIndex];
      const c = calculateChroma(l, baseChroma, avgHue, stepIndex, STEP_VALUES.length);
      const clamped = clampChroma({ l, c, h: avgHue });
      
      return { step, hex: oklchToHex(clamped), oklch: clamped };
    });
    
    return { name, baseHex, steps: result };
  }
  
  // Generate completely from base color using equal contrast scale
  const baseOklch = hexToOklch(baseHex);
  
  const result: ColorStep[] = STEP_VALUES.map((step, stepIndex) => {
    const l = EQUAL_CONTRAST_LIGHTNESS[stepIndex];
    const c = calculateChroma(l, baseOklch.c, baseOklch.h, stepIndex, STEP_VALUES.length);
    
    const clamped = clampChroma({ l, c, h: baseOklch.h });
    const hex = oklchToHex(clamped);
    
    return { step, hex, oklch: clamped };
  });
  
  return { name, baseHex, steps: result };
}

// Regenerate ramp from new base hex with equal contrast
export function regenerateRampFromBase(
  name: string,
  newBaseHex: string,
  _originalRamp: ColorRamp
): ColorRamp {
  const newBaseOklch = hexToOklch(newBaseHex);
  
  const newSteps: ColorStep[] = STEP_VALUES.map((step, stepIndex) => {
    // Use equal contrast lightness scale
    const l = EQUAL_CONTRAST_LIGHTNESS[stepIndex];
    
    // Calculate chroma with natural curve
    const c = calculateChroma(l, newBaseOklch.c, newBaseOklch.h, stepIndex, STEP_VALUES.length);
    
    const clamped = clampChroma({ l, c, h: newBaseOklch.h });
    
    return {
      step,
      hex: oklchToHex(clamped),
      oklch: clamped
    };
  });
  
  return { name, baseHex: newBaseHex, steps: newSteps };
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
