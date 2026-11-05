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

import type React from "react";

import type { TFile } from "@docspace/shared/api/files/types";
import { VDRIndexingAction } from "@docspace/shared/enums";
import { IndexIconButtons } from "@onlyoffice/apps-ui-kit/components/rows";

import AccessLevelCell from "../../TableView/sub-components/AccessLevelCell";
import AuthorCell from "../../TableView/sub-components/AuthorCell";
import DateCell from "../../TableView/sub-components/DateCell";
import ErasureCell from "../../TableView/sub-components/ErasureCell";
import FileNameCell from "../../TableView/sub-components/FileNameCell";
import IndexCell from "../../TableView/sub-components/IndexCell";
import LocationCell from "../../TableView/sub-components/LocationCell";
import SharedByCell from "../../TableView/sub-components/SharedByCell";
import SizeCell from "../../TableView/sub-components/SizeCell";
import TagsCell from "../../TableView/sub-components/TagsCell";
import TypeCell from "../../TableView/sub-components/TypeCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../../TableView/StyledTable";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";

import { useFilesRow } from "../row/FilesRowContext";
import { useFilesTable } from "../row/FilesTableContext";

type TCellProps = {
  /** The last rendered column carries the row's quick buttons. */
  isLast: boolean;
  sideColor: string;
};

// Pushed to the end of the name cell, which has no column of its own to fill.
const INDEX_BUTTONS_IN_NAME: React.CSSProperties = {
  justifyContent: "flex-end",
  flexGrow: "1",
};

/**
 * The quick buttons sit at the end of the last column rather than in a column
 * of their own, as in the old table, so they take no width while there is
 * room; while the rows are reordered, the arrows that move the row take their
 * place. `isLast` follows the visible columns, where the old table parsed it
 * out of `localStorage`.
 */
const QuickButtons = ({
  isLast,
  inName,
}: {
  isLast: boolean;
  inName: boolean;
}) => {
  const row = useFilesRow();
  if (!isLast || !row) return null;

  if (row.isIndexEditingMode)
    return (
      <IndexIconButtons
        containerClassName="index-arrows-container"
        style={inName ? INDEX_BUTTONS_IN_NAME : undefined}
        commonIconClassName="change-index_icon"
        onUpIndexClick={(e) =>
          row.onChangeIndex(e, VDRIndexingAction.HigherIndex)
        }
        onDownIndexClick={(e) =>
          row.onChangeIndex(e, VDRIndexingAction.LowerIndex)
        }
      />
    );

  return (
    <StyledQuickButtonsContainer>
      {row.quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );
};

const withQuickButtons = (
  cell: React.ReactNode,
  isLast: boolean,
  inName = false,
) => (
  <>
    {cell}
    <QuickButtons isLast={isLast} inName={inName} />
  </>
);

export const NameCell = ({ isLast }: Pick<TCellProps, "isLast">) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <>
      <FileNameCell
        t={row.t}
        item={row.item}
        theme={row.theme}
        element={row.element}
        checked={row.checked}
        inProgress={row.inProgress}
        linkStyles={row.linkStyles}
        titleWithoutExt={row.titleWithoutExt}
        onContentSelect={row.onContentFileSelect}
        isIndexEditingMode={row.isIndexEditingMode}
        displayFileExtension={row.displayFileExtension}
      />
      <StyledBadgesContainer>{row.badgesComponent}</StyledBadgesContainer>
    </>,
    isLast,
    true,
  );
};

/** The item's place in the room's order. */
export const IndexColumnCell = ({
  sideColor,
}: Pick<TCellProps, "sideColor">) => {
  const row = useFilesRow();
  if (!row) return null;

  return <IndexCell item={row.item} sideColor={sideColor} />;
};

export const AuthorColumnCell = ({ isLast, sideColor }: TCellProps) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <AuthorCell
      item={row.item}
      sideColor={sideColor}
      fileOwner={row.fileOwner}
    />,
    isLast,
  );
};

export const DateColumnCell = ({
  isLast,
  sideColor,
  create,
}: TCellProps & { create: boolean }) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <DateCell
      create={create}
      sideColor={sideColor}
      createdDate={row.createdDate}
      updatedDate={row.updatedDate}
      lastOpenedDate=""
      isRecentFolder={false}
    />,
    isLast,
  );
};

export const LastOpenedColumnCell = ({ isLast, sideColor }: TCellProps) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <DateCell
      create={false}
      sideColor={sideColor}
      createdDate={row.createdDate}
      updatedDate={row.updatedDate}
      lastOpenedDate={row.lastOpenedDate}
      isRecentFolder
    />,
    isLast,
  );
};

export const LocationColumnCell = ({ isLast, sideColor }: TCellProps) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <LocationCell item={row.item as TFile} sideColor={sideColor} />,
    isLast,
  );
};

export const SharedByColumnCell = ({ isLast, sideColor }: TCellProps) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <SharedByCell item={row.item} sideColor={sideColor} />,
    isLast,
  );
};

export const AccessLevelColumnCell = ({ isLast, sideColor }: TCellProps) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <AccessLevelCell t={row.t} item={row.item} sideColor={sideColor} />,
    isLast,
  );
};

export const ErasureColumnCell = ({ isLast, sideColor }: TCellProps) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <ErasureCell t={row.t} sideColor={sideColor} item={row.item} />,
    isLast,
  );
};

export const SizeColumnCell = ({ isLast, sideColor }: TCellProps) => {
  const row = useFilesRow();
  if (!row) return null;

  return withQuickButtons(
    <SizeCell item={row.item} sideColor={sideColor} />,
    isLast,
  );
};

export const TypeColumnCell = ({ isLast, sideColor }: TCellProps) => {
  const row = useFilesRow();
  const { isExternalShareRestricted, blockExistingLinksOnRestrict } =
    useFilesTable();
  if (!row) return null;

  return withQuickButtons(
    <TypeCell
      t={row.t}
      item={row.item}
      sideColor={sideColor}
      isExternalShareRestricted={isExternalShareRestricted}
      blockExistingLinksOnRestrict={blockExistingLinksOnRestrict}
    />,
    isLast,
  );
};

/** A room's tags; all of them while the row is hovered, selected or acted on. */
export const TagsColumnCell = ({ isLast }: TCellProps) => {
  const row = useFilesRow();
  const { tagCount } = useFilesTable();
  if (!row) return null;

  return withQuickButtons(
    <TagsCell
      item={row.item}
      tagCount={tagCount}
      isHovered={row.isHovered}
      isActive={row.isActive}
      checkedProps={row.checked}
    />,
    isLast,
  );
};

/** A room's storage, and its quota where one is set. */
export const QuotaColumnCell = ({ isLast }: TCellProps) => {
  const row = useFilesRow();
  if (!row) return null;

  // A room's rights, which the file and folder types do not list.
  const security = row.item.security as { EditRoom?: boolean } | undefined;

  return withQuickButtons(
    <SpaceQuota item={row.item} type="room" isReadOnly={!security?.EditRoom} />,
    isLast,
  );
};
