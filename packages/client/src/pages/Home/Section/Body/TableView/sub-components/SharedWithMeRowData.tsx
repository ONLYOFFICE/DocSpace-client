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

import { FC } from "react";
import classNames from "classnames";
import type { TFunction } from "i18next";
import { inject, observer } from "mobx-react";

import { TableCell } from "@docspace/shared/components/table";
import type { TTheme } from "@docspace/shared/themes";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { LinkProps } from "@docspace/shared/utils/plugin-file-utils";
import { getLastColumn } from "@docspace/shared/utils";

import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";

import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import FileNameCell from "./FileNameCell";
import AccessLevelCell from "./AccessLevelCell";

interface SharedWithMeRowDataProps {
  t: TFunction;
  item: TFile | TFolder;
  theme: TTheme;
  value: string;
  selectionProp: {
    className: string;
    value: string;
    documentTitle: string;
  };
  dragStyles: {
    style: React.CSSProperties;
  };
  index: number;

  updatedDate: string;
  createdDate: string;
  lastOpenedDate: string;
  isRecentFolder: boolean;

  inProgress: boolean;
  element: React.ReactNode;
  titleWithoutExt: string;
  linkStyles: LinkProps;
  isIndexEditingMode: boolean;
  displayFileExtension: boolean;
  badgesComponent: React.ReactNode;
  quickButtonsComponent: React.ReactNode;
  fileOwner: string;

  create?: unknown;
  checkedProps: boolean;
  showHotkeyBorder?: boolean;
  onContentFileSelect?: (checked: boolean, item: TFile | TFolder) => void;
}

interface InjectedSharedWithMeRowDataProps {
  authorShareWithMeColumnIsEnabled: boolean;
  accessLevelShareWithMeColumnIsEnabled: boolean;
  modifiedShareWithMeColumnIsEnabled: boolean;
  sizeShareWithMeColumnIsEnabled: boolean;
  typeShareWithMeColumnIsEnabled: boolean;
  tableStorageName: string;
}

const SharedWithMeRowData: FC<
  SharedWithMeRowDataProps & InjectedSharedWithMeRowDataProps
> = (props) => {
  const {
    value,
    theme,
    index,
    element,
    dragStyles,
    inProgress,
    checkedProps,
    selectionProp,
    // showHotkeyBorder,
    onContentFileSelect,
    badgesComponent,
    quickButtonsComponent,

    authorShareWithMeColumnIsEnabled,
    accessLevelShareWithMeColumnIsEnabled,
    modifiedShareWithMeColumnIsEnabled,
    sizeShareWithMeColumnIsEnabled,
    typeShareWithMeColumnIsEnabled,
    tableStorageName,
  } = props;

  const lastColumn = getLastColumn(tableStorageName);

  const lastColumnContent = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  const sideColor = theme.filesSection.tableView.row.sideColor;

  return (
    <>
      <TableCell
        {...dragStyles}
        value={value}
        dataTestId={`shared-with-me-cell-name-${index}`}
        className={classNames(
          selectionProp?.className,
          "table-container_file-name-cell",
        )}
      >
        <FileNameCell<TFile | TFolder>
          theme={theme}
          checked={checkedProps}
          element={element}
          inProgress={inProgress}
          onContentSelect={onContentFileSelect}
          t={props.t}
          item={props.item}
          linkStyles={props.linkStyles}
          titleWithoutExt={props.titleWithoutExt}
          isIndexEditingMode={props.isIndexEditingMode}
          displayFileExtension={props.displayFileExtension}
        />
        <StyledBadgesContainer>{badgesComponent}</StyledBadgesContainer>
        {lastColumn === "Name" ? lastColumnContent : null}
      </TableCell>

      {authorShareWithMeColumnIsEnabled ? (
        <TableCell
          dataTestId={`shared-with-me-cell-author-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorShareWithMe" ? "no-extra-space" : "",
          )}
        >
          <AuthorCell
            sideColor={sideColor}
            fileOwner={props.fileOwner}
            item={props.item}
          />
          {lastColumn === "AuthorShareWithMe" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {accessLevelShareWithMeColumnIsEnabled ? (
        <TableCell
          dataTestId={`shared-with-me-cell-access-level-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AccessLevelShareWithMe" ? "no-extra-space" : "",
          )}
        >
          <AccessLevelCell
            sideColor={sideColor}
            item={props.item}
            t={props.t}
          />
          {lastColumn === "AccessLevelShareWithMe" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {modifiedShareWithMeColumnIsEnabled ? (
        <TableCell
          dataTestId={`shared-with-me-cell-modified-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ModifiedShareWithMe" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={sideColor}
            create={props.create}
            updatedDate={props.updatedDate}
            createdDate={props.createdDate}
            lastOpenedDate={props.lastOpenedDate}
            isRecentFolder={props.isRecentFolder}
          />
          {lastColumn === "ModifiedShareWithMe" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {sizeShareWithMeColumnIsEnabled ? (
        <TableCell
          dataTestId={`shared-with-me-cell-size-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "SizeShareWithMe" ? "no-extra-space" : "",
          )}
        >
          <SizeCell sideColor={sideColor} item={props.item} />
          {lastColumn === "SizeShareWithMe" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {typeShareWithMeColumnIsEnabled ? (
        <TableCell
          dataTestId={`shared-with-me-cell-type-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "TypeShareWithMe" ? "no-extra-space" : "",
          )}
        >
          <TypeCell sideColor={sideColor} t={props.t} item={props.item} />
          {lastColumn === "TypeShareWithMe" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject<
  TStore,
  SharedWithMeRowDataProps,
  InjectedSharedWithMeRowDataProps
>(({ tableStore }) => {
  const {
    authorShareWithMeColumnIsEnabled,
    accessLevelShareWithMeColumnIsEnabled,
    modifiedShareWithMeColumnIsEnabled,
    sizeShareWithMeColumnIsEnabled,
    typeShareWithMeColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    authorShareWithMeColumnIsEnabled,
    accessLevelShareWithMeColumnIsEnabled,
    modifiedShareWithMeColumnIsEnabled,
    sizeShareWithMeColumnIsEnabled,
    typeShareWithMeColumnIsEnabled,
    tableStorageName,
  };
})(observer(SharedWithMeRowData));
