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

import { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { isMobile } from "@docspace/shared/utils";
import { useResolvedFileTitle } from "@docspace/shared/hooks/useResolvedFileTitle";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  FileType,
  RoomsType,
  VectorizationStatus,
} from "@docspace/shared/enums";
import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import PublicRoomBar from "@onlyoffice/apps-ui-kit/components/public-room-bar";
import { TRoom, TRoomLifetime } from "@docspace/shared/api/rooms/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme/themes";

import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";

import FilesStore from "SRC_DIR/store/FilesStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import FilesActionStore from "SRC_DIR/store/FilesActionsStore";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import AvatarEditorDialogStore from "SRC_DIR/store/AvatarEditorDialogStore";

import {
  isSkillFile,
  type TSkillFolder,
} from "@docspace/shared/utils/skillFile";
import type SkillsStore from "SRC_DIR/store/SkillsStore";
import type KnowledgeBasesStore from "SRC_DIR/store/KnowledgeBasesStore";
import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { isAgent } from "SRC_DIR/helpers/aiWorkspace";
import {
  getKnowledgeBaseStatus,
  KNOWLEDGE_BASE_REREAD_MS,
} from "SRC_DIR/store/KnowledgeBasesStore";

import { FormInfo } from "./sub-components/FormInfo";
import SkillIcon, { isSkillSetIconRoom } from "SRC_DIR/components/SkillIcon";

import { SkillSetInfo } from "./sub-components/SkillSetInfo";

import DetailsHelper from "./Details.utils";

import commonStyles from "../../helpers/Common.module.scss";

import styles from "./Details.module.scss";

type DetailsProps = {
  selection: TRoom | TFile | TFolder;

  isArchive: boolean;

  culture?: SettingsStore["culture"];

  createThumbnail?: FilesStore["createThumbnail"];

  getInfoPanelItemIcon?: InfoPanelStore["getInfoPanelItemIcon"];
  openUser?: InfoPanelStore["openUser"];

  isVisitor?: boolean;
  isCollaborator?: boolean;
  isAdmin?: boolean;

  onCreateRoomFromTemplate?: FilesActionStore["onCreateRoomFromTemplate"];

  isDefaultRoomsQuotaSet?: boolean;

  getLogoCoverModel?: DialogsStore["getLogoCoverModel"];

  onChangeFile?: AvatarEditorDialogStore["onChangeFile"];

  roomLifetime?: TRoomLifetime;

  /** The open folder: a skill is told by it, and named after it when it is a skill set. */
  openFolder?: TSkillFolder & { title: string };
  getSkill?: SkillsStore["get"];
  fetchSkill?: SkillsStore["fetch"];
  setEditSkillFile?: DialogsStore["setEditSkillFile"];

  getKnowledgeBase?: KnowledgeBasesStore["get"];
  fetchKnowledgeBase?: KnowledgeBasesStore["fetch"];

  agentSummaries?: AiProjectsStore["tileSummaries"];
  fetchAgentSummary?: AiProjectsStore["fetchTileSummary"];
  agentDefaultModelName?: AiProjectsStore["defaultModelName"];
  fetchAgentDefaultModel?: AiProjectsStore["fetchDefaultModel"];
};

