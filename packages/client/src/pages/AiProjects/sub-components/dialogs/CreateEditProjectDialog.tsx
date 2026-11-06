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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme";
import { ModalDialog, ModalDialogType } from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { ComboBox, type TOption } from "@onlyoffice/apps-ui-kit/components/combobox";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Textarea } from "@onlyoffice/apps-ui-kit/components/textarea";
import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { AddButton } from "@onlyoffice/apps-ui-kit/components/add-button";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import type { TImage } from "@onlyoffice/apps-ui-kit/components/image-editor/ImageEditor.types";
import { calculateRoomLogoParams } from "@onlyoffice/apps-ui-kit/utils";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import RoomSelector from "@onlyoffice/apps-ui-kit/selectors/Room";
import type { TSelectorItem } from "@onlyoffice/apps-ui-kit/components/selector";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { isChatCapableProfile } from "@docspace/shared/api/ai/enums";
import { RoomSearchArea } from "@docspace/shared/enums";
import {
  AI_PROJECT_MAX_ROOMS_PER_TYPE,
  AI_PROJECT_MAX_SUGGESTIONS,
  AI_PROJECT_MAX_TEXT_LENGTH,
  INSTRUCTIONS_ROOM_TYPE,
  KNOWLEDGE_ROOM_TYPE,
} from "@docspace/shared/api/ai/projects";
import type {
  TAiProject,
  TAiProjectCover,
  TAiProjectLogoUpload,
  TAiProjectSource,
  TAiProjectSuggestion,
} from "@docspace/shared/api/ai/projects";
import { aiProjectToRoom } from "@docspace/shared/api/ai/projects";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import InputParam from "SRC_DIR/components/CreateEditDialogParams/InputParam";
import TagInput from "SRC_DIR/components/TagInput";
import TagHandler from "SRC_DIR/helpers/TagHandler";
import type { TRoomTagsParams } from "@docspace/shared/utils/rooms";
import { createRandomTagId } from "@docspace/shared/utils/random";
import { StyledParam } from "SRC_DIR/components/CreateEditDialogParams/StyledParam";
import ChangeRoomOwner from "SRC_DIR/components/ChangeRoomOwner";
import AvatarEditorDialog from "SRC_DIR/components/dialogs/AvatarEditorDialog";
import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { errorMessage } from "SRC_DIR/store/AiProjectsStore";
import { useStore } from "SRC_DIR/store/useStore";

import { coverLogo, uploadedLogo } from "../list/ProjectLogo";
import { SourceRoomLogo } from "../project/RoomItem";
import { savedProjectProfileId } from "../../utils";
import SuggestionDialog from "./SuggestionDialog";
import styles from "./CreateEditProjectDialog.module.scss";

type CreateEditProjectDialogProps = {
  store: AiProjectsStore;
  /** Called with the project a successful create answered, e.g. to open it. */
  onCreated?: (project: TAiProject) => void;
};

/** An uploaded picture and its crop, as the image editor holds them; no `uploadedFile` until one is chosen. */
type TIcon = Omit<TImage, "uploadedFile"> & { uploadedFile?: File };

const EMPTY_ICON: TIcon = { x: 0.5, y: 0.5, zoom: 1 };

/** The crop of the picture in the units the server takes, read off the picture itself. */
const logoCrop = (file: File, { x, y, zoom }: TIcon) =>
  new Promise<Omit<TAiProjectLogoUpload, "tmpFile">>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(calculateRoomLogoParams(img, x, y, zoom));
    };
    img.onerror = reject;
    img.src = url;
  });

/** A suggestion as the form lists it, with a local key for its chip. */
type TSuggestionRow = TAiProjectSuggestion & { key: string };

const toSuggestionRow = (suggestion: TAiProjectSuggestion): TSuggestionRow => ({
  ...suggestion,
  key: createRandomTagId(),
});

type TRoomType = typeof INSTRUCTIONS_ROOM_TYPE | typeof KNOWLEDGE_ROOM_TYPE;

const MAX_TITLE = 170;

const ROOM_ICONS: Record<TRoomType, "instructionsRoom.svg" | "knowledgeRoom.svg"> = {
  [INSTRUCTIONS_ROOM_TYPE]: "instructionsRoom.svg",
  [KNOWLEDGE_ROOM_TYPE]: "knowledgeRoom.svg",
};

/**
 * The create / edit aside of a project, as the mockups draw it: the logo
 * with its colour next to the name, the owner row (edit only), the model
 * with its note under the field, the rooms of each kind as tags with the
 * "Select rooms" button in the same line and the hint below, then the
 * suggestion chips of the empty chat (added and edited in a centred dialog)
 * and the instructions to the chat as the agent dialog had them.
 */
