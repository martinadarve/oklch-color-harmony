# OKLCH Color Palette Generator

A perceptually uniform color palette generator using the OKLCH color space, designed to be the source of truth for design system colors.

## Features

- 🎨 **OKLCH Color Space**: Perceptually uniform color generation
- 💾 **Save System**: Distinguish between temporary and saved color ramps
- 🔄 **Smart Detection**: Automatically restores saved state when colors return to original
- 📦 **localStorage Persistence**: Saved ramps persist across sessions
- 🎯 **Drag & Drop**: Reorder color ramps
- 📋 **Export**: Copy as CSS variables or export as JSON
- ✨ **Visual Indicators**: Clear distinction between saved and unsaved ramps

## Technologies

- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **@dnd-kit** - Drag and drop functionality

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd oklch-color-harmony

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Usage

### Creating Color Ramps

1. Click **"Add Ramp"** button
2. Enter a name and base color
3. New ramp appears as **unsaved** (amber background, "Unsaved" badge)
4. Click **"Save"** to permanently save the ramp

### Saving Ramps

- Unsaved ramps have:
  - Amber background tint
  - "Unsaved" badge
  - "Save" button
- Click "Save" to make permanent
- Saved ramps persist in localStorage

### Smart Restore

The app automatically detects when you restore a color to its original value:
- Undo (Cmd+Z) to original → Automatically marks as saved
- Reset button → Restores to original saved state
- Color picker restore → Smart detection of original color

### Exporting

- **Copy CSS**: Copies CSS custom properties to clipboard
- **Export JSON**: Downloads palette as JSON file

## Development

```sh
# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── ColorRampEditor.tsx
│   ├── ColorSwatch.tsx
│   └── PaletteGenerator.tsx
├── lib/
│   ├── defaultPalettes.ts  # Default color ramps
│   ├── oklch.ts            # OKLCH color utilities
│   ├── storage.ts          # localStorage persistence
│   └── utils.ts
└── pages/
    └── Index.tsx
```

## License

MIT
