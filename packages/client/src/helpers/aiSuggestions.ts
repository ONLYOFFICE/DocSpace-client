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
import isNil from "lodash/isNil";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import type { Suggestion } from "@docspace/ui-kit/ai-agent/providers";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";

type QueryFolderType = `${FolderType}`;

/**
 * Right a suggestion needs before it is offered — the "who to show it to"
 * column of the AI presets spec. Two families, because the two kinds of
 * section have two different sources of truth:
 *
 * - *entity rights* (`create` … `editAccess`) are checked against the
 *   security of the opened room or space — the sections the spec labels
 *   "inside a room", "inside a Form Space", and the per-room-type ones. This
 *   also covers rights granted through a group or an external link, which a
 *   role name alone would miss.
 * - *portal roles* (`contentCreator`, `roomAdmin`) are checked against the
 *   current user. Used by the cross-entity lists — the Rooms and Forms roots,
 *   Recent, Favorites, Templates, Archive, Trash — where the listing folder
 *   carries no rights for the rooms and spaces shown inside it.
 *
 * Left unset the suggestion is shown to anyone who can see the section: every
 * "any user" / "any member" row, and every Files-sheet row, since that sheet
 * has no "who to show it to" column at all.
 */
export type SuggestionAccess =
  /** "Content Creator or higher": create, upload, organize, generate files. */
  | "create"
  /** "Room Owner": archive the room. */
  | "move"
  /** "Room Owner/Manager": name, tags, avatar, collection workflow. */
  | "editRoom"
  /** "Room Owner/Manager; DocSpace Admin": participants, roles, sharing. */
  | "editAccess"
  /** "Content Creator or higher" outside a room: anyone but a guest. */
  | "contentCreator"
  /**
   * "Room Owner", "Form Space Owner/Manager", "template owner", "user allowed
   * to create rooms / spaces" — DocSpace admins included.
   */
  | "roomAdmin";

type SuggestionEntry = Suggestion & { requires?: SuggestionAccess };

export type SuggestionContext = {
  roomType?: RoomsType | null;
  folderType?: QueryFolderType | null;
  selectedFolderType?: FolderType | null;
  rootFolderType?: FolderType | null;
  isFolder?: boolean;
  isRootFolder?: boolean;
  searchArea?: string | null;
  /** Security of the currently opened folder or room. */
  security?: Partial<TFolderSecurity> | null;
  /** DocSpace admin or portal owner. */
  isAdmin?: boolean;
  /** Room admin — can create rooms and spaces. */
  isRoomAdmin?: boolean;
  /** Guest (visitor): read-only participant. */
  isGuest?: boolean;
};

const hasAccess = (
  requires: SuggestionAccess | undefined,
  { security, isAdmin, isRoomAdmin, isGuest }: SuggestionContext,
): boolean => {
  if (!requires) return true;

  if (requires === "contentCreator") return !isGuest;
  if (requires === "roomAdmin") return Boolean(isAdmin) || Boolean(isRoomAdmin);

  // Security is absent until the room is loaded — show the suggestion rather
  // than render an empty welcome screen; the action itself is still checked
  // server-side.
  if (!security) return true;

  if (requires === "create") return Boolean(security.Create);
  if (requires === "move") return Boolean(security.Move);
  if (requires === "editRoom") return Boolean(security.EditRoom);

  return Boolean(security.EditAccess);
};

