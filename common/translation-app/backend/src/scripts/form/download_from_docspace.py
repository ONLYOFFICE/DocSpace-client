#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Download translation PDF forms from ONLYOFFICE DocSpace VDR room and import translations.

This script:
1. Connects to DocSpace portal using API key
2. Downloads PDF forms from a VDR room
3. Parses form fields to extract translations
4. Saves translations to locale files and metadata

Usage:
  pip install -r requirements.txt
  
  # Configure .env file with DOCSPACE_PORTAL_URL and DOCSPACE_API_KEY
  
  # Download and import from a specific room
  python download_from_docspace.py --room-id 12345
  
  # Download to custom directory
  python download_from_docspace.py --room-id 12345 --output-dir my_downloads
  
  # Only download, don't import
  python download_from_docspace.py --room-id 12345 --download-only
  
  # Only import from already downloaded files
  python download_from_docspace.py --import-dir downloaded_forms
"""

import argparse
import json
import sys
import os
import re
import tempfile
from pathlib import Path
from typing import Optional, Dict, List, Tuple, Any
from datetime import datetime

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False
    print("Warning: python-dotenv not installed. Using system environment variables only.", file=sys.stderr)

try:
    import docspace_api_sdk
    from docspace_api_sdk.rest import ApiException
    DOCSPACE_SDK_AVAILABLE = True
except ImportError:
    DOCSPACE_SDK_AVAILABLE = False
    print("Warning: docspace-api-sdk not installed. Download functionality will be disabled.", file=sys.stderr)

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("Warning: requests library not installed. Download functionality will be disabled.", file=sys.stderr)

import importlib.util


def prepare_docbuilder_env(reexec_if_needed: bool = False):
    """
    Ensure macOS can locate bundled Document Builder frameworks when importing docbuilder.
    The wheel ships native frameworks under site-packages/docbuilder/lib; we add that path
    to DYLD_FRAMEWORK_PATH and DYLD_LIBRARY_PATH before import.
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

    if missing and reexec_if_needed and not os.environ.get("DOCBUILDER_ENV_PATCHED"):
        os.environ["DOCBUILDER_ENV_PATCHED"] = "1"
        os.execve(sys.executable, [sys.executable] + sys.argv, os.environ)

    try:
        import ctypes
        for fw in ("graphics", "kernel"):
            fw_path = lib_dir / f"{fw}.framework" / fw
            if fw_path.exists():
                ctypes.CDLL(str(fw_path), mode=ctypes.RTLD_GLOBAL)
    except Exception:
        pass


# Docbuilder will be imported lazily when needed for PDF parsing
# This avoids the macOS DYLD library loading issues at module import time
DOCBUILDER_AVAILABLE = None  # Will be set on first use
_docbuilder_module = None


def get_docbuilder():
    """
    Lazily import docbuilder module.
    This is needed because on macOS, the DYLD paths must be set before loading.
    """
    global DOCBUILDER_AVAILABLE, _docbuilder_module

    if DOCBUILDER_AVAILABLE is not None:
        return _docbuilder_module

    try:
        # Prepare environment for macOS
        prepare_docbuilder_env(reexec_if_needed=False)

        # Now try to import
        import docbuilder
        _docbuilder_module = docbuilder
        DOCBUILDER_AVAILABLE = True
        return _docbuilder_module
    except (ImportError, OSError) as e:
        DOCBUILDER_AVAILABLE = False
        print(f"Warning: docbuilder not available: {e}", file=sys.stderr)
        print("PDF parsing will be disabled.", file=sys.stderr)
        return None


# Project locales mapping (from config.js)
PROJECT_LOCALES_MAP = {
    "Common": "public/locales",
    "Client": "packages/client/public/locales",
    "DocEditor": "packages/doceditor/public/locales",
    "Login": "packages/login/public/locales",
    "Management": "packages/management/public/locales",
}


def get_app_root_path() -> Path:
    """
    Get the application root path.
    This script is in: client/common/translation-app/backend/src/scripts/form/
    App root is: client/
    So we go up 7 levels.
    """
    return Path(__file__).resolve().parent.parent.parent.parent.parent.parent.parent


