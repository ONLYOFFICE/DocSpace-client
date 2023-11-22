import React, { useState, useRef } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";

import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
import TextInput from "@docspace/components/text-input";

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

  .email-input {
    width: 357.67px;
  }

  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const DecisionButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 3px;
  border: 1px solid #d0d5da;

  &:hover {
    svg {
      path {
        fill: ${(props) => props.theme.iconButton.hoverColor};
      }
    }
    border-color: ${(props) => props.theme.iconButton.hoverColor};
  }
`;

DecisionButton.defaultProps = { theme: Base };

const UsersTableRow = ({ displayName, isChecked, toggleAccount, email, id, changeEmail }) => {
  const { t, ready } = useTranslation(["SMTPSettings", "Settings", "Common"]);

  const [prevEmail, setPrevEmail] = useState(email);
  const [tempEmail, setTempEmail] = useState(email);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const emailInputRef = useRef();
  const emailTextRef = useRef();

  const handleEmailChange = (e) => {
    setTempEmail(e.target.value);
  };

  const clearEmail = () => {
    setTempEmail(prevEmail);
    setIsEmailOpen(false);
  };

  const openEmail = () => setIsEmailOpen(true);

  const handleSaveEmail = () => {
    setPrevEmail(tempEmail);
    changeEmail(id, tempEmail);
    setIsEmailOpen(false);
  };

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    emailInputRef.current?.contains(e.target) ||
      emailTextRef.current?.contains(e.target) ||
      toggleAccount(e);
  };

  if (!ready) return <></>;

  return (
    <StyledTableRow checked={isChecked} onClick={handleAccountToggle}>
      <TableCell>
        <Checkbox onChange={handleAccountToggle} isChecked={isChecked} />
        <Text fontWeight={600} className="textOverflow">
          {displayName}
        </Text>
      </TableCell>

      <TableCell>
        {isEmailOpen ? (
          <EmailInputWrapper ref={emailInputRef}>
            <TextInput
              placeholder={t("Settings:NoEmail")}
              className="email-input"
              value={tempEmail}
              onChange={handleEmailChange}
            />

            <DecisionButton onClick={handleSaveEmail}>
              <CheckSvg />
            </DecisionButton>
            <DecisionButton onClick={clearEmail}>
              <CrossSvg />
            </DecisionButton>
          </EmailInputWrapper>
        ) : (
          <span onClick={openEmail} className="user-email" ref={emailTextRef}>
            <EditSvg />
            <Text fontWeight={600} color="#A3A9AE" className="textOverflow">
              {tempEmail !== "" ? tempEmail : t("EnterEmail")}
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