export const getSuggestionsBySection = (t: TTranslation) => {
  return {
    // +
    files: [
      {
        name: t("AiSuggestions:FilesShowFileStructure"),
        prompt: t("AiSuggestions:FilesShowFileStructurePrompt"),
      },
      {
        name: t("AiSuggestions:FilesCreateANewFolder"),
        prompt: t("AiSuggestions:FilesCreateANewFolderPrompt"),
      },
      {
        name: t("AiSuggestions:FilesUploadAFile"),
        prompt: t("AiSuggestions:FilesUploadAFilePrompt"),
      },
      {
        name: t("AiSuggestions:FilesOrganizeFilesIntoFolders"),
        prompt: t("AiSuggestions:FilesOrganizeFilesIntoFoldersPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFindFilesByTopic"),
        prompt: t("AiSuggestions:FilesFindFilesByTopicPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFindLargeFiles"),
        prompt: t("AiSuggestions:FilesFindLargeFilesPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFindPossibleDuplicates"),
        prompt: t("AiSuggestions:FilesFindPossibleDuplicatesPrompt"),
      },
      {
        name: t("AiSuggestions:FilesSuggestFilesToCleanUp"),
        prompt: t("AiSuggestions:FilesSuggestFilesToCleanUpPrompt"),
      },
    ],

    // +
    sharedWithMe: [
      {
        name: t("AiSuggestions:SharedWithMeWhatSSharedWithMe"),
        prompt: t("AiSuggestions:SharedWithMeWhatSSharedWithMePrompt"),
      },
      {
        name: t("AiSuggestions:SharedWithMeWhatNeedsMyAction"),
        prompt: t("AiSuggestions:SharedWithMeWhatNeedsMyActionPrompt"),
      },
      {
        name: t("AiSuggestions:SharedWithMeFindFilesFromAPerson"),
        prompt: t("AiSuggestions:SharedWithMeFindFilesFromAPersonPrompt"),
      },
      {
        name: t("AiSuggestions:SharedWithMeCopyToMyFiles"),
        prompt: t("AiSuggestions:SharedWithMeCopyToMyFilesPrompt"),
      },
    ],

    // +
    filesRecent: [
      {
        name: t("AiSuggestions:FilesRecentSummarizeRecentFiles"),
        prompt: t("AiSuggestions:FilesRecentSummarizeRecentFilesPrompt"),
      },
      {
        name: t("AiSuggestions:FilesRecentFindRecentFilesByTopic"),
        prompt: t("AiSuggestions:FilesRecentFindRecentFilesByTopicPrompt"),
      },
      {
        name: t("AiSuggestions:FilesRecentOrganizeRecentFiles"),
        prompt: t("AiSuggestions:FilesRecentOrganizeRecentFilesPrompt"),
      },
    ],

    // +
    filesFavorites: [
      {
        name: t("AiSuggestions:FilesFavoritesSummarizeFavorites"),
        prompt: t("AiSuggestions:FilesFavoritesSummarizeFavoritesPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFavoritesFindInformationInFavorites"),
        prompt: t(
          "AiSuggestions:FilesFavoritesFindInformationInFavoritesPrompt",
        ),
      },
      {
        name: t("AiSuggestions:FilesFavoritesCompareFavoriteFiles"),
        prompt: t("AiSuggestions:FilesFavoritesCompareFavoriteFilesPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFavoritesCopyToAFolder"),
        prompt: t("AiSuggestions:FilesFavoritesCopyToAFolderPrompt"),
      },
    ],

    // +
    filesTrash: [
      {
        name: t("AiSuggestions:FilesTrashWhatSInTrash"),
        prompt: t("AiSuggestions:FilesTrashWhatSInTrashPrompt"),
      },
      {
        name: t("AiSuggestions:FilesTrashFindADeletedFile"),
        prompt: t("AiSuggestions:FilesTrashFindADeletedFilePrompt"),
      },
      {
        name: t("AiSuggestions:FilesTrashRestoreSelectedItems"),
        prompt: t("AiSuggestions:FilesTrashRestoreSelectedItemsPrompt"),
      },
      {
        name: t("AiSuggestions:FilesTrashWhatCanBeDeletedPermanently"),
        prompt: t("AiSuggestions:FilesTrashWhatCanBeDeletedPermanentlyPrompt"),
      },
      {
        name: t("AiSuggestions:FilesTrashEmptyTrash"),
        prompt: t("AiSuggestions:FilesTrashEmptyTrashPrompt"),
      },
    ],

    // +
    filesFolder: [
      {
        name: t("AiSuggestions:FilesFolderSummarizeThisFolder"),
        prompt: t("AiSuggestions:FilesFolderSummarizeThisFolderPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFolderCreateASubfolder"),
        prompt: t("AiSuggestions:FilesFolderCreateASubfolderPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFolderRenameFolder"),
        prompt: t("AiSuggestions:FilesFolderRenameFolderPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFolderOrganizeThisFolder"),
        prompt: t("AiSuggestions:FilesFolderOrganizeThisFolderPrompt"),
      },
      {
        name: t("AiSuggestions:FilesFolderFindEmptyFolders"),
        prompt: t("AiSuggestions:FilesFolderFindEmptyFoldersPrompt"),
      },
    ],

    filesSelectedFile: [
      {
        name: t("AiSuggestions:FilesSelectedFileSummarizeFile"),
        prompt: t("AiSuggestions:FilesSelectedFileSummarizeFilePrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileExtractMainPoints"),
        prompt: t("AiSuggestions:FilesSelectedFileExtractMainPointsPrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileFindTasksAndDeadlines"),
        prompt: t("AiSuggestions:FilesSelectedFileFindTasksAndDeadlinesPrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileFixGrammar"),
        prompt: t("AiSuggestions:FilesSelectedFileFixGrammarPrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileMakeTextMoreFormal"),
        prompt: t("AiSuggestions:FilesSelectedFileMakeTextMoreFormalPrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileConvertToATable"),
        prompt: t("AiSuggestions:FilesSelectedFileConvertToATablePrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileConvertFile"),
        prompt: t("AiSuggestions:FilesSelectedFileConvertFilePrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileFindTextInTheDocument"),
        prompt: t("AiSuggestions:FilesSelectedFileFindTextInTheDocumentPrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileShowFileDetails"),
        prompt: t("AiSuggestions:FilesSelectedFileShowFileDetailsPrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileRenameFile"),
        prompt: t("AiSuggestions:FilesSelectedFileRenameFilePrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileMoveFile"),
        prompt: t("AiSuggestions:FilesSelectedFileMoveFilePrompt"),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileDeleteFile"),
        prompt: t("AiSuggestions:FilesSelectedFileDeleteFilePrompt"),
      },
      {
        name: t(
          "AiSuggestions:FilesSelectedFileCreateAPresentationFromTheFile",
        ),
        prompt: t(
          "AiSuggestions:FilesSelectedFileCreateAPresentationFromTheFilePrompt",
        ),
      },
      {
        name: t("AiSuggestions:FilesSelectedFileTranslateAndSaveACopy"),
        prompt: t("AiSuggestions:FilesSelectedFileTranslateAndSaveACopyPrompt"),
      },
    ],

    filesMultiple: [
      {
        name: t("AiSuggestions:FilesMultipleCreateAPresentation"),
        prompt: t("AiSuggestions:FilesMultipleCreateAPresentationPrompt"),
      },
      {
        name: t("AiSuggestions:FilesMultipleCreateACombinedReport"),
        prompt: t("AiSuggestions:FilesMultipleCreateACombinedReportPrompt"),
      },
      {
        name: t("AiSuggestions:FilesMultipleCollectDataIntoATable"),
        prompt: t("AiSuggestions:FilesMultipleCollectDataIntoATablePrompt"),
      },
      {
        name: t("AiSuggestions:FilesMultipleCompareSelectedFiles"),
        prompt: t("AiSuggestions:FilesMultipleCompareSelectedFilesPrompt"),
      },
      {
        name: t("AiSuggestions:FilesMultipleCreateACombinedSummary"),
        prompt: t("AiSuggestions:FilesMultipleCreateACombinedSummaryPrompt"),
      },
      {
        name: t("AiSuggestions:FilesMultipleFindContradictions"),
        prompt: t("AiSuggestions:FilesMultipleFindContradictionsPrompt"),
      },
      {
        name: t("AiSuggestions:FilesMultiplePrepareForAMeeting"),
        prompt: t("AiSuggestions:FilesMultiplePrepareForAMeetingPrompt"),
      },
      {
        name: t("AiSuggestions:FilesMultipleCreateAnActionPlan"),
        prompt: t("AiSuggestions:FilesMultipleCreateAnActionPlanPrompt"),
      },
      {
        name: t("AiSuggestions:FilesMultipleConvertSelectedFiles"),
        prompt: t("AiSuggestions:FilesMultipleConvertSelectedFilesPrompt"),
      },
    ],

    // +
    rooms: [
      {
        name: t("AiSuggestions:RoomsFindARoom"),
        prompt: t("AiSuggestions:RoomsFindARoomPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsFindRoomsByParticipant"),
        prompt: t("AiSuggestions:RoomsFindRoomsByParticipantPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsFindARoomByFile"),
        prompt: t("AiSuggestions:RoomsFindARoomByFilePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsReviewRoomAccess"),
        prompt: t("AiSuggestions:RoomsReviewRoomAccessPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsShowRoomsIManage"),
        prompt: t("AiSuggestions:RoomsShowRoomsIManagePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsShowRoomsWithExternalAccess"),
        prompt: t("AiSuggestions:RoomsShowRoomsWithExternalAccessPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsHelpMeChooseARoomType"),
        prompt: t("AiSuggestions:RoomsHelpMeChooseARoomTypePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsSuggestRoomsToArchive"),
        prompt: t("AiSuggestions:RoomsSuggestRoomsToArchivePrompt"),
        requires: "roomAdmin",
      },
    ],

    // +
    roomsRecent: [
      {
        name: t("AiSuggestions:RoomsRecentSummarizeRecentRooms"),
        prompt: t("AiSuggestions:RoomsRecentSummarizeRecentRoomsPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsRecentWhereMyActionIsNeeded"),
        prompt: t("AiSuggestions:RoomsRecentWhereMyActionIsNeededPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsRecentReviewAccessInRecentRooms"),
        prompt: t("AiSuggestions:RoomsRecentReviewAccessInRecentRoomsPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsRecentArchiveInactiveRooms"),
        prompt: t("AiSuggestions:RoomsRecentArchiveInactiveRoomsPrompt"),
        requires: "roomAdmin",
      },
    ],

    // +
    roomsFavorites: [
      {
        name: t("AiSuggestions:RoomsFavoritesSummarizeFavoriteRooms"),
        prompt: t("AiSuggestions:RoomsFavoritesSummarizeFavoriteRoomsPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsFavoritesFindAFavoriteRoom"),
        prompt: t("AiSuggestions:RoomsFavoritesFindAFavoriteRoomPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsFavoritesArchiveSelectedRooms"),
        prompt: t("AiSuggestions:RoomsFavoritesArchiveSelectedRoomsPrompt"),
        requires: "roomAdmin",
      },
    ],

    // +
    roomsTemplates: [
      {
        name: t("AiSuggestions:RoomsTemplatesRecommendARoomTemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesRecommendARoomTemplatePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTemplatesCreateARoomFromATemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesCreateARoomFromATemplatePrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsTemplatesExplainThisTemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesExplainThisTemplatePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTemplatesUpdateTemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesUpdateTemplatePrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsTemplatesSaveAsTemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesSaveAsTemplatePrompt"),
        requires: "roomAdmin",
      },
    ],

    // +
    roomsArchive: [
      {
        name: t("AiSuggestions:RoomsArchiveShowRoomArchive"),
        prompt: t("AiSuggestions:RoomsArchiveShowRoomArchivePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsArchiveFindARoomInTheArchive"),
        prompt: t("AiSuggestions:RoomsArchiveFindARoomInTheArchivePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsArchiveRestoreARoomFromTheArchive"),
        prompt: t("AiSuggestions:RoomsArchiveRestoreARoomFromTheArchivePrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsArchiveDeleteAnArchivedRoom"),
        prompt: t("AiSuggestions:RoomsArchiveDeleteAnArchivedRoomPrompt"),
        requires: "roomAdmin",
      },
    ],

    // +
    roomsTrash: [
      {
        name: t("AiSuggestions:RoomsTrashWhatSDeleted"),
        prompt: t("AiSuggestions:RoomsTrashWhatSDeletedPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsTrashFindADeletedFileOrFolder"),
        prompt: t("AiSuggestions:RoomsTrashFindADeletedFileOrFolderPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsTrashRestoreARoom"),
        prompt: t("AiSuggestions:RoomsTrashRestoreARoomPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomsTrashDeletePermanently"),
        prompt: t("AiSuggestions:RoomsTrashDeletePermanentlyPrompt"),
        requires: "roomAdmin",
      },
    ],

    insideRoom: [
      {
        name: t("AiSuggestions:InsideRoomSummarizeRoom"),
        prompt: t("AiSuggestions:InsideRoomSummarizeRoomPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomSummarizeRoomFiles"),
        prompt: t("AiSuggestions:InsideRoomSummarizeRoomFilesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomFindTasksAndDeadlines"),
        prompt: t("AiSuggestions:InsideRoomFindTasksAndDeadlinesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomFindImportantFiles"),
        prompt: t("AiSuggestions:InsideRoomFindImportantFilesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomCreateAFolderInTheRoom"),
        prompt: t("AiSuggestions:InsideRoomCreateAFolderInTheRoomPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomUploadFilesToTheRoom"),
        prompt: t("AiSuggestions:InsideRoomUploadFilesToTheRoomPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomOrganizeContent"),
        prompt: t("AiSuggestions:InsideRoomOrganizeContentPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomFindADocument"),
        prompt: t("AiSuggestions:InsideRoomFindADocumentPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomShowRoomInfo"),
        prompt: t("AiSuggestions:InsideRoomShowRoomInfoPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomArchiveRoom"),
        prompt: t("AiSuggestions:InsideRoomArchiveRoomPrompt"),
        requires: "move",
      },
      {
        name: t("AiSuggestions:InsideRoomShowParticipantsAndRoles"),
        prompt: t("AiSuggestions:InsideRoomShowParticipantsAndRolesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomInviteParticipants"),
        prompt: t("AiSuggestions:InsideRoomInviteParticipantsPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:InsideRoomCheckExcessivePermissions"),
        prompt: t("AiSuggestions:InsideRoomCheckExcessivePermissionsPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:InsideRoomFindExternalAccess"),
        prompt: t("AiSuggestions:InsideRoomFindExternalAccessPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:InsideRoomChangeNameAndTags"),
        prompt: t("AiSuggestions:InsideRoomChangeNameAndTagsPrompt"),
        requires: "editRoom",
      },
      {
        name: t("AiSuggestions:InsideRoomUpdateRoomAvatar"),
        prompt: t("AiSuggestions:InsideRoomUpdateRoomAvatarPrompt"),
        requires: "editRoom",
      },
      {
        name: t("AiSuggestions:InsideRoomChangeParticipantRoles"),
        prompt: t("AiSuggestions:InsideRoomChangeParticipantRolesPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:InsideRoomRemoveAParticipant"),
        prompt: t("AiSuggestions:InsideRoomRemoveAParticipantPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:InsideRoomExplainCurrentPermissions"),
        prompt: t("AiSuggestions:InsideRoomExplainCurrentPermissionsPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomCheckRoleAlignment"),
        prompt: t("AiSuggestions:InsideRoomCheckRoleAlignmentPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:InsideRoomSuggestARoomStructure"),
        prompt: t("AiSuggestions:InsideRoomSuggestARoomStructurePrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomCreateAPresentationFromTheRoom"),
        prompt: t(
          "AiSuggestions:InsideRoomCreateAPresentationFromTheRoomPrompt",
        ),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomCreateAReportFromTheRoom"),
        prompt: t("AiSuggestions:InsideRoomCreateAReportFromTheRoomPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomCollectRoomDataIntoATable"),
        prompt: t("AiSuggestions:InsideRoomCollectRoomDataIntoATablePrompt"),
        requires: "create",
      },
    ],

    // AI room — a content-oriented subset of `insideRoom`: analysis and
    // authoring over the room's files, plus the few structural actions that
    // still make sense. Role/permission/branding management is intentionally
    // left out — it is not what the room is used for.
    aiRoom: [
      {
        name: t("AiSuggestions:InsideRoomSummarizeRoom"),
        prompt: t("AiSuggestions:InsideRoomSummarizeRoomPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomSummarizeRoomFiles"),
        prompt: t("AiSuggestions:InsideRoomSummarizeRoomFilesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomFindADocument"),
        prompt: t("AiSuggestions:InsideRoomFindADocumentPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomFindImportantFiles"),
        prompt: t("AiSuggestions:InsideRoomFindImportantFilesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomFindTasksAndDeadlines"),
        prompt: t("AiSuggestions:InsideRoomFindTasksAndDeadlinesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomCollectRoomDataIntoATable"),
        prompt: t("AiSuggestions:InsideRoomCollectRoomDataIntoATablePrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomCreateAReportFromTheRoom"),
        prompt: t("AiSuggestions:InsideRoomCreateAReportFromTheRoomPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomCreateAPresentationFromTheRoom"),
        prompt: t(
          "AiSuggestions:InsideRoomCreateAPresentationFromTheRoomPrompt",
        ),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomUploadFilesToTheRoom"),
        prompt: t("AiSuggestions:InsideRoomUploadFilesToTheRoomPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomOrganizeContent"),
        prompt: t("AiSuggestions:InsideRoomOrganizeContentPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:InsideRoomShowRoomInfo"),
        prompt: t("AiSuggestions:InsideRoomShowRoomInfoPrompt"),
      },
    ],

    // +
    collaborationRoom: [
      {
        name: t("AiSuggestions:CollaborationRoomFindUnansweredQuestions"),
        prompt: t(
          "AiSuggestions:CollaborationRoomFindUnansweredQuestionsPrompt",
        ),
      },
      {
        name: t("AiSuggestions:CollaborationRoomPrepareForAMeeting"),
        prompt: t("AiSuggestions:CollaborationRoomPrepareForAMeetingPrompt"),
      },
      {
        name: t("AiSuggestions:CollaborationRoomShowParticipantsAndRoles"),
        prompt: t(
          "AiSuggestions:CollaborationRoomShowParticipantsAndRolesPrompt",
        ),
      },
      {
        name: t("AiSuggestions:CollaborationRoomInviteParticipants"),
        prompt: t("AiSuggestions:CollaborationRoomInviteParticipantsPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:CollaborationRoomCreateAFileForTheRoom"),
        prompt: t("AiSuggestions:CollaborationRoomCreateAFileForTheRoomPrompt"),
        requires: "create",
      },
    ],

    // +
    vdrRoom: [
      {
        name: t("AiSuggestions:VdrRoomBuildADocumentIndex"),
        prompt: t("AiSuggestions:VdrRoomBuildADocumentIndexPrompt"),
      },
      {
        name: t("AiSuggestions:VdrRoomReviewVDRAccess"),
        prompt: t("AiSuggestions:VdrRoomReviewVDRAccessPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:VdrRoomFindSensitiveData"),
        prompt: t("AiSuggestions:VdrRoomFindSensitiveDataPrompt"),
      },
      {
        name: t("AiSuggestions:VdrRoomWhatDocumentsAreMissing"),
        prompt: t("AiSuggestions:VdrRoomWhatDocumentsAreMissingPrompt"),
      },
      {
        name: t("AiSuggestions:VdrRoomOrganizeVDRDocuments"),
        prompt: t("AiSuggestions:VdrRoomOrganizeVDRDocumentsPrompt"),
        requires: "create",
      },
    ],

    // +
    publicRoom: [
      {
        name: t("AiSuggestions:PublicRoomPrepareAPublicSummary"),
        prompt: t("AiSuggestions:PublicRoomPrepareAPublicSummaryPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:PublicRoomReviewBeforePublishing"),
        prompt: t("AiSuggestions:PublicRoomReviewBeforePublishingPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:PublicRoomReviewPublicAccess"),
        prompt: t("AiSuggestions:PublicRoomReviewPublicAccessPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:PublicRoomFindOutdatedContent"),
        prompt: t("AiSuggestions:PublicRoomFindOutdatedContentPrompt"),
        requires: "create",
      },
    ],

    // +
    roomTemplate: [
      {
        name: t("AiSuggestions:RoomTemplateExplainTemplateStructure"),
        prompt: t("AiSuggestions:RoomTemplateExplainTemplateStructurePrompt"),
      },
      {
        name: t("AiSuggestions:RoomTemplateShowTemplateRoles"),
        prompt: t("AiSuggestions:RoomTemplateShowTemplateRolesPrompt"),
      },
      {
        name: t("AiSuggestions:RoomTemplateCreateARoomFromThisTemplate"),
        prompt: t(
          "AiSuggestions:RoomTemplateCreateARoomFromThisTemplatePrompt",
        ),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:RoomTemplateImproveTemplate"),
        prompt: t("AiSuggestions:RoomTemplateImproveTemplatePrompt"),
        requires: "editRoom",
      },
    ],

    // +
    forms: [
      {
        name: t("AiSuggestions:FormsCreateAFormSpace"),
        prompt: t("AiSuggestions:FormsCreateAFormSpacePrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsStartFromAFormTemplate"),
        prompt: t("AiSuggestions:FormsStartFromAFormTemplatePrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsRecommendAFormForTheTask"),
        prompt: t("AiSuggestions:FormsRecommendAFormForTheTaskPrompt"),
      },
      {
        name: t("AiSuggestions:FormsCreateAFormWithAI"),
        prompt: t("AiSuggestions:FormsCreateAFormWithAIPrompt"),
        requires: "contentCreator",
      },
      {
        name: t("AiSuggestions:FormsConvertAFileIntoAForm"),
        prompt: t("AiSuggestions:FormsConvertAFileIntoAFormPrompt"),
        requires: "contentCreator",
      },
      {
        name: t("AiSuggestions:FormsWhichCollectionsNeedAttention"),
        prompt: t("AiSuggestions:FormsWhichCollectionsNeedAttentionPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsReviewFormsAccess"),
        prompt: t("AiSuggestions:FormsReviewFormsAccessPrompt"),
        requires: "roomAdmin",
      },
    ],

    // +
    formsRecent: [
      {
        name: t("AiSuggestions:FormsRecentSummarizeRecentSpaces"),
        prompt: t("AiSuggestions:FormsRecentSummarizeRecentSpacesPrompt"),
      },
      {
        name: t("AiSuggestions:FormsRecentRecentResults"),
        prompt: t("AiSuggestions:FormsRecentRecentResultsPrompt"),
      },
      {
        name: t("AiSuggestions:FormsRecentWhereActionIsNeeded"),
        prompt: t("AiSuggestions:FormsRecentWhereActionIsNeededPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsRecentContinueFormSetup"),
        prompt: t("AiSuggestions:FormsRecentContinueFormSetupPrompt"),
        requires: "contentCreator",
      },
    ],

    // +
    formsFavorites: [
      {
        name: t("AiSuggestions:FormsFavoritesSummarizeFavoriteSpaces"),
        prompt: t("AiSuggestions:FormsFavoritesSummarizeFavoriteSpacesPrompt"),
      },
      {
        name: t("AiSuggestions:FormsFavoritesCompareFavoriteSpaces"),
        prompt: t("AiSuggestions:FormsFavoritesCompareFavoriteSpacesPrompt"),
      },
      {
        name: t("AiSuggestions:FormsFavoritesCreateASimilarSpace"),
        prompt: t("AiSuggestions:FormsFavoritesCreateASimilarSpacePrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsFavoritesFindTheFormYouNeed"),
        prompt: t("AiSuggestions:FormsFavoritesFindTheFormYouNeedPrompt"),
      },
    ],

    // +
    formsTemplates: [
      {
        name: t("AiSuggestions:FormsTemplatesRecommendAFormTemplate"),
        prompt: t("AiSuggestions:FormsTemplatesRecommendAFormTemplatePrompt"),
      },
      {
        name: t("AiSuggestions:FormsTemplatesCreateASpaceFromATemplate"),
        prompt: t(
          "AiSuggestions:FormsTemplatesCreateASpaceFromATemplatePrompt",
        ),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsTemplatesAdaptTheTemplateToTheTask"),
        prompt: t(
          "AiSuggestions:FormsTemplatesAdaptTheTemplateToTheTaskPrompt",
        ),
        requires: "contentCreator",
      },
      {
        name: t("AiSuggestions:FormsTemplatesShowTemplateFields"),
        prompt: t("AiSuggestions:FormsTemplatesShowTemplateFieldsPrompt"),
      },
      {
        name: t("AiSuggestions:FormsTemplatesSaveAsTemplate"),
        prompt: t("AiSuggestions:FormsTemplatesSaveAsTemplatePrompt"),
        requires: "roomAdmin",
      },
    ],

    // +
    formsTrash: [
      {
        name: t("AiSuggestions:FormsTrashWhatSDeleted"),
        prompt: t("AiSuggestions:FormsTrashWhatSDeletedPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsTrashFindADeletedForm"),
        prompt: t("AiSuggestions:FormsTrashFindADeletedFormPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsTrashRestoreSelectedItems"),
        prompt: t("AiSuggestions:FormsTrashRestoreSelectedItemsPrompt"),
        requires: "roomAdmin",
      },
      {
        name: t("AiSuggestions:FormsTrashDeletePermanently"),
        prompt: t("AiSuggestions:FormsTrashDeletePermanentlyPrompt"),
        requires: "roomAdmin",
      },
    ],

    // +
    formSpace: [
      {
        name: t("AiSuggestions:FormSpaceSummarizeSpace"),
        prompt: t("AiSuggestions:FormSpaceSummarizeSpacePrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceCreateAFormWithAI"),
        prompt: t("AiSuggestions:FormSpaceCreateAFormWithAIPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:FormSpaceCreateABlankForm"),
        prompt: t("AiSuggestions:FormSpaceCreateABlankFormPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:FormSpaceConvertAFileIntoAForm"),
        prompt: t("AiSuggestions:FormSpaceConvertAFileIntoAFormPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:FormSpaceAddAFormFromTheGallery"),
        prompt: t("AiSuggestions:FormSpaceAddAFormFromTheGalleryPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:FormSpaceInviteParticipants"),
        prompt: t("AiSuggestions:FormSpaceInviteParticipantsPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:FormSpaceReviewAccessPermissions"),
        prompt: t("AiSuggestions:FormSpaceReviewAccessPermissionsPrompt"),
        requires: "editAccess",
      },
      {
        name: t("AiSuggestions:FormSpaceOrganizeForms"),
        prompt: t("AiSuggestions:FormSpaceOrganizeFormsPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:FormSpaceStartCollectingResponses"),
        prompt: t("AiSuggestions:FormSpaceStartCollectingResponsesPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:FormSpaceChangeNameAndTags"),
        prompt: t("AiSuggestions:FormSpaceChangeNameAndTagsPrompt"),
        requires: "editRoom",
      },
    ],

    // +
    formSpaceInProgress: [
      {
        name: t("AiSuggestions:FormSpaceInProgressShowCompletionStatus"),
        prompt: t(
          "AiSuggestions:FormSpaceInProgressShowCompletionStatusPrompt",
        ),
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressWhoHasnTCompleted"),
        prompt: t("AiSuggestions:FormSpaceInProgressWhoHasnTCompletedPrompt"),
        requires: "editRoom",
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressFindOverdueResponses"),
        prompt: t(
          "AiSuggestions:FormSpaceInProgressFindOverdueResponsesPrompt",
        ),
        requires: "editRoom",
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressShowCurrentStage"),
        prompt: t("AiSuggestions:FormSpaceInProgressShowCurrentStagePrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressFindBottlenecks"),
        prompt: t("AiSuggestions:FormSpaceInProgressFindBottlenecksPrompt"),
        requires: "editRoom",
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressPrepareAReminderList"),
        prompt: t(
          "AiSuggestions:FormSpaceInProgressPrepareAReminderListPrompt",
        ),
        requires: "editRoom",
      },
    ],

    // +
    formSpaceResults: [
      {
        name: t("AiSuggestions:FormSpaceResultsSummarizeResults"),
        prompt: t("AiSuggestions:FormSpaceResultsSummarizeResultsPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsShowKeyMetrics"),
        prompt: t("AiSuggestions:FormSpaceResultsShowKeyMetricsPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsFindCommonAnswers"),
        prompt: t("AiSuggestions:FormSpaceResultsFindCommonAnswersPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsCompareGroupsOrPeriods"),
        prompt: t("AiSuggestions:FormSpaceResultsCompareGroupsOrPeriodsPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsShowTrends"),
        prompt: t("AiSuggestions:FormSpaceResultsShowTrendsPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsFindUnusualAnswers"),
        prompt: t("AiSuggestions:FormSpaceResultsFindUnusualAnswersPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsCheckResponseQuality"),
        prompt: t("AiSuggestions:FormSpaceResultsCheckResponseQualityPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsGroupOpenEndedAnswers"),
        prompt: t("AiSuggestions:FormSpaceResultsGroupOpenEndedAnswersPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsCreateAnActionPlan"),
        prompt: t("AiSuggestions:FormSpaceResultsCreateAnActionPlanPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsConvertToATableOrChart"),
        prompt: t("AiSuggestions:FormSpaceResultsConvertToATableOrChartPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsCreateAResultsReport"),
        prompt: t("AiSuggestions:FormSpaceResultsCreateAResultsReportPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:FormSpaceResultsCreateAPresentation"),
        prompt: t("AiSuggestions:FormSpaceResultsCreateAPresentationPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:FormSpaceResultsSaveAnalysisToASpreadsheet"),
        prompt: t(
          "AiSuggestions:FormSpaceResultsSaveAnalysisToASpreadsheetPrompt",
        ),
        requires: "create",
      },
    ],

    default: [],
    // `satisfies` (rather than an annotation) keeps the literal section keys
    // for SuggestionSection while typing `requires` as SuggestionAccess.
  } satisfies Record<string, SuggestionEntry[]>;
};