const Details = ({
  selection,
  culture,
  createThumbnail,
  getInfoPanelItemIcon,
  openUser,
  isVisitor,
  isCollaborator,
  isAdmin,
  isArchive,
  isDefaultRoomsQuotaSet,

  getLogoCoverModel,
  onChangeFile,
  roomLifetime,
  onCreateRoomFromTemplate,
  openFolder,
  getSkill,
  fetchSkill,
  setEditSkillFile,
  getKnowledgeBase,
  fetchKnowledgeBase,
  agentSummaries,
  fetchAgentSummary,
  agentDefaultModelName,
  fetchAgentDefaultModel,
}: DetailsProps) => {
  const { t } = useTranslation([
    "InfoPanel",
    "Common",
    "Translations",
    "Files",
  ]);
  const [itemProperties, setItemProperties] = useState<
    ReturnType<DetailsHelper["getPropertyList"]>
  >([]);
  const [isThumbnailError, setIsThumbmailError] = useState(false);

  const onThumbnailError = () => setIsThumbmailError(true);

  // A skill is described by its file's text, which the skills store reads.
  const skillFile = isSkillFile(selection as TFile, openFolder)
    ? (selection as TFile)
    : null;
  const skill = skillFile ? (getSkill?.(skillFile) ?? null) : null;
  const skillName = skill?.name;
  const skillSetTitle =
    skillFile &&
    openFolder?.roomType === RoomsType.InstructionsRoom &&
    String(openFolder.id) === String(skillFile.folderId)
      ? openFolder.title
      : undefined;

  // A saved skill is dropped from the store and read again.
  const hasSkill = !!skill;
  useEffect(() => {
    if (skillFile && !hasSkill) fetchSkill?.(skillFile);
  }, [skillFile, fetchSkill, hasSkill]);

  // How far a knowledge base is indexed is in its files: they are read
  // again each time the base is selected, since indexing ends on its own.
  const knowledgeBaseId =
    "isRoom" in selection &&
    selection.isRoom &&
    selection.roomType === RoomsType.KnowledgeRoom
      ? selection.id
      : null;
  const knowledgeBaseFilesCount =
    knowledgeBaseId !== null && "filesCount" in selection
      ? selection.filesCount
      : undefined;
  const knowledgeStatus =
    knowledgeBaseId !== null
      ? getKnowledgeBaseStatus(
          getKnowledgeBase?.({
            id: knowledgeBaseId,
            filesCount: knowledgeBaseFilesCount,
          }) ?? null,
        )
      : null;

  useEffect(() => {
    if (knowledgeBaseId !== null)
      fetchKnowledgeBase?.(
        { id: knowledgeBaseId, filesCount: knowledgeBaseFilesCount },
        true,
      );
  }, [knowledgeBaseId, knowledgeBaseFilesCount, fetchKnowledgeBase]);

  // ... and while they are being indexed, again every little while.
  const isIndexingBase = knowledgeStatus === VectorizationStatus.InProgress;
  useEffect(() => {
    if (knowledgeBaseId === null || !isIndexingBase) return undefined;
    const timer = setInterval(
      () =>
        fetchKnowledgeBase?.(
          { id: knowledgeBaseId, filesCount: knowledgeBaseFilesCount },
          true,
        ),
      KNOWLEDGE_BASE_REREAD_MS,
    );
    return () => clearInterval(timer);
  }, [
    knowledgeBaseId,
    knowledgeBaseFilesCount,
    isIndexingBase,
    fetchKnowledgeBase,
  ]);

  // An agent of the Files list, or the one whose page is open, comes
  // without its settings in full: its model is what its tile reads. One
  // without a model of its own runs on the portal's chat model.
  const isAIProject = isAgent(selection);
  const agentSettings =
    isAIProject && "aiProject" in selection
      ? (selection.aiProject as
          | { partial?: true; modelUnread?: true }
          | undefined)
      : undefined;
  const agentSummaryId =
    isAIProject &&
    (!agentSettings || agentSettings.partial || agentSettings.modelUnread)
      ? Number(selection.id)
      : null;
  const agentSummary =
    agentSummaryId !== null ? agentSummaries?.[agentSummaryId] : undefined;
  const agentModelName = agentSummary ? agentSummary.model : undefined;

  useEffect(() => {
    if (agentSummaryId !== null) void fetchAgentSummary?.(agentSummaryId);
  }, [agentSummaryId, fetchAgentSummary]);

  useEffect(() => {
    if (isAIProject) void fetchAgentDefaultModel?.();
  }, [isAIProject, fetchAgentDefaultModel]);

  // A file of a knowledge base that could not be indexed says so first.
  const isIndexingFailed =
    !("isRoom" in selection && selection.isRoom) &&
    (selection as { vectorizationStatus?: VectorizationStatus | null })
      .vectorizationStatus === VectorizationStatus.Failed;

  const detailsHelper = new DetailsHelper({
    isCollaborator: isCollaborator!,
    isVisitor: isVisitor!,
    t,
    item: selection,
    openUser: openUser!,
    culture: culture!,
    isDefaultRoomsQuotaSet: isDefaultRoomsQuotaSet!,
    isAdmin: isAdmin!,
    isArchiveFolder: isArchive,
    roomLifetime: roomLifetime!,
    skillSetTitle,
    skillName,
    knowledgeStatus,
    agentModelName,
    agentDefaultModelName,
  });

  const createThumbnailAction = useCallback(async () => {
    const property = detailsHelper.getPropertyList();

    setItemProperties(property);

    if (
      "isFolder" in selection &&
      !selection.isFolder &&
      "thumbnailStatus" in selection &&
      selection.thumbnailStatus === 0 &&
      (selection.fileType === FileType.Image ||
        selection.fileType === FileType.Spreadsheet ||
        selection.fileType === FileType.Presentation ||
        selection.fileType === FileType.Document)
    ) {
      // createThumbnail expects a TFile but has always been
      // given the id here — its guards then bail out (file.id undefined);
      // erased cast preserves that no-op behavior.
      await createThumbnail?.(selection.id as unknown as TFile);
    }
  }, [
    selection,
    skillName,
    skillSetTitle,
    knowledgeStatus,
    agentModelName,
    agentDefaultModelName,
  ]);

  const onChangeFileContext = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFile?.(e, t);
  };

  const onCreateRoom = () => {
    onCreateRoomFromTemplate?.(selection);
  };

  useEffect(() => {
    createThumbnailAction();
  }, [selection, createThumbnailAction]);

  const currentIcon =
    "logo" in selection && selection?.logo?.large
      ? selection?.logo?.large
      : "logo" in selection && selection?.logo?.cover
        ? selection?.logo
        : getInfoPanelItemIcon?.(selection, 96);

  // isExternalShareRestricted/hasExternalLinks are intentionally omitted: the alert badge is
  // suppressed anyway by withEditing=true (EditRoom) via RoomIcon's badge render condition.
  const badgeUrl =
    "external" in selection ? getRoomBadgeUrl(selection, 24) : undefined;

  const badgeIconColor =
    "private" in selection && selection.private === true
      ? globalColors.lightStatusPositive
      : undefined;

  const isLoadedRoomIcon =
    "logo" in selection && !!(selection.logo?.cover || selection.logo?.large);

  const showDefaultRoomIcon =
    "isRoom" in selection && (selection.isRoom as boolean)
      ? !isLoadedRoomIcon
      : false;

  const hasImage = "logo" in selection && selection?.logo?.original;
  const model = getLogoCoverModel?.(t, hasImage);

  const tooltipContent =
    "external" in selection && selection?.external
      ? t("Files:RecentlyOpenedTooltip")
      : null;

  const isTemplate =
    selection &&
    "isTemplate" in selection &&
    selection.isTemplate &&
    "isRoom" in selection &&
    selection.isRoom;

  const isFormSpaceTemplate =
    "roomType" in selection && selection.roomType === RoomsType.FormRoom;

  const color = "logo" in selection ? selection.logo?.color : undefined;
  const resolvedTitle = useResolvedFileTitle(
    selection as { id?: number | string; title?: string; encrypted?: boolean },
  );
  const title =
    "title" in selection ? resolvedTitle || selection.title : "";

  return (
    <>
      {isTemplate ? (
        <div className={styles.publicRoomBar}>
          <PublicRoomBar
            className={styles.roomTemplateBar}
            headerText={t("Files:RoomTemplate")}
            iconName={FormReactSvgUrl}
            bodyText={
              <>
                <Text
                  fontSize="12px"
                  fontWeight={400}
                  className={styles.roomTemplateText}
                >
                  {t("Files:RoomTemplateDescription")}
                </Text>
                <Button
                  label={
                    isFormSpaceTemplate
                      ? t("Common:CreateFormSpaceAction")
                      : t("Common:CreateRoom")
                  }
                  className={styles.roomTemplateButton}
                  onClick={onCreateRoom}
                  size={ButtonSize.extraSmall}
                  primary
                  testId="info_panel_details_create_room_button"
                />
              </>
            }
          />
        </div>
      ) : "thumbnailUrl" in selection &&
        selection?.thumbnailUrl &&
        !isThumbnailError ? (
        <div
          className={classNames(styles.thumbnail, {
            [styles.isImageOrMedia]:
              "viewAccessibility" in selection &&
              (selection?.viewAccessibility?.ImageView ||
                selection?.viewAccessibility?.MediaView),
          })}
        >
          <img
            src={`${selection.thumbnailUrl}&size=3840x2160`}
            alt="thumbnail-image"
            onError={onThumbnailError}
          />
        </div>
      ) : (
        <div className={styles.noThumbnail}>
          {skillFile || isSkillSetIconRoom(selection as never) ? (
            <SkillIcon kind={skillFile ? "skill" : "set"} size={96} />
          ) : (
            <RoomIcon
              color={color}
              title={title}
              isArchive={isArchive}
              size="96px"
              radius="16px"
              // isRoom={"isRoom" in selection ? selection.isRoom : false}
              showDefault={showDefaultRoomIcon}
              imgClassName={`no-thumbnail-img ${"isRoom" in selection && selection.isRoom && styles.isRoom} ${
                "logo" in selection &&
                !isArchive &&
                selection.logo?.large &&
                styles.customLogo
              }`}
              logo={currentIcon}
              model={model}
              dropDownManualX={isMobile() ? "-30px" : "-10px"}
              onChangeFile={onChangeFileContext}
              badgeUrl={badgeUrl ?? undefined}
              badgeIconColor={badgeIconColor}
              tooltipContent={tooltipContent ?? undefined}
              tooltipId="info-panel-details_icon-tooltip"
              // When EditRoom is true, RoomIcon hides the badge in favour of the edit affordance.
              // An AI project changes its logo in its own edit dialog: the
              // room cover flow here would save it as a room's.
              withEditing={
                "isRoom" in selection && selection.isRoom && !isAIProject
                  ? Boolean(selection.security?.EditRoom)
                  : false
              }
              dataTestId="info_panel_details_room_icon"
            />
          )}
        </div>
      )}
      {isIndexingFailed ? (
        <Text
          as="div"
          fontSize="13px"
          lineHeight="20px"
          className={styles.indexingError}
          dataTestId="info_panel_details_indexing_error"
        >
          {t("Common:PreparationForAIFailedInfo")}
        </Text>
      ) : null}
      {skill?.description ? (
        <>
          <div className={commonStyles.subtitle}>
            <Text fontWeight="600" fontSize="14px">
              {t("Common:DescriptionLabel")}
            </Text>
          </div>
          <Text
            fontSize="13px"
            className={styles.skillDescription}
            dataTestId="info_panel_details_skill_description"
          >
            {skill.description}
          </Text>
        </>
      ) : null}
      <div className={commonStyles.subtitle}>
        <Text fontWeight="600" fontSize="14px">
          {t("Common:Properties")}
        </Text>
      </div>
      <div className={commonStyles.properties}>
        {itemProperties.map((property) => {
          return (
            <div
              id={property.id}
              key={property.title}
              className={`property ${property.className}`}
            >
              <Text className="property-title">{property.title}</Text>
              {property.content}
            </div>
          );
        })}
      </div>
      <FormInfo selection={selection} />
      {skillFile ? (
        <Button
          label={t("Common:ViewInstructions")}
          size={ButtonSize.small}
          scale
          onClick={() => setEditSkillFile?.(skillFile, true)}
          testId="info_panel_details_view_instructions_button"
        />
      ) : null}
      <SkillSetInfo selection={selection} />
    </>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    filesActionsStore,
    infoPanelStore,
    userStore,
    currentQuotaStore,
    dialogsStore,
    avatarEditorDialogStore,
    selectedFolderStore,
    skillsStore,
    knowledgeBasesStore,
    aiProjectsStore,
  }: TStore) => {
    const { getInfoPanelItemIcon, openUser, infoPanelRoomSelection } =
      infoPanelStore;

    const { createThumbnail } = filesStore;
    const { culture } = settingsStore;
    const { user } = userStore;

    const { onCreateRoomFromTemplate } = filesActionsStore;

    const isVisitor = user?.isVisitor;
    const isCollaborator = user?.isCollaborator;
    const isAdmin = user?.isAdmin;

    const { isDefaultRoomsQuotaSet } = currentQuotaStore;

    return {
      openFolder: {
        id: selectedFolderStore.id,
        roomType: selectedFolderStore.roomType,
        parentRoomType: selectedFolderStore.parentRoomType,
        title: selectedFolderStore.title,
      },
      getSkill: skillsStore.get,
      getKnowledgeBase: knowledgeBasesStore.get,
      fetchKnowledgeBase: knowledgeBasesStore.fetch,
      agentSummaries: aiProjectsStore.tileSummaries,
      fetchAgentSummary: aiProjectsStore.fetchTileSummary,
      agentDefaultModelName: aiProjectsStore.defaultModelName,
      fetchAgentDefaultModel: aiProjectsStore.fetchDefaultModel,
      fetchSkill: skillsStore.fetch,
      setEditSkillFile: dialogsStore.setEditSkillFile,
      culture,
      createThumbnail,
      getInfoPanelItemIcon,
      openUser,
      isVisitor,
      isCollaborator,
      isAdmin,
      isDefaultRoomsQuotaSet,
      getLogoCoverModel: dialogsStore.getLogoCoverModel,
      onChangeFile: avatarEditorDialogStore.onChangeFile,
      roomLifetime:
        infoPanelRoomSelection?.lifetime ?? selectedFolderStore?.lifetime,
      onCreateRoomFromTemplate,
    };
  },
)(observer(Details));
