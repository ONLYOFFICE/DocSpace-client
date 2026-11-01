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

import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";

import RoomType from "@docspace/shared/components/room-type";
import {
  AI_HUB_SECTION_TYPES,
  getCreateRoomTypes,
} from "@docspace/shared/utils/rooms";
import { RoomsType } from "@docspace/shared/enums";
import { Tooltip } from "@onlyoffice/apps-ui-kit/components/tooltip";

import { useStores } from "SRC_DIR/store/useStore";

import styles from "./RoomTypeList.module.scss";

type RoomTypeListProps = {
  disabledFormRoom: boolean;
  isExternalShareRestricted?: boolean;
  processCreatingRoomFromData?: boolean;
  isFormsCreate?: boolean;
  // The "AI rooms" section's chooser: the AI room types and nothing else.
  isAiRoomsCreate?: boolean;
  // Picking "AI project" there leaves this dialog for the project form.
  onOpenAiProjectForm?: () => void;
  // Set only when the OForms gallery is available; offers a form space built
  // around a gallery template even with the Forms quick actions turned off.
  onOpenTemplateGallery?: () => void;

  setRoomType: (roomType: RoomsType) => void;
  setTemplateDialogIsVisible: (isVisible: boolean) => void;
};

const RoomTypeList = ({
  disabledFormRoom = true,
  isExternalShareRestricted,
  processCreatingRoomFromData,
  isFormsCreate,
  isAiRoomsCreate,
  onOpenAiProjectForm,
  onOpenTemplateGallery,

  setRoomType,
  setTemplateDialogIsVisible,
}: RoomTypeListProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Files", "Common"]);
  const { settingsStore, userStore } = useStores();
  const vectorizationEnabled =
    settingsStore.aiConfig?.vectorizationEnabled !== false;
  const isAdmin = !!(userStore.user?.isOwner || userStore.user?.isAdmin);

  // Form Filling Rooms are created from the dedicated "Forms" section (which
  // opens straight into the FFR form via startRoomType). The only place the
  // FFR card still belongs in this generic chooser is the "create room from
  // selected PDF data" flow.
  const availableRoomTypes = getCreateRoomTypes();

  const roomTypeValues = processCreatingRoomFromData
    ? availableRoomTypes
    : availableRoomTypes.filter((roomType) => roomType !== RoomsType.FormRoom);

  const handleClick = (roomType: RoomsType | "template") => {
    if (disabledFormRoom && roomType === RoomsType.FormRoom) return;
    if (isExternalShareRestricted && roomType === RoomsType.PublicRoom) return;

    if (roomType === "template") {
      setTemplateDialogIsVisible(true);

      return;
    }

    setRoomType(roomType);
  };

  const formRoomTooltipContent = t("Files:FormRoomCreationLimit", {
    sectionName: t("Common:Rooms"),
  });

  const publicRoomTooltipContent = t("Common:PublicRoomCreationDisabled");

  if (isAiRoomsCreate) {
    // A Knowledge room is searched through vectorization, so it cannot be
    // created while vectorization is off (the server refuses it too); the
    // tooltip says who can turn it on.
    const knowledgeRoomTooltipContent = isAdmin
      ? t("Common:KnowledgeRoomCreationNeedsVectorizationAdmin")
      : t("Common:KnowledgeRoomCreationNeedsVectorizationUser");

    return (
      <div className={styles.roomTypeList}>
        {AI_HUB_SECTION_TYPES.map((roomType) => {
          const isDisabled =
            roomType === RoomsType.KnowledgeRoom && !vectorizationEnabled;
          const roomTypeElement = (
            <RoomType
              id={roomType.toString()}
              key={roomType}
              roomType={roomType}
              type="listItem"
              onClick={() =>
                roomType === RoomsType.AiProjectRoom
                  ? onOpenAiProjectForm?.()
                  : handleClick(roomType)
              }
              isDisabled={isDisabled}
              isOpen={false}
              selectedId={roomType.toString()}
            />
          );
          const tooltipId = `room-type-disabled-tooltip-${roomType}`;

          return isDisabled ? (
            <div key={roomType} id={tooltipId}>
              {roomTypeElement}
              <Tooltip
                id={`${tooltipId}-instance`}
                anchorSelect={`#${tooltipId}`}
                place="bottom"
                float
                getContent={() => knowledgeRoomTooltipContent}
              />
            </div>
          ) : (
            roomTypeElement
          );
        })}
      </div>
    );
  }

  if (isFormsCreate) {
    return (
      <div className={styles.roomTypeList}>
        <RoomType
          id={RoomsType.FormRoom.toString()}
          roomType={RoomsType.FormRoom}
          type="listItem"
          isFormSection
          onClick={() => handleClick(RoomsType.FormRoom)}
          isOpen={false}
          selectedId={RoomsType.FormRoom.toString()}
        />
        <RoomType
          id="Template"
          isTemplate
          isFormSection
          type="listItem"
          onClick={() => handleClick("template")}
          isOpen={false}
          selectedId="Template"
        />
        {onOpenTemplateGallery ? (
          <RoomType
            id="TemplateGallery"
            isTemplateGallery
            type="listItem"
            onClick={onOpenTemplateGallery}
            isOpen={false}
            selectedId="TemplateGallery"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.roomTypeList}>
      {roomTypeValues.map((roomType) => {
        const isFormRoom = roomType === RoomsType.FormRoom;
        const isPublicRoom = roomType === RoomsType.PublicRoom;

        const showFormRoomTooltip = isFormRoom && disabledFormRoom;
        const showPublicRoomTooltip = isPublicRoom && isExternalShareRestricted;
        const showTooltip = showFormRoomTooltip || showPublicRoomTooltip;

        const tooltipContent = showFormRoomTooltip
          ? formRoomTooltipContent
          : publicRoomTooltipContent;

        const roomTypeElement = (
          <RoomType
            id={roomType.toString()}
            key={roomType}
            roomType={roomType}
            type="listItem"
            onClick={() => handleClick(roomType)}
            disabledFormRoom={disabledFormRoom}
            disabledPublicRoom={isExternalShareRestricted}
            isOpen={false}
            selectedId={roomType.toString()}
          />
        );

        const tooltipId = `room-type-disabled-tooltip-${roomType}`;

        return showTooltip ? (
          <div key={roomType} id={tooltipId}>
            {roomTypeElement}
            <Tooltip
              id={`${tooltipId}-instance`}
              anchorSelect={`#${tooltipId}`}
              place="bottom"
              float
              getContent={() => tooltipContent as string}
            />
          </div>
        ) : (
          roomTypeElement
        );
      })}
      <RoomType
        id="Template"
        isTemplate
        type="listItem"
        onClick={() => handleClick("template")}
        disabledFormRoom={disabledFormRoom}
        isOpen={false}
        selectedId="Template"
      />
    </div>
  );
};

export default observer(RoomTypeList);
