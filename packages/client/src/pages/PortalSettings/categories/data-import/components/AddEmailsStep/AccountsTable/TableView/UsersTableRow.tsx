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

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { TableRow, TableCell } from "@docspace/shared/components/table";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { EmailInput } from "@docspace/shared/components/email-input";

import EditSvg from "PUBLIC_DIR/images/access.edit.react.svg";
import CrossSvgUrl from "PUBLIC_DIR/images/cross.edit.react.svg?url";
import CheckSvgUrl from "PUBLIC_DIR/images/check.edit.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import { globalColors } from "@docspace/shared/themes";

import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";
import {
  AddEmailTableRowProps,
  InjectedAddEmailTableRowProps,
} from "../../../../types";

const EmailInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-inline-end: 30px;
    text-overflow: ellipsis;
  }

  .user-email {
    display: flex;
    gap: 8px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};

    path {
      fill: ${(props) => props.theme.client.settings.migration.tableHeaderText};
    }
  }

  .import-email-input {
    width: 357.67px;
  }
`;

const UsersTableRow = (props: AddEmailTableRowProps) => {
  const {
    displayName,
    email,
    isChecked,
    toggleAccount,

    id,
    changeEmail,
    isEmailOpen,
    setOpenedEmailKey,
  } = props as InjectedAddEmailTableRowProps;

  const { t, ready } = useTranslation(["SMTPSettings", "Settings", "Common"]);

  const [prevEmail, setPrevEmail] = useState(email);
  const [tempEmail, setTempEmail] = useState(email);
  const [isEmailValid, setIsEmailValid] = useState(email.length > 0);
  const [isPrevEmailValid, setIsPrevEmailValid] = useState(email.length > 0);

  const [hasError, setHasError] = useState(false);

  const emailInputRef = useRef<HTMLDivElement>(null);
  const emailTextRef = useRef<HTMLSpanElement>(null);

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

  const handleAccountToggle = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      isPrevEmailValid &&
      !(
        emailInputRef.current &&
        emailInputRef.current.contains(e.target as Node)
      ) &&
      !emailTextRef.current?.contains(e.target as Node)
    ) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isEmailValid) {
        handleSaveEmail();
      } else {
        setHasError(true);
      }
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
    <StyledTableRow onClick={handleAccountToggle}>
      <TableCell className="checkboxWrapper">
        <Checkbox
          onChange={handleAccountToggle}
          isChecked={isChecked}
          isDisabled={!isPrevEmailValid}
          truncate
          label={displayName}
        />
      </TableCell>

      <TableCell>
        {isEmailOpen ? (
          <EmailInputWrapper ref={emailInputRef}>
            <EmailInput
              placeholder={t("SMTPSettings:EnterEmail")}
              className="import-email-input"
              value={tempEmail}
              onChange={handleEmailChange}
              onValidateInput={onValidateEmail}
              onKeyDown={handleKeyDown}
              hasError={hasError}
              onBlur={checkEmailValidity}
              isAutoFocussed
            />

            <IconButton
              className="import-check-container-button"
              size={32}
              onClick={handleSaveClick}
              iconName={CheckSvgUrl}
              isFill
              isClickable
              dataTestId="import_check_button"
            />
            <IconButton
              className="import-clear-container-button"
              size={32}
              onClick={clearEmail}
              iconName={CrossSvgUrl}
              isFill
              isClickable
              dataTestId="import_clear_button"
            />
          </EmailInputWrapper>
        ) : (
          <span onClick={openEmail} className="user-email" ref={emailTextRef}>
            <EditSvg />
            <Text color={globalColors.gray} className="user-email" truncate>
              {prevEmail !== "" ? prevEmail : t("Settings:NoEmail")}
            </Text>
          </span>
        )}
      </TableCell>
    </StyledTableRow>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const { changeEmail } = importAccountsStore;

  return {
    changeEmail,
  };
})(observer(UsersTableRow));
