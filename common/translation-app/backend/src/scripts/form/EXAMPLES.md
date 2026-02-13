# Usage Examples

## Example 1: Export and Build All Languages for Common Project

```bash
# This will export all languages (except English) and generate PDF forms
python export_and_build_all.py --project Common
```

**Output:**
```
=========================================
Export and Build PDF Forms
=========================================
Project: Common
Output: /path/to/scripts/form/output

Step 1: Exporting translations...
-----------------------------------------
Project: Common
Base language: en
Target languages: ru, de, fr, es, it, ...

Exporting ru... ✓ (1063 keys) → Common-all-keys-from-en-to-ru.json
Exporting de... ✓ (1063 keys) → Common-all-keys-from-en-to-de.json
Exporting fr... ✓ (1063 keys) → Common-all-keys-from-en-to-fr.json
...

Exported 15 language(s) successfully!

Step 2: Building PDF forms...
-----------------------------------------
Building PDF for: Common-all-keys-from-en-to-ru.json
Done!
PDF: output/forms/common-ru-review.pdf
...

=========================================
Complete!
=========================================
Exported JSON files: output/exports
Generated PDF forms: output/forms
```

## Example 2: Export Only Specific Languages

```bash
# Export only Russian and German translations
python export_and_build_all.py --project Client --languages ru de
```

## Example 3: Manual Export with Custom Settings

```bash
# Export all languages with custom output directory
python export_all_languages.py \
    --project Common \
    --base-language en \
    --output-dir my_exports

# Export only specific languages
python export_all_languages.py \
    --project Client \
    --languages ru de fr \
    --output-dir client_exports
```

## Example 4: Build PDF from Existing JSON

```bash
# If you already have exported JSON files
python build_oform.py \
    --input my_exports/Common-all-keys-from-en-to-ru.json \
    --output-dir my_forms
```

## Example 5: Export ALL Projects on ALL Languages (NEW!)

```bash
# Export and build PDFs for ALL projects on ALL languages
python export_and_build_all.py --all-projects
```

**This will process:**
- Common project (all languages)
- Client project (all languages)
- DocEditor project (all languages)
- Login project (all languages)
- Management project (all languages)

**Expected output:**
```
============================================================
Export and Build PDF Forms
============================================================
Projects: Common, Client, DocEditor, Login, Management
Base language: en
Target languages: all (except en)
Output directory: /path/to/output

Processing project: Common
------------------------------------------------------------
Exporting translations for Common...
Found 15 exported file(s)
Building PDF forms for Common...
  Building PDF for: Common-all-keys-from-en-to-ru.json
  Building PDF for: Common-all-keys-from-en-to-de.json
  ...

Processing project: Client
------------------------------------------------------------
...

============================================================
Summary
============================================================
Projects processed: 5
Total JSON files exported: 75
Total PDF forms generated: 75

Exported JSON files: /path/to/output/exports
Generated PDF forms: /path/to/output/forms
```

## Example 6: Export All Projects with Specific Languages

```bash
# Export only Russian and German for ALL projects
python export_and_build_all.py --all-projects --languages ru de
```

This is useful when you only need to update specific languages across all projects.

**Result structure:**
```
output/forms/
├── ru/
│   ├── common-ru-review.pdf
│   ├── client-ru-review.pdf
│   ├── doceditor-ru-review.pdf
│   ├── login-ru-review.pdf
│   └── management-ru-review.pdf
└── de/
    ├── common-de-review.pdf
    ├── client-de-review.pdf
    ├── doceditor-de-review.pdf
    ├── login-de-review.pdf
    └── management-de-review.pdf
```

**Workflow:**
1. Send `output/forms/ru/` folder to Russian translator
2. Send `output/forms/de/` folder to German translator
3. Each translator reviews all 5 projects in their language
4. Collect completed forms and import back

## Example 7: Batch Processing Multiple Projects

```bash
# Just use --all-projects flag!
python export_and_build_all.py --all-projects
```

This single command replaces the need for loops or batch scripts.

## Example 8: Export Only JSON Files (Skip PDF Generation)

```bash
# Export all projects but skip PDF generation (faster)
python export_and_build_all.py --all-projects --skip-pdf

# Later, you can build PDFs separately if needed
python export_and_build_all.py --project Common
```

This is useful when you want to:
- Quickly export all translations for backup
- Review JSON files before generating PDFs
- Save time when you don't need PDFs immediately

## Example 9: Export Only Untranslated Keys

The current script exports **all keys** (both translated and untranslated). This is equivalent to the API call with `exportAll=true`.

If you need only untranslated keys, you can use the backend API:

```bash
# Using curl to call the API
curl "http://localhost:3001/api/export/Common/ru?exportAll=false" \
    -o Common-untranslated-ru.json
```

## Example 10: Working with Large Projects

For projects with many keys (1000+), the PDF generation may take some time:

```bash
# Export first
python export_all_languages.py --project Client --languages ru

# Then build PDF (will show progress every 100 keys)
python build_oform.py --input output/Client-all-keys-from-en-to-ru.json
```

