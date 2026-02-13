# Quick Start Guide

## Installation

No installation required! All scripts use Python standard library except for PDF generation.

**For PDF generation only:**
```bash
pip install -r requirements.txt
```

**Optional: Configure License (Recommended)**

To avoid the "docbuilder: license is invalid!" warning:

**Option 1 (Easiest):** Set environment variable
```bash
cp .env.example .env
# Edit .env: ONLYOFFICE_BUILDER_LICENSE=/path/to/license.lic
```

**Option 2:** Install in Document Builder directory
- Windows: `C:\Program Files\ONLYOFFICE\DocumentBuilder\license.lic`
- Linux: `/opt/onlyoffice/documentbuilder/license.lic`
- macOS: `/Applications/ONLYOFFICE/DocumentBuilder.app/Contents/license.lic`

**Note:** PDFs work without a license (with warning).

## Basic Usage

### 1. Export Single Project

```bash
# Export all languages for Common project
python export_and_build_all.py --project Common
```

### 2. Export ALL Projects (Recommended for bulk operations)

```bash
# Export all 5 projects on all languages
python export_and_build_all.py --all-projects
```

### 3. Export Specific Languages Only

```bash
# Export only Russian and German across all projects
python export_and_build_all.py --all-projects --languages ru de
```

### 4. Export Without PDF Generation (Fast)

```bash
# Just export JSON files, skip PDF generation
python export_and_build_all.py --all-projects --skip-pdf
```

## Output

All files are saved to the `output/` directory:

```
output/
├── exports/          # JSON files with translation data
└── forms/            # PDF forms organized by language
    ├── ru/           # All Russian forms (all projects)
    ├── de/           # All German forms (all projects)
    ├── fr/           # All French forms (all projects)
    └── ...
```

**Each language folder contains all projects for that language**, making it easy to:
- Review all translations for one language
- Distribute work to language-specific translators
- Track progress by language

## Platform-Specific Commands

### Windows (Command Prompt)
```cmd
python export_and_build_all.py --all-projects
```

### Windows (PowerShell)
```powershell
python export_and_build_all.py --all-projects
```

### macOS/Linux
```bash
python export_and_build_all.py --all-projects
```

## Common Scenarios

### Scenario 1: Weekly Translation Review
```bash
# Export all projects, all languages
python export_and_build_all.py --all-projects

# Review PDFs in: output/forms/
# Fill in translations and check confirmations
```

### Scenario 2: Update Specific Language
```bash
# Export only Russian translations
python export_and_build_all.py --all-projects --languages ru
```

### Scenario 3: Quick Backup
```bash
# Export JSON only (no PDFs)
python export_and_build_all.py --all-projects --skip-pdf
```

### Scenario 4: Single Project Update
```bash
# Work on Client project only
python export_and_build_all.py --project Client
```

## Troubleshooting

### Error: "No languages found"
- Check that the project path exists
- Verify language directories exist in `public/locales/`

### Error: "docbuilder: license is invalid"
- This is a warning, not an error
- PDFs are still generated successfully
- Can be ignored for development use

### Slow PDF Generation
- Use `--skip-pdf` to export JSON only
- Generate PDFs later for specific projects
- Consider processing one project at a time

## Next Steps

After exporting:
1. Find JSON files in `output/exports/`
2. Find PDF forms in `output/forms/`
3. Review and fill PDF forms
4. Import completed translations (future feature)

## Help

```bash
# Show all available options
python export_and_build_all.py --help

# Show examples
cat EXAMPLES.md

# Read full documentation
cat README.md
```

## Available Projects

- **Common**: Shared translations (`public/locales`)
- **Client**: Client application (`packages/client/public/locales`)
- **DocEditor**: Document editor (`packages/doceditor/public/locales`)
- **Login**: Login page (`packages/login/public/locales`)
- **Management**: Management console (`packages/management/public/locales`)

## Time Estimates

| Operation | Time |
|-----------|------|
| Export single project (JSON only) | 2-3 seconds |
| Export all projects (JSON only) | 10-15 seconds |
| Generate PDF for one language | 30-60 seconds |
| Export + PDF for one project | 8-15 minutes |
| Export + PDF for all projects | 40-75 minutes |

**Tip:** Use `--skip-pdf` for quick exports, then generate PDFs only when needed!
