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

import AuthorCell from "../../TableView/sub-components/AuthorCell";
import DateCell from "../../TableView/sub-components/DateCell";
import ErasureCell from "../../TableView/sub-components/ErasureCell";
import FileNameCell from "../../TableView/sub-components/FileNameCell";
import SizeCell from "../../TableView/sub-components/SizeCell";
import TypeCell from "../../TableView/sub-components/TypeCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../../TableView/StyledTable";

import { useFilesRow } from "../row/FilesRowContext";

type TCellProps = {
  /** The last rendered column carries the row's quick buttons. */
  isLast: boolean;
  sideColor: string;
};

/**
 * The quick buttons sit at the end of the last column rather than in a column
 * of their own, as in the old table, so they take no width while there is
 * room. `isLast` follows the visible columns, where the old table parsed it out
 * of `localStorage`.
 */
const QuickButtons = ({ isLast }: Pick<TCellProps, "isLast">) => {
  const row = useFilesRow();
  if (!isLast || !row) return null;

  return (
    <StyledQuickButtonsContainer>
      {row.quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );
};

const withQuickButtons = (cell: React.ReactNode, isLast: boolean) => (
  <>
    {cell}
    <QuickButtons isLast={isLast} />
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
        isIndexEditingMode={false}
        displayFileExtension={row.displayFileExtension}
      />
      <StyledBadgesContainer>{row.badgesComponent}</StyledBadgesContainer>
    </>,
    isLast,
  );
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
  if (!row) return null;

  return withQuickButtons(
    <TypeCell t={row.t} item={row.item} sideColor={sideColor} />,
    isLast,
  );
};
