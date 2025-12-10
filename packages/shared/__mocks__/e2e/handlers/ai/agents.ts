// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH_AI_AGENTS = "ai/agents?*";

const successEmpty = {
	response: {
		files: [],
		folders: [],
		current: {
			parentId: 0,
			filesCount: 0,
			foldersCount: 0,
			new: 0,
			mute: false,
			pinned: false,
			private: false,
			indexing: false,
			denyDownload: false,
			fileEntryType: 1,
			id: 224866,
			rootFolderId: 224866,
			canShare: false,
			security: {
				Read: true,
				Create: false,
				Delete: false,
				EditRoom: false,
				Rename: false,
				CopyTo: false,
				Copy: false,
				MoveTo: true,
				Move: false,
				Pin: false,
				Mute: false,
				EditAccess: false,
				Duplicate: false,
				Download: false,
				CopySharedLink: false,
				Reconnect: false,
				CreateRoomFrom: false,
				CopyLink: false,
				Embed: false,
				ChangeOwner: false,
				IndexExport: false,
				UseChat: false,
			},
			availableShareRights: {},
			title: "AI agents",
			access: 0,
			shared: false,
			sharedForUser: false,
			parentShared: false,
			shortWebUrl: "",
			created: "2025-12-08T21:08:15.0000000+08:00",
			createdBy: {
				id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
				displayName: "Administrator ",
				avatar:
					"/static/images/default_user_photo_size_82-82.png?hash=1731136677",
				avatarOriginal:
					"/static/images/default_user_photo_size_200-200.png?hash=1731136677",
				avatarMax:
					"/static/images/default_user_photo_size_200-200.png?hash=1731136677",
				avatarMedium:
					"/static/images/default_user_photo_size_48-48.png?hash=1731136677",
				avatarSmall:
					"/static/images/default_user_photo_size_32-32.png?hash=1731136677",
				profileUrl: `${BASE_URL}/accounts/people/filter?search=test@gmail.com`,
				hasAvatar: false,
				isAnonim: false,
			},
			updated: "2025-12-08T21:08:15.0000000+08:00",
			rootFolderType: 34,
			updatedBy: {
				id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
				displayName: "Administrator ",
				avatar:
					"/static/images/default_user_photo_size_82-82.png?hash=1731136677",
				avatarOriginal:
					"/static/images/default_user_photo_size_200-200.png?hash=1731136677",
				avatarMax:
					"/static/images/default_user_photo_size_200-200.png?hash=1731136677",
				avatarMedium:
					"/static/images/default_user_photo_size_48-48.png?hash=1731136677",
				avatarSmall:
					"/static/images/default_user_photo_size_32-32.png?hash=1731136677",
				profileUrl: `${BASE_URL}/accounts/people/filter?search=test@gmail.com`,
				hasAvatar: false,
				isAnonim: false,
			},
		},
		pathParts: [
			{
				id: 224866,
				title: "AI agents",
				folderType: 34,
			},
		],
		startIndex: 0,
		count: 0,
		total: 0,
		new: 0,
	},
	count: 1,
	links: [
		{
			href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_AGENTS}`,
			action: "GET",
		},
	],
	status: 0,
	statusCode: 200,
};

const successEmptyWithCreate = {
	response: {
		files: [],
		folders: [],
		current: {
			parentId: 0,
			filesCount: 0,
			foldersCount: 0,
			new: 0,
			mute: false,
			pinned: false,
			private: false,
			indexing: false,
			denyDownload: false,
			fileEntryType: 1,
			id: 224866,
			rootFolderId: 224866,
			canShare: false,
			security: {
				Read: true,
				Create: true,
				Delete: false,
				EditRoom: false,
				Rename: false,
				CopyTo: false,
				Copy: false,
				MoveTo: true,
				Move: false,
				Pin: false,
				Mute: false,
				EditAccess: false,
				Duplicate: false,
				Download: false,
				CopySharedLink: false,
				Reconnect: false,
				CreateRoomFrom: false,
				CopyLink: false,
				Embed: false,
				ChangeOwner: false,
				IndexExport: false,
				UseChat: false,
			},
			availableShareRights: {},
			title: "AI agents",
			access: 0,
			shared: false,
			sharedForUser: false,
			parentShared: false,
			shortWebUrl: "",
			created: "2025-12-08T21:08:15.0000000+08:00",
			createdBy: {
				id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
				displayName: "Administrator ",
				avatar:
					"/static/images/default_user_photo_size_82-82.png?hash=1731136677",
				avatarOriginal:
					"/static/images/default_user_photo_size_200-200.png?hash=1731136677",
				avatarMax:
					"/static/images/default_user_photo_size_200-200.png?hash=1731136677",
				avatarMedium:
					"/static/images/default_user_photo_size_48-48.png?hash=1731136677",
				avatarSmall:
					"/static/images/default_user_photo_size_32-32.png?hash=1731136677",
				profileUrl: `${BASE_URL}/accounts/people/filter?search=test@gmail.com`,
				hasAvatar: false,
				isAnonim: false,
			},
			updated: "2025-12-08T21:08:15.0000000+08:00",
			rootFolderType: 34,
			updatedBy: {
				id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
				displayName: "Administrator ",
				avatar:
					"/static/images/default_user_photo_size_82-82.png?hash=1731136677",
				avatarOriginal:
					"/static/images/default_user_photo_size_200-200.png?hash=1731136677",
				avatarMax:
					"/static/images/default_user_photo_size_200-200.png?hash=1731136677",
				avatarMedium:
					"/static/images/default_user_photo_size_48-48.png?hash=1731136677",
				avatarSmall:
					"/static/images/default_user_photo_size_32-32.png?hash=1731136677",
				profileUrl: `${BASE_URL}/accounts/people/filter?search=test@gmail.com`,
				hasAvatar: false,
				isAnonim: false,
			},
		},
		pathParts: [
			{
				id: 224866,
				title: "AI agents",
				folderType: 34,
			},
		],
		startIndex: 0,
		count: 0,
		total: 0,
		new: 0,
	},
	count: 1,
	links: [
		{
			href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_AGENTS}`,
			action: "GET",
		},
	],
	status: 0,
	statusCode: 200,
};

export const aiAgentsHandler = ({ withCreate }: { withCreate?: boolean }) => {
	if (withCreate) {
		return new Response(JSON.stringify(successEmptyWithCreate));
	}
	return new Response(JSON.stringify(successEmpty));
};
