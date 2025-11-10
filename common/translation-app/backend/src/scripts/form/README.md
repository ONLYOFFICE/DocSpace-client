# Translation Form Generation Scripts

This directory contains Python scripts for exporting translations and generating PDF review forms.

## Scripts Overview

| Script | Purpose | Type | Platform |
|--------|---------|------|----------|
| `export_all_languages.py` | Export translation keys to JSON | Python | Cross-platform |
| `build_oform.py` | Generate PDF forms from JSON | Python | Cross-platform |
| `export_and_build_all.py` | Automated export + build workflow | Python | Cross-platform |
| `upload_to_docspace.py` | Upload PDF forms to DocSpace VDR | Python | Cross-platform |

## Scripts

### 1. `export_all_languages.py`

Exports all translation keys for all languages in a project. This script replicates the backend API export functionality with `exportAll=true` parameter.

**Features:**
- Exports all keys from base language to target languages
- Includes metadata comments for each key
- Generates JSON files compatible with `build_oform.py`
- Supports selective language export

**Usage:**

```bash
# Export all languages for a project
python export_all_languages.py --project Common

# Export specific languages only
python export_all_languages.py --project Client --languages ru de fr

# Use custom base language and output directory
python export_all_languages.py --project Common --base-language en --output-dir my_exports
```

**Arguments:**
- `--project` (required): Project name (Common, Client, DocEditor, Login, Management)
- `--base-language`: Base language code (default: en)
- `--output-dir`: Output directory for exported files (default: output)
- `--languages`: Specific languages to export (default: all languages except base)

**Output:**
- JSON files named: `{Project}-all-keys-from-{base}-to-{target}.json`
- Each file contains all translation keys with base values, target values, and comments

### 2. `build_oform.py`

Generates PDF review forms from exported translation JSON files using ONLYOFFICE Document Builder.

**Features:**
- Creates interactive PDF forms with fillable fields
- Each key includes: source text, comment, target field, and confirmation checkbox
- Supports large forms with progress indicators
- Uses ONLYOFFICE Python API for maximum performance

**Usage:**

```bash
# Generate PDF form from exported JSON
python build_oform.py --input Common-all-keys-from-en-to-ru.json

# Use custom output directory
python build_oform.py --input Common-all-keys-from-en-to-ru.json --output-dir my_forms
```

**Arguments:**
- `--input` (required): Path to translation JSON file
- `--output-dir`: Output directory for generated PDF (default: output)

**Requirements:**
```bash
pip install -r requirements.txt
```

## Prerequisites

- Python 3.6 or higher
- ONLYOFFICE Document Builder (for PDF generation)

**Install Dependencies:**
```bash
pip install -r requirements.txt
```

**Optional: Configure License (Recommended)**

To avoid the "docbuilder: license is invalid!" warning, you have two options:

**Option 1 (Recommended): Set environment variable**
```bash
cp .env.example .env
# Edit .env and set path to your license file:
ONLYOFFICE_BUILDER_LICENSE=/path/to/your/license.lic
```

**Option 2: Install in Document Builder directory**
Place `license.lic` in the installation directory:
- Windows: `C:\Program Files\ONLYOFFICE\DocumentBuilder\license.lic`
- Linux: `/opt/onlyoffice/documentbuilder/license.lic`
- macOS: `/Applications/ONLYOFFICE/DocumentBuilder.app/Contents/license.lic`

**Note:** Without a license, PDFs are still generated (with a warning)

### 3. `export_and_build_all.py`

Automated workflow script that combines export and PDF generation. **Cross-platform** (Windows, macOS, Linux).

**Features:**
- Single command to export and build PDFs
- Support for single project or ALL projects
- Selective language export
- Skip PDF generation option (JSON only)
- Progress tracking and error handling
- Works on Windows, macOS, and Linux

**Usage:**

```bash
# Export and build all languages for one project
python export_and_build_all.py --project Common

# Export specific languages only
python export_and_build_all.py --project Client --languages ru de fr

# Export ALL projects on ALL languages
python export_and_build_all.py --all-projects

# Export all projects with specific languages
python export_and_build_all.py --all-projects --languages ru de

# Export only (skip PDF generation)
python export_and_build_all.py --all-projects --skip-pdf

# Use custom base language and output directory
python export_and_build_all.py --all-projects --base-language en --output-dir my_output
```

**Arguments:**
- `--project`: Single project to process (mutually exclusive with `--all-projects`)
- `--all-projects`: Process ALL projects (Common, Client, DocEditor, Login, Management)
- `--languages`: Specific languages to export (default: all languages except base)
- `--base-language`: Base language code (default: en)
- `--output-dir`: Base output directory (default: output)
- `--skip-pdf`: Skip PDF generation, only export JSON files

**Output:**
- JSON files in `output/exports/`
- PDF forms in `output/forms/{language}/` (organized by language)

