// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useContext } from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import PlusSvgUrl from "PUBLIC_DIR/images/icons/12/plus.svg?url";
import UpSvgUrl from "PUBLIC_DIR/images/up.svg?url";
import FormRoomEmptyDarkImageUrl from "PUBLIC_DIR/images/emptyview/selector.form.room.empty.screen.dark.svg?url";
import FormRoomEmptyLightImageUrl from "PUBLIC_DIR/images/emptyview/selector.form.room.empty.screen.light.svg?url";
import Plus16SvgUrl from "PUBLIC_DIR/images/icons/16/plus.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

import { RoomsType } from "../../../enums";

import { Heading } from "../../heading";
import { Text } from "../../text";
import { IconButton } from "../../icon-button";
import { Link, LinkType } from "../../link";
import { SelectorAddButton } from "../../selector-add-button";

import { StyledEmptyScreen, StyledNewEmptyScreen } from "../Selector.styled";
import { EmptyScreenProps } from "../Selector.types";

import useCreateDropDown from "../hooks/useCreateDropDown";
import { EmptyScreenContext } from "../contexts/EmptyScreen";

import NewItemDropDown from "./NewItemDropDown";
import { SearchContext, SearchDispatchContext } from "../contexts/Search";

const linkStyles = {
  isHovered: true,
  type: LinkType.action,
  fontWeight: "600",
  className: "empty-folder_link",
  display: "flex",
};

const EmptyScreen = ({
  withSearch,
  items,
  inputItemVisible,
}: EmptyScreenProps) => {
  const {
    emptyScreenImage,
    emptyScreenHeader,
    emptyScreenDescription,
    searchEmptyScreenImage,
    searchEmptyScreenHeader,
    searchEmptyScreenDescription,
  } = useContext(EmptyScreenContext);

  const theme = useTheme();
  const { t } = useTranslation(["Common"]);

  const { onClearSearch } = useContext(SearchContext);
  const setIsSearch = useContext(SearchDispatchContext);
  const { isOpenDropDown, setIsOpenDropDown, onCloseDropDown } =
    useCreateDropDown();

  const formRoomEmptyScreenImage = theme.isBase
    ? FormRoomEmptyLightImageUrl
    : FormRoomEmptyDarkImageUrl;

  const currentImage = withSearch ? searchEmptyScreenImage : emptyScreenImage;
  const currentHeader = withSearch
    ? searchEmptyScreenHeader
    : emptyScreenHeader;
  const currentDescription = withSearch
    ? searchEmptyScreenDescription
    : emptyScreenDescription;

  const createItem = items.length > 0 ? items[0] : null;

  const onCreateClickAction = () => {
    if (
      !createItem ||
      (!createItem.onCreateClick && !createItem.dropDownItems) ||
      isOpenDropDown ||
      inputItemVisible
    )
      return;

    if (createItem.dropDownItems) return setIsOpenDropDown(true);

    createItem.onCreateClick?.();
  };

  if (
    !withSearch &&
    createItem?.isRoomsOnly &&
    createItem.createDefineRoomType === RoomsType.FormRoom
  )
    return (
      <StyledNewEmptyScreen>
        <img
          className="empty-image"
          src={formRoomEmptyScreenImage}
          alt="empty-screen"
        />
        <Heading level={3} className="empty-header">
          {t("Common:NoRoomsFound")}
        </Heading>
        <Text className="empty-description" noSelect>
          {t("Common:SelectorFormRoomEmptyScreenDescription")}
        </Text>
        <div className="empty_button-wrapper" onClick={onCreateClickAction}>
          <SelectorAddButton
            isAction
            iconSize={16}
            className="empty-button"
            iconName={Plus16SvgUrl}
            title={t("Common:CreateFormFillingRoom")}
          />
          <Text className="empty-button-label" noSelect>
            {t("Common:CreateFormFillingRoom")}
          </Text>
        </div>
      </StyledNewEmptyScreen>
    );

  return (
    <StyledEmptyScreen withSearch={withSearch}>
      <img className="empty-image" src={currentImage} alt="empty-screen" />

      <Heading level={3} className="empty-header">
        {currentHeader}
      </Heading>

      <Text className="empty-description" noSelect>
        {currentDescription}
      </Text>
      {createItem && (
        <div className="buttons">
          <div className="empty-folder_container-links">
            <IconButton
              className="empty-folder_container-icon"
              size={12}
              onClick={onCreateClickAction}
              iconName={PlusSvgUrl}
              isFill
            />
            <Link {...linkStyles} onClick={onCreateClickAction}>
              {items[0].label}
            </Link>
            {isOpenDropDown && createItem && createItem.dropDownItems && (
              <NewItemDropDown
                dropDownItems={createItem.dropDownItems}
                isEmpty
                onCloseDropDown={onCloseDropDown}
              />
            )}
          </div>
          <div className="empty-folder_container-links">
            <IconButton
              className="empty-folder_container-icon"
              size={12}
              onClick={
                withSearch
                  ? () => onClearSearch?.(() => setIsSearch(false))
                  : createItem.onBackClick
              }
              iconName={withSearch ? ClearEmptyFilterSvgUrl : UpSvgUrl}
              isFill
            />
            <Link
              {...linkStyles}
              onClick={
                withSearch
                  ? () => onClearSearch?.(() => setIsSearch(false))
                  : createItem.onBackClick
              }
            >
              {withSearch ? t("Common:ClearFilter") : t("Common:Back")}
            </Link>
          </div>
        </div>
      )}
    </StyledEmptyScreen>
  );
};

export { EmptyScreen };
