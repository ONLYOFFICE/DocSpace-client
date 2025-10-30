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

import { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/rows";

import { EmailInput } from "@docspace/shared/components/email-input";
import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";

import { isMobile } from "@docspace/shared/utils";

import EditSvg from "PUBLIC_DIR/images/access.edit.react.svg";
import CrossSvgUrl from "PUBLIC_DIR/images/cross.edit.react.svg?url";
import CheckSvgUrl from "PUBLIC_DIR/images/check.edit.react.svg?url";

import { globalColors } from "@docspace/shared/themes";

import EmailChangeDialog from "SRC_DIR/components/dialogs/EmailChangeDialog";
import { IconButton } from "@docspace/shared/components/icon-button";
import {
  AddEmailRowContentProps,
  InjectedAddEmailRowContentProps,
} from "../../../../types";

const EmailInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButtonWrapper = styled.div`
  width: 32px;
  height: 32px;

  border: var(--selector-item-input-button-border);
  border-radius: 3px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;

  div {
    height: 16px;
  }

  &:hover {
    div {
      cursor: pointer;
    }
    cursor: pointer;

    border-color: var(--selector-item-input-button-border-hover);

    svg path {
      fill: var(--selector-item-input-button-border-hover);
    }
  }
`;

const StyledRowContent = styled(RowContent)`
  display: flex;
  align-items: center;

  .import-accounts-name {
    font-weight: 600;
    font-size: 14px;
    display: flex;
    flex-direction: column;
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .user-email {
    margin-inline-end: 5px;
    font-size: 12px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};

    path {
      fill: ${(props) => props.theme.client.settings.migration.tableHeaderText};
    }
  }

  .row-main-container-wrapper {
    margin: 0;
    width: 100%;
  }

  .mainIcons {
    height: auto;
  }
`;

const UsersRowContent = (props: AddEmailRowContentProps) => {
  const {
    id,
    sectionWidth,
    displayName,
    email,
    emailInputRef,
    emailTextRef,
    isChecked,
    isEmailOpen,
    setOpenedEmailKey,
    toggleAccount,

    changeEmail,
    setIsPrevEmailValid,
  } = props as InjectedAddEmailRowContentProps;
  const { t, ready } = useTranslation(["SMTPSettings", "Settings", "Common"]);

  const [prevEmail, setPrevEmail] = useState(email);
  const [tempEmail, setTempEmail] = useState(email);
  const [isEmailValid, setIsEmailValid] = useState(email.length > 0);

  const [hasError, setHasError] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempEmail(e.target.value);
    if (hasError) {
      setHasError(false);
    }
  };

  const clearEmail = () => {
    setTempEmail(prevEmail);
    setOpenedEmailKey("");
    setHasError(false);
  };

  const openEmail = () => setOpenedEmailKey(id);

  const handleSaveEmail = () => {
    setPrevEmail(tempEmail);
    changeEmail(id, tempEmail);
    setOpenedEmailKey("");
    setIsPrevEmailValid(true);
    if (!isChecked) {
      toggleAccount();
    }
  };

  const onValidateEmail = (res: TValidate) => {
    setIsEmailValid(res.isValid);
    return { isValid: res.isValid, errors: res.errors || [] };
  };

  const handleSaveClick = () => {
    if (isEmailValid) {
      handleSaveEmail();
    } else {
      setHasError(true);
    }
  };

  const checkEmailValidity = () => {
    if (!isEmailValid) {
      setHasError(true);
    }
  };

  useEffect(() => {
    if (!isEmailOpen && prevEmail !== tempEmail) {
      setTempEmail(prevEmail);
      setHasError(false);
    }
  }, [isEmailOpen, prevEmail, tempEmail]);

  if (!ready) return;

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      <div className="import-accounts-name">
        <Text fontWeight={600} fontSize="14px">
          {displayName}
        </Text>
        <Text
          className="user-email"
          fontWeight={600}
          fontSize="12px"
          color={globalColors.gray}
        >
          {prevEmail === "" ? t("Settings:NoEmail") : prevEmail}
        </Text>
      </div>
      {isEmailOpen ? (
        isMobile() ? (
          <EmailChangeDialog
            visible={isEmailOpen}
            onClose={clearEmail}
            tempEmail={tempEmail}
            handleEmailChange={handleEmailChange}
            onValidateEmail={onValidateEmail}
            hasError={hasError}
            checkEmailValidity={checkEmailValidity}
            handleSave={handleSaveClick}
            displayName={displayName}
          />
        ) : (
          <EmailInputWrapper ref={emailInputRef}>
            <EmailInput
              placeholder={t("SMTPSettings:EnterEmail")}
              className="import-email-input"
              value={tempEmail}
              onChange={handleEmailChange}
              onValidateInput={onValidateEmail}
              hasError={hasError}
              onBlur={checkEmailValidity}
              isAutoFocussed
              dataTestId="change_email_input"
            />

            <IconButtonWrapper onClick={handleSaveClick}>
              <IconButton
                className="import-check-container-button"
                size={16}
                iconName={CheckSvgUrl}
                dataTestId="change_email_save_button"
              />
            </IconButtonWrapper>

            <IconButtonWrapper onClick={clearEmail}>
              <IconButton
                className="import-clear-container-button"
                size={16}
                iconName={CrossSvgUrl}
                dataTestId="change_email_clear_button"
              />
            </IconButtonWrapper>
          </EmailInputWrapper>
        )
      ) : (
        <span
          onClick={openEmail}
          className="user-email"
          ref={emailTextRef}
          data-testid="open_email_button"
        >
          <EditSvg />
        </span>
      )}
    </StyledRowContent>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const { changeEmail } = importAccountsStore;

  return {
    changeEmail,
  };
})(observer(UsersRowContent));
