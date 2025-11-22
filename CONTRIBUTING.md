# Contributing Guide

## Development Setup

1. Clone the repository
2. Load the extension in Firefox:
   - Open `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on"
   - Select `manifest.json`

## Making Changes

1. Create a new branch for your changes
2. Make your modifications
3. Test thoroughly in Firefox
4. Commit your changes with descriptive messages

## Commit Message Convention

We follow conventional commits for better changelog generation:

- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests

Examples:
```
feat: add OTP detection to notifications
fix: resolve undefined pb.fileQueue error
chore: update dependencies
docs: improve installation instructions
```

## Release Process

### Automatic Release (Default)

**Every push to `main` automatically creates a new release!**

1. **Make your changes** and commit to `main`
2. **Push to GitHub**
3. **Automatic actions**:
   - If the current version tag exists, patch version is auto-incremented
   - XPI package is created
   - Changelog is generated from git commits
   - GitHub release is created with the XPI attached
   - Version is tagged

**Example**: If current version is `367.0.0` and tag exists, it auto-bumps to `367.0.1`

**Note**: Changes to README.md, CHANGELOG.md, CONTRIBUTING.md, or `.github/` folder don't trigger releases (to avoid noise).

### Manual Release Trigger

To manually trigger a release (useful after documentation changes):

1. **Go to**: GitHub → Actions → "Auto Version and Release"
2. **Click**: "Run workflow"
3. **Options**:
   - Leave "Force specific version" empty for auto-bump
   - Or enter a specific version like `367.1.0`
4. **Click**: "Run workflow"

This is useful when:
- You only changed documentation and want to create a release anyway
- You want to set a specific version number
- The automatic workflow didn't trigger

### Manual Version Bump (For Major/Minor Changes)

For major or minor version changes, use the manual workflow:

1. **Trigger Workflow**:
   - Go to GitHub Actions → "Version Bump" workflow
   - Click "Run workflow"
   - Select bump type: `patch`, `minor`, or `major`
   - This updates `manifest.json` and commits

2. **Automatic Release**:
   - The auto-release workflow triggers and creates the release

### Manual Version Update

If you prefer to update the version yourself:

1. **Edit manifest.json**:
   ```bash
   # Update the version field
   # Follow semantic versioning: MAJOR.MINOR.PATCH
   ```

2. **Commit and Push**:
   ```bash
   git add manifest.json
   git commit -m "chore: bump version to X.Y.Z"
   git push origin main
   ```

3. **Automatic Release**:
   - The workflow creates the release automatically

## Semantic Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes or major feature additions
  - Example: Removing features, changing APIs
  
- **MINOR** (x.Y.0): New features, backwards compatible
  - Example: Adding OTP detection, new keyboard shortcuts
  
- **PATCH** (x.y.Z): Bug fixes and minor improvements
  - Example: Fixing undefined errors, improving error handling

### When to Bump

- **Patch**: Bug fixes, typos, minor improvements
- **Minor**: New features, enhancements, non-breaking changes
- **Major**: Breaking changes, major rewrites, removing features

## Testing Checklist

Before releasing, ensure:

- [ ] Extension loads without errors in Firefox
- [ ] Sign-in flow works (manual API key entry)
- [ ] SMS notifications display correctly
- [ ] OTP detection and copy works
- [ ] Dark mode toggles properly
- [ ] Keyboard shortcuts function
- [ ] No console errors in normal usage
- [ ] Manifest version is updated
- [ ] CHANGELOG.md is updated

## GitHub Actions Workflows

### Auto Release Workflow (`auto-release.yml`)
- **Trigger**: Push to `main` branch (automatic)
- **Actions**:
  - Checks if current version tag exists
  - Auto-increments patch version if tag exists
  - Creates XPI package
  - Generates changelog from git commits
  - Creates GitHub release with XPI
  - Tags the release

### Version Bump Workflow (`version-bump.yml`)
- **Trigger**: Manual (workflow_dispatch)
- **Actions**:
  - Calculates new version based on bump type (patch/minor/major)
  - Updates `manifest.json`
  - Commits and pushes changes
  - Triggers auto-release workflow

### Required Repository Settings

For the workflows to work, ensure these settings are enabled:

1. **Go to**: Repository Settings → Actions → General
2. **Workflow permissions**: Select "Read and write permissions"
3. **Check**: "Allow GitHub Actions to create and approve pull requests"
4. **Save** changes

If you get a 403 error, check these permissions!

## File Structure

```
.
├── .github/
│   └── workflows/
│       ├── release.yml          # Automatic XPI build and release
│       └── version-bump.yml     # Version bumping workflow
├── manifest.json                # Extension manifest (contains version)
├── CHANGELOG.md                 # Version history
├── README.md                    # Project documentation
├── CONTRIBUTING.md              # This file
└── [extension files]            # All other extension files
```

## Questions?

If you have questions about the release process or contributing, please open an issue on GitHub.
