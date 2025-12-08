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

import React from "react";
import { useTranslation } from "react-i18next";
import Dropzone from "react-dropzone";
import equal from "fast-deep-equal/react";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg";
import DocumentReactSvgUrl from "PUBLIC_DIR/images/document.react.svg";

import classNames from "classnames";
import { IconButton } from "../icon-button";
import { Button, ButtonSize } from "../button";
import { InputSize, InputType, TextInput } from "../text-input";
import { Loader, LoaderTypes } from "../loader";
import { toastr } from "../toast";

import styles from "./FileInput.module.scss";

import { FileInputProps } from "./FileInput.types";
import { globalColors } from "../../themes";

const FileInputPure = ({
  onInput,
  size = InputSize.base,
  placeholder,
  isDisabled = false,
  scale = false,
  hasError = false,
  hasWarning = false,
  accept = [""],
  id,
  buttonLabel,
  isLoading = false,
  fromStorage = false,
  path,
  idButton,
  isDocumentIcon = false,
  isMultiple = true,
  className,
  "data-test-id": dataTestId,
  ...rest
}: FileInputProps) => {
  const { t } = useTranslation("Common");

  const inputRef = React.useRef<null | HTMLInputElement>(null);

  const [fileName, setFileName] = React.useState("");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toastr.error(t("Common:NotSupportedFormat"));
      return;
    }

    setFileName(
      acceptedFiles.length > 1
        ? acceptedFiles.map((file) => file.name).join(", ")
        : acceptedFiles[0].name,
    );

    onInput?.(acceptedFiles.length > 1 ? acceptedFiles : acceptedFiles[0]);
  };

  const getSize = () => {
    let iconSize = 0;
    let buttonSize = ButtonSize.small;

    switch (size) {
      case InputSize.base:
        iconSize = 15;
        buttonSize = ButtonSize.extraSmall;
        break;
      case InputSize.middle:
        iconSize = 15;
        buttonSize = ButtonSize.small;
        break;
      case InputSize.large:
        iconSize = 16;
        buttonSize = ButtonSize.medium;
        break;
      default:
        break;
    }

    return { iconSize, buttonSize };
  };

  const { iconSize, buttonSize } = getSize();

  const wrapperClasses = classNames(styles.container, className, {
    [styles.scale]: scale ? 1 : 0,
    [styles[size]]: size,
    [styles.error]: hasError,
    [styles.warning]: hasWarning,
    [styles.disabled]: isDisabled,
  });

  const iconClasses = classNames(styles.icon, {
    [styles[size]]: size,
    [styles.disabled]: isDisabled,
    [styles.error]: hasError,
    [styles.warning]: hasWarning,
  });

  const textInputClasses = classNames(
    styles.textInput,
    {
      [styles[size]]: size,
      [styles.disabled]: isDisabled || isLoading,
      [styles.error]: hasError,
      [styles.warning]: hasWarning,
    },
    "text-input",
  );

  const iconButtonClasses = classNames(styles.iconButton, {
    [styles.disabled]: isDisabled,
  });

  const onClickProp =
    fromStorage && !isDisabled ? { onClick: rest.onClick } : {};

  return (
    <Dropzone
      onDrop={onDrop}
      noClick={isDisabled || isLoading}
      accept={accept}
      multiple={isMultiple}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          className={wrapperClasses}
          id={idButton}
          data-testid={dataTestId ?? "file-input"}
          aria-disabled={isDisabled ? "true" : "false"}
          role="button"
          {...rest}
          {...getRootProps()}
        >
          <TextInput
            isReadOnly
            className={textInputClasses}
            placeholder={placeholder}
            value={fromStorage && path ? path : fileName}
            size={size}
            isDisabled={isDisabled || isLoading}
            hasError={hasError}
            hasWarning={hasWarning}
            scale={scale}
            type={InputType.text}
            withBorder
            {...onClickProp}
          />
          {!fromStorage ? (
            <input
              data-testid="upload-click-input"
              type="file"
              id={id}
              ref={inputRef}
              style={{ display: "none" }}
              {...getInputProps()}
            />
          ) : null}

          {buttonLabel ? (
            <Button
              isDisabled={isDisabled}
              label={buttonLabel}
              size={buttonSize}
              type="button"
            />
          ) : (
            <div className={iconClasses} {...onClickProp}>
              {isLoading ? (
                <Loader
                  className={styles.loader}
                  size="20px"
                  type={LoaderTypes.track}
                />
              ) : (
                <IconButton
                  data-testid="icon-button"
                  className={iconButtonClasses}
                  iconNode={
                    isDocumentIcon ? (
                      <DocumentReactSvgUrl />
                    ) : (
                      <CatalogFolderReactSvgUrl />
                    )
                  }
                  color={globalColors.gray}
                  size={iconSize}
                  isDisabled={isDisabled}
                />
              )}
            </div>
          )}
        </div>
      )}
    </Dropzone>
  );
};

export { FileInputPure };

const compare = (
  prevProps: Readonly<FileInputProps>,
  nextProps: Readonly<FileInputProps>,
) => {
  return equal(prevProps, nextProps);
};

export const FileInput = React.memo(FileInputPure, compare);
