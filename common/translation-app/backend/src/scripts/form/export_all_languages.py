#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Export all translation keys for all languages in a project.
This script replicates the backend API export functionality with exportAll=true parameter.

Usage:
  python export_all_languages.py --project Common
  python export_all_languages.py --project Client --output-dir my_exports
  python export_all_languages.py --project Common --base-language en
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional


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
    
    Args:
        project_name: Name of the project
        
    Returns:
        Path to the project's locales directory
        
    Raises:
        ValueError: If project not found in configuration
    """
    if project_name not in PROJECT_LOCALES_MAP:
        raise ValueError(f"Project '{project_name}' not found in configuration")
    
    app_root = get_app_root_path()
    return app_root / PROJECT_LOCALES_MAP[project_name]


def get_available_languages(project_name: str) -> List[str]:
    """
    Get all available languages for a project.
    
    Args:
        project_name: Name of the project
        
    Returns:
        List of language codes
    """
    project_path = resolve_project_path(project_name)
    
    if not project_path.exists():
        print(f"Warning: Project path does not exist: {project_path}", file=sys.stderr)
        return []
    
    languages = []
    for entry in project_path.iterdir():
        if entry.is_dir() and entry.name != ".meta":
            languages.append(entry.name)
    
    return sorted(languages)


def get_namespaces(project_name: str, language: str) -> List[str]:
    """
    Get all namespace files for a specific language in a project.
    
    Args:
        project_name: Name of the project
        language: Language code
        
    Returns:
        List of namespace names (without .json extension)
    """
    project_path = resolve_project_path(project_name)
    lang_path = project_path / language
    
    if not lang_path.exists():
        print(f"Warning: Language path does not exist: {lang_path}", file=sys.stderr)
        return []
    
    namespaces = []
    for entry in lang_path.iterdir():
        if entry.is_file() and entry.suffix == ".json":
            namespaces.append(entry.stem)
    
    return sorted(namespaces)


def read_translation_file(project_name: str, language: str, namespace: str) -> Optional[Dict]:
    """
    Read a translation file.
    
    Args:
        project_name: Name of the project
        language: Language code
        namespace: Namespace name
        
    Returns:
        Translation data as dictionary, or None if file doesn't exist
    """
    project_path = resolve_project_path(project_name)
    file_path = project_path / language / f"{namespace}.json"
    
    if not file_path.exists():
        return None
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error reading {file_path}: {e}", file=sys.stderr)
        return None


def find_metadata_file(project_name: str, namespace: str, key_path: str) -> Optional[Dict]:
    """
    Find metadata file for a specific key.
    
    Args:
        project_name: Project name
        namespace: Namespace
        key_path: Key path
        
    Returns:
        Metadata dictionary or None if not found
    """
    project_path = resolve_project_path(project_name)
    meta_path = project_path / ".meta" / namespace / f"{key_path}.json"
    
    if not meta_path.exists():
        return None
    
    try:
        with open(meta_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error reading metadata {meta_path}: {e}", file=sys.stderr)
        return None


def find_all_keys_recursive(
    base_obj: Dict,
    target_obj: Optional[Dict],
    namespace: str,
    project_name: str,
    path: str = ""
) -> Dict[str, Dict[str, str]]:
    """
    Recursively find all keys in base object.
    
    Args:
        base_obj: Base language translation object
        target_obj: Target language translation object (can be None)
        namespace: Current namespace
        project_name: Project name
        path: Current key path
        
    Returns:
        Dictionary of keys with their values and metadata
    """
    result = {}
    
    for key, value in base_obj.items():
        current_path = f"{path}.{key}" if path else key
        
        # Skip if base value is empty or null
        if value is None or value == "":
            continue
        
        # If nested object, recurse
        if isinstance(value, dict):
            nested_target = target_obj.get(key, {}) if target_obj and isinstance(target_obj, dict) else {}
            nested_result = find_all_keys_recursive(
                value,
                nested_target,
                namespace,
                project_name,
                current_path
            )
            result.update(nested_result)
        
        # If string value in base language
        elif isinstance(value, str):
            # Get target value if exists
            target_value = ""
            if target_obj and key in target_obj:
                target_value = target_obj[key] if target_obj[key] is not None else ""
            
            # Get metadata comment
            comment = ""
            metadata = find_metadata_file(project_name, namespace, current_path)
            if metadata:
                comment = metadata.get("comment", {}).get("text", "") or metadata.get("context", "")
            
            result[current_path] = {
                "baseValue": value,
                "targetValue": target_value,
                "comment": comment
            }
    
    return result


def export_language(
    project_name: str,
    language: str,
    base_language: str = "en"
) -> Optional[Dict]:
    """
    Export all keys for a specific language.
    
    Args:
        project_name: Name of the project
        language: Target language code
        base_language: Base language code (default: "en")
        
    Returns:
        Export data dictionary or None if no keys found
    """
    # Get all namespaces for the project
    namespaces = get_namespaces(project_name, base_language)
    
    if not namespaces:
        print(f"No namespaces found for project '{project_name}', language '{base_language}'", file=sys.stderr)
        return None
    
    # Initialize result object
    export_data = {
        "projectName": project_name,
        "language": language,
        "baseLanguage": base_language,
        "untranslatedKeys": {}
    }
    
    # For each namespace, find all keys
    for namespace in namespaces:
        # Read translation files for base and target languages
        base_translations = read_translation_file(project_name, base_language, namespace)
        
        if not base_translations:
            continue
        
        target_translations = read_translation_file(project_name, language, namespace)
        
        # Find all keys recursively
        all_keys = find_all_keys_recursive(
            base_translations,
            target_translations,
            namespace,
            project_name
        )
        
        # Only add namespace if it has keys
        if all_keys:
            export_data["untranslatedKeys"][namespace] = all_keys
    
    # Check if there are any keys
    if not export_data["untranslatedKeys"]:
        return None
    
    return export_data


def main():
    parser = argparse.ArgumentParser(
        description="Export all translation keys for all languages in a project"
    )
    parser.add_argument(
        "--project",
        required=True,
        choices=list(PROJECT_LOCALES_MAP.keys()),
        help="Project name"
    )
    parser.add_argument(
        "--base-language",
        default="en",
        help="Base language code (default: en)"
    )
    parser.add_argument(
        "--output-dir",
        default="output",
        help="Output directory for exported files (default: output)"
    )
    parser.add_argument(
        "--languages",
        nargs="+",
        help="Specific languages to export (default: all languages except base)"
    )
    
    args = parser.parse_args()
    
    # Get available languages
    all_languages = get_available_languages(args.project)
    
    if not all_languages:
        print(f"No languages found for project '{args.project}'", file=sys.stderr)
        sys.exit(1)
    
    # Validate base language exists
    if args.base_language not in all_languages:
        print(f"Base language '{args.base_language}' not found in project '{args.project}'", file=sys.stderr)
        print(f"Available languages: {', '.join(all_languages)}", file=sys.stderr)
        sys.exit(1)
    
    # Determine which languages to export
    if args.languages:
        # Validate specified languages
        invalid_langs = [lang for lang in args.languages if lang not in all_languages]
        if invalid_langs:
            print(f"Invalid languages: {', '.join(invalid_langs)}", file=sys.stderr)
            print(f"Available languages: {', '.join(all_languages)}", file=sys.stderr)
            sys.exit(1)
        target_languages = args.languages
    else:
        # Export all languages except base
        target_languages = [lang for lang in all_languages if lang != args.base_language]
    
    if not target_languages:
        print(f"No target languages to export", file=sys.stderr)
        sys.exit(1)
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Export each language
    print(f"Project: {args.project}")
    print(f"Base language: {args.base_language}")
    print(f"Target languages: {', '.join(target_languages)}")
    print(f"Output directory: {output_dir}")
    print()
    
    exported_count = 0
    for language in target_languages:
        print(f"Exporting {language}...", end=" ")
        
        export_data = export_language(args.project, language, args.base_language)
        
        if not export_data:
            print("No keys found, skipping")
            continue
        
        # Count total keys
        total_keys = sum(len(keys) for keys in export_data["untranslatedKeys"].values())
        
        # Generate filename
        filename = f"{args.project}-all-keys-from-{args.base_language}-to-{language}.json"
        output_path = output_dir / filename
        
        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ ({total_keys} keys) → {filename}")
        exported_count += 1
    
    print()
    print(f"Exported {exported_count} language(s) successfully!")
    print(f"Files saved to: {output_dir.absolute()}")
    
    # Print next steps
    if exported_count > 0:
        print()
        print("Next steps:")
        print("  1. Review the exported JSON files")
        print("  2. Convert to PDF forms using build_oform.py:")
        print(f"     python build_oform.py --input {output_dir}/[filename].json")


if __name__ == "__main__":
    main()
