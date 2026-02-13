#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Export all languages and build PDF forms for translation projects.
Cross-platform Python script for Windows, macOS, and Linux.

Usage:
  # Export and build all languages for one project
  python export_and_build_all.py --project Common
  
  # Export specific languages only
  python export_and_build_all.py --project Client --languages ru de fr
  
  # Export ALL projects on ALL languages
  python export_and_build_all.py --all-projects
  
  # Export all projects with specific languages
  python export_and_build_all.py --all-projects --languages ru de
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import List, Optional


# Project locales mapping (from config.js)
PROJECT_LOCALES_MAP = {
    "Common": "public/locales",
    "Client": "packages/client/public/locales",
    "DocEditor": "packages/doceditor/public/locales",
    "Login": "packages/login/public/locales",
    "Management": "packages/management/public/locales",
}


def print_header(text: str):
    """Print a formatted header."""
    print()
    print("=" * 60)
    print(text)
    print("=" * 60)


def print_section(text: str):
    """Print a formatted section header."""
    print()
    print(text)
    print("-" * 60)


def run_export(
    project: str,
    languages: Optional[List[str]],
    base_language: str,
    output_dir: Path
) -> bool:
    """
    Run the export_all_languages.py script.
    
    Args:
        project: Project name
        languages: List of languages to export (None = all)
        base_language: Base language code
        output_dir: Output directory for exports
        
    Returns:
        True if successful, False otherwise
    """
    script_dir = Path(__file__).parent
    export_script = script_dir / "export_all_languages.py"
    
    cmd = [
        sys.executable,
        str(export_script),
        "--project", project,
        "--base-language", base_language,
        "--output-dir", str(output_dir)
    ]
    
    if languages:
        cmd.extend(["--languages"] + languages)
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=False, text=True)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error: Export failed for project {project}", file=sys.stderr)
        return False


def run_build_pdf(json_file: Path, output_dir: Path, language: str) -> bool:
    """
    Run the build_oform.py script to generate PDF.
    
    Args:
        json_file: Path to exported JSON file
        output_dir: Base output directory for PDF forms
        language: Target language code (for organizing by language folders)
        
    Returns:
        True if successful, False otherwise
    """
    script_dir = Path(__file__).parent
    build_script = script_dir / "build_oform.py"
    
    # Create language-specific subdirectory
    language_dir = output_dir / language
    language_dir.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        sys.executable,
        str(build_script),
        "--input", str(json_file),
        "--output-dir", str(language_dir)
    ]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=False, text=True)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Warning: Failed to build PDF for {json_file.name}", file=sys.stderr)
        return False


def process_project(
    project: str,
    languages: Optional[List[str]],
    base_language: str,
    export_dir: Path,
    forms_dir: Path
) -> tuple[int, int]:
    """
    Process a single project: export and build PDFs.
    
    Args:
        project: Project name
        languages: List of languages to export (None = all)
        base_language: Base language code
        export_dir: Directory for exported JSON files
        forms_dir: Directory for generated PDF forms
        
    Returns:
        Tuple of (exported_count, built_count)
    """
    print_section(f"Processing project: {project}")
    
    # Step 1: Export translations
    print(f"Exporting translations for {project}...")
    if not run_export(project, languages, base_language, export_dir):
        print(f"Skipping PDF generation for {project} due to export failure")
        return 0, 0
    
    # Step 2: Find exported files for this project
    pattern = f"{project}-all-keys-from-{base_language}-to-*.json"
    exported_files = list(export_dir.glob(pattern))
    
    if not exported_files:
        print(f"No exported files found for {project}")
        return 0, 0
    
    exported_count = len(exported_files)
    print(f"Found {exported_count} exported file(s)")
    
    # Step 3: Build PDF forms
    print(f"Building PDF forms for {project}...")
    built_count = 0
    
    for json_file in exported_files:
        # Extract language from filename: "Project-all-keys-from-en-to-ru.json" -> "ru"
        filename = json_file.stem  # Remove .json extension
        parts = filename.split("-to-")
        if len(parts) == 2:
            language = parts[1]
        else:
            # Fallback: try to extract from filename
            language = "unknown"
        
        print(f"  Building PDF for: {json_file.name} → forms/{language}/")
        if run_build_pdf(json_file, forms_dir, language):
            built_count += 1
    
    return exported_count, built_count


