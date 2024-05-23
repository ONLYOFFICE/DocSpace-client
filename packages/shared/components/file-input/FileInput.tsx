// (c) Copyright Ascensio System SIA 2009-2024
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

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import DocumentReactSvgUrl from "PUBLIC_DIR/images/document.react.svg?url";

import { IconButton } from "../icon-button";
import { Button, ButtonSize } from "../button";
import { InputSize, InputType, TextInput } from "../text-input";
import { Loader, LoaderTypes } from "../loader";
import { toastr } from "../toast";

import StyledFileInput from "./FileInput.styled";
import { FileInputProps } from "./FileInput.types";

const FileInputPure = ({
  onInput,
  size = InputSize.base,
  placeholder,
  isDisabled,
  scale,
  hasError,
  hasWarning,
  accept,
  id,
  buttonLabel,
  isLoading,
  fromStorage = false,
  path,
  idButton,
  isDocumentIcon,
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

    onInput(acceptedFiles.length > 1 ? acceptedFiles : acceptedFiles[0]);
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
      case InputSize.big:
        iconSize = 16;
        buttonSize = ButtonSize.normal;
        break;
      case InputSize.huge:
        iconSize = 16;
        buttonSize = ButtonSize.medium;
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

  const onClickProp =
    fromStorage && !isDisabled ? { onClick: rest.onClick } : {};

  return (
    <Dropzone onDrop={onDrop} noClick={isDisabled || isLoading} accept={accept}>
      {({ getRootProps, getInputProps }) => (
        <StyledFileInput
          scale={scale ? 1 : 0}
          hasError={hasError}
          hasWarning={hasWarning}
          id={idButton}
          isDisabled={isDisabled}
          {...rest}
          {...getRootProps()}
          size={size}
          data-testid="file-input"
        >
          <TextInput
            isReadOnly
            className="text-input"
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
          {!fromStorage && (
            <input
              type="file"
              id={id}
              ref={inputRef}
              style={{ display: "none" }}
              {...getInputProps()}
            />
          )}

          {buttonLabel ? (
            <Button
              isDisabled={isDisabled}
              label={buttonLabel}
              size={buttonSize}
            />
          ) : (
            <div className="icon" {...onClickProp}>
              {isLoading ? (
                <Loader
                  className="loader"
                  size="20px"
                  type={LoaderTypes.track}
                />
              ) : (
                <IconButton
                  className="icon-button"
                  iconName={
                    isDocumentIcon
                      ? DocumentReactSvgUrl
                      : CatalogFolderReactSvgUrl
                  }
                  color="#A3A9AE"
                  size={iconSize}
                  isDisabled={isDisabled}
                />
              )}
            </div>
          )}
        </StyledFileInput>
      )}
    </Dropzone>
  );
};

FileInputPure.defaultProps = {
  scale: false,
  hasWarning: false,
  hasError: false,
  isDisabled: false,
  isLoading: false,
  accept: [""],
  isDocumentIcon: false,
};

export { FileInputPure };

const compare = (
  prevProps: Readonly<FileInputProps>,
  nextProps: Readonly<FileInputProps>,
) => {
  return equal(prevProps, nextProps);
};

export const FileInput = React.memo(FileInputPure, compare);
