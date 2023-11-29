import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";

import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
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

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-right: 30px;
    text-overflow: ellipsis;
  }

  .user-email {
    display: flex;
    gap: 8px;
    overflow: hidden;
    path {
      fill: #a3a9ae;
    }
  }

  .import-email-input {
    width: 357.67px;
  }

  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const DecisionButton = styled(Button)`
  width: 32px;
  height: 32px;
`;

DecisionButton.defaultProps = { theme: Base };

const UsersTableRow = ({
  displayName,
  isChecked,
  toggleAccount,
  email,
  id,
  changeEmail,
  isEmailOpen,
  setOpenedEmailKey,
}) => {
  const { t, ready } = useTranslation(["SMTPSettings", "Settings", "Common"]);

  const [prevEmail, setPrevEmail] = useState(email);
  const [tempEmail, setTempEmail] = useState(email);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPrevEmailValid, setIsPrevEmailValid] = useState(false);

  const emailInputRef = useRef();
  const emailTextRef = useRef();

  const handleEmailChange = (e) => {
    setTempEmail(e.target.value);
  };

  const clearEmail = () => {
    setTempEmail(prevEmail);
    setOpenedEmailKey(null);
  };

  const openEmail = () => setOpenedEmailKey(id);

  const handleSaveEmail = () => {
    setPrevEmail(tempEmail);
    changeEmail(id, tempEmail);
    setOpenedEmailKey(null);
    setIsPrevEmailValid(true);
    !isChecked && toggleAccount();
  };

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    !isPrevEmailValid ||
      emailInputRef.current?.contains(e.target) ||
      emailTextRef.current?.contains(e.target) ||
      toggleAccount();
  };

  const onValidateEmail = (res) => {
    setIsEmailValid(res.isValid);
  };

  useEffect(() => {
    isEmailOpen || prevEmail === tempEmail || setTempEmail(prevEmail);
  }, [isEmailOpen]);

  if (!ready) return <></>;

  return (
    <StyledTableRow onClick={handleAccountToggle} isDisabled={!isPrevEmailValid}>
      <TableCell className="checkboxWrapper">
        <Checkbox
          onChange={handleAccountToggle}
          isChecked={isChecked}
          isDisabled={!isPrevEmailValid}
        />
        <Text fontWeight={600} className="textOverflow">
          {displayName}
        </Text>
      </TableCell>

      <TableCell>
        {isEmailOpen ? (
          <EmailInputWrapper ref={emailInputRef}>
            <EmailInput
              placeholder={t("Settings:NoEmail")}
              className="import-email-input"
              value={tempEmail}
              onChange={handleEmailChange}
              type="email"
              onValidateInput={onValidateEmail}
            />

            <DecisionButton
              icon={<CheckSvg />}
              onClick={handleSaveEmail}
              isDisabled={!isEmailValid}
            />
            <DecisionButton icon={<CrossSvg />} onClick={clearEmail} />
          </EmailInputWrapper>
        ) : (
          <span onClick={openEmail} className="user-email" ref={emailTextRef}>
            <EditSvg />
            <Text fontWeight={600} color="#A3A9AE" className="textOverflow">
              {prevEmail !== "" ? prevEmail : t("EnterEmail")}
            </Text>
          </span>
        )}
      </TableCell>
    </StyledTableRow>
  );
};

export default inject(({ importAccountsStore }) => {
  const { changeEmail } = importAccountsStore;

  return {
    changeEmail,
  };
})(observer(UsersTableRow));