export type SuggestionSection = keyof ReturnType<
  typeof getSuggestionsBySection
>;

type FolderArea = "files" | "rooms" | "forms";

const folderArea = (
  folderType?: QueryFolderType | null,
): FolderArea | undefined => {
  switch (Number(folderType)) {
    case FolderType.USER:
      return "files";
    case FolderType.EditingRoom:
    case FolderType.VirtualDataRoom:
    case FolderType.PublicRoom:
    case FolderType.CustomRoom:
      return "rooms";
    case FolderType.FormRoom:
      return "forms";
    default:
      return undefined;
  }
};

const VARIANT_SECTIONS: Record<
  FolderArea,
  Partial<Record<FolderType, SuggestionSection>>
> = {
  files: {
    [FolderType.Recent]: "filesRecent",
    [FolderType.Favorites]: "filesFavorites",
    [FolderType.TRASH]: "filesTrash",
  },
  rooms: {
    [FolderType.Recent]: "roomsRecent",
    [FolderType.Favorites]: "roomsFavorites",
    [FolderType.TRASH]: "roomsTrash",
  },
  forms: {
    [FolderType.Recent]: "formsRecent",
    [FolderType.Favorites]: "formsFavorites",
    [FolderType.TRASH]: "formsTrash",
  },
};

const TEMPLATE_SECTIONS: Record<string, SuggestionSection> = {
  FormTemplates: "formsTemplates",
  Templates: "roomsTemplates",
};

