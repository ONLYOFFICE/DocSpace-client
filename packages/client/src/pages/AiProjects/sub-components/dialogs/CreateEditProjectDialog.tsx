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

import React from "react";
import classnames from "classnames";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme";
import { ModalDialog, ModalDialogType } from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { ComboBox, type TOption } from "@onlyoffice/apps-ui-kit/components/combobox";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { AddButton } from "@onlyoffice/apps-ui-kit/components/add-button";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { RoomIcon, type TModel } from "@onlyoffice/apps-ui-kit/components/room-icon";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import RoomSelector from "@onlyoffice/apps-ui-kit/selectors/Room";
import type { TSelectorItem } from "@onlyoffice/apps-ui-kit/components/selector";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { isChatCapableProfile } from "@docspace/shared/api/ai/enums";
import { INSTRUCTIONS_ROOM_TYPE, KNOWLEDGE_ROOM_TYPE } from "@docspace/shared/api/ai/projects";
import type { TAiProjectCover, TAiProjectSource } from "@docspace/shared/api/ai/projects";
import { aiProjectToRoom } from "@docspace/shared/api/ai/projects";
import { iconSize32 } from "@docspace/shared/utils/image-helpers";
import { ROOM_ACTION_KEYS } from "@docspace/shared/constants";

import PenSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import InputParam from "SRC_DIR/components/CreateEditDialogParams/InputParam";
import { StyledParam } from "SRC_DIR/components/CreateEditDialogParams/StyledParam";
import ChangeRoomOwner from "SRC_DIR/components/ChangeRoomOwner";
import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { useStore } from "SRC_DIR/store/useStore";

import { coverLogo } from "../list/ProjectLogo";
import styles from "./CreateEditProjectDialog.module.scss";

type CreateEditProjectDialogProps = {
  store: AiProjectsStore;
};

type TRoomType = typeof INSTRUCTIONS_ROOM_TYPE | typeof KNOWLEDGE_ROOM_TYPE;

const MAX_TITLE = 170;

const ROOM_ICONS: Record<TRoomType, string> = {
  [INSTRUCTIONS_ROOM_TYPE]: "instructionsRoom.svg",
  [KNOWLEDGE_ROOM_TYPE]: "knowledgeRoom.svg",
};

/**
 * The create / edit aside of a project, as the mockups draw it: the logo
 * with its colour next to the name, the owner row (edit only), the model
 * with its note under the field, then the rooms of each kind as tags with
 * the "Select rooms" button in the same line and the hint below.
 */
