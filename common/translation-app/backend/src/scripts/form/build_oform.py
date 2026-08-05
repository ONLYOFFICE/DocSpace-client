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
import urllib.parse
from pathlib import Path
import importlib.util

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


def prepare_docbuilder_env(reexec_if_needed: bool = False):
    """
    Ensure macOS can locate bundled Document Builder frameworks when importing docbuilder.
    The wheel ships native frameworks under site-packages/docbuilder/lib; we add that path
    to DYLD_FRAMEWORK_PATH and DYLD_LIBRARY_PATH before import. Additionally, we eagerly
    load key frameworks (graphics/kernel) via ctypes to help macOS resolve @rpath deps
    when running under the latest Python builds.
    """
    if sys.platform != "darwin":
        return

    spec = importlib.util.find_spec("docbuilder")
    if not spec or not spec.origin:
        return

    lib_dir = Path(spec.origin).resolve().parent / "lib"
    if not lib_dir.exists():
        return

    missing = False
    for env in ("DYLD_FRAMEWORK_PATH", "DYLD_LIBRARY_PATH"):
        current = os.environ.get(env, "")
        parts = [p for p in current.split(":") if p]
        if str(lib_dir) not in parts:
            parts.insert(0, str(lib_dir))
            os.environ[env] = ":".join(parts)
            missing = True

    # If we just populated DYLD_* and were asked to reexec, restart the process so
    # dyld sees the paths before loading native libraries.
    if missing and reexec_if_needed and not os.environ.get("DOCBUILDER_ENV_PATCHED"):
        os.environ["DOCBUILDER_ENV_PATCHED"] = "1"
        os.execve(sys.executable, [sys.executable] + sys.argv, os.environ)

    # Preload dependent frameworks so docbuilder.c can resolve @rpath references
    try:
        import ctypes

        for fw in ("graphics", "kernel"):
            fw_path = lib_dir / f"{fw}.framework" / fw
            if fw_path.exists():
                ctypes.CDLL(str(fw_path), mode=ctypes.RTLD_GLOBAL)
    except Exception:
        # Best-effort; if it fails we'll surface the import error later
        pass


PROJECT_LOCALES_MAP = {
    'Common': 'public/locales',
    'Client': 'packages/client/public/locales',
    'DocEditor': 'packages/doceditor/public/locales',
    'Login': 'packages/login/public/locales',
    'Management': 'packages/management/public/locales',
}


def find_repo_root() -> Path | None:
    """Find the repository root by walking up from the script directory."""
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / '.git').exists():
            return current
        current = current.parent
    return None


def get_google_translate_lang(lang_code: str) -> str:
    """Convert DocSpace language code to Google Translate language code."""
    # Chinese variants need the full code
    if lang_code.startswith('zh-'):
        return lang_code
    # For most others, just use the language part before the region
    return lang_code.split('-')[0]


def build_google_translate_url(text: str, source_lang: str, target_lang: str) -> str:
    """Build a Google Translate URL for the given text."""
    sl = get_google_translate_lang(source_lang)
    tl = get_google_translate_lang(target_lang)
    # Truncate to avoid overly long URLs
    truncated = text[:500] if len(text) > 500 else text
    params = urllib.parse.urlencode({
        'sl': sl, 'tl': tl, 'text': truncated, 'op': 'translate'
    })
    return f"https://translate.google.com/?{params}"


def load_meta_issues(repo_root: Path, project_name: str, namespace: str,
                     key: str, language: str) -> list:
    """Load validation issues from .meta file for a specific key and language."""
    locales_rel = PROJECT_LOCALES_MAP.get(project_name)
    if not locales_rel:
        return []

    sanitized_key = key.replace('.', '_')
    meta_file = repo_root / locales_rel / '.meta' / namespace / f"{sanitized_key}.json"

    if not meta_file.exists():
        return []

    try:
        meta_data = json.loads(meta_file.read_text(encoding='utf-8'))
        lang_data = meta_data.get('languages', {}).get(language, {})
        return lang_data.get('ai_spell_check_issues', [])
    except (json.JSONDecodeError, OSError):
        return []


def format_issues(issues: list) -> str:
    """Format validation issues into a readable string."""
    parts = []
    for issue in issues:
        desc = issue.get('description', '')
        if desc:
            parts.append(desc)
            continue
        # Fallback: use type + suggestion
        issue_type = issue.get('type', 'unknown').replace('_', ' ').capitalize()
        suggestion = issue.get('suggestion', '')
        text = issue_type
        if suggestion:
            text += f": {suggestion}"
        parts.append(text)
    return " | ".join(parts)


