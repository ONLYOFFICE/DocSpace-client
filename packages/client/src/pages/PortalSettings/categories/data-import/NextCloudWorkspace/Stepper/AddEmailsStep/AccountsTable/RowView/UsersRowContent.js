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

import { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";

import { EmailInput } from "@docspace/shared/components/email-input";
import { Button } from "@docspace/shared/components/button";

import EditSvg from "PUBLIC_DIR/images/access.edit.react.svg";
import CrossSvg from "PUBLIC_DIR/images/cross.edit.react.svg";
import CheckSvg from "PUBLIC_DIR/images/check.edit.react.svg";

import { Base } from "@docspace/shared/themes";

const EmailInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const DecisionButton = styled(Button)`
  width: 32px;
  height: 32px;
`;

DecisionButton.defaultProps = { theme: Base };

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
    margin-right: 5px;
    path {
      fill: #a3a9ae;
    }
  }

  .row-main-container-wrapper {
    margin: 0;
  }

  .mainIcons {
    height: auto;
  }
`;

const UsersRowContent = ({
  sectionWidth,
  displayName,
  email,
  id,
  emailInputRef,
  emailTextRef,

  toggleAccount,
  changeEmail,
  isChecked,
  isEmailOpen,
  setOpenedEmailKey,
  setIsPrevEmailValid,
}) => {
  const { t, ready } = useTranslation(["SMTPSettings", "Settings", "Common"]);

  const [prevEmail, setPrevEmail] = useState(email);
  const [tempEmail, setTempEmail] = useState(email);
  const [isEmailValid, setIsEmailValid] = useState(email.length > 0);

  const [hasError, setHasError] = useState(false);

  const handleEmailChange = (e) => {
    setTempEmail(e.target.value);
    hasError && setHasError(false);
  };

  const clearEmail = () => {
    setTempEmail(prevEmail);
    setOpenedEmailKey(null);
    setHasError(false);
  };

  const openEmail = () => setOpenedEmailKey(id);

  const handleSaveEmail = () => {
    setPrevEmail(tempEmail);
    changeEmail(id, tempEmail);
    setOpenedEmailKey(null);
    setIsPrevEmailValid(true);
    !isChecked && toggleAccount();
  };

  const onValidateEmail = (res) => {
    setIsEmailValid(res.isValid);
  };

  const handleSaveClick = () => {
    isEmailValid ? handleSaveEmail() : setHasError(true);
  };

  const checkEmailValidity = () => {
    !isEmailValid && setHasError(true);
  };

  useEffect(() => {
    isEmailOpen ||
      prevEmail === tempEmail ||
      setTempEmail(prevEmail) ||
      setHasError(false);
  }, [isEmailOpen]);

  if (!ready) return <></>;

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      <div className="import-accounts-name">
        <Text fontWeight={600} fontSize="14px">
          {displayName}
        </Text>
        <Text fontWeight={600} fontSize="12px" color="#A3A9AE">
          {prevEmail === "" ? t("Settings:NoEmail") : prevEmail}
        </Text>
      </div>
      {isEmailOpen ? (
        <EmailInputWrapper ref={emailInputRef}>
          <EmailInput
            placeholder={t("Settings:NoEmail")}
            className="import-email-input"
            value={tempEmail}
            onChange={handleEmailChange}
            type="email"
            onValidateInput={onValidateEmail}
            hasError={hasError}
            onBlur={checkEmailValidity}
          />

          <DecisionButton icon={<CheckSvg />} onClick={handleSaveClick} />
          <DecisionButton icon={<CrossSvg />} onClick={clearEmail} />
        </EmailInputWrapper>
      ) : (
        <span onClick={openEmail} className="user-email" ref={emailTextRef}>
          <EditSvg />
        </span>
      )}
    </StyledRowContent>
  );
};

export default inject(({ importAccountsStore }) => {
  const { changeEmail } = importAccountsStore;

  return {
    changeEmail,
  };
})(observer(UsersRowContent));
