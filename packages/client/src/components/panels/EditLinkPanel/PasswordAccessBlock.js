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

import React, { useRef } from "react";
import ToggleBlock from "./ToggleBlock";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/refresh.react.svg?url";
import { FieldContainer } from "@docspace/shared/components/field-container";
import copy from "copy-to-clipboard";
import { toastr } from "@docspace/shared/components/toast";

const PasswordAccessBlock = (props) => {
  const {
    t,
    isLoading,
    isChecked,
    passwordValue,
    setPasswordValue,
    isPasswordValid,
    setIsPasswordValid,
  } = props;

  const passwordInputRef = useRef(null);

  const onGeneratePasswordClick = () => {
    passwordInputRef.current.onGeneratePassword();
  };

  const onCleanClick = () => {
    passwordInputRef.current.setState((s) => ({ ...s, value: "" })); //TODO: PasswordInput bug
    setPasswordValue("");
  };

  const onCopyClick = () => {
    const isPasswordValid = !!passwordValue.trim();
    if (isPasswordValid) {
      copy(passwordValue);
      toastr.success(t("Files:PasswordSuccessfullyCopied"));
    }
  };

  const onChangePassword = (e) => {
    setPasswordValue(e.target.value);
    setIsPasswordValid(true);
  };

  return (
    <ToggleBlock {...props}>
      {isChecked ? (
        <div>
          <div className="edit-link_password-block">
            <FieldContainer
              isVertical
              hasError={!isPasswordValid}
              errorMessage={t("Common:RequiredField")}
              className="edit-link_password-block"
            >
              <PasswordInput
                // scale //doesn't work
                // tabIndex={3}
                // simpleView
                // passwordSettings={{ minLength: 0 }}
                className="edit-link_password-input"
                ref={passwordInputRef}
                simpleView
                isDisabled={isLoading}
                hasError={!isPasswordValid}
                inputValue={passwordValue}
                onChange={onChangePassword}
              />
            </FieldContainer>

            <IconButton
              className="edit-link_generate-icon"
              size="16"
              isDisabled={isLoading}
              iconName={RefreshReactSvgUrl}
              onClick={onGeneratePasswordClick}
            />
          </div>
          <div className="edit-link_password-links">
            <Link
              fontSize="13px"
              fontWeight={600}
              isHovered
              type="action"
              isDisabled={isLoading}
              onClick={onCleanClick}
            >
              {t("Files:Clean")}
            </Link>
            <Link
              fontSize="13px"
              fontWeight={600}
              isHovered
              type="action"
              isDisabled={isLoading}
              onClick={onCopyClick}
            >
              {t("Files:CopyPassword")}
            </Link>
          </div>
        </div>
      ) : (
        <></>
      )}
    </ToggleBlock>
  );
};

export default PasswordAccessBlock;