**Expected output:**
```
Project: Client
Language: en → ru
Keys: 1500
Building PDF form...
Processed 100/1500 fields...
Processed 200/1500 fields...
...
Done!
PDF: output/client-ru-review.pdf
```

## Example 11: Directory Structure After Export

```
backend/src/scripts/form/
├── export_all_languages.py
├── build_oform.py
├── export_and_build_all.py
├── README.md
├── EXAMPLES.md
└── output/
    ├── exports/
    │   ├── Common-all-keys-from-en-to-ru.json
    │   ├── Common-all-keys-from-en-to-de.json
    │   ├── Client-all-keys-from-en-to-ru.json
    │   └── ...
    └── forms/                         # Organized by language!
        ├── ru/                        # All Russian forms
        │   ├── common-ru-review.pdf
        │   ├── client-ru-review.pdf
        │   ├── doceditor-ru-review.pdf
        │   ├── login-ru-review.pdf
        │   └── management-ru-review.pdf
        ├── de/                        # All German forms
        │   ├── common-de-review.pdf
        │   ├── client-de-review.pdf
        │   └── ...
        ├── fr/                        # All French forms
        │   └── ...
        └── ...
```

**Benefits of language-based organization:**
- ✅ Review all projects for one language in a single folder
- ✅ Easy to distribute forms to language-specific translators
- ✅ Simpler workflow for checking translations by language
- ✅ Each translator gets one folder with all their work

## Example 12: Checking Export Statistics

```bash
# Export and check how many keys were exported
python export_all_languages.py --project Common --languages ru

# Check the JSON file
cat output/Common-all-keys-from-en-to-ru.json | \
    python -c "import sys, json; data=json.load(sys.stdin); \
    print(f'Total keys: {sum(len(v) for v in data[\"untranslatedKeys\"].values())}')"
```

## Example 13: Windows-Specific Usage

The Python scripts work perfectly on Windows:

```cmd
REM Windows Command Prompt
python export_and_build_all.py --all-projects

REM PowerShell
python export_and_build_all.py --project Common --languages ru de
```

## Example 14: Comparing Export with API

The Python script replicates the backend API behavior:

**API call:**
```bash
curl "http://localhost:3001/api/export/Common/ru?exportAll=true&baseLanguage=en"
```

**Equivalent Python script:**
```bash
python export_all_languages.py --project Common --languages ru --base-language en
```

Both produce identical JSON output with:
- `projectName`: "Common"
- `language`: "ru"
- `baseLanguage`: "en"
- `untranslatedKeys`: { namespace: { key: { baseValue, targetValue, comment } } }

## Troubleshooting

### Issue: "No languages found for project"

**Solution:** Check that the project path is correct and contains language directories:

```bash
# Check available projects
ls -la /path/to/DocSpace/client/public/locales/
ls -la /path/to/DocSpace/client/packages/client/public/locales/
```

### Issue: "No keys found, skipping"

**Solution:** This means the language has no translation files. Check:

```bash
# Verify language directory exists and has JSON files
ls -la /path/to/project/locales/ru/
```

### Issue: PDF generation fails

**Solution:** Ensure ONLYOFFICE Document Builder is installed:

```bash
pip install -r requirements.txt
```

### Issue: "docbuilder: license is invalid!"

**Solution:** Configure the ONLYOFFICE Document Builder license using one of two methods:

**Method 1 (Recommended): Set environment variable**

```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit .env and set path to your license file
nano .env

# Add this line with your actual license path:
ONLYOFFICE_BUILDER_LICENSE=/path/to/your/license.lic
```

**Examples:**
- Windows: `ONLYOFFICE_BUILDER_LICENSE=C:\licenses\onlyoffice\license.lic`
- Linux: `ONLYOFFICE_BUILDER_LICENSE=/home/user/licenses/license.lic`
- macOS: `ONLYOFFICE_BUILDER_LICENSE=/Users/user/licenses/license.lic`
- Relative: `ONLYOFFICE_BUILDER_LICENSE=./license.lic`
- Home: `ONLYOFFICE_BUILDER_LICENSE=~/onlyoffice/license.lic`

**Method 2: Install in Document Builder directory**

Copy your `license.lic` file to:
- **Windows:** `C:\Program Files\ONLYOFFICE\DocumentBuilder\license.lic`
- **Linux:** `/opt/onlyoffice/documentbuilder/license.lic`
- **macOS:** `/Applications/ONLYOFFICE/DocumentBuilder.app/Contents/license.lic`

**After configuration:**
- With Method 1, you'll see: `✓ License file found: /path/to/license.lic`
- Document Builder will use the license automatically

**Important Notes:**
- Method 1 is more flexible - license can be anywhere
- Method 2 requires admin rights to install in system directory
- If you don't have a license, the warning can be ignored - PDFs are still generated successfully
- Trial versions will show this warning

### Issue: Permission denied

**Solution:** Make scripts executable:

```bash
chmod +x export_all_languages.py
chmod +x export_and_build_all.py
```
