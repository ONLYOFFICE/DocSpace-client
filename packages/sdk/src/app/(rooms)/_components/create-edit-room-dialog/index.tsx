// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  TextInput,
  InputSize,
  InputType,
} from "@docspace/ui-kit/components/text-input";
import { Text } from "@docspace/ui-kit/components/text";
import { Tag } from "@docspace/ui-kit/components/tag";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { AvatarEditorDialog } from "@docspace/ui-kit/components/avatar-editor-dialog";
import { RoomLogoCoverDialog } from "@docspace/ui-kit/components/room-logo-cover-dialog";
import { ROOM_ACTION_KEYS } from "@docspace/ui-kit/constants";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { calculateRoomLogoParams } from "@docspace/ui-kit/utils";
import type { TImage } from "@docspace/ui-kit/components/image-editor";
import type { ICover } from "@docspace/ui-kit/components/room-logo-cover-dialog";
import type { Nullable } from "@docspace/shared/types";
import { RoomsType } from "@docspace/shared/enums";
import api from "@docspace/shared/api";

import {
  useDialogsStore,
  type TEditableRoom,
} from "@/app/(docspace)/_store/DialogsStore";

import UploadSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import DeleteSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import PencilSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";

import { RoomsRefreshContext } from "../../_contexts/RoomsRefreshContext";

import styles from "./CreateEditRoomDialog.module.scss";

type CreateEditRoomDialogProps = {
  visible: boolean;
  onClose: () => void;
  room?: TEditableRoom;
  onRoomEdited?: (roomId: number) => void;
  onRoomCreated?: () => void;
};