### 4. `upload_to_docspace.py`

Upload generated PDF forms to ONLYOFFICE DocSpace VDR (Virtual Data Room) for review.

**Features:**
- Creates VDR room for translation review
- Uploads PDF forms organized by language folders
- Automatic folder structure creation
- Progress tracking and error handling
- Works with DocSpace API

**Usage:**

```bash
# Upload all forms from default directory
python upload_to_docspace.py

# Upload from custom directory
python upload_to_docspace.py --forms-dir my_forms

# Specify custom room name
python upload_to_docspace.py --room-name "Translation Review Q4 2024"

# Override environment variables
python upload_to_docspace.py --portal-url https://your-portal.onlyoffice.com --api-key YOUR_API_KEY
```

**Arguments:**
- `--forms-dir`: Directory containing language folders with PDF forms (default: output/forms)
- `--room-name`: Name for the VDR room (default: Translation Review)
- `--portal-url`: DocSpace portal URL (overrides DOCSPACE_PORTAL_URL env variable)
- `--api-key`: DocSpace API key (overrides DOCSPACE_API_KEY env variable)

**Requirements:**
```bash
pip install -r requirements.txt
```

This will install the official ONLYOFFICE DocSpace SDK (`docspace-api-sdk`).

**Configuration:**

Set in `.env` file:
```bash
DOCSPACE_PORTAL_URL=https://your-portal.onlyoffice.com
DOCSPACE_API_KEY=your-api-key-here
```

To generate an API key:
1. Log in to your DocSpace portal
2. Go to Settings → Integration → Developer Tools → API
3. Create a new API key

**Output:**
- Creates VDR room in DocSpace
- Uploads language folders with PDF forms
- Prints room URL for sharing with reviewers

## Complete Workflow

### Quick Start (Automated)

Use the `export_and_build_all.py` script to export and build PDF forms in one command (works on Windows, macOS, Linux):

```bash
# Export all languages and build PDFs for Common project
python export_and_build_all.py --project Common

# Export only specific languages
python export_and_build_all.py --project Client --languages ru de fr

# Export ALL projects on ALL languages (powerful!)
python export_and_build_all.py --all-projects

# Export all projects with specific languages only
python export_and_build_all.py --all-projects --languages ru de
```

This script will:
1. Export all translation keys to JSON files
2. Generate PDF forms for each language
3. Save everything to the `output/` directory

**Then upload to DocSpace:**
```bash
# Upload forms to DocSpace VDR room
python upload_to_docspace.py

# Or with custom room name
python upload_to_docspace.py --room-name "Translation Review December 2024"
```

### Complete End-to-End Workflow

```bash
# 1. Export and build all forms
python export_and_build_all.py --all-projects --languages ru de fr

# 2. Upload to DocSpace for review
python upload_to_docspace.py --room-name "Translation Review Q4 2024"

# 3. Share the room URL with translators
# (URL is printed by the upload script)
```

### Manual Workflow

#### Step 1: Export translations for all languages

```bash
# Export all languages for Common project
python export_all_languages.py --project Common --output-dir exports

# This will create files like:
# - Common-all-keys-from-en-to-ru.json
# - Common-all-keys-from-en-to-de.json
# - Common-all-keys-from-en-to-fr.json
# etc.
```

#### Step 2: Generate PDF forms

```bash
# Generate PDF for each exported language
for file in exports/*.json; do
    python build_oform.py --input "$file" --output-dir forms
done
```

### Step 3: Review and fill forms

1. Open the generated PDF forms in ONLYOFFICE or compatible PDF viewer
2. Review each translation
3. Fill in or correct the target language fields
4. Check the "confirmed" checkbox for each completed translation

### Step 4: Import completed translations (future feature)

The filled PDF forms can be processed to extract confirmed translations and import them back into the system.

## Project Structure

The scripts work with the following project structure:

```
DocSpace/
├── public/locales/                    # Common project
│   ├── en/
│   │   ├── Common.json
│   │   ├── Files.json
│   │   └── ...
│   ├── ru/
│   ├── de/
│   └── .meta/                         # Metadata (comments, etc.)
│       ├── Common/
│       │   ├── About.json
│       │   └── ...
│       └── ...
├── packages/
│   ├── client/public/locales/         # Client project
│   ├── doceditor/public/locales/      # DocEditor project
│   ├── login/public/locales/          # Login project
│   └── management/public/locales/     # Management project
```

## Supported Projects

- **Common**: `public/locales`
- **Client**: `packages/client/public/locales`
- **DocEditor**: `packages/doceditor/public/locales`
- **Login**: `packages/login/public/locales`
- **Management**: `packages/management/public/locales`

## Notes

- The export script reads directly from the file system, not via API
- Metadata comments are included when available
- Empty or null values in base language are skipped
- The scripts preserve the exact structure and behavior of the backend API
