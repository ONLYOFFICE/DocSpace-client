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

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import RemoveIcon from "PUBLIC_DIR/images/remove.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import ProtectedReactSvgUrl from "PUBLIC_DIR/images/icons/16/protected.react.svg?url";

import { StyledDownloadContent } from "./StyledDownloadDialog";
import SimulatePassword from "../../../components/SimulatePassword";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { IconButton } from "@docspace/shared/components/icon-button";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";

const PasswordRow = ({
  item,
  resetDownloadedFileFormat,
  discardDownloadedFile,
  updateDownloadedFilePassword,
  getItemIcon,
  type,
}) => {
  const [showPasswordInput, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const { t } = useTranslation([
    "UploadPanel",
    "DownloadDialog",
    "Files",
    "Common",
  ]);
  const inputRef = useRef(null);

  const onInputClick = () => {
    const newState = !showPasswordInput;

    setShowPassword(newState);
  };

  const onButtonClick = () => {
    onInputClick();
    updateDownloadedFilePassword(item.id, password, type);
  };

  const onChangePassword = (password) => {
    setPassword(password);
  };

  const onChangeInOriginal = () => {
    resetDownloadedFileFormat(item.id, item.fileExst, type);
  };

  const removeFromList = () => {
    discardDownloadedFile(item.id, type);
  };

  const onKeyUp = (event) => {
    if ((!showPasswordInput && type === "password") || !password) return;

    event.stopPropagation();
    event.preventDefault();

    if (event.key === "Enter") {
      onButtonClick();
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", onKeyUp, true);

    return () => {
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [onKeyUp]);

  const getOptions = () => {
    const options = [
      {
        ...(type !== "original" && {
          key: "original-format",
          label: t("DownloadDialog:OriginalFormat"),
          onClick: onChangeInOriginal,
          disabled: false,
          icon: DownloadAsReactSvgUrl,
        }),
      },
      {
        key: "original-format",
        label: t("EnterPassword"),
        onClick: onInputClick,
        disabled: false,
        icon: ProtectedReactSvgUrl,
      },
      {
        ...(type !== "remove" && {
          key: "remove",
          label: t("Files:RemoveFromList"),
          onClick: removeFromList,
          disabled: false,
          icon: RemoveIcon,
        }),
      },
    ];

    return options;
  };

  const element = getItemIcon(item);

  return (
    <StyledDownloadContent>
      <div className="download-dialog-row">
        <div
          className="download-dialog-main-content password-content"
          onClick={onInputClick}
        >
          <IconButton
            className="remove-icon"
            size={16}
            iconName={ProtectedReactSvgUrl}
            onClick={onInputClick}
          />
          <div>{element}</div>
          <Text fontWeight="600" fontSize="14px" className="password-title">
            {item.title}
          </Text>
        </div>
        <div className="download-dialog-actions">
          <ContextMenuButton
            className="expandButton"
            directionX="right"
            getData={getOptions}
            title={t("Common:Actions")}
            isDisabled={false}
            usePortal
            iconName={VerticalDotsReactSvgUrl}
          />
        </div>
      </div>
      {showPasswordInput && (
        <div className="password-input">
          <SimulatePassword
            onChange={onChangePassword}
            forwardedRef={inputRef}
            inputValue={password}
          />
          <Button
            id="conversion-button"
            className="conversion-password_button"
            size={"small"}
            scale
            primary
            label={t("Common:SaveButton")}
            onClick={onButtonClick}
            isDisabled={!password}
          />
        </div>
      )}
    </StyledDownloadContent>
  );
};
export default inject(({ filesStore, dialogsStore }) => {
  const {
    resetDownloadedFileFormat,
    discardDownloadedFile,
    updateDownloadedFilePassword,
  } = dialogsStore;

  return {
    resetDownloadedFileFormat,
    discardDownloadedFile,
    updateDownloadedFilePassword,
  };
})(observer(PasswordRow));