const ROOT_SECTIONS: Partial<Record<FolderType, SuggestionSection>> = {
  [FolderType.USER]: "files",
  [FolderType.SHARE]: "sharedWithMe",
  [FolderType.Rooms]: "rooms",
  [FolderType.Archive]: "roomsArchive",
  [FolderType.Forms]: "forms",
};

const rootFolderSection = (
  folderType?: QueryFolderType | null,
  rootType?: FolderType | null,
  searchArea?: string | null,
): SuggestionSection | undefined => {
  if (isNil(rootType)) return undefined;

  switch (rootType) {
    case FolderType.Recent:
    case FolderType.Favorites:
    case FolderType.TRASH: {
      const area = folderArea(folderType);
      return area ? VARIANT_SECTIONS[area][rootType] : undefined;
    }
    case FolderType.RoomTemplates:
      return searchArea ? TEMPLATE_SECTIONS[searchArea] : undefined;
    default:
      return ROOT_SECTIONS[rootType];
  }
};

const sectionFromRoomType = (
  roomType?: RoomsType | null,
): SuggestionSection => {
  switch (roomType) {
    case RoomsType.EditingRoom:
      return "collaborationRoom";
    case RoomsType.PublicRoom:
      return "publicRoom";
    case RoomsType.VirtualDataRoom:
      return "vdrRoom";
    case RoomsType.FormRoom:
      return "formSpace";
    case RoomsType.AIRoom:
      return "aiRoom";
    // case RoomsType.CustomRoom:
    //   return "insideRoom";
    default:
      return "default";
  }
};

