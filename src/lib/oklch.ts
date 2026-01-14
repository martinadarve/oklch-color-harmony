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

// Generate a color ramp using OKLCH
// The algorithm interpolates lightness while preserving hue
// Chroma is adjusted based on lightness curve
export function generateRamp(
  name: string,
  baseHex: string,
  referenceSteps?: { step: number; hex: string }[]
): ColorRamp {
  const steps = [50, 100, 150, 200, 250, 350, 450, 550, 650, 750, 800, 850, 900, 950];
  
  // If we have reference steps (150-850), use them directly
  if (referenceSteps && referenceSteps.length > 0) {
    const refMap = new Map(referenceSteps.map(s => [s.step, s.hex]));
    
    // Parse all reference colors to get their OKLCH values
    const refOklch = referenceSteps.map(s => ({
      step: s.step,
      oklch: hexToOklch(s.hex)
    }));
    
    // Get the hue from reference colors (average or from base)
    const baseOklch = hexToOklch(baseHex);
    const avgHue = refOklch.length > 0 
      ? refOklch.reduce((sum, r) => sum + r.oklch.h, 0) / refOklch.length 
      : baseOklch.h;
    
    // Find lightness range from references
    const sortedByStep = [...refOklch].sort((a, b) => a.step - b.step);
    
    const result: ColorStep[] = steps.map(step => {
      // If we have the exact reference, use it
      if (refMap.has(step)) {
        const hex = refMap.get(step)!;
        return { step, hex, oklch: hexToOklch(hex) };
      }
      
      // Interpolate based on step position
      // Find surrounding reference points
      let lowerRef = sortedByStep[0];
      let upperRef = sortedByStep[sortedByStep.length - 1];
      
      for (let i = 0; i < sortedByStep.length - 1; i++) {
        if (sortedByStep[i].step <= step && sortedByStep[i + 1].step >= step) {
          lowerRef = sortedByStep[i];
          upperRef = sortedByStep[i + 1];
          break;
        }
      }
      
      // Extrapolate for steps outside reference range
      if (step < sortedByStep[0].step) {
        // Extrapolate lighter
        const t = (sortedByStep[0].step - step) / (sortedByStep[0].step - 50);
        const targetL = Math.min(0.98, sortedByStep[0].oklch.l + t * (0.98 - sortedByStep[0].oklch.l));
        const targetC = sortedByStep[0].oklch.c * (1 - t * 0.5);
        const clamped = clampChroma({ l: targetL, c: targetC, h: avgHue });
        return { step, hex: oklchToHex(clamped), oklch: clamped };
      }
      
      if (step > sortedByStep[sortedByStep.length - 1].step) {
        // Extrapolate darker
        const lastRef = sortedByStep[sortedByStep.length - 1];
        const t = (step - lastRef.step) / (950 - lastRef.step);
        const targetL = Math.max(0.15, lastRef.oklch.l - t * (lastRef.oklch.l - 0.15));
        const targetC = lastRef.oklch.c * (1 - t * 0.3);
        const clamped = clampChroma({ l: targetL, c: targetC, h: avgHue });
        return { step, hex: oklchToHex(clamped), oklch: clamped };
      }
      
      // Interpolate between two points
      const t = (step - lowerRef.step) / (upperRef.step - lowerRef.step);
      const l = lowerRef.oklch.l + t * (upperRef.oklch.l - lowerRef.oklch.l);
      const c = lowerRef.oklch.c + t * (upperRef.oklch.c - lowerRef.oklch.c);
      
      const clamped = clampChroma({ l, c, h: avgHue });
      return { step, hex: oklchToHex(clamped), oklch: clamped };
    });
    
    return { name, baseHex, steps: result };
  }
  
  // Generate from scratch using base hex
  const baseOklch = hexToOklch(baseHex);
  
  // Define lightness curve based on step (inverted - higher step = darker)
  const getLightness = (step: number): number => {
    // Map step to lightness: 50 -> ~0.97, 950 -> ~0.20
    const normalized = (step - 50) / 900; // 0 to 1
    return 0.97 - normalized * 0.77;
  };
  
  // Define chroma curve - peaks in the middle, decreases at extremes
  const getChroma = (step: number, baseChroma: number): number => {
    const normalized = (step - 50) / 900;
    // Bell curve peaking around step 450-550
    const chromaMultiplier = 1 - Math.pow((normalized - 0.45) * 1.5, 2);
    return baseChroma * Math.max(0.3, Math.min(1.2, chromaMultiplier + 0.3));
  };
  
  const result: ColorStep[] = steps.map(step => {
    const l = getLightness(step);
    const c = getChroma(step, baseOklch.c);
    const h = baseOklch.h;
    
    const clamped = clampChroma({ l, c, h });
    const hex = oklchToHex(clamped);
    
    return { step, hex, oklch: clamped };
  });
  
  return { name, baseHex, steps: result };
}

// Generate ramp from new base hex while trying to match original structure
export function regenerateRampFromBase(
  name: string,
  newBaseHex: string,
  originalRamp: ColorRamp
): ColorRamp {
  const newBaseOklch = hexToOklch(newBaseHex);
  const oldBaseOklch = hexToOklch(originalRamp.baseHex);
  
  // Calculate hue shift
  const hueShift = newBaseOklch.h - oldBaseOklch.h;
  const chromaRatio = newBaseOklch.c / (oldBaseOklch.c || 0.01);
  
  const newSteps: ColorStep[] = originalRamp.steps.map(step => {
    // Shift hue and adjust chroma
    let newH = step.oklch.h + hueShift;
    if (newH < 0) newH += 360;
    if (newH >= 360) newH -= 360;
    
    const newC = Math.max(0, step.oklch.c * chromaRatio);
    
    const newOklch = clampChroma({ l: step.oklch.l, c: newC, h: newH });
    
    return {
      step: step.step,
      hex: oklchToHex(newOklch),
      oklch: newOklch
    };
  });
  
  return { name, baseHex: newBaseHex, steps: newSteps };
}

// Format OKLCH for display
export function formatOklch(oklch: OklchColor): string {
  return `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
}
