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

import { isMobile } from "@docspace/ui-kit/utils/device";
import { showPreviewThreshold } from "../constants";
import styles from "./StyledPresets.module.scss";

const cn =
  (...classes) =>
  (extra) =>
    [...classes, extra].filter(Boolean).join(" ");

export const SDKContainer = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.sdkContainer, isMobile() ? styles.isMobile : "")(
      className,
    )}
    style={{ "--show-preview-threshold": `${showPreviewThreshold}px`, ...style }}
    {...rest}
  >
    {children}
  </div>
);

export const Controls = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.controls, isMobile() ? styles.isMobile : "")(
      className,
    )}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const CategoryHeader = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.categoryHeader, isMobile() ? styles.isMobile : "")(
      className,
    )}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const CategorySubHeader = ({
  className,
  style,
  children,
  ...rest
}) => (
  <div
    className={cn(
      styles.categorySubHeader,
      isMobile() ? styles.isMobile : "",
      className?.includes("copy-window-code") ? styles.copyWindowCode : "",
    )(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const CategoryDescription = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.categoryDescription)(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const ControlsGroup = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.controlsGroup, isMobile() ? styles.isMobile : "")(
      className,
    )}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const CheckboxGroup = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.checkboxGroup)(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const LabelGroup = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.labelGroup)(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const ControlsSection = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.controlsSection)(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const Frame = ({
  width,
  height,
  targetId,
  className,
  style,
  children,
  ...rest
}) => (
  <div
    className={cn(
      styles.frame,
      isMobile() ? styles.isMobile : "",
      !width ? styles.noWidth : "",
      !height ? styles.noHeight : "",
    )(className)}
    style={{
      "--frame-width": width || "100%",
      "--frame-height": height || "100%",
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

export const Container = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.container, isMobile() ? styles.isMobile : "")(
      className,
    )}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const RowContainer = ({ combo, className, style, children, ...rest }) => (
  <div
    className={cn(styles.rowContainer, combo ? styles.combo : "")(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const ColumnContainer = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.columnContainer, isMobile() ? styles.isMobile : "")(
      className,
    )}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const Preview = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.preview, isMobile() ? styles.isMobile : "")(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const GetCodeButtonWrapper = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.getCodeButtonWrapper)(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const FilesSelectorInputWrapper = ({
  className,
  style,
  children,
  ...rest
}) => (
  <div
    className={cn(styles.filesSelectorInputWrapper)(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const SelectedItemsContainer = ({
  className,
  style,
  children,
  ...rest
}) => (
  <div
    className={cn(styles.selectedItemsContainer)(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const PreviewColumn = ({ className, style, children, ...rest }) => (
  <div
    className={cn(styles.previewColumn)(className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export const CodeWrapper = ({ height, className, style, children, ...rest }) => (
  <div
    className={cn(styles.codeWrapper)(className)}
    style={{ "--code-wrapper-height": height || "400px", ...style }}
    {...rest}
  >
    {children}
  </div>
);
