#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Upload translation PDF forms to ONLYOFFICE DocSpace VDR room.

This script:
1. Connects to DocSpace portal using API key
2. Creates a VDR (Virtual Data Room) for translation review
3. Uploads PDF forms organized by language folders
4. Sets appropriate permissions for reviewers

Usage:
  pip install -r requirements.txt
  
  # Configure .env file with DOCSPACE_PORTAL_URL and DOCSPACE_API_KEY
  
  # Upload all forms from output/forms directory
  python upload_to_docspace.py
  
  # Upload from custom directory
  python upload_to_docspace.py --forms-dir my_forms
  
  # Specify custom room name
  python upload_to_docspace.py --room-name "Translation Review Q4 2024"
"""

import argparse
import json
import sys
import os
import base64
from pathlib import Path
from typing import Optional, Dict, List

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False
    print("Warning: python-dotenv not installed. Using system environment variables only.", file=sys.stderr)

try:
    import docspace_api_sdk
    from docspace_api_sdk.rest import ApiException
except ImportError:
    print("Error: docspace-api-sdk is required. Install it with: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)

try:
    import requests
except ImportError:
    print("Error: requests library is required. Install it with: pip install requests", file=sys.stderr)
    sys.exit(1)


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


def upload_forms_to_docspace(
    forms_dir: Path,
    portal_url: str,
    api_key: str,
    room_name: str
) -> bool:
    """
    Upload translation forms to DocSpace VDR room.

    Args:
        forms_dir: Directory containing language folders with PDF forms
        portal_url: DocSpace portal URL
        api_key: DocSpace API key
        room_name: Name for the VDR room

    Returns:
        True if successful, False otherwise
    """
    # Configure DocSpace SDK
    configuration = docspace_api_sdk.Configuration(
        host=portal_url.rstrip('/')
    )

    # Test connection (skip profile check due to SDK validation issues)
    print("Initializing DocSpace connection...")
    print(f"✓ Configuration ready for {portal_url}")

    custom_headers = {"Authorization": f"Bearer {api_key}"}

    with docspace_api_sdk.ApiClient(configuration) as api_client:
        # try:
        #     # Get self profile
        #     print(f"\nGet self profile...")
        #     profile_api = docspace_api_sdk.ProfilesApi(api_client)
        #     profile = profile_api.get_self_profile(_headers=custom_headers)
        #     print(f"✓ Self profile: {profile}")

        # except ApiException as e:
        #     print(f"✗ Failed to get self profile: {e}", file=sys.stderr)
        #     if hasattr(e, 'status'):
        #         print(f"  HTTP Status: {e.status}", file=sys.stderr)
        #     if hasattr(e, 'body'):
        #         print(f"  Response: {e.body}", file=sys.stderr)
        # except Exception as e:
        #     print(f"✗ Failed to get self profile: {e}", file=sys.stderr)
        #     print(f"  Error type: {type(e).__name__}", file=sys.stderr)

        try:
            # Create VDR room
            print(f"\nCreating VDR room: {room_name}...")
            room_id = None
            rooms_api = docspace_api_sdk.RoomsApi(api_client)
            # Create room request
            create_room_request = docspace_api_sdk.CreateRoomRequestDto(
                title=room_name,
                room_type=docspace_api_sdk.RoomType.VirtualDataRoom
            )

            result = rooms_api.create_room(
                create_room_request_dto=create_room_request, _headers=custom_headers)
            room = result.response
            room_id = room.id
            print(f"✓ Created VDR room: {room_name} (ID: {room_id})")
            print(f"✓ Connection to DocSpace verified")
        except ApiException as e:
            print(f"✗ Failed to create VDR room: {e}", file=sys.stderr)
            if hasattr(e, 'status'):
                print(f"  HTTP Status: {e.status}", file=sys.stderr)
            if hasattr(e, 'body'):
                print(f"  Response: {e.body}", file=sys.stderr)
            return False
        except Exception as e:
            print(f"✗ Failed to create VDR room: {e}", file=sys.stderr)
            print(f"  Error type: {type(e).__name__}", file=sys.stderr)
            return False

    # Get language folders
    if not forms_dir.exists():
        print(
            f"Error: Forms directory not found: {forms_dir}", file=sys.stderr)
        print("\nExpected directory structure:", file=sys.stderr)
        print(f"  {forms_dir}/", file=sys.stderr)
        print(f"    ├── en/", file=sys.stderr)
        print(f"    │   ├── form1.pdf", file=sys.stderr)
        print(f"    │   └── form2.pdf", file=sys.stderr)
        print(f"    ├── ru/", file=sys.stderr)
        print(f"    │   └── form1.pdf", file=sys.stderr)
        print(f"    └── ...", file=sys.stderr)
        print("\nPlease create the directory and add language folders with PDF forms.", file=sys.stderr)
        print(f"Or specify a different directory with --forms-dir option.",
              file=sys.stderr)
        return False

    language_folders = [d for d in forms_dir.iterdir() if d.is_dir()]

    if not language_folders:
        print(
            f"Warning: No language folders found in {forms_dir}", file=sys.stderr)
        return False

    print(f"\nFound {len(language_folders)} language folder(s)")

    # Upload each language folder
    total_uploaded = 0
    total_failed = 0

    with docspace_api_sdk.ApiClient(configuration) as api_client:
        folders_api = docspace_api_sdk.FoldersApi(api_client)

        for lang_folder in sorted(language_folders):
            lang_code = lang_folder.name
            print(f"\nProcessing language: {lang_code}")

            # Create language folder in VDR room
            try:
                create_folder_request = docspace_api_sdk.CreateFolder(
                    title=lang_code
                )

                result = folders_api.create_folder(
                    folder_id=room_id,
                    create_folder=create_folder_request,
                    _headers=custom_headers
                )
                folder = result.response
                folder_id = folder.id
                print(f"  ✓ Created folder: {lang_code} (ID: {folder_id})")
            except ApiException as e:
                print(
                    f"  ✗ Failed to create folder '{lang_code}': {e}", file=sys.stderr)
                print(f"  Skipping language {lang_code}")
                continue
            except Exception as e:
                print(
                    f"  ✗ Failed to create folder '{lang_code}': {e}", file=sys.stderr)
                print(f"  Skipping language {lang_code}")
                continue

            # Upload all PDF files in this language folder
            pdf_files = list(lang_folder.glob("*.pdf"))
            print(f"  Found {len(pdf_files)} PDF file(s)")

            for pdf_file in sorted(pdf_files):
                try:
                    # Upload file using direct HTTP request
                    # SDK doesn't properly support multipart/form-data, so we use requests directly
                    with open(pdf_file, 'rb') as f:
                        files = {'file': (pdf_file.name, f, 'application/pdf')}
                        
                        upload_url = f"{configuration.host}/api/2.0/files/{folder_id}/upload"
                        headers = {
                            "Authorization": f"Bearer {api_key}"
                        }
                        
                        response = requests.post(
                            upload_url,
                            files=files,
                            headers=headers
                        )
                        response.raise_for_status()

                    print(f"    ✓ Uploaded: {pdf_file.name}")
                    total_uploaded += 1
                except requests.exceptions.HTTPError as e:
                    print(
                        f"    ✗ Failed to upload '{pdf_file.name}': HTTP {e.response.status_code}", file=sys.stderr)
                    if e.response.text:
                        print(f"      Response: {e.response.text[:200]}", file=sys.stderr)
                    total_failed += 1
                except ApiException as e:
                    print(
                        f"    ✗ Failed to upload '{pdf_file.name}': {e}", file=sys.stderr)
                    total_failed += 1
                except Exception as e:
                    print(
                        f"    ✗ Failed to upload '{pdf_file.name}': {e}", file=sys.stderr)
                    total_failed += 1

    # Print summary
    print("\n" + "=" * 60)
    print("Upload Summary")
    print("=" * 60)
    print(f"VDR Room: {room_name}")
    print(f"Room ID: {room_id}")
    print(f"Languages processed: {len(language_folders)}")
    print(f"Files uploaded: {total_uploaded}")
    if total_failed > 0:
        print(f"Files failed: {total_failed}")
    print(f"\nRoom URL: {portal_url}/rooms/shared/{room_id}")

    return total_failed == 0


def main():
    # Load environment variables
    load_env_file()

    parser = argparse.ArgumentParser(
        description="Upload translation PDF forms to ONLYOFFICE DocSpace VDR room",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Upload all forms from default directory
  python upload_to_docspace.py
  
  # Upload from custom directory
  python upload_to_docspace.py --forms-dir my_forms
  
  # Specify custom room name
  python upload_to_docspace.py --room-name "Translation Review Q4 2024"
  
Environment variables (set in .env file):
  DOCSPACE_PORTAL_URL - DocSpace portal URL (required)
  DOCSPACE_API_KEY    - DocSpace API key (required)
        """
    )

    parser.add_argument(
        "--forms-dir",
        type=str,
        default=None,
        help="Directory containing language folders with PDF forms (default: <script_dir>/output/forms)"
    )

    parser.add_argument(
        "--room-name",
        type=str,
        default="Translation Review",
        help="Name for the VDR room (default: Translation Review)"
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

    # Get configuration
    portal_url = args.portal_url or os.environ.get('DOCSPACE_PORTAL_URL')
    api_key = args.api_key or os.environ.get('DOCSPACE_API_KEY')

    if not portal_url:
        print("Error: DocSpace portal URL is required.", file=sys.stderr)
        print("Set DOCSPACE_PORTAL_URL in .env file or use --portal-url argument.", file=sys.stderr)
        sys.exit(1)

    if not api_key:
        print("Error: DocSpace API key is required.", file=sys.stderr)
        print(
            "Set DOCSPACE_API_KEY in .env file or use --api-key argument.", file=sys.stderr)
        sys.exit(1)

    # Determine forms directory
    if args.forms_dir:
        forms_dir = Path(args.forms_dir)
    else:
        # Use script directory / output / forms as default
        script_dir = Path(__file__).parent
        forms_dir = script_dir / "output" / "forms"

    # Print configuration
    print("=" * 60)
    print("Upload Translation Forms to DocSpace")
    print("=" * 60)
    print(f"Portal URL: {portal_url}")
    print(f"Forms directory: {forms_dir.absolute()}")
    print(f"Room name: {args.room_name}")
    print()

    # Upload forms
    success = upload_forms_to_docspace(
        forms_dir=forms_dir,
        portal_url=portal_url,
        api_key=api_key,
        room_name=args.room_name
    )

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
