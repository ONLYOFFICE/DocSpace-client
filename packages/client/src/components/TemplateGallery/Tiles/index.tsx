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

import { Key, useEffect, useCallback } from "react";
import { observer, inject } from "mobx-react";

import { withTranslation } from "react-i18next";

import type { FC } from "react";
import type { TilesProps, TFile } from "./Tiles.types";
import FileTile from "./FileTile";

import InfiniteGrid from "../InfiniteGrid";
import SubmitToGalleryTile from "./SubmitToGalleryTile";
import useTemplateGalleryHotkeys from "../hooks/useTemplateGalleryHotkeys";

const Tiles: FC<TilesProps> = ({
  tReady,
  oformFiles,
  hasMoreFiles,
  fetchMoreFiles,
  setGallerySelected,
  submitToGalleryTileIsVisible,
  canSubmitToFormGallery,
  setOformFilesLoaded,
  isShowOneTile,
  smallPreview,
  setIsVisibleInfoPanelTemplateGallery,
  viewMobile,
  onCreateTemplate,
  setTemplateGalleryVisible,
  isShowInitSkeleton,
  hotkeysResetKey,
  setSubmitToGalleryDialogVisible,
}) => {
  useEffect(() => {
    setOformFilesLoaded(tReady && oformFiles?.length > 0);
  }, [tReady, oformFiles]);

  const onClickInfo = useCallback(
    (item: { id: Key | null | undefined }) => {
      if (!item) return;
      setIsVisibleInfoPanelTemplateGallery(true);
      setGallerySelected(item);
    },
    [setIsVisibleInfoPanelTemplateGallery, setGallerySelected],
  );

  const onClick = useCallback(
    (item: { id: Key | null | undefined }) => {
      setGallerySelected(item);
      onCreateTemplate();
      setSubmitToGalleryDialogVisible(false);
    },
    [setGallerySelected, onCreateTemplate],
  );

  const handleSelectByIndex = useCallback(
    (index: number) => {
      if (oformFiles && oformFiles[index]) {
        onClick(oformFiles[index]);
      }
    },
    [oformFiles, onClick],
  );

  const handleInfoSelectByIndex = useCallback(
    (index: number) => {
      if (oformFiles && oformFiles[index]) {
        onClickInfo(oformFiles[index]);
      }
    },
    [oformFiles, onClickInfo],
  );

  const hasSubmitTile =
    !isShowInitSkeleton &&
    submitToGalleryTileIsVisible &&
    canSubmitToFormGallery() &&
    (oformFiles?.length || 0) > 0;

  const { focusedIndex, isSubmitTileFocused } = useTemplateGalleryHotkeys({
    itemsCount: oformFiles?.length || 0,
    isShowOneTile,
    onSelect: handleSelectByIndex,
    onInfoSelect: handleInfoSelectByIndex,
    enabled: !isShowInitSkeleton,
    resetKey: hotkeysResetKey,
    hasSubmitTile,
    submitTileSpan: smallPreview || viewMobile ? 2 : 1,
  });

  const submitToGalleryTileNode =
    submitToGalleryTileIsVisible &&
    canSubmitToFormGallery() &&
    oformFiles?.length > 0 ? (
      <SubmitToGalleryTile
        viewMobile={viewMobile}
        smallPreview={smallPreview}
        isSubmitTile
        isKeyboardFocused={isSubmitTileFocused}
      />
    ) : null;

  return (
    <div className="tile-container">
      {viewMobile && !isShowInitSkeleton ? submitToGalleryTileNode : null}
      <InfiniteGrid
        filesList={oformFiles}
        hasMoreFiles={hasMoreFiles}
        fetchMoreFiles={fetchMoreFiles}
        isShowOneTile={isShowOneTile}
        smallPreview={smallPreview}
        showLoading={isShowInitSkeleton}
      >
        {viewMobile && !isShowInitSkeleton ? null : submitToGalleryTileNode}
        {isShowInitSkeleton
          ? null
          : oformFiles.map((item: TFile, index: number) => {
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

export default inject<TStore>(
  ({
    settingsStore,
    accessRightsStore,
    oformsStore,
    contextOptionsStore,
    dialogsStore,
  }) => ({
    theme: settingsStore.theme,
    oformFiles: oformsStore.oformFiles,
    hasGalleryFiles: oformsStore.hasGalleryFiles,
    hasMoreFiles: oformsStore.hasMoreForms,
    fetchMoreFiles: oformsStore.fetchMoreOforms,
    setGallerySelected: oformsStore.setGallerySelected,
    resetFilters: oformsStore.resetFilters,
    submitToGalleryTileIsVisible: oformsStore.submitToGalleryTileIsVisible,
    canSubmitToFormGallery: accessRightsStore.canSubmitToFormGallery,
    setOformFilesLoaded: oformsStore.setOformFilesLoaded,
    categoryFilterLoaded: oformsStore.categoryFilterLoaded,
    languageFilterLoaded: oformsStore.languageFilterLoaded,
    oformFilesLoaded: oformsStore.oformFilesLoaded,
    onCreateTemplate: contextOptionsStore.onCreateTemplate,
    setTemplateGalleryVisible: oformsStore.setTemplateGalleryVisible,
    setIsVisibleInfoPanelTemplateGallery:
      oformsStore.setIsVisibleInfoPanelTemplateGallery,
    setSubmitToGalleryDialogVisible:
      dialogsStore.setSubmitToGalleryDialogVisible,
  }),
)(withTranslation(["Common", "FormGallery"])(observer(Tiles)));