const nestedFolderSection = (
  selectedFolderType?: FolderType | null,
): SuggestionSection => {
  switch (selectedFolderType) {
    case FolderType.Done:
    case FolderType.SubFolderDone:
      return "formSpaceResults";
    case FolderType.InProgress:
    case FolderType.SubFolderInProgress:
      return "formSpaceInProgress";
    default:
      return "filesFolder";
  }
};

export const resolveSuggestionSection = ({
  roomType,
  rootFolderType,
  folderType,
  selectedFolderType,
  isFolder,
  isRootFolder,
  searchArea,
}: SuggestionContext): SuggestionSection => {
  if (isFolder && !isRootFolder && isNil(roomType)) {
    return nestedFolderSection(selectedFolderType);
  }

  if (isRootFolder) {
    return (
      rootFolderSection(folderType, rootFolderType, searchArea) ?? "default"
    );
  }

  return sectionFromRoomType(roomType);
};

export const getSuggestions = (
  context: SuggestionContext,
  t: TTranslation,
): Suggestion[] => {
  const entries: SuggestionEntry[] =
    getSuggestionsBySection(t)[resolveSuggestionSection(context)];

  return entries
    .filter((entry) => hasAccess(entry.requires, context))
    .map(({ name, prompt }) => ({ name, prompt }));
};
