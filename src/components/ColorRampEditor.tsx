import { useState, useEffect, useCallback, useRef } from 'react';
import { ColorRamp, regenerateRampFromBase, hexToOklch, formatOklch } from '@/lib/oklch';
import { ColorSwatch } from './ColorSwatch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { Copy, RotateCcw, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ColorRampEditorProps {
  ramp: ColorRamp;
  onRampChange: (ramp: ColorRamp) => void;
  onDelete?: () => void;
}

export function ColorRampEditor({ ramp, onRampChange, onDelete }: ColorRampEditorProps) {
  const [baseHex, setBaseHex] = useState(ramp.baseHex);
  const [originalRamp] = useState(ramp);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const snapshotHex = useRef(ramp.baseHex);

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

  const onPickerOpenChange = (open: boolean) => {
    if (open) {
      snapshotHex.current = baseHex;
      setIsPickerOpen(true);
    } else {
      // If closing without explicit Accept/Restore (e.g. clicking outside), 
      // we generally keep the changes in a "live preview" model, 
      // but to strictly follow "Accept or Restore", clicking outside might be ambiguous.
      // Usually clicking outside = Accept. 
      setIsPickerOpen(false);
    }
  };

  const handlePickerAccept = () => {
    setIsPickerOpen(false);
    toast.success('Color updated');
  };

  const handlePickerRestore = () => {
    handleHexChange(snapshotHex.current);
    setIsPickerOpen(false);
    toast.info('Color restored');
  };

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
              <Popover open={isPickerOpen} onOpenChange={onPickerOpenChange}>
                <PopoverTrigger asChild>
                  <div
                    className="color-preview cursor-pointer hover:ring-2 ring-primary/20 transition-all"
                    style={{ backgroundColor: baseHex.length === 7 ? baseHex : ramp.baseHex }}
                    title="Click to edit color"
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-3"
                  align="start"
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerMove={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-3">
                    <HexColorPicker color={baseHex} onChange={handleHexChange} />
                    <div className="flex gap-2 justify-between">
                      <Button size="sm" variant="outline" className="w-full" onClick={handlePickerRestore}>
                        <X className="w-3 h-3 mr-1" /> Restore
                      </Button>
                      <Button size="sm" className="w-full" onClick={handlePickerAccept}>
                        <Check className="w-3 h-3 mr-1" /> Accept
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
