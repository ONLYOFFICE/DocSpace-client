import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import RowContent from "@docspace/components/row-content";

import EmailInput from "@docspace/components/email-input";
import Button from "@docspace/components/button";

import EditSvg from "PUBLIC_DIR/images/access.edit.react.svg";
import CrossSvg from "PUBLIC_DIR/images/cross.edit.react.svg";
import CheckSvg from "PUBLIC_DIR/images/check.edit.react.svg";

import { Base } from "@docspace/components/themes";

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
    isEmailOpen || prevEmail === tempEmail || setTempEmail(prevEmail) || setHasError(false);
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
