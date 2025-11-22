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

### Automatic Release (Recommended)

1. **Bump Version** (Manual Trigger):
   - Go to GitHub Actions → "Version Bump" workflow
   - Click "Run workflow"
   - Select bump type: `patch`, `minor`, or `major`
   - This will automatically update `manifest.json` and commit

2. **Automatic Build**:
   - When the version bump is merged to `main`, the release workflow automatically:
     - Creates an XPI package
     - Generates a changelog from git commits
     - Creates a GitHub release with the XPI attached
     - Tags the release with the version number

### Manual Release

If you prefer to bump the version manually:

1. **Update Version**:
   ```bash
   # Edit manifest.json and update the version field
   # Follow semantic versioning: MAJOR.MINOR.PATCH
   ```

2. **Update CHANGELOG.md**:
   ```bash
   # Add your changes under the [Unreleased] section
   # Move them to a new version section
   ```

3. **Commit and Push**:
   ```bash
   git add manifest.json CHANGELOG.md
   git commit -m "chore: bump version to X.Y.Z"
   git push origin main
   ```

4. **Automatic Build**:
   - The GitHub Actions workflow will automatically create the release

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

### Release Workflow (`release.yml`)
- **Trigger**: Push to `main` branch
- **Actions**:
  - Checks if version tag already exists
  - Creates XPI package if new version
  - Generates changelog from git commits
  - Creates GitHub release with XPI

### Version Bump Workflow (`version-bump.yml`)
- **Trigger**: Manual (workflow_dispatch)
- **Actions**:
  - Calculates new version based on bump type
  - Updates `manifest.json`
  - Commits and pushes changes
  - Triggers release workflow

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
