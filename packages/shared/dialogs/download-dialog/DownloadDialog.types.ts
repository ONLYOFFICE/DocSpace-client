/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import type { JSX } from "react";
import type { TTranslation } from "../../types";
import type { TFile, TFolder } from "../../api/files/types";
import type { LinkWithDropDownProps } from "../../components/link-with-dropdown";
import type { ContextMenuTypeOnClick } from "../../components/context-menu";

import {
  type DownloadedDocumentType,
  ProtectedFileCategoryType,
} from "./DownloadDialog.enums";

export type TDownloadedFile = (TFile | TFolder) & {
  checked?: boolean;
  format?: string | null;
  oldFormat?: string | null;
  password?: string;
};

export type TSortedFiles = Record<DownloadedDocumentType, TDownloadedFile[]>;

export type TSortedDownloadFiles = Partial<
  Record<ProtectedFileCategoryType, TDownloadedFile[]>
>;

export type DownloadRowProps = {
  t: TTranslation;
  file: TDownloadedFile;
  onRowSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: DownloadedDocumentType;
  dropdownItems: LinkWithDropDownProps["data"];
  isOther: boolean;
  isChecked?: boolean;
  getItemIcon: (item: TDownloadedFile) => React.ReactNode;
  dataTestId?: string;
};

export type DownloadContentProps = {
  t: TTranslation;
  items: TDownloadedFile[];
  onSelectFormat: ContextMenuTypeOnClick;
  onRowSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  titleFormat?: string;
  type: DownloadedDocumentType;
  extsConvertible: Record<string, string[]>;
  title: string;
  isChecked?: boolean;
  isIndeterminate: boolean;
  getItemIcon: (item: TDownloadedFile) => React.ReactNode;
  dataTestId?: string;
};

export type PasswordRowProps = {
  item: TDownloadedFile;
  resetDownloadedFileFormat: (
    id: number,
    fileExst: string,
    type: ProtectedFileCategoryType,
  ) => void;
  discardDownloadedFile: (id: number, type: ProtectedFileCategoryType) => void;
  updateDownloadedFilePassword: (
    id: number,
    password: string,
    type: ProtectedFileCategoryType,
  ) => void;
  getItemIcon: (item: TDownloadedFile) => React.ReactNode;
  type: ProtectedFileCategoryType;
};

export type PasswordContentProps = {
  getItemIcon: (item: TDownloadedFile) => React.ReactNode;
  sortedDownloadFiles: TSortedDownloadFiles;
  resetDownloadedFileFormat: (
    id: number,
    fileExst: string,
    type: ProtectedFileCategoryType,
  ) => void;
  discardDownloadedFile: (id: number, type: ProtectedFileCategoryType) => void;
  updateDownloadedFilePassword: (
    id: number,
    password: string,
    type: ProtectedFileCategoryType,
  ) => void;
};

export type OnePasswordRowProps = {
  item: TDownloadedFile;
  getItemIcon: (item: TDownloadedFile) => React.ReactNode;
  onDownload: (files: TDownloadedFile[]) => void;
  downloadItems: TDownloadedFile[];
  onClosePanel: VoidFunction;
  visible: boolean;
};

export type TFileConvertId = { key: number; value: string; password?: string };

export type TTranslationsForDownload = {
  label: string;
  error: string;
  passwordError: JSX.Element;
};

export type DownloadDialogProps = {
  sortedFiles: TSortedFiles;
  setDownloadItems: (items: TDownloadedFile[]) => void;
  downloadItems: TDownloadedFile[];
  downloadFiles: (
    fileConvertIds: TFileConvertId[],
    folderIds: number[],
    translations: TTranslationsForDownload,
  ) => void;
  getDownloadItems: (
    itemList: TDownloadedFile[],
    t: TTranslation,
  ) => [TFileConvertId[], number[], string | null];
  sortedPasswordFiles: TDownloadedFile[];
  updateDownloadedFilePassword: (
    id: number,
    password: string,
    type: ProtectedFileCategoryType,
  ) => void;
  sortedDownloadFiles: TSortedDownloadFiles;
  resetDownloadedFileFormat: (
    id: number,
    fileExst: string,
    type: ProtectedFileCategoryType,
  ) => void;
  discardDownloadedFile: (id: number, type: ProtectedFileCategoryType) => void;
  visible: boolean;
  setDownloadDialogVisible: (value: boolean) => void;
  setSortedPasswordFiles: (
    value: Record<ProtectedFileCategoryType, TDownloadedFile[]>,
  ) => void;
  getIcon: (size: number, extension?: string) => string;
  getFolderIcon: (size: number) => string;
  extsConvertible: Record<string, string[]>;
};

export function isFile(
  item: TDownloadedFile,
): item is Exclude<TDownloadedFile, TFolder> {
  return "fileExst" in item;
}
