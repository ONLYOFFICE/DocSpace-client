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

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { Text } from "@docspace/shared/components/text";
import {
  ContextMenu,
  ContextMenuRefType,
} from "@docspace/shared/components/context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";

import OformsStore from "SRC_DIR/store/OformsStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import ContextOptionsStore from "SRC_DIR/store/ContextOptionsStore";

import commonStyles from "../../helpers/Common.module.scss";

import styles from "./Gallery.module.scss";

type ItemTitleProps = {
  gallerySelected: OformsStore["gallerySelected"] | any;
  getIcon?: FilesSettingsStore["getIcon"];
  currentColorScheme?: SettingsStore["currentColorScheme"];
  getFormGalleryContextOptions?: ContextOptionsStore["getFormGalleryContextOptions"];
  currentExtensionGallery?: OformsStore["currentExtensionGallery"];
};

const ItemTitle = ({
  gallerySelected,
  getIcon,
  currentColorScheme,

  getFormGalleryContextOptions,
  currentExtensionGallery,
}: ItemTitleProps) => {
  const { t } = useTranslation(["FormGallery", "Common"]);

  const itemTitleRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<ContextMenuRefType>(null);

  const navigate = useNavigate();

  const onGetContextOptions = () => {
    if (!getFormGalleryContextOptions) return [];
    let options = getFormGalleryContextOptions?.(gallerySelected, t, navigate);
    options = options.filter((option) => option.key !== "template-info");
    return options;
  };

  const onClickContextMenu = (e: React.MouseEvent) => {
    if (!contextMenuRef.current?.menuRef.current) itemTitleRef.current?.click();
    contextMenuRef.current?.show(e);
  };

  return (
    <div
      className={commonStyles.title}
      ref={itemTitleRef}
      data-testid="info_panel_gallery_item_title"
    >
      <ReactSVG
        className="icon"
        src={getIcon?.(32, currentExtensionGallery) ?? ""}
      />
      <Text className="text">{gallerySelected?.attributes?.name_form}</Text>

      <Text color={currentColorScheme?.main?.accent} className="free-label">
        {t("Common:Free")}
      </Text>
      {gallerySelected ? (
        <div
          className={styles.contextOptions}
          data-testid="info_panel_gallery_context_options"
        >
          <ContextMenu
            ref={contextMenuRef}
            getContextModel={onGetContextOptions}
            withBackdrop={false}
            model={onGetContextOptions()}
            dataTestId="info_panel_gallery_context_menu"
          />
          <ContextMenuButton
            id="info-options"
            className="expandButton"
            title={t("Translations:TitleShowActions")}
            onClick={onClickContextMenu}
            getData={onGetContextOptions}
            directionX="right"
            displayType={ContextMenuButtonDisplayType.toggle}
            testId="info_panel_gallery_context_menu_button"
          />
        </div>
      ) : null}
    </div>
  );
};

export default inject(
  ({
    contextOptionsStore,
    settingsStore,
    filesSettingsStore,
    oformsStore,
  }: TStore) => ({
    getFormGalleryContextOptions:
      contextOptionsStore.getFormGalleryContextOptions,
    currentColorScheme: settingsStore.currentColorScheme,
    getIcon: filesSettingsStore.getIcon,
    currentExtensionGallery: oformsStore.currentExtensionGallery,
  }),
)(observer(ItemTitle));
