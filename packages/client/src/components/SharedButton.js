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

import CatalogShareSmallReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.share.small.react.svg?url";
import CatalogSharedReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.shared.react.svg?url";
import React from "react";
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";

import { inject, observer } from "mobx-react";

const SharedButton = ({
  t,
  id,
  isFolder,
  shared,
  onSelectItem,
  setSharingPanelVisible,
  isSmallIcon = false,
  theme,
}) => {
  const color = shared
    ? theme.filesSharedButton.sharedColor
    : theme.filesSharedButton.color;

  const onClickShare = () => {
    onSelectItem({ id, isFolder });
    setSharingPanelVisible(true);
  };

  const icon = isSmallIcon
    ? CatalogShareSmallReactSvgUrl
    : CatalogSharedReactSvgUrl;

  return (
    <Text
      className="share-button"
      as="span"
      title={t("Share")}
      fontSize="12px"
      fontWeight={600}
      color={color}
      display="inline-flex"
      onClick={onClickShare}
    >
      <IconButton
        className="share-button-icon"
        color={color}
        hoverColor={theme.filesSharedButton.sharedColor}
        size={isSmallIcon ? 12 : 16}
        iconName={icon}
      />
      {t("Share")}
    </Text>
  );
};

export default inject(({ settingsStore, filesActionsStore, dialogsStore }) => {
  return {
    theme: settingsStore.theme,
    onSelectItem: filesActionsStore.onSelectItem,
    setSharingPanelVisible: dialogsStore.setSharingPanelVisible,
  };
})(observer(SharedButton));
