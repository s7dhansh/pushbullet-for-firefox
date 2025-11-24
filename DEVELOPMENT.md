# Development Guide

## Quick Start

### Loading the Extension in Firefox

**⚠️ IMPORTANT**: You must load the `src/` folder, not the repository root!

1. Open Firefox Developer Edition or Nightly
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Navigate to the `src/` folder
5. Select `manifest.json` from inside the `src/` folder

### Using web-ext (Recommended)

```bash
# Install dependencies (optional, web-ext will be downloaded on demand)
pnpm install

# Run with auto-reload
pnpm run dev

# Build XPI package
pnpm run xpi

# Lint the extension
pnpm run lint
```

## Project Structure

```
pushbullet-enhanced/
├── src/                    # ← Load THIS folder in Firefox!
│   ├── manifest.json       # Extension manifest
│   ├── assets/            # Static assets
│   │   ├── images/        # Icons, UI images
│   │   ├── sounds/        # Alert sounds
│   │   └── fonts/         # Custom fonts
│   ├── css/               # Stylesheets
│   ├── html/              # HTML pages
│   ├── js/                # JavaScript
│   │   ├── background/    # Background scripts
│   │   ├── content/       # Content scripts
│   │   ├── core/          # Core functionality
│   │   ├── lib/           # Third-party libraries
│   │   └── ui/            # UI scripts
│   └── _locales/          # i18n translations
├── .github/               # GitHub Actions workflows
├── dist/                  # Build output (XPI files)
├── package.json           # npm scripts
└── web-ext-config.js      # web-ext configuration
```

## Common Issues

### "Firefox can't find the file at moz-extension://..."

**Problem**: You loaded the repository root instead of the `src/` folder.

**Solution**: 
1. Go to `about:debugging#/runtime/this-firefox`
2. Remove the extension
3. Click "Load Temporary Add-on..."
4. Navigate INTO the `src/` folder
5. Select `manifest.json` from there

### Icons/Images Not Loading

**Problem**: Paths are incorrect or extension not loaded from `src/` folder.

**Solution**: Make sure you loaded the `src/` folder, not the root. All paths in the extension are relative to the `src/` folder.

### Changes Not Reflecting

**Problem**: Firefox caches extension files.

**Solution**:
- Click "Reload" button in `about:debugging`
- Or use `pnpm run dev` which auto-reloads on changes

## Building for Production

### Manual Build
```bash
# Build XPI
pnpm run xpi

# Output will be in dist/
ls -lh dist/*.xpi
```

### Automated Build (GitHub Actions)
Releases are automatically created when:
1. Version is bumped in `src/manifest.json`
2. Changes are pushed to `main` branch
3. GitHub Actions builds and creates a release with XPI attached

## File Paths in Extension

### In HTML files (use absolute paths from extension root):
```html
<link rel="stylesheet" href="/css/base.css">
<script src="/js/core/utils.js"></script>
<img src="/assets/images/icon.png">
```

### In CSS files (use absolute paths from extension root):
```css
background-image: url(/assets/images/logo.png);
src: url(/assets/fonts/pushfont.woff);
```

### In JavaScript files (use relative paths, no leading slash):
```javascript
// For Chrome extension APIs
iconUrl: '/assets/images/icon.png'
chrome.extension.getURL('html/options.html')

// For DOM manipulation
img.src = '/assets/images/icon.png'
```

## Testing

### Manual Testing
1. Load extension in Firefox Developer Edition
2. Sign in with Pushbullet account
3. Test features:
   - Push notifications
   - SMS mirroring
   - Dark mode toggle
   - OTP detection
   - Keyboard shortcuts

### Linting
```bash
pnpm run lint
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style guidelines
- Commit message conventions
- Pull request process
- Release workflow
