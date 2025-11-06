#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Generate translation review PDF forms. Each key is represented by 4 lines:
1) [text] -> Key name (e.g., "1. Common.About")
2) [input](key:{namespace_key}_origin) -> Base value (original text)
3) [input](key:{namespace_key}_comment) -> Translation comment
4) [checkbox](key:{namespace_key}_confirmed) + [input](key:{namespace_key}_target) -> Target value

Uses Python API directly for maximum performance and reliability.

Usage:
  pip install -r requirements.txt
  
  # Generate PDF form from translation JSON
  python build_oform.py --input Common-all-keys-from-en-to-ru.json
  
  # With custom output directory
  python build_oform.py --input Common-all-keys-from-en-to-ru.json --output-dir my_forms
"""

import argparse
import json
import sys
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False


def load_env_file():
    """
    Load environment variables from .env file if it exists.
    Uses python-dotenv library if available, otherwise skips.
    Supports ONLYOFFICE_BUILDER_LICENSE variable.
    """
    if not DOTENV_AVAILABLE:
        # Silently skip if python-dotenv is not installed
        return
    
    script_dir = Path(__file__).parent
    env_file = script_dir / ".env"
    
    if env_file.exists():
        try:
            load_dotenv(dotenv_path=env_file, override=False)
        except Exception as e:
            print(f"Warning: Failed to load .env file: {e}", file=sys.stderr)


def set_docbuilder_license():
    """
    Validate ONLYOFFICE Document Builder license path from environment variable.
    This prevents the "license is invalid" warning.
    
    ONLYOFFICE Document Builder reads license from two locations:
    1. Environment variable ONLYOFFICE_BUILDER_LICENSE (path to license.lic)
    2. Standard installation directory (if env variable is not set):
       - Windows: C:\\Program Files\\ONLYOFFICE\\DocumentBuilder\\license.lic
       - Linux: /opt/onlyoffice/documentbuilder/license.lic
       - macOS: /Applications/ONLYOFFICE/DocumentBuilder.app/Contents/license.lic
    
    This function validates that the license file exists at the specified path.
    """
    license_path = os.environ.get('ONLYOFFICE_BUILDER_LICENSE')
    
    if not license_path:
        return False
    
    # Expand user path (~) and resolve relative paths
    license_path = Path(license_path).expanduser().resolve()
    
    if not license_path.exists():
        print(f"Warning: License file not found: {license_path}", file=sys.stderr)
        print(f"Hint: Make sure the license file exists and the path is correct.", file=sys.stderr)
        return False
    
    # License file exists and ONLYOFFICE_BUILDER_LICENSE is set
    # Document Builder will use this license automatically
    print(f"✓ License file found: {license_path}")
    return True


def parse_translation_data(translation_data: dict) -> tuple:
    """
    Parse translation JSON and extract fields for form generation.

    Returns:
        tuple: (title, fields_list)
        where fields_list contains dicts with: name, placeholder, default, label
    """
    project_name = translation_data.get("projectName", "Translation")
    language = translation_data.get("language", "en")
    base_language = translation_data.get("baseLanguage", "en")
    untranslated_keys = translation_data.get("untranslatedKeys", {})

    fields = []

    # Iterate through namespaces and keys
    for namespace, keys in untranslated_keys.items():
        for key, data in keys.items():
            field = {
                "name": f"{namespace}.{key}",
                "placeholder": data.get("baseValue", ""),
                "default": data.get("targetValue", ""),
                "label": data.get("comment", "")
            }
            fields.append(field)

    title = f"{project_name} – Translation Review Form ({base_language} → {language})"

    return title, fields


def build_form(title: str, fields: list, pdf_path: str, base_language: str = "en", language: str = "ru"):
    """Build form using Python API directly and save as PDF."""
    try:
        import docbuilder
    except ImportError as e:
        return False, f"docbuilder import failed: {e}"

    try:
        # Create builder instance
        builder = docbuilder.CDocBuilder()
        builder.CreateFile(docbuilder.FileTypes.Document.OFORM_PDF)

        # Get API context
        context = builder.GetContext()
        globalObj = context.GetGlobal()
        api = globalObj['Api']

        # Get document
        document = api.Call('GetDocument')
        paragraph = document.Call('GetElement', 0)
        headingStyle = document.Call('GetStyle', 'Heading 3')

        # Add title
        paragraph.Call('AddText', title)
        paragraph.Call('SetStyle', headingStyle)
        document.Call('Push', paragraph)

        # Add spacer
        paragraph = api.Call('CreateParagraph')
        paragraph.Call('AddText', ' ')
        document.Call('Push', paragraph)

        # Set up form roles - only TRANSLATOR role
        roles = document.GetFormRoles()
        roles.Call('SetRoleColor', "Anyone", "#C6E0B3")

        # Process each field
        for i, f in enumerate(fields):
            name = f.get("name") or f"field_{i+1}"
            base_val = str(f.get("placeholder") or "")
            comment = str(f.get("label") or "")
            target = str(f.get("default") or "")

            # 1) Line: key name + checkbox "confirmed" on the right
            paragraph = api.Call('CreateParagraph')
            run = api.Call('CreateRun')
            run.Call('AddText', f"{i+1}  {name}     ")
            run.Call('SetBold', True)
            paragraph.Call('AddElement', run)
            document.Call('Push', paragraph)

            paragraph = api.Call('CreateParagraph')
            run = api.Call('CreateRun')
            run.Call('AddText', comment)
            run.Call('SetItalic', True)
            run.Call('SetHighlight', "yellow")
            paragraph.Call('AddElement', run)
            document.Call('Push', paragraph)

            # 2) Line: Source: with field
            paragraph = api.Call('CreateParagraph')
            run = api.Call('CreateRun')
            run.Call('AddText', f"Source ({base_language.upper()}):")
            paragraph.Call('AddElement', run)
            document.Call('Push', paragraph)

            paragraph = api.Call('CreateParagraph')
            run = api.Call('CreateRun')
            run.Call('AddText', base_val)
            run.Call('SetHighlight', "green")
            paragraph.Call('AddElement', run)
            document.Call('Push', paragraph)

            # 3) Line: Target: with field
            paragraph = api.Call('CreateParagraph')
            run = api.Call('CreateRun')
            run.Call('AddText', f"Target ({language.upper()}): ")
            paragraph.Call('AddElement', run)

            # Checkbox on the right
            confirmed = api.Call('CreateCheckBoxForm')
            confirmed.Call('SetFormKey', f"{name}_confirmed")
            confirmed.Call('SetChecked', False)
            confirmed.Call('SetRequired', True)
            paragraph.Call('AddElement', confirmed)

            run = api.Call('CreateRun')
            run.Call('AddText', ' confirmed')
            paragraph.Call('AddElement', run)
            document.Call('Push', paragraph)

            paragraph = api.Call('CreateParagraph')
            targetField = api.Call('CreateTextForm')
            targetField.Call('SetFormKey', f"{name}_target")
            targetField.Call('SetText', target)
            targetField.Call('SetRequired', True)
            targetField.Call('SetPlaceholderText', "Enter translation")
            targetField.Call('ToFixed', 10000, 2000)
            targetField.Call('SetMultiline', True)
            paragraph.Call('AddElement', targetField)
            targetField.Call('SetBorderColor', "#000000")
            document.Call('Push', paragraph)

            # Spacer between items
            paragraph = api.Call('CreateParagraph')
            paragraph.Call('AddLineBreak')
            document.Call('Push', paragraph)

            # Progress indicator for large forms
            if (i + 1) % 100 == 0:
                print(f"Processed {i + 1}/{len(fields)} fields...")

        roles.Call('Remove', "Anyone")  # Explicitly remove Anyone role

        # Save as PDF
        builder.SaveFile(docbuilder.FileTypes.Document.OFORM_PDF, pdf_path)
        builder.CloseFile()

        return True, "OK"

    except Exception as e:
        return False, f"Form building failed: {e}"


def main():
    # Load environment variables from .env file
    load_env_file()
    
    # Validate ONLYOFFICE Builder license if specified
    license_set = set_docbuilder_license()
    # Note: License validation output is handled in set_docbuilder_license()
    
    parser = argparse.ArgumentParser(
        description="Build ONLYOFFICE Form for translation review")
    parser.add_argument("--input", required=True,
                        help="Path to translation JSON file")
    parser.add_argument("--output-dir", default="output",
                        help="Output directory for generated files (default: output)")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"File not found: {input_path}", file=sys.stderr)
        sys.exit(2)

    # Load translation JSON file
    try:
        data = json.loads(input_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"Invalid JSON file: {e}", file=sys.stderr)
        sys.exit(2)

    # Validate format
    if "untranslatedKeys" not in data:
        print(f"Invalid format. Expected 'untranslatedKeys' key in JSON.",
              file=sys.stderr)
        sys.exit(2)

    # Parse translation data
    title, fields = parse_translation_data(data)

    # Generate output path
    project_name = data.get("projectName", "translation")
    language = data.get("language", "target")
    base_language = data.get("baseLanguage", "en")
    base_name = f"{project_name.lower()}-{language}-review"

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    pdf_path = str(output_dir / f"{base_name}.pdf")

    # Print info
    print(f"Project: {data.get('projectName')}")
    print(f"Language: {base_language} → {language}")
    print(f"Keys: {len(fields)}")
    print(f"Building PDF form...")

    # Build form
    ok, msg = build_form(title, fields, pdf_path, base_language, language)
    if ok:
        print("Done!")
        print(f"PDF: {pdf_path}")
    else:
        print(f"Failed to build form: {msg}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
