import React, { useState } from "react";
import styled from "styled-components";
import Text from "@docspace/components/text";
import RowContent from "@docspace/components/row-content";

import TextInput from "@docspace/components/text-input";

import EditSvg from "PUBLIC_DIR/images/access.edit.react.svg";
import CrossSvg from "PUBLIC_DIR/images/cross.edit.react.svg";
import CheckSvg from "PUBLIC_DIR/images/check.edit.react.svg";

import { Base } from "@docspace/components/themes";

const EmailInputWrapper = styled.div`
  display: flex;
  gap: 8px;
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
  }

  .row-main-container-wrapper {
    margin: 0;
  }

  .mainIcons {
    height: auto;
  }
`;

const UsersRowContent = ({ sectionWidth, displayName }) => {
  const [email, setEmail] = useState("");
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const clearEmail = () => {
    setEmail("");
    setIsEmailOpen(false);
  };

  const openEmail = () => setIsEmailOpen(true);
  const closeEmail = () => setIsEmailOpen(false);

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      <div className="import-accounts-name">
        <Text fontWeight={600} fontSize="14px">
          {displayName}
        </Text>
        <Text fontWeight={600} fontSize="12px" color="#A3A9AE">
          {email === "" ? "NO EMAIL" : email}
        </Text>
      </div>
      {isEmailOpen ? (
        <EmailInputWrapper>
          <TextInput
            placeholder="Enter email"
            className="email-input"
            value={email}
            onChange={handleEmailChange}
          />

          <DecisionButton onClick={closeEmail}>
            <CheckSvg />
          </DecisionButton>
          <DecisionButton onClick={clearEmail}>
            <CrossSvg />
          </DecisionButton>
        </EmailInputWrapper>
      ) : (
        <span onClick={openEmail} className="user-email">
          <EditSvg />
        </span>
      )}
    </StyledRowContent>
  );
};

export default UsersRowContent;
