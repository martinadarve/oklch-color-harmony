import { ColorRamp, generateRamp } from './oklch';

// Default color palettes based on the provided reference
// Fixed hue consistency issues - all steps now maintain consistent hue

export const defaultPalettes: ColorRamp[] = [
  // Neutrals - warm gray with consistent hue throughout
  generateRamp('Neutrals', '#978881', [
    { step: 50, hex: '#FBF9F8' },
    { step: 100, hex: '#F7F4F2' },
    { step: 150, hex: '#EEECEB' },
    { step: 200, hex: '#D9D4D1' },
    { step: 250, hex: '#C4B9B4' },
    { step: 350, hex: '#AEA39D' },
    { step: 450, hex: '#978881' },
    { step: 550, hex: '#786A64' },
    { step: 650, hex: '#5F5550' }, // Fixed: was #695057 (wrong hue)
    { step: 750, hex: '#4A4440' },
    { step: 800, hex: '#3A3632' },
    { step: 850, hex: '#2C2926' },
    { step: 900, hex: '#211F1D' },
    { step: 950, hex: '#151413' },
  ], true),

  // Very Peri - periwinkle blue-violet
  generateRamp('Very Peri', '#7A90EF', [
    { step: 50, hex: '#F8F9FF' },
    { step: 100, hex: '#F0F2FF' },
    { step: 150, hex: '#E5E8FD' },
    { step: 200, hex: '#CED2FA' },
    { step: 250, hex: '#B3B8F6' },
    { step: 350, hex: '#989EF3' },
    { step: 450, hex: '#7A90EF' },
    { step: 550, hex: '#5B5AEA' },
    { step: 650, hex: '#4D4CD4' },
    { step: 750, hex: '#3F30AA' },
    { step: 800, hex: '#302E80' },
    { step: 850, hex: '#252360' },
    { step: 900, hex: '#1A1940' },
    { step: 950, hex: '#100E28' },
  ], true),

  // Blue - true blue, not cyan
  generateRamp('Blue', '#5C8FBF', [
    { step: 50, hex: '#F0F6FC' },
    { step: 100, hex: '#E0EEF9' },
    { step: 150, hex: '#C5E0F5' }, // Fixed: was cyan #ADEEEF
    { step: 200, hex: '#9DCFEF' },
    { step: 250, hex: '#7DBDE6' },
    { step: 350, hex: '#6DAAE3' },
    { step: 450, hex: '#5C8FBF' },
    { step: 550, hex: '#487096' },
    { step: 650, hex: '#3A5A7A' },
    { step: 750, hex: '#2D4760' },
    { step: 800, hex: '#233648' },
    { step: 850, hex: '#1A2834' },
    { step: 900, hex: '#121C24' },
    { step: 950, hex: '#0A1016' },
  ], true),

  // Green - consistent green hue
  generateRamp('Green', '#389C70', [
    { step: 50, hex: '#F0FDF6' },
    { step: 100, hex: '#DFFAEC' },
    { step: 150, hex: '#C0F2DA' },
    { step: 200, hex: '#9CE3C4' },
    { step: 250, hex: '#6DD4A8' },
    { step: 350, hex: '#4FC08C' },
    { step: 450, hex: '#389C70' },
    { step: 550, hex: '#2C7A58' },
    { step: 650, hex: '#236344' },
    { step: 750, hex: '#1A4D34' },
    { step: 800, hex: '#133A26' },
    { step: 850, hex: '#0D2A1C' },
    { step: 900, hex: '#081E13' },
    { step: 950, hex: '#04120A' },
  ], true),

  // Yellow - warm golden yellow
  generateRamp('Yellow', '#A68741', [
    { step: 50, hex: '#FEFBF3' },
    { step: 100, hex: '#FDF5E3' },
    { step: 150, hex: '#FAEBCA' },
    { step: 200, hex: '#F4D89A' },
    { step: 250, hex: '#EBC46E' },
    { step: 350, hex: '#D4A854' },
    { step: 450, hex: '#A68741' },
    { step: 550, hex: '#836A33' },
    { step: 650, hex: '#675428' },
    { step: 750, hex: '#4E401E' },
    { step: 800, hex: '#3A3016' },
    { step: 850, hex: '#28220F' },
    { step: 900, hex: '#1C170A' },
    { step: 950, hex: '#100D05' },
  ], true),

  // Orange - true orange
  generateRamp('Orange', '#F15900', [
    { step: 50, hex: '#FFF6F0' },
    { step: 100, hex: '#FFEBD9' },
    { step: 150, hex: '#FFDCC0' },
    { step: 200, hex: '#FFC4A0' },
    { step: 250, hex: '#FFA876' },
    { step: 350, hex: '#FF8239' },
    { step: 450, hex: '#F15900' },
    { step: 550, hex: '#C44800' },
    { step: 650, hex: '#993800' },
    { step: 750, hex: '#722A00' },
    { step: 800, hex: '#541F00' },
    { step: 850, hex: '#3A1500' },
    { step: 900, hex: '#260E00' },
    { step: 950, hex: '#150800' },
  ], true),

  // Red - true red (not pink)
  generateRamp('Red', '#E53935', [
    { step: 50, hex: '#FFF5F5' },
    { step: 100, hex: '#FFE8E8' },
    { step: 150, hex: '#FFD5D5' },
    { step: 200, hex: '#FFBDBD' },
    { step: 250, hex: '#FFA0A0' },
    { step: 350, hex: '#F87070' }, // Fixed: was pink #FC7FB1
    { step: 450, hex: '#E53935' },
    { step: 550, hex: '#C62828' },
    { step: 650, hex: '#A11F1F' },
    { step: 750, hex: '#7C1818' },
    { step: 800, hex: '#5C1212' },
    { step: 850, hex: '#400D0D' },
    { step: 900, hex: '#2A0808' },
    { step: 950, hex: '#180404' },
  ], true),

  // Pink - consistent pink/magenta hue
  generateRamp('Pink', '#C27390', [
    { step: 50, hex: '#FDF5F8' },
    { step: 100, hex: '#FCEAF0' },
    { step: 150, hex: '#F9D8E5' },
    { step: 200, hex: '#F4C0D4' },
    { step: 250, hex: '#EDA4C0' },
    { step: 350, hex: '#DE8AAC' },
    { step: 450, hex: '#C27390' },
    { step: 550, hex: '#9E5C74' },
    { step: 650, hex: '#7E495C' },
    { step: 750, hex: '#603846' },
    { step: 800, hex: '#462932' },
    { step: 850, hex: '#301C22' },
    { step: 900, hex: '#1F1216' },
    { step: 950, hex: '#110A0C' },
  ], true),
];

export function getDefaultPalettes(): ColorRamp[] {
  return defaultPalettes;
}