const CreateEditProjectDialog = ({ store }: CreateEditProjectDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const dialogsStore = useStore("dialogsStore");
  const filesStore = useStore("filesStore");
  const { useProfilesStore } = useStores();
  const profiles = useProfilesStore((s) => s.profiles);
  const defaultProfile = useProfilesStore((s) => s.defaultProfile);
  const state = store.projectDialog;
  const project = state?.mode === "edit" ? state.project : null;

  const [title, setTitle] = React.useState(project?.title ?? "");
  const [isValidTitle, setIsValidTitle] = React.useState(true);
  // The logo colour, six hex digits without "#": the one of the project, or
  // a random one for a new project, as the room dialog picks it.
  const randomColor = React.useMemo(
    () => globalColors.logoColors[Math.floor(Math.random() * globalColors.logoColors.length)].replace("#", ""),
    [],
  );
  const [color, setColor] = React.useState<string>(project?.logo.color.replace("#", "") ?? randomColor);
  const [coverIcon, setCoverIcon] = React.useState<TAiProjectCover | null>(project?.logo.cover ?? null);
  // `null` = the portal default profile, as the API stores it.
  const [profileId, setProfileId] = React.useState<string | null>(project?.aiProject.profile?.id ?? null);
  const [instructions, setInstructions] = React.useState<TAiProjectSource[]>(project?.aiProject.instructionsRooms ?? []);
  const [knowledge, setKnowledge] = React.useState<TAiProjectSource[]>(project?.aiProject.knowledgeRooms ?? []);
  const [selector, setSelector] = React.useState<TRoomType | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const chatProfiles = React.useMemo(() => profiles.filter(isChatCapableProfile), [profiles]);

  // "Customize cover" opens the shared cover dialog; what it picks lands in
  // `dialogsStore.cover` (the colour and the id of a built-in icon, resolved
  // against the covers the dialog loaded) and is taken over here. The cover
  // is cleared when this dialog goes away, so the next room dialog starts clean.
  const coverColor = dialogsStore.cover?.color;
  const coverId = dialogsStore.cover?.cover;
  const covers = dialogsStore.covers;
  React.useEffect(() => {
    if (!coverColor) return;
    setColor(coverColor);
    const picked = coverId ? covers?.find((item) => item.id === coverId) : undefined;
    setCoverIcon(picked ? { id: picked.id, data: picked.data } : null);
  }, [coverColor, coverId, covers]);
  React.useEffect(
    () => () => {
      dialogsStore.setCover();
    },
    [dialogsStore],
  );

  const logoModel = React.useMemo<TModel[]>(
    () => [
      {
        key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_CUSTOMIZE_COVER,
        label: t("Common:CustomizeCover"),
        icon: PenSvgUrl,
        onClick: () => dialogsStore.setRoomLogoCoverDialogVisible(true),
      },
    ],
    [dialogsStore, t],
  );
  // A camera until something is typed or a cover is chosen, like a new room.
  const isEmptyIcon = !project && !title && !dialogsStore.cover;

  // The default profile of the portal first (as the "null" profile the API
  // stores), then every chat-capable profile, each by its name only.
  const profileOptions = React.useMemo<TOption[]>(
    () => [
      ...(defaultProfile ? [{ key: "default", value: "default", label: defaultProfile.name }] : []),
      ...chatProfiles
        .filter((profile) => profile.id !== defaultProfile?.id)
        .map((profile) => ({ key: profile.id, value: profile.id, label: profile.name })),
    ],
    [chatProfiles, defaultProfile],
  );
  const selectedProfileOption =
    profileOptions.find((option) => option.key === (profileId ?? "default")) ?? (profileOptions[0] as TOption);

  if (!state) return null;

  const onSubmit = async () => {
    const name = title.trim();
    if (!name || name.length > MAX_TITLE) {
      setIsValidTitle(false);
      return;
    }
    setIsSaving(true);
    try {
      const data = {
        title: name,
        // The cover goes as a room's does (CreateEditRoomStore): the id of
        // the built-in icon or "" for the initials, and the colour.
        logo: { color: `#${color}`, cover: coverIcon?.id ?? "" },
        aiProject: {
          profileId,
          instructionsRoomIds: instructions.map((r) => r.id),
          knowledgeRoomIds: knowledge.map((r) => r.id),
        },
      };
      if (project) {
        await store.updateProject(project.id, data);
      } else {
        const created = await store.createProject(data);
        toastr.success(t("Common:AIProjectCreated", { name: created.title }));
      }
      store.closeProjectDialog();
    } catch (e) {
      toastr.error((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const onOwnerChange = () => {
    if (!project) return;
    filesStore.setBufferSelection(aiProjectToRoom(project) as never);
    dialogsStore.setChangeRoomOwnerIsVisible(true);
  };

  const onRoomsSelected = (items: TSelectorItem[]) => {
    if (selector === null) return;
    const rooms = items.map((item) => ({
      id: Number(item.id),
      title: item.label,
      roomType: selector,
      available: true,
      archived: false,
    }));
    if (selector === INSTRUCTIONS_ROOM_TYPE) setInstructions(rooms);
    else setKnowledge(rooms);
    setSelector(null);
  };

  // The rooms of one kind, as the agent dialog lists its MCP servers: the
  // add button opens the selector, each chosen room is a chip with the icon
  // of its type and a cross, the hint sits under the row.
  const roomsBlock = (
    label: string,
    hint: string,
    rooms: TAiProjectSource[],
    type: TRoomType,
    setRooms: (rooms: TAiProjectSource[]) => void,
  ) => (
    <StyledParam increaseGap className={styles.block}>
      <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
        {label}
      </Text>
      <div className="ai-mcp-group">
        <AddButton onClick={() => setSelector(type)} isDisabled={isSaving} testId={`ai-project-add-rooms-${type}`} />
        {rooms.map((room) => (
          <div className={classnames("ai-mcp-item", styles.roomItem)} key={room.id} data-testid="ai-project-room-item">
            <img src={iconSize32.get(ROOM_ICONS[type])} alt="" />
            <Text fontSize="12px" fontWeight={600} lineHeight="16px" noSelect truncate>
              {room.title}
            </Text>
            <IconButton
              iconName={CrossReactSvgUrl}
              size={12}
              onClick={() => setRooms(rooms.filter((r) => r.id !== room.id))}
              dataTestId="ai-project-remove-room"
            />
          </div>
        ))}
      </div>
      <Text className={styles.hint} fontSize="12px" lineHeight="16px" noSelect>
        {hint}
      </Text>
    </StyledParam>
  );

  const selected = selector === INSTRUCTIONS_ROOM_TYPE ? instructions : knowledge;

  return (
    <ModalDialog
        visible
        displayType={ModalDialogType.aside}
        withBodyScroll
        withForm
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        onClose={store.closeProjectDialog}
        isCloseable={!isSaving}
        containerVisible={selector !== null}
        dataTestId="ai-project-dialog"
      >
        {selector !== null ? (
          <ModalDialog.Container>
            <RoomSelector
              onClose={() => setSelector(null)}
              isMultiSelect
              // Room rows come with `disableMultiSelect`; this overrules it,
              // as the "add rooms to a group" dialog does.
              forceIsMultiSelect
              roomType={selector}
              withSearch
              withHeader
              headerProps={{
                headerLabel: selector === INSTRUCTIONS_ROOM_TYPE ? t("Common:InstructionsRooms") : t("Common:AIProjectKnowledgeRooms"),
                onCloseClick: () => setSelector(null),
                onBackClick: () => setSelector(null),
                withoutBackButton: false,
                withoutBorder: false,
              }}
              withCancelButton
              cancelButtonLabel={t("Common:CancelButton")}
              onCancel={() => setSelector(null)}
              submitButtonLabel={t("Common:SelectAction")}
              selectedItems={selected.map((room) => ({ id: room.id, label: room.title })) as unknown as TSelectorItem[]}
              sortSelectedFirst
              onSubmit={onRoomsSelected}
            />
          </ModalDialog.Container>
        ) : null}
        <ModalDialog.Header>
          {project ? t("Common:AIProjectEditTitle") : t("Common:AIProjectCreateTitle")}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <div className={styles.body}>
            <div className="logo-name-container">
              <RoomIcon
                title={title || project?.title || ""}
                color={color}
                size="64px"
                radius="12px"
                className="room-params-icon"
                showDefault={!coverIcon}
                logo={coverIcon ? coverLogo(coverIcon, color) : undefined}
                isEmptyIcon={isEmptyIcon}
                withEditing={!isEmptyIcon}
                model={logoModel}
                dataTestId="ai-project-logo"
              />
              <InputParam
                id="ai-project-title"
                title={`${t("Common:Label")}:`}
                placeholder={t("Common:EnterName")}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsValidTitle(true);
                }}
                isValidTitle={isValidTitle}
                errorMessage={t("Common:RequiredField")}
                isAutoFocussed
                isDisabled={isSaving}
                dataTestId="ai-project-title"
              />
            </div>
            <div className={styles.block}>
              <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
                {`${t("Common:AIAgentModel")}:`}
              </Text>
              <ComboBox
                options={profileOptions}
                selectedOption={selectedProfileOption}
                onSelect={(option) => setProfileId(option.key === "default" ? null : String(option.key))}
                scaled
                scaledOptions
                dropDownMaxHeight={profileOptions.length > 7 ? 300 : undefined}
                isDefaultMode
                displaySelectedOption
                isDisabled={isSaving}
                dataTestId="ai-project-profile-combobox"
              />
              <Text className={styles.hint} fontSize="12px" lineHeight="16px" noSelect>
                {t("Common:AIProjectModelHint")}
              </Text>
            </div>
            {roomsBlock(t("Common:InstructionsRooms"), t("Common:AIProjectInstructionsHint"), instructions, INSTRUCTIONS_ROOM_TYPE, setInstructions)}
            {roomsBlock(t("Common:AIProjectKnowledgeRooms"), t("Common:AIProjectKnowledgeHint"), knowledge, KNOWLEDGE_ROOM_TYPE, setKnowledge)}
            {project?.createdBy ? (
              <div className={styles.owner}>
                <ChangeRoomOwner
                  roomOwner={project.createdBy as never}
                  canChangeOwner={project.security.ChangeOwner}
                  onOwnerChange={onOwnerChange}
                  isAgent={false}
                  label={t("Common:AIProjectOwner")}
                />
              </div>
            ) : null}
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            label={project ? t("Common:SaveButton") : t("Common:Create")}
            size={ButtonSize.normal}
            primary
            scale
            type="submit"
            isLoading={isSaving}
            testId="ai-project-submit"
          />
          <Button label={t("Common:CancelButton")} size={ButtonSize.normal} scale onClick={store.closeProjectDialog} isDisabled={isSaving} />
        </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default observer(CreateEditProjectDialog);
