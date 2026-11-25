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

import { useEffect, useCallback, useState } from "react";
import { observer, inject } from "mobx-react";

import { getCountTilesInGallery } from "@docspace/shared/utils";

import { withTranslation } from "react-i18next";
import { withoutInjected } from "SRC_DIR/helpers/injected";

import type { FC } from "react";
import type { TilesProps, TFile } from "./Tiles.types";
import FileTile from "./FileTile";

import InfiniteGrid from "../InfiniteGrid";
import useTemplateGalleryHotkeys from "../hooks/useTemplateGalleryHotkeys";

const Tiles: FC<TilesProps> = ({
  tReady,
  galleryTemplates,
  hasMoreFiles,
  fetchMoreFiles,
  setGallerySelected,
  setGalleryTemplatesLoaded,
  isShowOneTile,
  smallPreview,
  setIsVisibleInfoPanelTemplateGallery,
  onCreateTemplate,
  setTemplateGalleryVisible,
  isShowInitSkeleton,
  hotkeysResetKey,
  setSubmitToGalleryDialogVisible,
  filterPanelVisible,
}) => {
  useEffect(() => {
    setGalleryTemplatesLoaded(tReady && galleryTemplates?.length > 0);
  }, [tReady, galleryTemplates]);

  const onClickInfo = useCallback(
    (item: TFile) => {
      if (!item) return;
      setIsVisibleInfoPanelTemplateGallery(true);
      setGallerySelected(item);
    },
    [setIsVisibleInfoPanelTemplateGallery, setGallerySelected],
  );

  const onClick = useCallback(
    (item: TFile) => {
      setGallerySelected(item);
      onCreateTemplate();
      setSubmitToGalleryDialogVisible(false);
    },
    [setGallerySelected, onCreateTemplate],
  );

  const handleSelectByIndex = useCallback(
    (index: number) => {
      if (galleryTemplates && galleryTemplates[index]) {
        onClick(galleryTemplates[index]);
      }
    },
    [galleryTemplates, onClick],
  );

  const handleInfoSelectByIndex = useCallback(
    (index: number) => {
      if (galleryTemplates && galleryTemplates[index]) {
        onClickInfo(galleryTemplates[index]);
      }
    },
    [galleryTemplates, onClickInfo],
  );

  const [gridColumns, setGridColumns] = useState(0);
  const countTilesInRow = gridColumns || getCountTilesInGallery(isShowOneTile);

  const { focusedIndex } = useTemplateGalleryHotkeys({
    itemsCount: galleryTemplates?.length || 0,
    columnsCount: countTilesInRow,
    onSelect: handleSelectByIndex,
    onInfoSelect: handleInfoSelectByIndex,
    enabled: !isShowInitSkeleton && !filterPanelVisible,
    resetKey: hotkeysResetKey,
  });

  return (
    <div className="tile-container">
      <InfiniteGrid
        filesList={galleryTemplates}
        hasMoreFiles={hasMoreFiles}
        fetchMoreFiles={fetchMoreFiles}
        isShowOneTile={isShowOneTile}
        countTilesInRow={countTilesInRow}
        onGridColumnsChange={setGridColumns}
        smallPreview={smallPreview}
        showLoading={isShowInitSkeleton}
      >
        {isShowInitSkeleton
          ? null
          : galleryTemplates.map((item: TFile, index: number) => {
              return (
                <FileTile
                  key={item.id}
                  item={item}
                  smallPreview={smallPreview}
                  onClickInfo={() => onClickInfo(item)}
                  onClick={() => onClick(item)}
                  isFocused={focusedIndex === index}
                />
              );
            })}
      </InfiniteGrid>
    </div>
  );
};

const injectStores = ({
  settingsStore,
  templateGalleryStore,
  contextOptionsStore,
  dialogsStore,
}: TStore) => ({
  theme: settingsStore.theme,
  galleryTemplates: templateGalleryStore.galleryTemplates,
  hasGalleryFiles: templateGalleryStore.hasGalleryFiles,
  hasMoreFiles: templateGalleryStore.hasMoreForms,
  fetchMoreFiles: templateGalleryStore.fetchMoreGalleryTemplates,
  setGallerySelected: templateGalleryStore.setGallerySelected,
  resetFilters: templateGalleryStore.resetFilters,
  setGalleryTemplatesLoaded: templateGalleryStore.setGalleryTemplatesLoaded,
  categoryFilterLoaded: templateGalleryStore.categoryFilterLoaded,
  languageFilterLoaded: templateGalleryStore.languageFilterLoaded,
  galleryTemplatesLoaded: templateGalleryStore.galleryTemplatesLoaded,
  onCreateTemplate: contextOptionsStore.onCreateTemplate,
  setTemplateGalleryVisible: templateGalleryStore.setTemplateGalleryVisible,
  setIsVisibleInfoPanelTemplateGallery:
    templateGalleryStore.setIsVisibleInfoPanelTemplateGallery,
  setSubmitToGalleryDialogVisible: dialogsStore.setSubmitToGalleryDialogVisible,
  filterPanelVisible: templateGalleryStore.filterPanelVisible,
});

export default withoutInjected<TilesProps, ReturnType<typeof injectStores>>(
  inject<TStore>(injectStores)(
    withTranslation(["Common", "FormGallery"])(observer(Tiles)),
  ),
);