const CreateEditRoomDialog = ({
  visible,
  onClose,
  room,
  onRoomEdited,
  onRoomCreated,
}: CreateEditRoomDialogProps) => {
  const { t } = useTranslation(["Common", "Files"]);
  const refreshRooms = React.useContext(RoomsRefreshContext);
  const dialogsStore = useDialogsStore();

  const isEdit = !!room;

  const [name, setName] = React.useState(room?.title ?? "");
  const [tags, setTags] = React.useState<string[]>(room?.tags ?? []);
  const [tagInputValue, setTagInputValue] = React.useState("");
  const [cropperImage, setCropperImage] = React.useState<TImage>({
    x: 0.5,
    y: 0.5,
    zoom: 1,
    uploadedFile: undefined,
  });
  const [cropperVisible, setCropperVisible] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    room?.roomLogo ?? null,
  );
  const [logoChanged, setLogoChanged] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasNameError, setHasNameError] = React.useState(false);

  const [coverDialogVisible, setCoverDialogVisible] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
    undefined,
  );
  const [selectedCover, setSelectedCover] = React.useState<ICover | null>(
    room?.roomCover ?? null,
  );

  const randomColor = React.useMemo(
    () =>
      room?.roomIconColor ??
      globalColors.logoColors[
        Math.floor(Math.random() * globalColors.logoColors.length)
      ].replace("#", ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    if (visible) dialogsStore.getCovers();
  }, [visible, dialogsStore]);

  React.useEffect(() => {
    setName(room?.title ?? "");
    setTags(room?.tags ?? []);
    setTagInputValue("");
    setCropperImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: undefined });
    setPreviewUrl(room?.roomLogo ?? null);
    setCropperVisible(false);
    setIsLoading(false);
    setHasNameError(false);
    setLogoChanged(false);
    setSelectedColor(room?.roomIconColor ?? undefined);
    setSelectedCover(room?.roomCover ?? null);
    setCoverDialogVisible(false);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const onOpenCoverDialog = () => {
    setCoverDialogVisible(true);
  };

  const onApplyCover = (color: string, cover: ICover | null) => {
    setSelectedColor(color.replace("#", ""));
    setSelectedCover(cover);
    setPreviewUrl(null);
    setLogoChanged(true);
    setCoverDialogVisible(false);
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (hasNameError) setHasNameError(false);
  };

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInputValue("");
  };

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInputValue);
    } else if (e.key === "Backspace" && !tagInputValue && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const onDeleteTag = React.useCallback((tag?: string) => {
    if (tag) setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: file });
    setCropperVisible(true);
  };

  const onCropperChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: file });
  };

  const onChangeImage = (image: TImage) => setCropperImage(image);

  const onCropperSave = (_image: TImage, preview: string) => {
    setCropperImage(_image);
    setPreviewUrl(preview);
    setSelectedCover(null);
    setLogoChanged(true);
    setCropperVisible(false);
  };

  const onCropperClose = () => setCropperVisible(false);

  const onDeleteLogo = React.useCallback(() => {
    setCropperImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: undefined });
    setPreviewUrl(null);
    setSelectedCover(null);
    setLogoChanged(true);
  }, []);

  const hasCoverOrPreview = !!(previewUrl || selectedCover);

  const model = React.useMemo(() => {
    type UploadItem = {
      key: typeof ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_UPLOAD;
      label: string;
      icon: string;
      onClick: (ref?: React.RefObject<Nullable<HTMLInputElement>>) => void;
    };
    type ActionItem = {
      key: string;
      label: string;
      icon: string;
      onClick: () => void;
    };

    const items: (UploadItem | ActionItem)[] = [
      {
        key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_UPLOAD,
        label: t("Common:UploadPicture"),
        icon: UploadSvgUrl,
        onClick: (ref?: React.RefObject<Nullable<HTMLInputElement>>) =>
          ref?.current?.click(),
      },
    ];

    items.push({
      key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_CUSTOMIZE_COVER,
      label: t("Common:CustomizeCover"),
      icon: PencilSvgUrl,
      onClick: onOpenCoverDialog,
    });

    if (hasCoverOrPreview) {
      items.push({
        key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_DELETE,
        label: t("Common:Delete"),
        icon: DeleteSvgUrl,
        onClick: onDeleteLogo,
      });
    }

    return items;
  }, [hasCoverOrPreview, t, onDeleteLogo]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildLogoParams = async () => {
    if (!(cropperImage.uploadedFile instanceof File) || !previewUrl)
      return undefined;

    const file = cropperImage.uploadedFile;
    const objectUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("0", file);

    const [response, img] = await Promise.all([
      api.rooms.uploadRoomLogo(formData) as Promise<{ data?: string }>,
      new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(el);
        };
        el.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject();
        };
        el.src = objectUrl;
      }),
    ]);

    if (!response?.data) return undefined;

    return {
      tmpFile: response.data,
      ...calculateRoomLogoParams(
        img,
        cropperImage.x,
        cropperImage.y,
        cropperImage.zoom,
      ),
    };
  };

  const onSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setHasNameError(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        const logo = logoChanged ? await buildLogoParams() : undefined;
        await api.rooms.editRoom(room.id, {
          title: trimmedName,
          tags,
          ...(logoChanged && logo ? { logo } : {}),
        });

        if (logoChanged && (selectedCover || !logo)) {
          await api.rooms.setRoomCover(room.id, {
            color: selectedColor ?? globalColors.logoColors[0].replace("#", ""),
            cover: selectedCover?.id ?? "",
          });
        }

        onRoomEdited?.(room.id);
      } else {
        const logo = await buildLogoParams();
        const newRoom = (await api.rooms.createRoom({
          roomType: RoomsType.CustomRoom,
          title: trimmedName,
          ...(tags.length && { tags }),
          ...(logo && { logo }),
        })) as { id?: number };

        if (selectedCover && newRoom?.id) {
          const colorForApi =
            selectedColor ?? globalColors.logoColors[0].replace("#", "");
          await api.rooms.setRoomCover(newRoom.id, {
            color: colorForApi,
            cover: selectedCover.id,
          });
        }

        (onRoomCreated ?? refreshRooms)?.();
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const roomIconLogo = React.useMemo(() => {
    if (previewUrl) return previewUrl;
    if (selectedCover)
      return {
        cover: selectedCover,
      } as unknown as import("@docspace/ui-kit/types").TLogo;
    return undefined;
  }, [previewUrl, selectedCover]);

  const iconColor = selectedColor ?? randomColor;
  const hasAnyLogoConfig = !!(previewUrl || selectedCover || selectedColor);
  const isEmptyIcon = !name && !hasAnyLogoConfig;
  const showDefault = !hasCoverOrPreview && (!!name || !!selectedColor);
  const withEditing = !isEmptyIcon;

  const initialCoverColor = selectedColor ? `#${selectedColor}` : undefined;
  return (
    <>
      <ModalDialog
        displayType={ModalDialogType.aside}
        visible={visible}
        onClose={onClose}
      >
        <ModalDialog.Header>
          {isEdit ? t("Common:EditRoom") : t("Common:CreateRoom")}
        </ModalDialog.Header>

        <ModalDialog.Body>
          <div className={styles.body}>
            <div className={styles.logoNameRow}>
              <RoomIcon
                title={name}
                color={iconColor}
                size="64px"
                radius="12px"
                logo={roomIconLogo}
                showDefault={showDefault}
                withEditing={withEditing}
                model={model}
                onChangeFile={onChangeFile}
                isEmptyIcon={isEmptyIcon}
                dataTestId="create_edit_room_icon"
              />
              <div className={styles.nameInputWrapper}>
                <Text
                  className={styles.inputLabel}
                  fontWeight={600}
                  fontSize="13px"
                >
                  {t("Common:Label")}:
                </Text>
                <TextInput
                  type={InputType.text}
                  scale
                  size={InputSize.base}
                  placeholder={t("Common:EnterName")}
                  value={name}
                  onChange={onChangeName}
                  hasError={hasNameError}
                  isAutoFocussed
                  isDisabled={isLoading}
                />
                {hasNameError ? (
                  <Text className={styles.errorText} fontSize="11px">
                    {t("Common:RequiredField")}
                  </Text>
                ) : null}
              </div>
            </div>

            <div className={styles.tagsSection}>
              <Text fontWeight={600} fontSize="13px">
                {t("Common:Tags")}:
              </Text>
              <TextInput
                type={InputType.text}
                scale
                size={InputSize.base}
                placeholder={t("Common:AddTag")}
                value={tagInputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTagInputValue(e.target.value)
                }
                onKeyDown={onTagKeyDown}
                onBlur={() => {
                  if (tagInputValue.trim()) addTag(tagInputValue);
                }}
                isDisabled={isLoading}
              />
              {tags.length > 0 ? (
                <div className={styles.tagsList}>
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      tag={tag}
                      label={tag}
                      isNewTag
                      onDelete={onDeleteTag}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {isEdit && room.createdBy ? (
              <div className={styles.ownerSection}>
                <Text fontWeight={600} fontSize="13px">
                  {t("Common:RoomOwner")}:
                </Text>
                <div className={styles.ownerDisplay}>
                  <Avatar
                    size={AvatarSize.base}
                    role={AvatarRole.none}
                    isDefaultSource={room.createdBy.hasAvatar}
                    source={
                      room.createdBy.hasAvatar
                        ? room.createdBy.avatar
                        : room.createdBy.avatarSmall
                    }
                    userName={room.createdBy.displayName}
                  />
                  <Text fontWeight={600} fontSize="13px">
                    {room.createdBy.displayName}
                  </Text>
                </div>
              </div>
            ) : null}
          </div>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            label={isEdit ? t("Common:SaveButton") : t("Common:Create")}
            size={ButtonSize.normal}
            primary
            scale
            isLoading={isLoading}
            onClick={onSave}
            isDisabled={!name.trim() || isLoading}
          />
          <Button
            label={t("Common:CancelButton")}
            size={ButtonSize.normal}
            scale
            onClick={onClose}
            isDisabled={isLoading}
          />
        </ModalDialog.Footer>
      </ModalDialog>

      <AvatarEditorDialog
        t={t}
        visible={cropperVisible}
        title={t("RoomLogoCover:RoomCover")}
        image={cropperImage}
        onClose={onCropperClose}
        onSave={onCropperSave}
        onChangeImage={onChangeImage}
        onChangeFile={onCropperChangeFile}
      />

      <RoomLogoCoverDialog
        t={t}
        visible={coverDialogVisible}
        covers={dialogsStore.covers}
        title={name}
        initialColor={initialCoverColor}
        initialCover={selectedCover}
        onClose={() => setCoverDialogVisible(false)}
        onApply={onApplyCover}
      />
    </>
  );
};

export default CreateEditRoomDialog;

