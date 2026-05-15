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

import { headers } from "next/headers";

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import {
	TFilesSettings,
	type TFolder,
	type TGetFolder,
} from "@docspace/shared/api/files/types";
import {
	checkFilterInstance,
	decodeDisplayName,
	getFolderClassNameByType,
	sortInDisplayOrder,
} from "@docspace/shared/utils/common";
import FilesFilter from "@docspace/shared/api/files/filter";
import { TValidateShareRoom } from "@docspace/shared/api/rooms/types";
import { FolderType } from "@docspace/shared/enums";
import { SHARE_KEY_HEADER } from "@/utils/constants";
import { logger } from "@/../logger.mjs";

export async function getFilesSettings(): Promise<TFilesSettings | undefined> {
	logger.debug("Start GET /files/settings");

	try {
		const [req] = await createRequest([`/files/settings`], [["", ""]], "GET");

		const res = await fetch(req, {
			next: { revalidate: 900 },
			signal: AbortSignal.timeout(8000),
		});

		if (!res.ok) {
			logger.error(`GET /files/settings failed: ${res.status}`);
			return;
		}

		const filesSettings = await res.json();

		return filesSettings.response;
	} catch (error) {
		logger.error(`Error in getFilesSettings: ${error}`);
	}
}

export async function getFoldersTree(): Promise<TFolder[]> {
	logger.debug("Start GET /files/@root?filterType=2&count=1");

	try {
		const [req] = await createRequest(
			[`/files/@root?filterType=2&count=1`],
			[["", ""]],
			"GET",
		);

		const res = await fetch(req, {
			next: { revalidate: 300 },
			signal: AbortSignal.timeout(8000),
		});

		if (!res.ok) {
			logger.error(
				`GET /files/@root?filterType=2&count=1 failed: ${res.status}`,
			);
			throw new Error("Failed to get folders tree");
		}

		const resJson = await res.json();
		const folders = resJson.response as TGetFolder[];

		const sortedFolders = sortInDisplayOrder(folders);

		return sortedFolders.map((data, index) => {
			const { new: newItems, pathParts, current } = data;

			const {
				parentId,
				title,
				id,
				rootFolderType,
				security,
				foldersCount,
				filesCount,
			} = current;

			const type = +rootFolderType;

			const name = getFolderClassNameByType(type);

			return {
				...current,
				id,
				key: `0-${index}`,
				parentId,
				title,
				rootFolderType: type,
				folderClassName: name,
				folders: null,
				pathParts,
				foldersCount,
				filesCount,
				newItems,
				security,
				new: newItems,
			} as TFolder;
		});
	} catch (error) {
		logger.error(`Error in getFoldersTree: ${error}`);
		throw error;
	}
}

export async function getFolder(
	folderIdParam: string | number,
	filter: FilesFilter,
	signal?: AbortSignal,
	share?: string,
): Promise<TGetFolder> {
	logger.debug(`Start GET /files/params`);

	try {
		const hdrs = await headers();

		const shareKey = hdrs.get(SHARE_KEY_HEADER);

		let params = folderIdParam;
		let folderId = folderIdParam;

		if (folderId && typeof folderId === "string") {
			folderId = encodeURIComponent(folderId.replace(/\\\\/g, "\\"));
		}

		if (filter) {
			checkFilterInstance(filter, FilesFilter);

			params = `${folderId}?${filter.toApiUrlParams()}`;
		}

		const shareHeader: [string, string] =
			share || shareKey
				? ["Request-Token", share || shareKey || ""]
				: ["", ""];

		logger.debug(`Start GET /files/${params}`);

		const [req] = await createRequest(
			[`/files/${params}`],
			[shareHeader],
			"GET",
			undefined,
			undefined,
			[signal],
		);

		const res = await fetch(req, {
			next: { revalidate: 300 },
			signal: AbortSignal.timeout(8000),
		});

		if (!res.ok) {
			logger.error(`GET /files/${params} failed: ${res.status}`);
			throw new Error("Failed to get folder");
		}

		const resJson = await res.json();
		const folder = resJson.response as TGetFolder;

		folder.files = decodeDisplayName(folder.files);
		folder.folders = decodeDisplayName(folder.folders);

		folder.current.isArchive =
			!!folder.current.roomType &&
			folder.current.rootFolderType === FolderType.Archive;

		return folder;
	} catch (error) {
		logger.error(`Error in getFolder: ${error}`);
		throw error;
	}
}

export async function getFolderInfo(
	folderId: string | number,
): Promise<TFolder> {
	logger.debug(`Start GET /files/folder/${folderId}`);

	try {
		const [req] = await createRequest(
			[`/files/folder/${folderId}`],
			[["", ""]],
			"GET",
		);

		const res = await fetch(req, {
			next: { revalidate: 300 },
			signal: AbortSignal.timeout(8000),
		});

		if (!res.ok) {
			logger.error(`GET /files/folder/${folderId} failed: ${res.status}`);
			throw new Error("Failed to get folder info");
		}

		const resJson = await res.json();
		return resJson.response as TFolder;
	} catch (error) {
		logger.error(`Error in getFolderInfo: ${error}`);
		throw error;
	}
}

export async function validateShareFolder(share: string) {
	logger.debug(`Start GET /files/share/${share}`);

	try {
		const shareHeader: [string, string] = share
			? ["Request-Token", share]
			: ["", ""];

		const [req] = await createRequest(
			[`/files/share/${share}`],
			[shareHeader],
			"GET",
		);

		const res = await fetch(req, {
			next: { revalidate: 300 },
			signal: AbortSignal.timeout(8000),
		});

		if (!res.ok) {
			logger.error(`GET /files/share/${share} failed: ${res.status}`);
			throw new Error("Failed to validate share folder");
		}

		const resJson = await res.json();
		const shareKey = resJson.response as TValidateShareRoom;

		return shareKey;
	} catch (error) {
		logger.error(`Error in validateShareFolder: ${error}`);
		throw error;
	}
}