def parse_translation_data(translation_data: dict, repo_root: Path = None) -> tuple:
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
            base_val = data.get("baseValue", "")

            # Load meta issues for this key
            error_text = ""
            if repo_root:
                issues = load_meta_issues(repo_root, project_name, namespace, key, language)
                error_text = format_issues(issues)

            # Build Google Translate URL
            translate_url = build_google_translate_url(base_val, base_language, language) if base_val else ""

            field = {
                "name": f"{namespace}.{key}",
                "placeholder": base_val,
                "default": data.get("targetValue", ""),
                "label": data.get("comment", ""),
                "error": error_text,
                "translate_url": translate_url,
            }
            fields.append(field)

    title = f"{project_name} – Translation Review Form ({base_language} → {language})"

    return title, fields


def build_form(title: str, fields: list, pdf_path: str, base_language: str = "en", language: str = "ru"):
    """Build form using Python API directly and save as PDF."""
    # Prepare native library search paths for macOS wheel
    prepare_docbuilder_env()

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
        document = api.GetDocument()
        paragraph = document.GetElement(0)
        headingStyle = document.GetStyle('Heading 3')

        # Add title
        paragraph.AddText(title)
        paragraph.SetStyle(headingStyle)
        document.Push(paragraph)

        # Add spacer
        paragraph = api.CreateParagraph()
        paragraph.AddText(' ')
        document.Push(paragraph)

        # Set up form roles - only TRANSLATOR role
        roles = document.GetFormRoles()
        roles.SetRoleColor("Anyone", "#C6E0B3")

        # Process each field
        for i, f in enumerate(fields):
            name = f.get("name") or f"field_{i+1}"
            base_val = str(f.get("placeholder") or "")
            comment = str(f.get("label") or "")
            target = str(f.get("default") or "")

            # 1) Line: key name + checkbox "confirmed" on the right
            paragraph = api.CreateParagraph()
            run = api.CreateRun()
            run.AddText(f"{i+1}  {name}     ")
            run.SetBold(True)
            paragraph.AddElement(run)
            document.Push(paragraph)

            if comment:
                paragraph = api.CreateParagraph()
                run = api.CreateRun()
                run.AddText(comment)
                run.SetItalic(True)
                run.SetHighlight("yellow")
                paragraph.AddElement(run)
                document.Push(paragraph)

            # Error from .meta (if any)
            error = str(f.get("error") or "")
            if error:
                paragraph = api.CreateParagraph()
                run = api.CreateRun()
                run.AddText(f"\u26A0 {error}")
                run.SetBold(True)
                run.SetColor(204, 0, 0)
                paragraph.AddElement(run)
                document.Push(paragraph)

            # 2) Line: Source: with field + Google Translate link
            paragraph = api.CreateParagraph()
            run = api.CreateRun()
            run.AddText(f"Source ({base_language.upper()}):  ")
            paragraph.AddElement(run)

            # Google Translate clickable hyperlink
            translate_url = f.get("translate_url", "")
            if translate_url:
                hyperlink = api.CreateHyperlink(translate_url, "Google Translate \u2197", "Open in Google Translate")
                paragraph.AddElement(hyperlink)

            document.Push(paragraph)

            paragraph = api.CreateParagraph()
            run = api.CreateRun()
            run.AddText(base_val)
            run.SetHighlight("green")
            paragraph.AddElement(run)
            document.Push(paragraph)

            # 3) Line: Target: with field
            paragraph = api.CreateParagraph()
            run = api.CreateRun()
            run.AddText(f"Target ({language.upper()}): ")
            paragraph.AddElement(run)

            # Checkbox on the right
            confirmed = api.CreateCheckBoxForm()
            confirmed.SetFormKey(f"{name}_confirmed")
            confirmed.SetLabel(f" confirmed")
            confirmed.SetChecked(False)
            confirmed.SetRequired(True)
            paragraph.AddElement(confirmed)
            document.Push(paragraph)

            paragraph = api.CreateParagraph()
            targetField = api.CreateTextForm()
            targetField.SetFormKey(f"{name}_target")
            targetField.SetText(target)
            targetField.SetRequired(True)
            targetField.SetPlaceholderText("Enter translation")
            targetField.ToFixed(10000, 2000)
            targetField.SetMultiline(True)
            paragraph.AddElement(targetField)
            targetField.SetBorderColor("#000000")
            document.Push(paragraph)

            # Spacer between items
            paragraph = api.CreateParagraph()
            paragraph.AddLineBreak()
            document.Push(paragraph)

            # Progress indicator for large forms
            if (i + 1) % 100 == 0:
                print(f"Processed {i + 1}/{len(fields)} fields...")

        # roles.Remove("Anyone")  # Explicitly remove Anyone role

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
    # Ensure macOS can resolve docbuilder native libs (may re-exec with DYLD paths)
    prepare_docbuilder_env(reexec_if_needed=True)
    
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

    # Find repository root for .meta files
    repo_root = find_repo_root()
    if repo_root:
        print(f"Repository root: {repo_root}")

    # Parse translation data
    title, fields = parse_translation_data(data, repo_root=repo_root)

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
