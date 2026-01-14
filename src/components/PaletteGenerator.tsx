import { useState, useCallback } from 'react';
import { ColorRamp, generateRamp } from '@/lib/oklch';
import { getDefaultPalettes } from '@/lib/defaultPalettes';
import { ColorRampEditor } from './ColorRampEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function PaletteGenerator() {
  const [ramps, setRamps] = useState<ColorRamp[]>(getDefaultPalettes);
  const [newRampName, setNewRampName] = useState('');
  const [newRampHex, setNewRampHex] = useState('#6366F1');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleRampChange = useCallback((index: number, updatedRamp: ColorRamp) => {
    setRamps(prev => {
      const newRamps = [...prev];
      newRamps[index] = updatedRamp;
      return newRamps;
    });
  }, []);
  
  const handleDeleteRamp = useCallback((index: number) => {
    setRamps(prev => prev.filter((_, i) => i !== index));
    toast.success('Ramp deleted');
  }, []);
  
  const handleAddRamp = () => {
    if (!newRampName.trim()) {
      toast.error('Please enter a name for the ramp');
      return;
    }
    
    if (!/^#[0-9A-Fa-f]{6}$/.test(newRampHex)) {
      toast.error('Please enter a valid hex color');
      return;
    }
    
    const newRamp = generateRamp(newRampName.trim(), newRampHex);
    setRamps(prev => [...prev, newRamp]);
    setNewRampName('');
    setNewRampHex('#6366F1');
    setDialogOpen(false);
    toast.success(`Added "${newRampName}" ramp`);
  };
  
  const handleExport = () => {
    const exportData = {
      version: '1.0',
      ramps: ramps.map(ramp => ({
        name: ramp.name,
        baseHex: ramp.baseHex,
        steps: ramp.steps.map(s => ({
          step: s.step,
          hex: s.hex,
        })),
      })),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Palette exported');
  };
  
  const handleExportCSS = () => {
    let css = ':root {\n';
    ramps.forEach(ramp => {
      const prefix = ramp.name.toLowerCase().replace(/\s+/g, '-');
      ramp.steps.forEach(step => {
        css += `  --${prefix}-${step.step}: ${step.hex};\n`;
      });
      css += '\n';
    });
    css += '}';
    
    navigator.clipboard.writeText(css);
    toast.success('CSS variables copied to clipboard');
  };
  
  return (
    <div className="palette-generator">
      <header className="palette-header">
        <div className="header-content">
          <div className="header-title">
            <h1>OKLCH Palette Generator</h1>
            <p className="header-subtitle">
              Create perceptually uniform color ramps using the OKLCH color space
            </p>
          </div>
          
          <div className="header-actions">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ramp
                </Button>
              </DialogTrigger>
              <DialogContent className="dialog-content">
                <DialogHeader>
                  <DialogTitle>Add New Color Ramp</DialogTitle>
                </DialogHeader>
                <div className="dialog-form">
                  <div className="form-field">
                    <label>Name</label>
                    <Input
                      value={newRampName}
                      onChange={(e) => setNewRampName(e.target.value)}
                      placeholder="e.g. Purple, Brand, Accent"
                    />
                  </div>
                  <div className="form-field">
                    <label>Base Color</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={newRampHex}
                        onChange={(e) => setNewRampHex(e.target.value.toUpperCase())}
                        className="color-picker"
                      />
                      <Input
                        value={newRampHex}
                        onChange={(e) => setNewRampHex(e.target.value.toUpperCase())}
                        placeholder="#6366F1"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddRamp} className="add-btn">
                    Create Ramp
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleExportCSS}>
              <Download className="h-4 w-4 mr-2" />
              Copy CSS
            </Button>
            
            <Button variant="outline" onClick={handleExport}>
              <Upload className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
      </header>
      
      <main className="palette-content">
        <div className="ramps-container">
          {ramps.map((ramp, index) => (
            <ColorRampEditor
              key={`${ramp.name}-${index}`}
              ramp={ramp}
              onRampChange={(updated) => handleRampChange(index, updated)}
              onDelete={ramps.length > 1 ? () => handleDeleteRamp(index) : undefined}
            />
          ))}
        </div>
      </main>
      
      <footer className="palette-footer">
        <p>Click any swatch to copy its hex value • Edit base color to regenerate ramp</p>
      </footer>
    </div>
  );
}
