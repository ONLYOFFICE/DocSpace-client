/*
 * Copyright (C) Ascensio System SIA, 2009-2026
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
 */

const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const { BASE_DIR } = require("./files");

// ui-kit is no longer checked out here: it ships as a prebuilt tarball and is
// only present under node_modules. Its components own a large share of the
// Common namespace and reference images that live in this repo's
// public/images, so callers that need either have to read the built package
// instead of source.
//
// Throws when the package is not installed. Returning a "ui-kit contributes
// nothing" fallback instead would let UiKitCommonResolverPrefixTest pass on an
// empty file list and let the locale and image scans quietly lose ui-kit's
// share of the evidence -- a green run that checked nothing. Every caller runs
// after `pnpm install`, so absence is a broken environment, not a mode.
const resolveUiKitDist = () => {
	let pkgJson;

	try {
		const req = createRequire(
			path.join(BASE_DIR, "packages", "client", "noop.js"),
		);
		pkgJson = req.resolve("@onlyoffice/apps-ui-kit/package.json");
	} catch (err) {
		throw new Error(
			"@onlyoffice/apps-ui-kit is not installed, so these checks cannot " +
				"see the code that owns much of the Common namespace and many of " +
				`the images. Run \`pnpm install\` and retry. (${err.message})`,
		);
	}

	const dist = path.join(path.dirname(pkgJson), "dist", "esm");

	if (!fs.existsSync(dist)) {
		throw new Error(
			`@onlyoffice/apps-ui-kit is installed but ships no ${path.join("dist", "esm")}: ` +
				`${dist} does not exist. The tarball at the repo root is broken -- ` +
				"rebuild it in the docspace-ui-kit-react repository.",
		);
	}

	return dist;
};

module.exports = { resolveUiKitDist };
