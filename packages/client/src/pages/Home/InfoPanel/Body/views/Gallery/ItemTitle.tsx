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

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import classNames from "classnames";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { Text } from "@docspace/ui-kit/components/text";
import {
  ContextMenu,
  ContextMenuRefType,
} from "@docspace/ui-kit/components/context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/ui-kit/components/context-menu-button";

import OformsStore from "SRC_DIR/store/OformsStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import ContextOptionsStore from "SRC_DIR/store/ContextOptionsStore";

import commonStyles from "../../helpers/Common.module.scss";

import styles from "./Gallery.module.scss";

type ItemTitleProps = {
  gallerySelected:
    | OformsStore["gallerySelected"]
    | {
        attributes: { name_form: string };
      };
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
      className={classNames(commonStyles.title, {
        [commonStyles.aside]: true,
      })}
      ref={itemTitleRef}
      data-testid="info_panel_gallery_item_title"
    >
      <ReactSVG
        className="icon"
        src={getIcon?.(32, currentExtensionGallery) ?? ""}
      />
      <Text className={classNames(styles.select, "text")}>
        {gallerySelected?.attributes?.name_form}
      </Text>

      <Text
        color={currentColorScheme?.main?.accent ?? undefined}
        className="free-label"
      >
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
            title={t("Common:TitleShowActions")}
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
