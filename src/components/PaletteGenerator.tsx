import { useState, useCallback, useEffect } from 'react';
import { ColorRamp, generateRamp } from '@/lib/oklch';
import { getDefaultPalettes } from '@/lib/defaultPalettes';
import { loadRamps, saveRamps } from '@/lib/storage';
import { readRampsFromUrl, writeRampsToUrl } from '@/lib/urlState';
import { ColorRampEditor } from './ColorRampEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableRampItem({ id, children }: { id: string, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
      {children}
    </div>
  );
}

export function PaletteGenerator() {
  const [ramps, setRamps] = useState<ColorRamp[]>(() => {
    if (typeof window !== 'undefined') {
      const fromUrl = readRampsFromUrl();
      if (fromUrl?.length) return fromUrl;

      const saved = loadRamps();
      if (saved) return saved;
    }

    return getDefaultPalettes();
  });
  const [newRampName, setNewRampName] = useState('');
  const [newRampHex, setNewRampHex] = useState('#6366F1');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [rampToSave, setRampToSave] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRamps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRampChange = useCallback((index: number, updatedRamp: ColorRamp) => {
    setRamps(prev => {
      const newRamps = [...prev];
      // Use the isSaved value from updatedRamp (ColorRampEditor handles smart detection)
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

    // New ramps are unsaved by default
    const newRamp = generateRamp(newRampName.trim(), newRampHex, undefined, false);
    setRamps(prev => [...prev, newRamp]);
    setNewRampName('');
    setNewRampHex('#6366F1');
    setDialogOpen(false);
    toast.success(`Added "${newRampName}" ramp`);
  };

  const handleSaveRamp = (index: number) => {
    setRampToSave(index);
    setSaveDialogOpen(true);
  };

  const confirmSaveRamp = () => {
    if (rampToSave === null) return;

    setRamps(prev => {
      const newRamps = [...prev];
      newRamps[rampToSave] = { ...newRamps[rampToSave], isSaved: true };
      saveRamps(newRamps);
      return newRamps;
    });

    toast.success('Ramp saved permanently');
    setSaveDialogOpen(false);
    setRampToSave(null);
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

  // Persist current state in the URL so it can be shared
  useEffect(() => {
    if (typeof window === 'undefined') return;
    writeRampsToUrl(ramps);
  }, [ramps]);

  return (
    <div className="palette-generator">
      <header className="palette-header">
        <div className="header-content">
          <div className="header-logo-section flex items-center gap-4">
            <img
              src="/polaris-logo.png"
              alt="Polaris Design System"
              className="h-10 w-auto object-contain"
            />
            <div className="header-title">
              <h1 className="text-xl font-bold">Design system Core Color Generator</h1>
              <p className="header-subtitle text-sm text-muted-foreground">
                Source of truth for the Polaris Design System core color palette
              </p>
            </div>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={ramps.map(r => r.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="ramps-container">
              {ramps.map((ramp, index) => (
                <SortableRampItem key={ramp.id} id={ramp.id}>
                  <ColorRampEditor
                    ramp={ramp}
                    onRampChange={(updated) => handleRampChange(index, updated)}
                    onDelete={ramps.length > 1 ? () => handleDeleteRamp(index) : undefined}
                    onSave={() => handleSaveRamp(index)}
                  />
                </SortableRampItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      <footer className="palette-footer">
        <p>Click any swatch to copy its hex value • Edit base color to regenerate ramp</p>
      </footer>

      <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Color Ramp</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently save this ramp as part of your design system's source of truth.
              <br /><br />
              <strong>Note:</strong> This does not automatically update design tokens - that process is manual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSaveRamp}>Save Permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
