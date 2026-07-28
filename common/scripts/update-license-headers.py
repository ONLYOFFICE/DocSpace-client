#!/usr/bin/env python3
"""
Replace old AGPL license headers with the new standardized format.

Usage:
  python3 update-license-headers.py [--root <path>] [--year <year>]

Defaults:
  --root  repo root (parent of this script's common/scripts directory)
  --year  current year
"""

import argparse
import datetime
import glob
import json
import re
import sys

DEFAULT_EXTENSIONS = ("*.ts", "*.tsx", "*.js", "*.jsx", "*.scss")
SKIP_DIRS = ("/dist/", "/node_modules/", "/public/scripts/sdk/")

NEW_HEADER_TEMPLATE = """\
/*
 * Copyright (C) Ascensio System SIA, 2009-{year}
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */"""

# Matches the full old header in /* ... */ or /*! ... */ or /** ... */ style
OLD_BLOCK_HEADER = re.compile(
    r"^/\*+\n"
    r" \* \(c\) Copyright Ascensio System SIA \d{4}-\d{4}\n"
    r".+?"
    r"International\. See the License terms at http://creativecommons\.org/licenses/by-sa/4\.0/legalcode\n"
    r" \*/",
    re.DOTALL | re.MULTILINE,
)

# Matches the full old header in // line-comment style (allows trailing spaces on blank lines)
OLD_LINE_HEADER = re.compile(
    r"^// \(c\) Copyright Ascensio System SIA \d{4}-\d{4}\n"
    r"(//[^\n]*\n)*"
    r"// International\. See the License terms at http://creativecommons\.org/licenses/by-sa/4\.0/legalcode",
    re.MULTILINE,
)

# Matches a truncated // header (partial — no CC line at the end)
TRUNCATED_LINE_HEADER = re.compile(
    r"^// \(c\) Copyright Ascensio System SIA \d{4}-\d{4}\n"
    r"(//[^\n]*\n)+",
    re.MULTILINE,
)


def should_skip(path: str) -> bool:
    return any(d in path for d in SKIP_DIRS)


def replace_header(content: str, new_header: str) -> str | None:
    for pattern in (OLD_BLOCK_HEADER, OLD_LINE_HEADER):
        m = pattern.search(content)
        if m:
            return content[: m.start()] + new_header + content[m.end() :]

    # Truncated // header (file has no CC attribution line)
    m = TRUNCATED_LINE_HEADER.match(content)
    if m:
        return new_header + "\n" + content[m.end() :]

    return None


def process_file(filepath: str, new_header: str, dry_run: bool) -> bool:
    try:
        with open(filepath, "rb") as f:
            raw = f.read()

        crlf = b"\r\n" in raw
        content = raw.decode("utf-8")
        if crlf:
            content = content.replace("\r\n", "\n")

        new_content = replace_header(content, new_header)
        if new_content is None:
            return False

        if not dry_run:
            if crlf:
                new_content = new_content.replace("\n", "\r\n")
            with open(filepath, "wb") as f:
                f.write(new_content.encode("utf-8"))

        return True
    except Exception as exc:
        print(f"  ERROR {filepath}: {exc}", file=sys.stderr)
        return False


WORKSPACE_FILE = "frontend.code-workspace"

# The licenser.customHeader value uses literal \n sequences (not real newlines)
NEW_LICENSER_HEADER_TEMPLATE = (
    "Copyright (C) @AUTHOR@, 2009-{year}\\n"
    "\\n"
    "This program is a free software product. You can redistribute it and/or\\n"
    "modify it under the terms of the GNU Affero General Public License (AGPL)\\n"
    "version 3 as published by the Free Software Foundation, together with the\\n"
    "additional terms provided in the LICENSE file.\\n"
    "\\n"
    "This program is distributed WITHOUT ANY WARRANTY; without even the implied\\n"
    "warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For\\n"
    "details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html\\n"
    "\\n"
    "You can contact Ascensio System SIA by email at info@onlyoffice.com\\n"
    "or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,\\n"
    "LV-1050, Latvia, European Union.\\n"
    "\\n"
    "The interactive user interfaces in modified versions of the Program\\n"
    "are required to display Appropriate Legal Notices in accordance with\\n"
    "Section 5 of the GNU AGPL version 3.\\n"
    "\\n"
    "No trademark rights are granted under this License.\\n"
    "\\n"
    "All non-code elements of the Product, including illustrations,\\n"
    "icon sets, and technical writing content, are licensed under the\\n"
    "Creative Commons Attribution-ShareAlike 4.0 International License:\\n"
    "https://creativecommons.org/licenses/by-sa/4.0/legalcode\\n"
    "\\n"
    "This license applies only to such non-code elements and does not\\n"
    "modify or replace the licensing terms applicable to the Program's\\n"
    "source code, which remains licensed under the GNU Affero General\\n"
    "Public License v3.\\n"
    "\\n"
    "SPDX-License-Identifier: AGPL-3.0-only"
)


def update_workspace(root: str, year: int, dry_run: bool) -> bool:
    import os

    workspace_path = os.path.join(root, WORKSPACE_FILE)
    try:
        with open(workspace_path, "rb") as f:
            raw = f.read()
        crlf = b"\r\n" in raw
        data = json.loads(raw.decode("utf-8"))

        settings = data.get("settings", {})
        new_header = NEW_LICENSER_HEADER_TEMPLATE.format(year=year)

        if (
            settings.get("licenser.customHeader") == new_header
            and settings.get("licenser.useSingleLineStyle") is False
        ):
            return False  # already up to date

        if not dry_run:
            settings["licenser.customHeader"] = new_header
            settings["licenser.useSingleLineStyle"] = False
            out = json.dumps(data, indent=2, ensure_ascii=False)
            if crlf:
                out = out.replace("\n", "\r\n")
            with open(workspace_path, "wb") as f:
                f.write(out.encode("utf-8"))

        return True
    except Exception as exc:
        print(f"  ERROR {workspace_path}: {exc}", file=sys.stderr)
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Repository root directory")
    parser.add_argument(
        "--year",
        type=int,
        default=datetime.date.today().year,
        help="Copyright end year",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing files",
    )
    args = parser.parse_args()

    new_header = NEW_HEADER_TEMPLATE.format(year=args.year)
    updated = skipped = 0

    for ext in DEFAULT_EXTENSIONS:
        for filepath in glob.glob(f"{args.root}/**/{ext}", recursive=True):
            if should_skip(filepath):
                continue
            if process_file(filepath, new_header, args.dry_run):
                updated += 1
                if args.dry_run:
                    print(f"  would update: {filepath}")
            else:
                skipped += 1

    action = "Would update" if args.dry_run else "Updated"
    print(f"{action}: {updated} files  |  skipped (no old header): {skipped}")

    if update_workspace(args.root, args.year, args.dry_run):
        print(f"{action}: {WORKSPACE_FILE} (licenser.customHeader)")
    else:
        print(f"Skipped: {WORKSPACE_FILE} (already up to date)")


if __name__ == "__main__":
    main()
