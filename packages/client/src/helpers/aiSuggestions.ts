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

import { FolderType, RoomsType } from "@docspace/shared/enums";
import type { Suggestion } from "@docspace/ui-kit/ai-agent/providers";
import type { TTranslation } from "@docspace/shared/types";

export const getSuggestionsBySection = (t: TTranslation) => {
  return {
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
      },
      {
        name: t("AiSuggestions:RoomsShowRoomsIManage"),
        prompt: t("AiSuggestions:RoomsShowRoomsIManagePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsShowRoomsWithExternalAccess"),
        prompt: t("AiSuggestions:RoomsShowRoomsWithExternalAccessPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsHelpMeChooseARoomType"),
        prompt: t("AiSuggestions:RoomsHelpMeChooseARoomTypePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsSuggestRoomsToArchive"),
        prompt: t("AiSuggestions:RoomsSuggestRoomsToArchivePrompt"),
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
      },
      {
        name: t("AiSuggestions:RoomsRecentArchiveInactiveRooms"),
        prompt: t("AiSuggestions:RoomsRecentArchiveInactiveRoomsPrompt"),
      },
    ],

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
      },
    ],

    roomsTemplates: [
      {
        name: t("AiSuggestions:RoomsTemplatesRecommendARoomTemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesRecommendARoomTemplatePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTemplatesCreateARoomFromATemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesCreateARoomFromATemplatePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTemplatesExplainThisTemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesExplainThisTemplatePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTemplatesUpdateTemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesUpdateTemplatePrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTemplatesSaveAsTemplate"),
        prompt: t("AiSuggestions:RoomsTemplatesSaveAsTemplatePrompt"),
      },
    ],

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
      },
      {
        name: t("AiSuggestions:RoomsArchiveDeleteAnArchivedRoom"),
        prompt: t("AiSuggestions:RoomsArchiveDeleteAnArchivedRoomPrompt"),
      },
    ],

    roomsTrash: [
      {
        name: t("AiSuggestions:RoomsTrashWhatSDeleted"),
        prompt: t("AiSuggestions:RoomsTrashWhatSDeletedPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTrashFindADeletedFileOrFolder"),
        prompt: t("AiSuggestions:RoomsTrashFindADeletedFileOrFolderPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTrashRestoreARoom"),
        prompt: t("AiSuggestions:RoomsTrashRestoreARoomPrompt"),
      },
      {
        name: t("AiSuggestions:RoomsTrashDeletePermanently"),
        prompt: t("AiSuggestions:RoomsTrashDeletePermanentlyPrompt"),
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
      },
      {
        name: t("AiSuggestions:InsideRoomUploadFilesToTheRoom"),
        prompt: t("AiSuggestions:InsideRoomUploadFilesToTheRoomPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomOrganizeContent"),
        prompt: t("AiSuggestions:InsideRoomOrganizeContentPrompt"),
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
      },
      {
        name: t("AiSuggestions:InsideRoomShowParticipantsAndRoles"),
        prompt: t("AiSuggestions:InsideRoomShowParticipantsAndRolesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomInviteParticipants"),
        prompt: t("AiSuggestions:InsideRoomInviteParticipantsPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomCheckExcessivePermissions"),
        prompt: t("AiSuggestions:InsideRoomCheckExcessivePermissionsPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomFindExternalAccess"),
        prompt: t("AiSuggestions:InsideRoomFindExternalAccessPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomChangeNameAndTags"),
        prompt: t("AiSuggestions:InsideRoomChangeNameAndTagsPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomUpdateRoomAvatar"),
        prompt: t("AiSuggestions:InsideRoomUpdateRoomAvatarPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomChangeParticipantRoles"),
        prompt: t("AiSuggestions:InsideRoomChangeParticipantRolesPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomRemoveAParticipant"),
        prompt: t("AiSuggestions:InsideRoomRemoveAParticipantPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomExplainCurrentPermissions"),
        prompt: t("AiSuggestions:InsideRoomExplainCurrentPermissionsPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomCheckRoleAlignment"),
        prompt: t("AiSuggestions:InsideRoomCheckRoleAlignmentPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomSuggestARoomStructure"),
        prompt: t("AiSuggestions:InsideRoomSuggestARoomStructurePrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomCreateAPresentationFromTheRoom"),
        prompt: t(
          "AiSuggestions:InsideRoomCreateAPresentationFromTheRoomPrompt",
        ),
      },
      {
        name: t("AiSuggestions:InsideRoomCreateAReportFromTheRoom"),
        prompt: t("AiSuggestions:InsideRoomCreateAReportFromTheRoomPrompt"),
      },
      {
        name: t("AiSuggestions:InsideRoomCollectRoomDataIntoATable"),
        prompt: t("AiSuggestions:InsideRoomCollectRoomDataIntoATablePrompt"),
      },
    ],

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
      },
      {
        name: t("AiSuggestions:CollaborationRoomCreateAFileForTheRoom"),
        prompt: t("AiSuggestions:CollaborationRoomCreateAFileForTheRoomPrompt"),
      },
    ],

    vdrRoom: [
      {
        name: t("AiSuggestions:VdrRoomBuildADocumentIndex"),
        prompt: t("AiSuggestions:VdrRoomBuildADocumentIndexPrompt"),
      },
      {
        name: t("AiSuggestions:VdrRoomReviewVDRAccess"),
        prompt: t("AiSuggestions:VdrRoomReviewVDRAccessPrompt"),
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
      },
    ],

    publicRoom: [
      {
        name: t("AiSuggestions:PublicRoomPrepareAPublicSummary"),
        prompt: t("AiSuggestions:PublicRoomPrepareAPublicSummaryPrompt"),
      },
      {
        name: t("AiSuggestions:PublicRoomReviewBeforePublishing"),
        prompt: t("AiSuggestions:PublicRoomReviewBeforePublishingPrompt"),
      },
      {
        name: t("AiSuggestions:PublicRoomReviewPublicAccess"),
        prompt: t("AiSuggestions:PublicRoomReviewPublicAccessPrompt"),
      },
      {
        name: t("AiSuggestions:PublicRoomFindOutdatedContent"),
        prompt: t("AiSuggestions:PublicRoomFindOutdatedContentPrompt"),
      },
    ],

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
      },
      {
        name: t("AiSuggestions:RoomTemplateImproveTemplate"),
        prompt: t("AiSuggestions:RoomTemplateImproveTemplatePrompt"),
      },
    ],

    forms: [
      {
        name: t("AiSuggestions:FormsCreateAFormSpace"),
        prompt: t("AiSuggestions:FormsCreateAFormSpacePrompt"),
      },
      {
        name: t("AiSuggestions:FormsStartFromAFormTemplate"),
        prompt: t("AiSuggestions:FormsStartFromAFormTemplatePrompt"),
      },
      {
        name: t("AiSuggestions:FormsRecommendAFormForTheTask"),
        prompt: t("AiSuggestions:FormsRecommendAFormForTheTaskPrompt"),
      },
      {
        name: t("AiSuggestions:FormsCreateAFormWithAI"),
        prompt: t("AiSuggestions:FormsCreateAFormWithAIPrompt"),
      },
      {
        name: t("AiSuggestions:FormsConvertAFileIntoAForm"),
        prompt: t("AiSuggestions:FormsConvertAFileIntoAFormPrompt"),
      },
      {
        name: t("AiSuggestions:FormsWhichCollectionsNeedAttention"),
        prompt: t("AiSuggestions:FormsWhichCollectionsNeedAttentionPrompt"),
      },
      {
        name: t("AiSuggestions:FormsReviewFormsAccess"),
        prompt: t("AiSuggestions:FormsReviewFormsAccessPrompt"),
      },
    ],

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
      },
      {
        name: t("AiSuggestions:FormsRecentContinueFormSetup"),
        prompt: t("AiSuggestions:FormsRecentContinueFormSetupPrompt"),
      },
    ],

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
      },
      {
        name: t("AiSuggestions:FormsFavoritesFindTheFormYouNeed"),
        prompt: t("AiSuggestions:FormsFavoritesFindTheFormYouNeedPrompt"),
      },
    ],

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
      },
      {
        name: t("AiSuggestions:FormsTemplatesAdaptTheTemplateToTheTask"),
        prompt: t(
          "AiSuggestions:FormsTemplatesAdaptTheTemplateToTheTaskPrompt",
        ),
      },
      {
        name: t("AiSuggestions:FormsTemplatesShowTemplateFields"),
        prompt: t("AiSuggestions:FormsTemplatesShowTemplateFieldsPrompt"),
      },
      {
        name: t("AiSuggestions:FormsTemplatesSaveAsTemplate"),
        prompt: t("AiSuggestions:FormsTemplatesSaveAsTemplatePrompt"),
      },
    ],

    formsTrash: [
      {
        name: t("AiSuggestions:FormsTrashWhatSDeleted"),
        prompt: t("AiSuggestions:FormsTrashWhatSDeletedPrompt"),
      },
      {
        name: t("AiSuggestions:FormsTrashFindADeletedForm"),
        prompt: t("AiSuggestions:FormsTrashFindADeletedFormPrompt"),
      },
      {
        name: t("AiSuggestions:FormsTrashRestoreSelectedItems"),
        prompt: t("AiSuggestions:FormsTrashRestoreSelectedItemsPrompt"),
      },
      {
        name: t("AiSuggestions:FormsTrashDeletePermanently"),
        prompt: t("AiSuggestions:FormsTrashDeletePermanentlyPrompt"),
      },
    ],

    formSpace: [
      {
        name: t("AiSuggestions:FormSpaceSummarizeSpace"),
        prompt: t("AiSuggestions:FormSpaceSummarizeSpacePrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceCreateAFormWithAI"),
        prompt: t("AiSuggestions:FormSpaceCreateAFormWithAIPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceCreateABlankForm"),
        prompt: t("AiSuggestions:FormSpaceCreateABlankFormPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceConvertAFileIntoAForm"),
        prompt: t("AiSuggestions:FormSpaceConvertAFileIntoAFormPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceAddAFormFromTheGallery"),
        prompt: t("AiSuggestions:FormSpaceAddAFormFromTheGalleryPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceInviteParticipants"),
        prompt: t("AiSuggestions:FormSpaceInviteParticipantsPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceReviewAccessPermissions"),
        prompt: t("AiSuggestions:FormSpaceReviewAccessPermissionsPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceOrganizeForms"),
        prompt: t("AiSuggestions:FormSpaceOrganizeFormsPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceStartCollectingResponses"),
        prompt: t("AiSuggestions:FormSpaceStartCollectingResponsesPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceChangeNameAndTags"),
        prompt: t("AiSuggestions:FormSpaceChangeNameAndTagsPrompt"),
      },
    ],

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
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressFindOverdueResponses"),
        prompt: t(
          "AiSuggestions:FormSpaceInProgressFindOverdueResponsesPrompt",
        ),
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressShowCurrentStage"),
        prompt: t("AiSuggestions:FormSpaceInProgressShowCurrentStagePrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressFindBottlenecks"),
        prompt: t("AiSuggestions:FormSpaceInProgressFindBottlenecksPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceInProgressPrepareAReminderList"),
        prompt: t(
          "AiSuggestions:FormSpaceInProgressPrepareAReminderListPrompt",
        ),
      },
    ],

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
      },
      {
        name: t("AiSuggestions:FormSpaceResultsCreateAPresentation"),
        prompt: t("AiSuggestions:FormSpaceResultsCreateAPresentationPrompt"),
      },
      {
        name: t("AiSuggestions:FormSpaceResultsSaveAnalysisToASpreadsheet"),
        prompt: t(
          "AiSuggestions:FormSpaceResultsSaveAnalysisToASpreadsheetPrompt",
        ),
      },
    ],
  };
};

