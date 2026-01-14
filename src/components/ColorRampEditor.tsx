import { useState, useEffect, useCallback } from 'react';
import { ColorRamp, regenerateRampFromBase, hexToOklch, formatOklch } from '@/lib/oklch';
import { ColorSwatch } from './ColorSwatch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ColorRampEditorProps {
  ramp: ColorRamp;
  onRampChange: (ramp: ColorRamp) => void;
  onDelete?: () => void;
}

export function ColorRampEditor({ ramp, onRampChange, onDelete }: ColorRampEditorProps) {
  const [baseHex, setBaseHex] = useState(ramp.baseHex);
  const [originalRamp] = useState(ramp);
  
  useEffect(() => {
    setBaseHex(ramp.baseHex);
  }, [ramp.baseHex]);
  
  const handleHexChange = useCallback((value: string) => {
    // Normalize input
    let hex = value.trim();
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    
    setBaseHex(hex);
    
    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const newRamp = regenerateRampFromBase(ramp.name, hex, originalRamp);
      onRampChange(newRamp);
    }
  }, [ramp.name, originalRamp, onRampChange]);
  
  const handleReset = () => {
    setBaseHex(originalRamp.baseHex);
    onRampChange(originalRamp);
    toast.info('Ramp reset to original');
  };
  
  const handleCopyAll = () => {
    const cssVars = ramp.steps
      .map(s => `--${ramp.name.toLowerCase().replace(/\s+/g, '-')}-${s.step}: ${s.hex};`)
      .join('\n');
    navigator.clipboard.writeText(cssVars);
    toast.success('CSS variables copied');
  };
  
  const baseOklch = hexToOklch(baseHex.length === 7 ? baseHex : ramp.baseHex);
  
  return (
    <div className="ramp-editor">
      <div className="ramp-header">
        <div className="ramp-title-section">
          <h3 className="ramp-title">{ramp.name}</h3>
          <div className="ramp-controls">
            <div className="base-color-input">
              <div 
                className="color-preview"
                style={{ backgroundColor: baseHex.length === 7 ? baseHex : ramp.baseHex }}
              />
              <Input
                type="text"
                value={baseHex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="hex-input"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
            <span className="oklch-display">{formatOklch(baseOklch)}</span>
          </div>
        </div>
        <div className="ramp-actions">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Reset to original"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyAll}
            title="Copy as CSS variables"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="Delete ramp"
              className="delete-btn"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="ramp-swatches">
        {ramp.steps.map((step) => (
          <ColorSwatch
            key={step.step}
            step={step}
            rampName={ramp.name}
          />
        ))}
      </div>
    </div>
  );
}
