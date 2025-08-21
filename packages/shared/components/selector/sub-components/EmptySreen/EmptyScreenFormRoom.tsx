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

import React from "react";
import { useTranslation } from "react-i18next";

import FormRoomEmptyDarkImageUrl from "PUBLIC_DIR/images/emptyview/selector.form.room.empty.screen.dark.svg?url";
import FormRoomEmptyLightImageUrl from "PUBLIC_DIR/images/emptyview/selector.form.room.empty.screen.light.svg?url";
import Plus16SvgUrl from "PUBLIC_DIR/images/icons/16/plus.svg?url";

import { RoomsType } from "../../../../enums";
import { useTheme } from "../../../../hooks/useTheme";

import { Text } from "../../../text";
import { Heading } from "../../../heading";
import { SelectorAddButton } from "../../../selector-add-button";
import styles from "../../Selector.module.scss";
import { EmptyScreenFormRoomProps } from "../../Selector.types";

const EmptyScreenFormRoom = ({
  onCreateClickAction,
  createDefineRoomType,
}: EmptyScreenFormRoomProps) => {
  const { t } = useTranslation(["Common"]);

  const { isBase } = useTheme();

  const formRoomEmptyScreenImage = isBase
    ? FormRoomEmptyLightImageUrl
    : FormRoomEmptyDarkImageUrl;

  const description =
    createDefineRoomType === RoomsType.FormRoom
      ? t("Common:SelectorFormRoomEmptyScreenDescription")
      : t("Common:SelectorVDREmptyScreenDescription");

  const buttonLabel =
    createDefineRoomType === RoomsType.FormRoom
      ? t("Common:CreateFormFillingRoom")
      : t("Common:CreateVirtualDataRoom");

  return (
    <section className={styles.newEmptyScreen}>
      <img
        className="empty-image"
        src={formRoomEmptyScreenImage}
        alt="empty-screen"
      />
      <Heading level={3} className="empty-header">
        {t("Common:NoRoomsFound")}
      </Heading>
      <Text className="empty-description">{description}</Text>
      <div className="empty_button-wrapper" onClick={onCreateClickAction}>
        <SelectorAddButton
          isAction
          iconSize={16}
          className="empty-button"
          iconName={Plus16SvgUrl}
          title={buttonLabel}
          label={buttonLabel}
          size="36px"
          noSelect
        />
      </div>
    </section>
  );
};

export default EmptyScreenFormRoom;