def main():
    parser = argparse.ArgumentParser(
        description="Export all languages and build PDF forms for translation projects",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Export and build all languages for one project
  python export_and_build_all.py --project Common
  
  # Export specific languages only
  python export_and_build_all.py --project Client --languages ru de fr
  
  # Export ALL projects on ALL languages
  python export_and_build_all.py --all-projects
  
  # Export all projects with specific languages
  python export_and_build_all.py --all-projects --languages ru de
  
  # Use custom base language
  python export_and_build_all.py --all-projects --base-language en
        """
    )
    
    # Project selection
    project_group = parser.add_mutually_exclusive_group(required=True)
    project_group.add_argument(
        "--project",
        choices=list(PROJECT_LOCALES_MAP.keys()),
        help="Single project to process"
    )
    project_group.add_argument(
        "--all-projects",
        action="store_true",
        help="Process ALL projects"
    )
    
    # Language options
    parser.add_argument(
        "--languages",
        nargs="+",
        help="Specific languages to export (default: all languages except base)"
    )
    parser.add_argument(
        "--base-language",
        default="en",
        help="Base language code (default: en)"
    )
    
    # Output options
    parser.add_argument(
        "--output-dir",
        default="output",
        help="Base output directory (default: output)"
    )
    parser.add_argument(
        "--skip-pdf",
        action="store_true",
        help="Skip PDF generation, only export JSON files"
    )
    
    args = parser.parse_args()
    
    # Determine which projects to process
    if args.all_projects:
        projects = list(PROJECT_LOCALES_MAP.keys())
    else:
        projects = [args.project]
    
    # Setup output directories
    script_dir = Path(__file__).parent
    base_output_dir = script_dir / args.output_dir
    export_dir = base_output_dir / "exports"
    forms_dir = base_output_dir / "forms"
    
    # Create output directories
    export_dir.mkdir(parents=True, exist_ok=True)
    if not args.skip_pdf:
        forms_dir.mkdir(parents=True, exist_ok=True)
    
    # Print configuration
    print_header("Export and Build PDF Forms")
    print(f"Projects: {', '.join(projects)}")
    print(f"Base language: {args.base_language}")
    if args.languages:
        print(f"Target languages: {', '.join(args.languages)}")
    else:
        print(f"Target languages: all (except {args.base_language})")
    print(f"Output directory: {base_output_dir.absolute()}")
    if args.skip_pdf:
        print("PDF generation: DISABLED")
    
    # Process each project
    total_exported = 0
    total_built = 0
    failed_projects = []
    
    for project in projects:
        try:
            exported, built = process_project(
                project,
                args.languages,
                args.base_language,
                export_dir,
                forms_dir
            )
            total_exported += exported
            if not args.skip_pdf:
                total_built += built
        except Exception as e:
            print(f"Error processing project {project}: {e}", file=sys.stderr)
            failed_projects.append(project)
    
    # Print summary
    print_header("Summary")
    print(f"Projects processed: {len(projects)}")
    print(f"Total JSON files exported: {total_exported}")
    if not args.skip_pdf:
        print(f"Total PDF forms generated: {total_built}")
    
    if failed_projects:
        print(f"Failed projects: {', '.join(failed_projects)}")
    
    print()
    print(f"Exported JSON files: {export_dir.absolute()}")
    if not args.skip_pdf:
        print(f"Generated PDF forms: {forms_dir.absolute()}")
        print()
        print("PDF forms are organized by language:")
        print(f"  {forms_dir.absolute()}/")
        # Show language folders if they exist
        if forms_dir.exists():
            lang_dirs = sorted([d.name for d in forms_dir.iterdir() if d.is_dir()])
            for lang in lang_dirs[:5]:  # Show first 5 languages
                print(f"    ├── {lang}/")
                print(f"    │   ├── common-{lang}-review.pdf")
                print(f"    │   ├── client-{lang}-review.pdf")
                print(f"    │   └── ...")
            if len(lang_dirs) > 5:
                print(f"    └── ... ({len(lang_dirs) - 5} more languages)")
    
    # Print next steps
    if total_exported > 0:
        print()
        print("Next steps:")
        if args.skip_pdf:
            print("  1. Review the exported JSON files")
            print("  2. Build PDF forms:")
            print(f"     python export_and_build_all.py --project <name>")
        else:
            print(f"  1. Review PDF forms by language in: {forms_dir.absolute()}")
            print("  2. Each language folder contains all projects for that language")
            print("  3. Fill in translations and check confirmations")
            print("  4. Process completed forms (future feature)")
    
    # Exit with error code if any projects failed
    if failed_projects:
        sys.exit(1)


if __name__ == "__main__":
    main()