export type SuggestionSection = keyof ReturnType<
  typeof getSuggestionsBySection
>;

// Map a folder type to a section, or `undefined` if it isn't a section root.
const sectionFromFolderType = (
  folderType?: FolderType | null,
): SuggestionSection | undefined => {
  switch (folderType) {
    case FolderType.USER:
      return "files";
    case FolderType.SHARE:
      return "sharedWithMe";
    case FolderType.Recent:
      return "filesRecent";
    case FolderType.Favorites:
      return "filesFavorites";
    case FolderType.TRASH:
      return "filesTrash";
    case FolderType.Archive:
      return "roomsArchive";
    case FolderType.Rooms:
      return "rooms";
    default:
      return undefined;
  }
};

// Map a room type to a section, or `undefined` if it isn't a known room type.
const sectionFromRoomType = (
  roomType?: RoomsType | null,
): SuggestionSection | undefined => {
  switch (roomType) {
    case RoomsType.EditingRoom:
      return "collaborationRoom";
    case RoomsType.PublicRoom:
      return "publicRoom";
    case RoomsType.VirtualDataRoom:
      return "vdrRoom";
    case RoomsType.FormRoom:
    case RoomsType.CustomRoom:
    case RoomsType.AIRoom:
      return "insideRoom";
    default:
      return undefined;
  }
};

export type SuggestionContext = {
  roomType?: RoomsType | null;
  folderType?: FolderType | null;
  selectedFolderType?: FolderType | null;
  rootFolderType?: FolderType | null;
};

// Map the host's current context to a suggestion section.
//
// Inside a room the room type picks the section. Otherwise the current folder
// type is tried first (a section root, e.g. My Documents), then
// `rootFolderType` — which stays meaningful when the current folder is a nested
// subfolder whose own type is just `DEFAULT`. Falls back to `files`.
export const resolveSuggestionSection = ({
  roomType,
  folderType,
  rootFolderType,
  selectedFolderType,
}: SuggestionContext): SuggestionSection => {
  const roomSection = sectionFromRoomType(roomType);
  if (roomSection) return roomSection;

  return (
    sectionFromFolderType(selectedFolderType) ??
    sectionFromFolderType(rootFolderType) ??
    "files"
  );
};

// Build the ready-made suggestion chips for the current section. Passed to
// `AiAgentProviders` via the `suggestions` prop.
export const getSuggestions = (
  context: SuggestionContext,
  t: TTranslation,
): Suggestion[] =>
  getSuggestionsBySection(t)[resolveSuggestionSection(context)];
