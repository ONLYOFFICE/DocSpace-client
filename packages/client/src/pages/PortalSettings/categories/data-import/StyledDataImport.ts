// (c) Copyright Ascensio System SIA 2009-2026
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

import React from "react";

import { TableContainer } from "@docspace/ui-kit/components/table";
import { Paging } from "@docspace/ui-kit/components/paging";

import styles from "./StyledDataImport.module.scss";

export const WorkspacesContainer = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.workspacesContainer, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const Wrapper = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.wrapper, className].filter(Boolean).join(" "),
      style,
      ...rest,
    },
    children,
  );

export const StyledTableContainer = ({
  className,
  children,
  ...rest
}: React.ComponentProps<typeof TableContainer>) =>
  React.createElement(
    TableContainer,
    {
      className: [styles.styledTableContainer, className]
        .filter(Boolean)
        .join(" "),
      ...rest,
    },
    children,
  );

export const DescriptionWrapper = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.descriptionWrapper, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const SelectFileLoader = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.selectFileLoader, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const DataImportLoader = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.dataImportLoader, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const SectionWrapper = ({
  isChecked,
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { isChecked: boolean }) =>
  React.createElement(
    "div",
    {
      className: [
        styles.sectionWrapper,
        !isChecked ? styles.sectionWrapperUnchecked : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const FlexContainer = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.flexContainer, className].filter(Boolean).join(" "),
      style,
      ...rest,
    },
    children,
  );

export const ImportItemWrapper = ({
  isChecked,
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { isChecked: boolean }) =>
  React.createElement(
    "div",
    {
      className: [
        styles.importItemWrapper,
        !isChecked ? styles.importItemWrapperUnchecked : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const ArrowWrapper = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.arrowWrapper, className].filter(Boolean).join(" "),
      style,
      ...rest,
    },
    children,
  );

export const MigrationButtonsWrapper = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.migrationButtonsWrapper, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const CancelMigrationButton = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) =>
  React.createElement(
    "span",
    {
      className: [styles.cancelMigrationButton, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const StyledPaging = ({
  className,
  ...rest
}: React.ComponentProps<typeof Paging>) =>
  React.createElement(Paging, {
    className: [styles.styledPaging, className].filter(Boolean).join(" "),
    ...rest,
  });

export const SelectFileWrapper = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.selectFileWrapper, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const FileUploadContainer = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.fileUploadContainer, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const ErrorBlock = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.errorBlock, className].filter(Boolean).join(" "),
      style,
      ...rest,
    },
    children,
  );

export const ImportCompleteWrapper = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.importCompleteWrapper, className]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );

export const ImportStepWrapper = ({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement(
    "div",
    {
      className: [styles.importWrapper, className].filter(Boolean).join(" "),
      style,
      ...rest,
    },
    children,
  );

export const StyledInfoBlock = ({
  isLimitReached,
  isAdmins,
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  isLimitReached?: boolean;
  isAdmins?: boolean;
}) =>
  React.createElement(
    "div",
    {
      className: [
        styles.styledInfoBlock,
        isAdmins ? styles.isAdmins : "",
        isLimitReached ? styles.limitReached : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
      style,
      ...rest,
    },
    children,
  );