const CreateEditProjectDialog = ({ store, onCreated }: CreateEditProjectDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const dialogsStore = useStore("dialogsStore");
  const filesStore = useStore("filesStore");
  const tagsStore = useStore("tagsStore");
  const settingsStore = useStore("settingsStore");
  const avatarEditorDialogStore = useStore("avatarEditorDialogStore");
  const { avatarEditorDialogVisible } = avatarEditorDialogStore;
  // With vectorization off a Knowledge room cannot be searched, so none can
  // be linked: the selector lists them greyed out, with the reason.
  const vectorizationEnabled = settingsStore.aiConfig?.vectorizationEnabled !== false;
  const { useProfilesStore } = useStores();
  const profiles = useProfilesStore((s) => s.profiles);
  const ensureProfiles = useProfilesStore((s) => s.ensureProfiles);
  const defaultProfile = useProfilesStore((s) => s.defaultProfile);
  const profilesLoaded = useProfilesStore((s) => s.profilesLoaded);
  // The chat starts knowing only its assigned profiles; the model combo
  // box lists the whole catalogue.
  React.useEffect(() => {
    void ensureProfiles();
  }, [ensureProfiles]);
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
  // An uploaded picture, as the room dialog takes one: the file and its crop
  // while the editor is open, the cropped preview once saved, and whether
  // the project's stored picture was removed in this dialog.
  const [icon, setIcon] = React.useState<TIcon>(EMPTY_ICON);
  const [previewIcon, setPreviewIcon] = React.useState("");
  const [imageRemoved, setImageRemoved] = React.useState(false);
  const storedImage = !imageRemoved && project ? uploadedLogo(project.logo) : null;
  const hasImage = !!previewIcon || !!storedImage;
  // `null` until a model is picked: the portal default is preselected.
  const [profileId, setProfileId] = React.useState<string | null>(project?.aiProject.profile?.id ?? null);
  // What the form opened with: the instructions and suggestions are sent
  // only when they differ from it. A refresh of the open project replaces
  // the store's copy while the form keeps its fields, so comparing against
  // that copy would write the form's older values over another member's change.
  const [seed] = React.useState(() => ({
    instructions: (project?.aiProject.instructions ?? "").trim(),
    suggestions: JSON.stringify(
      (project?.aiProject.suggestions ?? []).map(({ name: label, prompt: text }) => [label, text]),
    ),
  }));
  const [prompt, setPrompt] = React.useState(project?.aiProject.instructions ?? "");
  const [suggestions, setSuggestions] = React.useState<TSuggestionRow[]>(() =>
    (project?.aiProject.suggestions ?? []).map(toSuggestionRow),
  );
  // The suggestion open in its dialog: `"new"` to add one, a row key to edit it.
  const [editedSuggestion, setEditedSuggestion] = React.useState<string | null>(null);
  const [instructions, setInstructions] = React.useState<TAiProjectSource[]>(project?.aiProject.instructionsRooms ?? []);
  const [knowledge, setKnowledge] = React.useState<TAiProjectSource[]>(project?.aiProject.knowledgeRooms ?? []);
  const [selector, setSelector] = React.useState<TRoomType | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  // The tags, as the room dialog keeps them: the project's own, with the
  // portal's tags fetched for the input's suggestions.
  const [tags, setTags] = React.useState<TRoomTagsParams[]>(() =>
    (project?.tags ?? []).map((name) => ({ id: createRandomTagId(), name })),
  );
  const [fetchedTags, setFetchedTags] = React.useState<string[]>([]);
  React.useEffect(() => {
    // The portal's tags feed the input's suggestions; anything but a list
    // (a failed or odd answer) leaves the suggestions empty instead of
    // breaking the form.
    void tagsStore
      .fetchTags()
      .then((list) => setFetchedTags(Array.isArray(list) ? (list as string[]) : []));
  }, [tagsStore]);
  const tagHandler = new TagHandler(tags, setTags, fetchedTags);

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
    // A cover takes the picture's place.
    setPreviewIcon("");
    setIcon(EMPTY_ICON);
    setImageRemoved(true);
  }, [coverColor, coverId, covers]);
  React.useEffect(
    () => () => {
      dialogsStore.setCover();
    },
    [dialogsStore],
  );

  // The picture is chosen through the icon's hidden file input; the editor
  // store sizes it down and opens the crop dialog.
  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = await avatarEditorDialogStore.uploadFile(t, e);
    setIcon((prev) => ({ ...prev, uploadedFile }));
  };
  const onChangeIcon = (next: TImage) =>
    setIcon({ ...next, uploadedFile: next.uploadedFile instanceof File ? next.uploadedFile : undefined });
  const onSaveAvatar = (_image: TImage, preview: string) => {
    avatarEditorDialogStore.setAvatarEditorDialogVisible(false);
    // The picture takes the cover's place.
    dialogsStore.setCover();
    setCoverIcon(null);
    setImageRemoved(false);
    if (preview) setPreviewIcon(preview);
  };
  const onCloseAvatarEditor = () => {
    avatarEditorDialogStore.setAvatarEditorDialogVisible(false);
    avatarEditorDialogStore.clearUploadedFile();
    setIcon(EMPTY_ICON);
  };
  const onDeleteImage = () => {
    avatarEditorDialogStore.clearUploadedFile();
    setIcon(EMPTY_ICON);
    setPreviewIcon("");
    setImageRemoved(true);
  };
  // Upload a picture, then delete it or customize the cover, as a room's menu goes.
  const logoModel = dialogsStore.getLogoCoverModel(t, hasImage, () => onDeleteImage);
  // A camera until something is typed, a cover is chosen or a picture is
  // uploaded, like a new room.
  const isEmptyIcon = !project && !title && !dialogsStore.cover && !hasImage;

  // The default profile of the portal first, then every chat-capable
  // profile, each by its name only. Whichever is picked is stored as the
  // project's own model, the default included.
  const profileOptions = React.useMemo<TOption[]>(
    () => [
      ...(defaultProfile ? [{ key: defaultProfile.id, value: defaultProfile.id, label: defaultProfile.name }] : []),
      ...chatProfiles
        .filter((profile) => profile.id !== defaultProfile?.id)
        .map((profile) => ({ key: profile.id, value: profile.id, label: profile.name })),
    ],
    [chatProfiles, defaultProfile],
  );
  const selectedProfileOption =
    profileOptions.find((option) => option.key === profileId) ?? (profileOptions[0] as TOption);
  // A stored model that is gone, or none at all, shows as the default, so
  // the default is what gets saved; one not read yet is kept.
  const savedProfileId = savedProjectProfileId(
    profileId,
    profileOptions.map((option) => String(option.key)),
    selectedProfileOption ? String(selectedProfileOption.key) : undefined,
    profilesLoaded,
  );

  // Shown as an error under the field; the server refuses the text, the form does not.
  const instructionsTooLong = prompt.trim().length > AI_PROJECT_MAX_TEXT_LENGTH;

  if (!state) return null;

  const onSubmit = async () => {
    const name = title.trim();
    if (!name || name.length > MAX_TITLE) {
      setIsValidTitle(false);
      return;
    }
    setIsSaving(true);
    try {
      // A picture that was cropped in this dialog goes up first, as a room's
      // does: the resized file to `files/logos`, then its temporary name and
      // the crop with the project.
      const { uploadedFile } = icon;
      const image = uploadedFile
        ? await (async (): Promise<TAiProjectLogoUpload> => {
            const [crop, uploaded] = await Promise.all([
              logoCrop(uploadedFile, icon),
              avatarEditorDialogStore.getUploadedLogoData(),
            ]);
            return { tmpFile: uploaded.responseData.data, ...crop };
          })()
        : undefined;
      const data = {
        title: name,
        tags: tags.map((tag) => tag.name),
        // The cover goes as a room's does (CreateEditRoomStore): the id of
        // the built-in icon or "" for the initials, and the colour.
        logo: { color: `#${color}`, cover: coverIcon?.id ?? "", image },
        aiProject: {
          profileId: savedProfileId,
          instructions: prompt.trim() === seed.instructions ? undefined : prompt.trim(),
          suggestions:
            JSON.stringify(suggestions.map(({ name: label, prompt: text }) => [label, text])) === seed.suggestions
              ? undefined
              : suggestions.map(({ name: label, prompt: text }) => ({ name: label, prompt: text })),
          instructionsRoomIds: instructions.map((r) => r.id),
          knowledgeRoomIds: knowledge.map((r) => r.id),
          rooms: [...instructions, ...knowledge],
        },
      };
      if (project) {
        // The stored picture goes when it was removed here and nothing replaced it.
        const removeLogo = imageRemoved && !image && !!uploadedLogo(project.logo);
        await store.updateProject(project.id, data, { removeLogo });
        store.closeProjectDialog();
      } else {
        const created = await store.createProject(data);
        toastr.success(t("Common:AIProjectCreated", { name: created.title }));
        store.closeProjectDialog();
        // A new project opens, as a new room does.
        onCreated?.(created);
      }
    } catch (e) {
      toastr.error(errorMessage(e));
    } finally {
      setIsSaving(false);
    }
  };

  const onOwnerChange = () => {
    if (!project) return;
    filesStore.setBufferSelection(aiProjectToRoom(project) as never);
    dialogsStore.setChangeRoomOwnerIsVisible(true);
  };

  // The limit is never shown up front: only ticking a room past it is told.
  const onRoomsLimitReached = () =>
    toastr.warning(
      selector === INSTRUCTIONS_ROOM_TYPE
        ? t("Common:AIProjectInstructionsRoomsLimit", { limit: AI_PROJECT_MAX_ROOMS_PER_TYPE })
        : t("Common:AIProjectKnowledgeRoomsLimit", { limit: AI_PROJECT_MAX_ROOMS_PER_TYPE }),
    );

  const onRoomsSelected = (items: TSelectorItem[]) => {
    if (selector === null) return;
    // The logo the selector read with the room, so the saved project shows
    // the linked rooms without reading them back.
    const rooms = items.map((item) => {
      const room = item as { color?: string; cover?: TAiProjectCover; icon?: string; iconOriginal?: string };
      return {
        id: Number(item.id),
        title: item.label,
        roomType: selector,
        available: true,
        archived: false,
        logo: {
          color: room.color ? `#${room.color.replace("#", "")}` : "",
          cover: room.cover ?? null,
          medium: typeof room.icon === "string" ? room.icon : undefined,
          original: room.iconOriginal,
        },
      };
    });
    if (selector === INSTRUCTIONS_ROOM_TYPE) setInstructions(rooms);
    else setKnowledge(rooms);
    setSelector(null);
  };

  // The rooms of one kind, as the agent dialog lists its MCP servers: the
  // add button opens the selector, each chosen room is a chip with the
  // room's own logo and a cross, the hint sits under the row.
  const roomsBlock = (
    label: string,
    hint: string,
    rooms: TAiProjectSource[],
    type: TRoomType,
    setRooms: (rooms: TAiProjectSource[]) => void,
  ) => (
    <StyledParam className={styles.block}>
      <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
        {label}
      </Text>
      <div className={styles.addRow}>
        <AddButton
          label={t("Common:SelectRoom")}
          onClick={() => setSelector(type)}
          isDisabled={isSaving}
          testId={`ai-project-add-rooms-${type}`}
        />
      </div>
      {rooms.length > 0 ? (
        <div className={styles.roomList}>
          {rooms.map((room) => (
            <div className={styles.roomItem} key={room.id} data-testid="ai-project-room-item">
              <SourceRoomLogo title={room.title} logo={room.logo ?? undefined} icon={ROOM_ICONS[type]} size="20px" />
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
      ) : null}
      <Text className={styles.hint} fontSize="12px" lineHeight="16px" noSelect>
        {hint}
      </Text>
    </StyledParam>
  );

  const onSaveSuggestion = (suggestion: TAiProjectSuggestion) => {
    setSuggestions((rows) =>
      editedSuggestion === "new"
        ? [...rows, toSuggestionRow(suggestion)]
        : rows.map((row) => (row.key === editedSuggestion ? { ...row, ...suggestion } : row)),
    );
    setEditedSuggestion(null);
  };

  // The chips of the empty chat, as the rooms below list theirs: "Add
  // suggestion" and a click on a chip open the centred dialog, the cross
  // removes the chip, the limit disables the button.
  const suggestionsBlock = (
    <div className={styles.block}>
      <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
        {t("Common:AIProjectSuggestions")}
      </Text>
      <div className={styles.addRow}>
        <AddButton
          label={t("Common:AIProjectAddSuggestion")}
          onClick={() => setEditedSuggestion("new")}
          isDisabled={isSaving || suggestions.length >= AI_PROJECT_MAX_SUGGESTIONS}
          testId="ai-project-add-suggestion"
        />
      </div>
      {suggestions.length > 0 ? (
        <div className={styles.roomList}>
          {suggestions.map((row) => (
            <div className={styles.suggestionItem} key={row.key} title={row.prompt} data-testid="ai-project-suggestion">
              <button
                type="button"
                className={styles.suggestionLabel}
                onClick={() => setEditedSuggestion(row.key)}
                disabled={isSaving}
                data-testid="ai-project-edit-suggestion"
              >
                <Text fontSize="12px" fontWeight={600} lineHeight="16px" noSelect truncate>
                  {row.name}
                </Text>
              </button>
              <IconButton
                iconName={CrossReactSvgUrl}
                size={12}
                onClick={() => setSuggestions((rows) => rows.filter((r) => r.key !== row.key))}
                isDisabled={isSaving}
                dataTestId="ai-project-remove-suggestion"
              />
            </div>
          ))}
        </div>
      ) : null}
      <Text className={styles.hint} fontSize="12px" lineHeight="16px" noSelect>
        {t("Common:AIProjectSuggestionsHint", { limit: AI_PROJECT_MAX_SUGGESTIONS })}
      </Text>
    </div>
  );

  const selected = selector === INSTRUCTIONS_ROOM_TYPE ? instructions : knowledge;

  return (
    <>
    <ModalDialog
        visible
        displayType={ModalDialogType.aside}
        withBodyScroll
        withForm
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        // A swipe on the suggestion dialog's header also reaches this
        // dialog's own swipe handler: the form stays while that one is open.
        onClose={() => {
          if (editedSuggestion === null) store.closeProjectDialog();
        }}
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
              maxSelectedItems={AI_PROJECT_MAX_ROOMS_PER_TYPE}
              onSelectLimitReached={onRoomsLimitReached}
              roomType={selector}
              // Instructions and Knowledge rooms live under the "AI rooms"
              // root, not in Rooms.
              searchArea={RoomSearchArea.AiHub}
              isRoomDisabled={() => selector === KNOWLEDGE_ROOM_TYPE && !vectorizationEnabled}
              getRoomDisabledText={() =>
                selector === KNOWLEDGE_ROOM_TYPE && !vectorizationEnabled
                  ? t("Common:KnowledgeRoomsNeedVectorization")
                  : undefined
              }
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
                showDefault={!hasImage && !coverIcon}
                logo={previewIcon || storedImage || (coverIcon ? coverLogo(coverIcon, color) : undefined)}
                isEmptyIcon={isEmptyIcon}
                withEditing={!isEmptyIcon}
                model={logoModel}
                onChangeFile={onChangeFile}
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
            <TagInput
              t={t}
              title={t("Common:Tags")}
              tagHandler={tagHandler}
              setIsScrollLocked={() => {}}
              isDisabled={isSaving}
              dataTestId="ai-project-tags-input"
            />
            <div className={styles.block}>
              <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
                {`${t("Common:AIAgentModel")}:`}
              </Text>
              <ComboBox
                options={profileOptions}
                selectedOption={selectedProfileOption}
                onSelect={(option) => setProfileId(String(option.key))}
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
            {suggestionsBlock}
            <div className={styles.block}>
              <div>
                <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
                  {t("Common:AIInstructions")}
                </Text>
                <Text className={styles.hint} fontSize="12px" lineHeight="16px" noSelect>
                  {t("Common:InstructionsDescriptionAgent")}
                </Text>
              </div>
              <FieldContainer
                isVertical
                removeMargin
                labelVisible={false}
                hasError={instructionsTooLong}
                errorMessage={t("Common:AIProjectTextTooLong", { limit: AI_PROJECT_MAX_TEXT_LENGTH })}
                errorMessageWidth="100%"
              >
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  heightTextArea={144}
                  placeholder={t("Common:InstructionsDescriptionAgentExample")}
                  hasError={instructionsTooLong}
                  isDisabled={isSaving}
                  dataTestId="ai-project-instructions-textarea"
                />
              </FieldContainer>
            </div>
            {project?.createdBy ? (
              <div className={styles.owner}>
                <ChangeRoomOwner
                  roomOwner={project.createdBy as never}
                  canChangeOwner={project.security.ChangeOwner}
                  onOwnerChange={onOwnerChange}
                  label={t("Common:AIProjectOwner")}
                />
              </div>
            ) : null}
            {avatarEditorDialogVisible ? (
              <AvatarEditorDialog
                t={t}
                isDisabled={isSaving}
                image={icon}
                setPreview={setPreviewIcon}
                onChangeImage={onChangeIcon}
                onClose={onCloseAvatarEditor}
                onSave={onSaveAvatar}
                onChangeFile={onChangeFile}
                visible={!!icon.uploadedFile}
                dataTestId="ai-project-avatar-editor"
              />
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
    {/* A sibling of the form, not inside it: Enter in its fields must not submit the project. */}
    {editedSuggestion !== null ? (
      <SuggestionDialog
        suggestion={suggestions.find((row) => row.key === editedSuggestion) ?? null}
        onSave={onSaveSuggestion}
        onClose={() => setEditedSuggestion(null)}
      />
    ) : null}
    </>
  );
};

export default observer(CreateEditProjectDialog);
