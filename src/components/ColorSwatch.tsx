import { useState } from 'react';
import { ColorStep, formatOklch, getStepContrastWithWhite } from '@/lib/oklch';
import { toast } from 'sonner';

interface ColorSwatchProps {
  step: ColorStep;
  rampName: string;
}

export function ColorSwatch({ step, rampName }: ColorSwatchProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine if text should be light or dark based on lightness
  const textColor = step.oklch.l > 0.6 ? 'text-neutral-900' : 'text-white';
  
  // Calculate contrast ratio with white
  const contrastRatio = getStepContrastWithWhite(step.hex);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(step.hex);
    toast.success(`Copied ${step.hex}`, {
      duration: 1500,
    });
  };
  
  return (
    <div
      className="color-swatch relative flex flex-col cursor-pointer"
      style={{ backgroundColor: step.hex }}
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${rampName} ${step.step}\n${step.hex}\n${formatOklch(step.oklch)}\nContrast: ${contrastRatio.toFixed(2)}:1`}
    >
      <div className={`swatch-content ${textColor}`}>
        <span className="step-label">{step.step}</span>
        <span className="hex-value">{step.hex}</span>
        <span className="contrast-ratio">{contrastRatio.toFixed(1)}:1</span>
      </div>
      
      {isHovered && (
        <div className="swatch-tooltip">
          <div className="tooltip-row">
            <span className="tooltip-label">OKLCH</span>
            <span className="tooltip-value">{formatOklch(step.oklch)}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Contrast</span>
            <span className="tooltip-value">{contrastRatio.toFixed(2)}:1</span>
          </div>
          <div className="tooltip-hint">Click to copy</div>
        </div>
      )}
    </div>
  );
}