def resolve_project_path(project_name: str) -> Path:
    """
    Resolve the absolute path to a project's locales directory.
    """
    if project_name not in PROJECT_LOCALES_MAP:
        raise ValueError(
            f"Project '{project_name}' not found in configuration")

    app_root = get_app_root_path()
    return app_root / PROJECT_LOCALES_MAP[project_name]


def load_env_file():
    """Load environment variables from .env file if it exists."""
    if not DOTENV_AVAILABLE:
        return

    script_dir = Path(__file__).parent
    env_file = script_dir / ".env"

    if env_file.exists():
        try:
            load_dotenv(dotenv_path=env_file, override=False)
        except Exception as e:
            print(f"Warning: Failed to load .env file: {e}", file=sys.stderr)


def download_files_from_room(
    portal_url: str,
    api_key: str,
    room_id: int,
    output_dir: Path
) -> Dict[str, List[Path]]:
    """
    Download all PDF files from a DocSpace room.

    Args:
        portal_url: DocSpace portal URL
        api_key: DocSpace API key
        room_id: Room ID to download from
        output_dir: Directory to save downloaded files

    Returns:
        Dictionary mapping language codes to lists of downloaded file paths
    """
    if not DOCSPACE_SDK_AVAILABLE or not REQUESTS_AVAILABLE:
        print("Error: Required libraries not available for download.", file=sys.stderr)
        return {}

    configuration = docspace_api_sdk.Configuration(
        host=portal_url.rstrip('/')
    )
    custom_headers = {"Authorization": f"Bearer {api_key}"}

    downloaded_files: Dict[str, List[Path]] = {}

    with docspace_api_sdk.ApiClient(configuration) as api_client:
        files_api = docspace_api_sdk.FilesApi(api_client)
        folders_api = docspace_api_sdk.FoldersApi(api_client)

        try:
            # Get room contents
            print(f"Downloading room (ID: {room_id})...")
            result = folders_api.bulk_download_folder(
                folder_id=room_id, _headers=custom_headers)
            room_data = result.response

            # Get subfolders (language folders)
            folders = room_data.folders if hasattr(
                room_data, 'folders') else []
            files = room_data.files if hasattr(room_data, 'files') else []

            print(
                f"Found {len(folders)} language folder(s) and {len(files)} file(s) in root")

            # Process each language folder
            for folder in folders:
                lang_code = folder.title
                folder_id = folder.id
                print(f"\nProcessing language: {lang_code}")

                # Create language output directory
                lang_output_dir = output_dir / lang_code
                lang_output_dir.mkdir(parents=True, exist_ok=True)

                # Get folder contents
                folder_result = folders_api.get_folder_by_folder_id(
                    folder_id=folder_id, _headers=custom_headers)
                folder_data = folder_result.response
                folder_files = folder_data.files if hasattr(
                    folder_data, 'files') else []

                downloaded_files[lang_code] = []

                for file_info in folder_files:
                    if not file_info.title.lower().endswith('.pdf'):
                        continue

                    file_id = file_info.id
                    file_name = file_info.title

                    try:
                        # Download file using direct HTTP request
                        download_url = f"{configuration.host}/api/2.0/files/file/{file_id}/download"
                        headers = {"Authorization": f"Bearer {api_key}"}

                        response = requests.get(
                            download_url, headers=headers, stream=True)
                        response.raise_for_status()

                        # Save file
                        file_path = lang_output_dir / file_name
                        with open(file_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                f.write(chunk)

                        downloaded_files[lang_code].append(file_path)
                        print(f"  ✓ Downloaded: {file_name}")

                    except Exception as e:
                        print(
                            f"  ✗ Failed to download '{file_name}': {e}", file=sys.stderr)

                print(
                    f"  Downloaded {len(downloaded_files[lang_code])} file(s)")

            # Also check for files in root (in case structure is different)
            for file_info in files:
                if not file_info.title.lower().endswith('.pdf'):
                    continue

                file_id = file_info.id
                file_name = file_info.title

                # Try to extract language from filename
                # Expected format: project-language-review.pdf
                match = re.search(
                    r'-([a-z]{2}(?:-[A-Z]{2})?)-review\.pdf$', file_name)
                if match:
                    lang_code = match.group(1)
                else:
                    lang_code = "unknown"

                lang_output_dir = output_dir / lang_code
                lang_output_dir.mkdir(parents=True, exist_ok=True)

                try:
                    download_url = f"{configuration.host}/api/2.0/files/file/{file_id}/download"
                    headers = {"Authorization": f"Bearer {api_key}"}

                    response = requests.get(
                        download_url, headers=headers, stream=True)
                    response.raise_for_status()

                    file_path = lang_output_dir / file_name
                    with open(file_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)

                    if lang_code not in downloaded_files:
                        downloaded_files[lang_code] = []
                    downloaded_files[lang_code].append(file_path)
                    print(
                        f"✓ Downloaded from root: {file_name} → {lang_code}/")

                except Exception as e:
                    print(
                        f"✗ Failed to download '{file_name}': {e}", file=sys.stderr)

        except ApiException as e:
            print(f"✗ Failed to access room: {e}", file=sys.stderr)
            if hasattr(e, 'status'):
                print(f"  HTTP Status: {e.status}", file=sys.stderr)
            return {}
        except Exception as e:
            print(f"✗ Failed to access room: {e}", file=sys.stderr)
            return {}

    return downloaded_files


def parse_pdf_form_fields(pdf_path: Path) -> Dict[str, Any]:
    """
    Parse PDF form fields and extract translation data using ONLYOFFICE Document Builder.

    Expected field naming convention:
    - {namespace}.{key}_target: Translation text
    - {namespace}.{key}_confirmed: Checkbox (boolean)

    Args:
        pdf_path: Path to PDF file

    Returns:
        Dictionary with parsed translations:
        {
            "namespace": {
                "key": {
                    "target": "translated text",
                    "confirmed": True/False
                }
            }
        }
    """
    docbuilder = get_docbuilder()
    if docbuilder is None:
        print("Error: docbuilder not available. Cannot parse PDF.", file=sys.stderr)
        return {}

    translations: Dict[str, Dict[str, Dict[str, Any]]] = {}

    try:
        # Create builder instance and open the PDF
        builder = docbuilder.CDocBuilder()

        # Open the PDF file
        if not builder.OpenFile(str(pdf_path), ""):
            print(f"  Warning: Could not open PDF file: {pdf_path.name}")
            return {}

        # Get API context
        context = builder.GetContext()
        globalObj = context.GetGlobal()
        api = globalObj['Api']

        # Get document
        document = api.GetDocument()

        # Get all form fields
        all_forms = document.GetAllForms()

        if all_forms is None or (hasattr(all_forms, '__len__') and len(all_forms) == 0):
            print(f"  Warning: No form fields found in {pdf_path.name}")
            builder.CloseFile()
            return {}

        # Convert to list if needed
        forms_count = all_forms.GetLength() if hasattr(
            all_forms, 'GetLength') else len(all_forms)

        for i in range(forms_count):
            try:
                form = all_forms[i] if hasattr(
                    all_forms, '__getitem__') else all_forms.Get(i)

                # Get form key (field name)
                field_name = form.GetFormKey() if hasattr(
                    form, 'GetFormKey') else str(form.GetKey())

                if not field_name:
                    continue

                # Parse field name to extract namespace, key, and field type
                # Expected format: Namespace.key.path_target or Namespace.key.path_confirmed

                if field_name.endswith('_target'):
                    base_key = field_name[:-7]  # Remove '_target'
                    field_type = 'target'
                elif field_name.endswith('_confirmed'):
                    base_key = field_name[:-10]  # Remove '_confirmed'
                    field_type = 'confirmed'
                else:
                    continue  # Skip unknown field types

                # Split into namespace and key
                parts = base_key.split('.', 1)
                if len(parts) != 2:
                    continue

                namespace, key = parts

                # Initialize namespace if not exists
                if namespace not in translations:
                    translations[namespace] = {}

                # Initialize key if not exists
                if key not in translations[namespace]:
                    translations[namespace][key] = {
                        'target': '',
                        'confirmed': False
                    }

                # Extract field value based on type
                if field_type == 'target':
                    # Text form field
                    value = ''
                    if hasattr(form, 'GetText'):
                        value = form.GetText() or ''
                    elif hasattr(form, 'GetValue'):
                        value = form.GetValue() or ''
                    translations[namespace][key]['target'] = str(value)

                elif field_type == 'confirmed':
                    # Checkbox form field
                    is_checked = False
                    if hasattr(form, 'IsChecked'):
                        is_checked = bool(form.IsChecked())
                    elif hasattr(form, 'GetValue'):
                        val = form.GetValue()
                        is_checked = str(val).lower() in (
                            'yes', 'true', '1', 'on', 'checked')
                    translations[namespace][key]['confirmed'] = is_checked

            except Exception as field_error:
                print(
                    f"  Warning: Error processing form field {i}: {field_error}", file=sys.stderr)
                continue

        builder.CloseFile()
        return translations

    except Exception as e:
        print(f"  Error parsing PDF {pdf_path.name}: {e}", file=sys.stderr)
        return {}


def parse_pdf_with_fallback(pdf_path: Path) -> Dict[str, Dict[str, Dict[str, Any]]]:
    """
    Parse PDF form using docbuilder.

    Args:
        pdf_path: Path to PDF file

    Returns:
        Parsed translations dictionary
    """
    translations = parse_pdf_form_fields(pdf_path)

    if not translations:
        print(f"  Note: No form fields found in {pdf_path.name}")

    return translations


def extract_project_and_language_from_filename(filename: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract project name and language from PDF filename.

    Expected format: project-language-review.pdf
    Example: common-ru-review.pdf → ("Common", "ru")

    Args:
        filename: PDF filename

    Returns:
        Tuple of (project_name, language_code) or (None, None) if not matched
    """
    # Pattern: project-language-review.pdf
    match = re.match(
        r'^([a-zA-Z]+)-([a-z]{2}(?:-[A-Z]{2})?)-review\.pdf$', filename, re.IGNORECASE)

    if match:
        project_raw = match.group(1)
        language = match.group(2)

        # Normalize project name
        project_map = {
            'common': 'Common',
            'client': 'Client',
            'doceditor': 'DocEditor',
            'login': 'Login',
            'management': 'Management',
        }
        project = project_map.get(
            project_raw.lower(), project_raw.capitalize())

        return project, language

    return None, None


def save_translations_to_locales(
    translations: Dict[str, Dict[str, Dict[str, Any]]],
    project_name: str,
    language: str,
    only_confirmed: bool = True,
    dry_run: bool = False
) -> Tuple[int, int]:
    """
    Save parsed translations to locale files.

    Args:
        translations: Parsed translations dictionary
        project_name: Project name
        language: Target language code
        only_confirmed: Only save translations that are confirmed
        dry_run: If True, don't actually write files

    Returns:
        Tuple of (saved_count, skipped_count)
    """
    project_path = resolve_project_path(project_name)
    lang_path = project_path / language

    if not lang_path.exists():
        print(f"  Warning: Language directory does not exist: {lang_path}")
        if not dry_run:
            lang_path.mkdir(parents=True, exist_ok=True)
            print(f"  Created language directory: {lang_path}")

    saved_count = 0
    skipped_count = 0

    for namespace, keys in translations.items():
        file_path = lang_path / f"{namespace}.json"

        # Load existing translations
        existing_data = {}
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except json.JSONDecodeError:
                print(
                    f"  Warning: Invalid JSON in {file_path}, starting fresh")

        # Update with new translations
        modified = False
        for key, data in keys.items():
            target_value = data.get('target', '')
            is_confirmed = data.get('confirmed', False)

            # Skip if not confirmed and only_confirmed is True
            if only_confirmed and not is_confirmed:
                skipped_count += 1
                continue

            # Skip empty translations
            if not target_value or not target_value.strip():
                skipped_count += 1
                continue

            # Handle nested keys (e.g., "parent.child")
            key_parts = key.split('.')
            current = existing_data

            # Navigate to parent, creating nested dicts as needed
            for part in key_parts[:-1]:
                if part not in current:
                    current[part] = {}
                elif not isinstance(current[part], dict):
                    # Key exists but is not a dict, skip
                    break
                current = current[part]
            else:
                # Set the final value
                final_key = key_parts[-1]
                current[final_key] = target_value
                modified = True
                saved_count += 1

        # Write updated file
        if modified and not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, indent=2, ensure_ascii=False)
                f.write('\n')  # Add trailing newline
            print(f"  ✓ Updated: {file_path.name}")

    return saved_count, skipped_count


def save_translations_to_metadata(
    translations: Dict[str, Dict[str, Dict[str, Any]]],
    project_name: str,
    language: str,
    dry_run: bool = False
) -> int:
    """
    Save translation metadata (approval status, history) to .meta files.

    Args:
        translations: Parsed translations dictionary
        project_name: Project name
        language: Target language code
        dry_run: If True, don't actually write files

    Returns:
        Number of metadata files updated
    """
    project_path = resolve_project_path(project_name)
    meta_path = project_path / ".meta"

    if not meta_path.exists():
        if not dry_run:
            meta_path.mkdir(parents=True, exist_ok=True)

    updated_count = 0
    timestamp = datetime.utcnow().isoformat() + "Z"

    for namespace, keys in translations.items():
        namespace_meta_path = meta_path / namespace

        if not namespace_meta_path.exists() and not dry_run:
            namespace_meta_path.mkdir(parents=True, exist_ok=True)

        for key, data in keys.items():
            target_value = data.get('target', '')
            is_confirmed = data.get('confirmed', False)

            # Skip empty translations
            if not target_value or not target_value.strip():
                continue

            # Metadata file path
            meta_file_path = namespace_meta_path / f"{key}.json"

            # Load existing metadata
            existing_meta = {}
            if meta_file_path.exists():
                try:
                    with open(meta_file_path, 'r', encoding='utf-8') as f:
                        existing_meta = json.load(f)
                except json.JSONDecodeError:
                    existing_meta = {}

            # Update approval status
            if 'approvals' not in existing_meta:
                existing_meta['approvals'] = {}

            existing_meta['approvals'][language] = {
                'approved': is_confirmed,
                'approvedAt': timestamp if is_confirmed else None,
                'approvedBy': 'pdf-import',
                'value': target_value
            }

            # Add to history
            if 'history' not in existing_meta:
                existing_meta['history'] = []

            history_entry = {
                'timestamp': timestamp,
                'action': 'pdf-import',
                'language': language,
                'value': target_value,
                'confirmed': is_confirmed
            }
            existing_meta['history'].append(history_entry)

            # Keep only last 50 history entries
            if len(existing_meta['history']) > 50:
                existing_meta['history'] = existing_meta['history'][-50:]

            # Write metadata file
            if not dry_run:
                with open(meta_file_path, 'w', encoding='utf-8') as f:
                    json.dump(existing_meta, f, indent=2, ensure_ascii=False)
                    f.write('\n')

            updated_count += 1

    return updated_count


def import_from_directory(
    import_dir: Path,
    only_confirmed: bool = True,
    dry_run: bool = False
) -> Dict[str, Dict[str, int]]:
    """
    Import translations from downloaded PDF files in a directory.

    Args:
        import_dir: Directory containing language folders with PDF files
        only_confirmed: Only import confirmed translations
        dry_run: If True, don't actually write files

    Returns:
        Statistics dictionary
    """
    stats: Dict[str, Dict[str, int]] = {}

    if not import_dir.exists():
        print(
            f"Error: Import directory does not exist: {import_dir}", file=sys.stderr)
        return stats

    # Find language folders
    language_folders = [d for d in import_dir.iterdir() if d.is_dir()]

    if not language_folders:
        # Check if PDFs are directly in the import directory
        pdf_files = list(import_dir.glob("*.pdf"))
        if pdf_files:
            language_folders = [import_dir]

    print(f"\nFound {len(language_folders)} folder(s) to process")

    for lang_folder in sorted(language_folders):
        lang_code = lang_folder.name if lang_folder != import_dir else "auto"
        print(f"\n{'='*60}")
        print(f"Processing: {lang_folder}")
        print(f"{'='*60}")

        pdf_files = list(lang_folder.glob("*.pdf"))

        if not pdf_files:
            print(f"  No PDF files found")
            continue

        print(f"  Found {len(pdf_files)} PDF file(s)")

        for pdf_file in sorted(pdf_files):
            print(f"\n  Processing: {pdf_file.name}")

            # Extract project and language from filename
            project, language = extract_project_and_language_from_filename(
                pdf_file.name)

            if not project or not language:
                # Use folder name as language if available
                if lang_code != "auto" and lang_code != "unknown":
                    language = lang_code
                else:
                    print(f"    ✗ Could not determine project/language from filename")
                    continue

            print(f"    Project: {project}, Language: {language}")

            # Parse PDF
            translations = parse_pdf_with_fallback(pdf_file)

            if not translations:
                print(f"    ✗ No translations found in PDF")
                continue

            # Count keys
            total_keys = sum(len(keys) for keys in translations.values())
            confirmed_keys = sum(
                1 for keys in translations.values()
                for data in keys.values()
                if data.get('confirmed', False)
            )
            print(f"    Found {total_keys} keys ({confirmed_keys} confirmed)")

            # Save to locales
            saved, skipped = save_translations_to_locales(
                translations, project, language, only_confirmed, dry_run
            )

            # Save to metadata
            meta_updated = save_translations_to_metadata(
                translations, project, language, dry_run
            )

            # Update stats
            key = f"{project}/{language}"
            if key not in stats:
                stats[key] = {'saved': 0, 'skipped': 0, 'meta_updated': 0}
            stats[key]['saved'] += saved
            stats[key]['skipped'] += skipped
            stats[key]['meta_updated'] += meta_updated

            print(
                f"    ✓ Saved: {saved}, Skipped: {skipped}, Meta updated: {meta_updated}")

    return stats


def main():
    # Load environment variables
    load_env_file()

    parser = argparse.ArgumentParser(
        description="Download translation PDF forms from DocSpace and import translations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Download and import from a specific room
  python download_from_docspace.py --room-id 12345
  
  # Download to custom directory
  python download_from_docspace.py --room-id 12345 --output-dir my_downloads
  
  # Only download, don't import
  python download_from_docspace.py --room-id 12345 --download-only
  
  # Only import from already downloaded files
  python download_from_docspace.py --import-dir downloaded_forms
  
  # Import all translations (not just confirmed)
  python download_from_docspace.py --import-dir downloaded_forms --include-unconfirmed
  
  # Dry run (show what would be done without writing files)
  python download_from_docspace.py --import-dir downloaded_forms --dry-run

Environment variables (set in .env file):
  DOCSPACE_PORTAL_URL - DocSpace portal URL (required for download)
  DOCSPACE_API_KEY    - DocSpace API key (required for download)
        """
    )

    parser.add_argument(
        "--room-id",
        type=int,
        help="DocSpace room ID to download from"
    )

    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Directory to save downloaded files (default: <script_dir>/downloads)"
    )

    parser.add_argument(
        "--import-dir",
        type=str,
        help="Directory containing PDF files to import (skips download)"
    )

    parser.add_argument(
        "--download-only",
        action="store_true",
        help="Only download files, don't import translations"
    )

    parser.add_argument(
        "--include-unconfirmed",
        action="store_true",
        help="Import all translations, not just confirmed ones"
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without writing files"
    )

    parser.add_argument(
        "--portal-url",
        type=str,
        help="DocSpace portal URL (overrides DOCSPACE_PORTAL_URL env variable)"
    )

    parser.add_argument(
        "--api-key",
        type=str,
        help="DocSpace API key (overrides DOCSPACE_API_KEY env variable)"
    )

    args = parser.parse_args()

    # Validate arguments
    if not args.room_id and not args.import_dir:
        print("Error: Either --room-id or --import-dir is required.", file=sys.stderr)
        parser.print_help()
        sys.exit(1)

    # Determine output/import directory
    script_dir = Path(__file__).parent

    if args.import_dir:
        import_dir = Path(args.import_dir)
    elif args.output_dir:
        import_dir = Path(args.output_dir)
    else:
        import_dir = script_dir / "downloads"

    # Print configuration
    print("=" * 60)
    print("Download & Import Translation Forms from DocSpace")
    print("=" * 60)

    if args.dry_run:
        print("*** DRY RUN MODE - No files will be written ***")

    downloaded_files = {}

    # Download phase
    if args.room_id:
        portal_url = args.portal_url or os.environ.get('DOCSPACE_PORTAL_URL')
        api_key = args.api_key or os.environ.get('DOCSPACE_API_KEY')

        if not portal_url:
            print("Error: DocSpace portal URL is required for download.",
                  file=sys.stderr)
            print(
                "Set DOCSPACE_PORTAL_URL in .env file or use --portal-url argument.", file=sys.stderr)
            sys.exit(1)

        if not api_key:
            print("Error: DocSpace API key is required for download.", file=sys.stderr)
            print(
                "Set DOCSPACE_API_KEY in .env file or use --api-key argument.", file=sys.stderr)
            sys.exit(1)

        print(f"Portal URL: {portal_url}")
        print(f"Room ID: {args.room_id}")
        print(f"Output directory: {import_dir.absolute()}")
        print()

        # Create output directory
        import_dir.mkdir(parents=True, exist_ok=True)

        # Download files
        downloaded_files = download_files_from_room(
            portal_url=portal_url,
            api_key=api_key,
            room_id=args.room_id,
            output_dir=import_dir
        )

        if not downloaded_files:
            print("\nNo files were downloaded.")
            sys.exit(1)

        # Print download summary
        total_files = sum(len(files) for files in downloaded_files.values())
        print(f"\n{'='*60}")
        print("Download Summary")
        print(f"{'='*60}")
        print(f"Total files downloaded: {total_files}")
        for lang, files in sorted(downloaded_files.items()):
            print(f"  {lang}: {len(files)} file(s)")

        if args.download_only:
            print(f"\nFiles saved to: {import_dir.absolute()}")
            print("Use --import-dir to import translations later.")
            sys.exit(0)

    # Import phase
    print(f"\nImport directory: {import_dir.absolute()}")
    print(f"Only confirmed: {not args.include_unconfirmed}")
    print()

    stats = import_from_directory(
        import_dir=import_dir,
        only_confirmed=not args.include_unconfirmed,
        dry_run=args.dry_run
    )

    # Print import summary
    print(f"\n{'='*60}")
    print("Import Summary")
    print(f"{'='*60}")

    if not stats:
        print("No translations were imported.")
    else:
        total_saved = sum(s['saved'] for s in stats.values())
        total_skipped = sum(s['skipped'] for s in stats.values())
        total_meta = sum(s['meta_updated'] for s in stats.values())

        print(f"Total translations saved: {total_saved}")
        print(f"Total translations skipped: {total_skipped}")
        print(f"Total metadata files updated: {total_meta}")
        print()
        print("By project/language:")
        for key, s in sorted(stats.items()):
            print(
                f"  {key}: saved={s['saved']}, skipped={s['skipped']}, meta={s['meta_updated']}")

    if args.dry_run:
        print("\n*** DRY RUN - No files were actually written ***")

    sys.exit(0)


if __name__ == "__main__":
    main()
