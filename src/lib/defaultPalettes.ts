import { ColorRamp, generateRamp } from './oklch';

// Default color palettes based on the provided reference
// Using the 150-850 range as the "source of truth" for the algorithm

export const defaultPalettes: ColorRamp[] = [
  // Neutrals - kept exactly as provided with all steps
  generateRamp('Neutrals', '#978881', [
    { step: 50, hex: '#FBF9FB' },
    { step: 100, hex: '#F7F4F2' },
    { step: 150, hex: '#EEECEB' },
    { step: 200, hex: '#D9D4D1' },
    { step: 250, hex: '#C4B9B7' },
    { step: 350, hex: '#AEA39D' },
    { step: 450, hex: '#978881' },
    { step: 550, hex: '#786A64' },
    { step: 650, hex: '#695057' },
    { step: 750, hex: '#544A46' },
    { step: 800, hex: '#3F3834' },
    { step: 850, hex: '#302828' },
    { step: 900, hex: '#26211F' },
    { step: 950, hex: '#191512' },
  ]),
  
  // Very Peri - exact values from image
  generateRamp('Very Peri', '#7A90EF', [
    { step: 50, hex: '#FAFBFF' },
    { step: 100, hex: '#F3F3FF' },
    { step: 150, hex: '#EBEBFD' },
    { step: 200, hex: '#CED2FA' },
    { step: 250, hex: '#B3B8F6' },
    { step: 350, hex: '#989EF3' },
    { step: 450, hex: '#7A90EF' },
    { step: 550, hex: '#5B5AEA' },
    { step: 650, hex: '#4D4CD4' },
    { step: 750, hex: '#3F30AA' },
    { step: 800, hex: '#302E80' },
    { step: 850, hex: '#252383' },
    { step: 900, hex: '#1E1940' },
    { step: 950, hex: '#120C39' },
  ]),
  
  // Blue - exact values from image
  generateRamp('Blue', '#5C8FBF', [
    { step: 50, hex: '#F0FAFF' },
    { step: 100, hex: '#E5F5FF' },
    { step: 150, hex: '#ADEEEF' },
    { step: 200, hex: '#83D9FC' },
    { step: 250, hex: '#86C2FB' },
    { step: 350, hex: '#6DAAE3' },
    { step: 450, hex: '#5C8FBF' },
    { step: 550, hex: '#487096' },
    { step: 650, hex: '#3F6283' },
    { step: 750, hex: '#324F69' },
    { step: 800, hex: '#263B4F' },
    { step: 850, hex: '#1D2E3D' },
    { step: 900, hex: '#142330' },
    { step: 950, hex: '#0C1820' },
  ]),
  
  // Green - exact values from image
  generateRamp('Green', '#389C70', [
    { step: 50, hex: '#EEFFF7' },
    { step: 100, hex: '#E0FFF0' },
    { step: 150, hex: '#ADEEEF' },
    { step: 200, hex: '#9CE3C4' },
    { step: 250, hex: '#50D29F' },
    { step: 350, hex: '#42B985' },
    { step: 450, hex: '#389C70' },
    { step: 550, hex: '#2C7A58' },
    { step: 650, hex: '#296840' },
    { step: 750, hex: '#1F583E' },
    { step: 800, hex: '#17402E' },
    { step: 850, hex: '#123224' },
    { step: 900, hex: '#0D2518' },
    { step: 950, hex: '#08180F' },
  ]),
  
  // Yellow - exact values from image
  generateRamp('Yellow', '#A68741', [
    { step: 50, hex: '#FFFBF2' },
    { step: 100, hex: '#FFF6E0' },
    { step: 150, hex: '#FAEBCA' },
    { step: 200, hex: '#F4D082' },
    { step: 250, hex: '#E2B758' },
    { step: 350, hex: '#C5A04D' },
    { step: 450, hex: '#A68741' },
    { step: 550, hex: '#836A33' },
    { step: 650, hex: '#775C2D' },
    { step: 750, hex: '#5B4A24' },
    { step: 800, hex: '#45371B' },
    { step: 850, hex: '#352B15' },
    { step: 900, hex: '#28200F' },
    { step: 950, hex: '#1A1508' },
  ]),
  
  // Orange - exact values from image
  generateRamp('Orange', '#F15900', [
    { step: 50, hex: '#FFF8F2' },
    { step: 100, hex: '#FFF0E5' },
    { step: 150, hex: '#FFEADC' },
    { step: 200, hex: '#FFC4AA' },
    { step: 250, hex: '#FFA876' },
    { step: 350, hex: '#FF8239' },
    { step: 450, hex: '#F15900' },
    { step: 550, hex: '#BE4600' },
    { step: 650, hex: '#963000' },
    { step: 750, hex: '#883100' },
    { step: 800, hex: '#652500' },
    { step: 850, hex: '#4F1D00' },
    { step: 900, hex: '#3A1500' },
    { step: 950, hex: '#250D00' },
  ]),
  
  // Red - exact values from image
  generateRamp('Red', '#FB4846', [
    { step: 50, hex: '#FFF5F5' },
    { step: 100, hex: '#FFEBEB' },
    { step: 150, hex: '#FFE8E9' },
    { step: 200, hex: '#FEC7C8' },
    { step: 250, hex: '#FDA5A7' },
    { step: 350, hex: '#FC7FB1' },
    { step: 450, hex: '#FB4846' },
    { step: 550, hex: '#DC0004' },
    { step: 650, hex: '#C20003' },
    { step: 750, hex: '#9E0003' },
    { step: 800, hex: '#790002' },
    { step: 850, hex: '#610002' },
    { step: 900, hex: '#480001' },
    { step: 950, hex: '#300001' },
  ]),
  
  // Pink - exact values from image
  generateRamp('Pink', '#C27390', [
    { step: 50, hex: '#FFF7FB' },
    { step: 100, hex: '#FFEFF5' },
    { step: 150, hex: '#FFE0EF' },
    { step: 200, hex: '#FEC5DA' },
    { step: 250, hex: '#FFA1C4' },
    { step: 350, hex: '#E788AC' },
    { step: 450, hex: '#C27390' },
    { step: 550, hex: '#975B71' },
    { step: 650, hex: '#835063' },
    { step: 750, hex: '#6B4150' },
    { step: 800, hex: '#4D313B' },
    { step: 850, hex: '#3B262D' },
    { step: 900, hex: '#2A1A20' },
    { step: 950, hex: '#1A1013' },
  ]),
];

export function getDefaultPalettes(): ColorRamp[] {
  return defaultPalettes;
}
