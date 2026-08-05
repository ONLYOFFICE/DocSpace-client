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
import type {
  Suggestion,
  SuggestionSet,
} from "@docspace/ui-kit/ai-agent/providers";
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
  /**
   * The Overview (dashboard) page. It lives outside the Files/Rooms sections,
   * so no folder context applies — the flag short-circuits the folder-based
   * resolution entirely.
   */
  isOverview?: boolean;
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
  // The base "inside a room" rows. Every room type shows them, and the
  // per-type sections below only add their own rows on top, so the list is
  // kept in one place instead of being repeated four times.
  const insideRoom: SuggestionEntry[] = [
    {
      name: t("AiSuggestions:InsideRoomSummarizeRoom"),
      prompt: t("AiSuggestions:InsideRoomSummarizeRoomPrompt"),
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
      name: t("AiSuggestions:InsideRoomChangeNameAndTags"),
      prompt: t("AiSuggestions:InsideRoomChangeNameAndTagsPrompt"),
      requires: "editRoom",
    },
    {
      name: t("AiSuggestions:InsideRoomSuggestARoomStructure"),
      prompt: t("AiSuggestions:InsideRoomSuggestARoomStructurePrompt"),
      requires: "create",
    },
    {
      name: t("AiSuggestions:InsideRoomCreateAReportFromTheRoom"),
      prompt: t("AiSuggestions:InsideRoomCreateAReportFromTheRoomPrompt"),
      requires: "create",
    },
  ];

  // "Complete and results" is a single section in the spec, so the in-progress
  // and the done folders of a Form Space share one list.
  const formSpaceResults: SuggestionEntry[] = [
    {
      name: t("AiSuggestions:FormSpaceResultsSummarizeResults"),
      prompt: t("AiSuggestions:FormSpaceResultsSummarizeResultsPrompt"),
    },
    {
      name: t("AiSuggestions:FormSpaceResultsCompareGroupsOrPeriods"),
      prompt: t("AiSuggestions:FormSpaceResultsCompareGroupsOrPeriodsPrompt"),
    },
    {
      name: t("AiSuggestions:FormSpaceResultsCreateAResultsReport"),
      prompt: t("AiSuggestions:FormSpaceResultsCreateAResultsReportPrompt"),
      requires: "create",
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
      name: t("AiSuggestions:FormSpaceResultsFindUnusualAnswers"),
      prompt: t("AiSuggestions:FormSpaceResultsFindUnusualAnswersPrompt"),
    },
    {
      name: t("AiSuggestions:FormSpaceResultsConvertToATableOrChart"),
      prompt: t("AiSuggestions:FormSpaceResultsConvertToATableOrChartPrompt"),
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
  ];

  return {
    // The Overview (dashboard) page: "create with AI" starters. The dashboard
    // has no folder context, so every chip targets the user's My documents
    // ("create it in Files"). All rows are for any user — guests never reach
    // them because the chat itself is unavailable to guests.
    overview: [
      {
        name: t("AiSuggestions:OverviewCreateADocumentFromADescription"),
        prompt: t(
          "AiSuggestions:OverviewCreateADocumentFromADescriptionPrompt",
        ),
      },
      {
        name: t("AiSuggestions:OverviewCreateASpreadsheetForMyTask"),
        prompt: t("AiSuggestions:OverviewCreateASpreadsheetForMyTaskPrompt"),
      },
      {
        name: t("AiSuggestions:OverviewCreateAPresentationOnATopic"),
        prompt: t("AiSuggestions:OverviewCreateAPresentationOnATopicPrompt"),
      },
      {
        name: t("AiSuggestions:OverviewPrepareADocumentForPDF"),
        prompt: t("AiSuggestions:OverviewPrepareADocumentForPDFPrompt"),
      },
      {
        name: t("AiSuggestions:OverviewFindATemplateFromTheLibrary"),
        prompt: t("AiSuggestions:OverviewFindATemplateFromTheLibraryPrompt"),
      },
    ],

    // +
    files: [
      {
        name: t("AiSuggestions:FilesShowFileStructure"),
        prompt: t("AiSuggestions:FilesShowFileStructurePrompt"),
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
        name: t("AiSuggestions:FilesSelectedFileFixGrammar"),
        prompt: t("AiSuggestions:FilesSelectedFileFixGrammarPrompt"),
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
        name: t("AiSuggestions:FilesMultipleConvertSelectedFiles"),
        prompt: t("AiSuggestions:FilesMultipleConvertSelectedFilesPrompt"),
      },
    ],

    // +
    rooms: [
      {
        name: t("AiSuggestions:RoomsHelpMeChooseARoomType"),
        prompt: t("AiSuggestions:RoomsHelpMeChooseARoomTypePrompt"),
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
        name: t("AiSuggestions:RoomsShowRoomsIManage"),
        prompt: t("AiSuggestions:RoomsShowRoomsIManagePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsShowRoomsWithExternalAccess"),
        prompt: t("AiSuggestions:RoomsShowRoomsWithExternalAccessPrompt"),
        requires: "roomAdmin",
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

    aiRoom: [
      {
        name: t("AiSuggestions:AiRoomWhatCanIAsk"),
        prompt: t("AiSuggestions:AiRoomWhatCanIAskPrompt"),
      },
      {
        name: t("AiSuggestions:AiRoomSummarizeTheKnowledgeBase"),
        prompt: t("AiSuggestions:AiRoomSummarizeTheKnowledgeBasePrompt"),
      },
      {
        name: t("AiSuggestions:AiRoomShowSourceDocuments"),
        prompt: t("AiSuggestions:AiRoomShowSourceDocumentsPrompt"),
      },
      {
        name: t("AiSuggestions:AiRoomFindADocument"),
        prompt: t("AiSuggestions:AiRoomFindADocumentPrompt"),
      },
      {
        name: t("AiSuggestions:AiRoomFindTasksAndDeadlines"),
        prompt: t("AiSuggestions:AiRoomFindTasksAndDeadlinesPrompt"),
      },
      {
        name: t("AiSuggestions:AiRoomCompareDocuments"),
        prompt: t("AiSuggestions:AiRoomCompareDocumentsPrompt"),
      },
      {
        name: t("AiSuggestions:AiRoomFindContradictions"),
        prompt: t("AiSuggestions:AiRoomFindContradictionsPrompt"),
      },
      {
        name: t("AiSuggestions:AiRoomCreateAReport"),
        prompt: t("AiSuggestions:AiRoomCreateAReportPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:AiRoomCreateAPresentation"),
        prompt: t("AiSuggestions:AiRoomCreateAPresentationPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:AiRoomCollectDataIntoATable"),
        prompt: t("AiSuggestions:AiRoomCollectDataIntoATablePrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:AiRoomTranslateADocument"),
        prompt: t("AiSuggestions:AiRoomTranslateADocumentPrompt"),
        requires: "create",
      },
      {
        name: t("AiSuggestions:AiRoomShowSavedResults"),
        prompt: t("AiSuggestions:AiRoomShowSavedResultsPrompt"),
      },
      {
        name: t("AiSuggestions:AiRoomAddToTheKnowledgeBase"),
        prompt: t("AiSuggestions:AiRoomAddToTheKnowledgeBasePrompt"),
        requires: "create",
      },
    ],

    customRoom: insideRoom,
    // +
    collaborationRoom: insideRoom,

    // +
    vdrRoom: [
      {
        name: t("AiSuggestions:VdrRoomFindSensitiveData"),
        prompt: t("AiSuggestions:VdrRoomFindSensitiveDataPrompt"),
      },
      {
        name: t("AiSuggestions:VdrRoomOrganizeVDRDocuments"),
        prompt: t("AiSuggestions:VdrRoomOrganizeVDRDocumentsPrompt"),
        requires: "create",
      },
      ...insideRoom,
    ],

    // +
    publicRoom: [
      {
        name: t("AiSuggestions:PublicRoomFindOutdatedContent"),
        prompt: t("AiSuggestions:PublicRoomFindOutdatedContentPrompt"),
        requires: "create",
      },
      ...insideRoom,
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
        name: t("AiSuggestions:FormsCreateAFormWithAI"),
        prompt: t("AiSuggestions:FormsCreateAFormWithAIPrompt"),
        requires: "contentCreator",
      },
      {
        name: t("AiSuggestions:FormsConvertAFileIntoAForm"),
        prompt: t("AiSuggestions:FormsConvertAFileIntoAFormPrompt"),
        requires: "contentCreator",
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
    formSpaceInProgress: formSpaceResults,

    // +
    formSpaceResults,

    // Composer attachment the backend flagged as analyzable (a form): the
    // chips act on the attached file itself, so they need no folder rights.
    attachedForm: [
      {
        name: t("AiSuggestions:AiFormAnalyzeTheForm"),
        prompt: t("AiSuggestions:AiFormAnalyzeTheFormPrompt"),
      },
      {
        name: t("AiSuggestions:AiFormShowTheFields"),
        prompt: t("AiSuggestions:AiFormShowTheFieldsPrompt"),
      },
      {
        name: t("AiSuggestions:AiFormWhatIsStillEmpty"),
        prompt: t("AiSuggestions:AiFormWhatIsStillEmptyPrompt"),
      },
      {
        name: t("AiSuggestions:AiFormCheckTheAnswers"),
        prompt: t("AiSuggestions:AiFormCheckTheAnswersPrompt"),
      },
      {
        name: t("AiSuggestions:AiFormSummarizeTheResponses"),
        prompt: t("AiSuggestions:AiFormSummarizeTheResponsesPrompt"),
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
    case RoomsType.CustomRoom:
      return "customRoom";
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
  isOverview,
}: SuggestionContext): SuggestionSection => {
  // The dashboard is not a Files/Rooms section — the selected-folder state is
  // whatever lingered from the previous location, so it must not be consulted.
  if (isOverview) return "overview";

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

const toSuggestions = (
  entries: SuggestionEntry[],
  context: SuggestionContext,
): Suggestion[] =>
  entries
    .filter((entry) => hasAccess(entry.requires, context))
    .map(({ name, prompt }) => ({ name, prompt }));

export const getSuggestions = (
  context: SuggestionContext,
  t: TTranslation,
): Suggestion[] =>
  toSuggestions(
    getSuggestionsBySection(t)[resolveSuggestionSection(context)],
    context,
  );

/**
 * Chips per composer state, for the AI chat provider to choose from: while
 * files are attached in the composer they are what the user is asking about,
 * so the location-based section steps aside. The provider owns the switching
 * — only it sees the attachments store (drag-and-drop, chip removal).
 */
export const getSuggestionSet = (
  context: SuggestionContext,
  t: TTranslation,
): Required<SuggestionSet> => {
  const sections = getSuggestionsBySection(t);

  return {
    default: getSuggestions(context, t),
    singleFile: toSuggestions(sections.filesSelectedFile, context),
    multipleFiles: toSuggestions(sections.filesMultiple, context),
    analyzableForm: toSuggestions(sections.attachedForm, context),
  };
};
