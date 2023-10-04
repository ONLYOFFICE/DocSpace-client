import React from "react";
import styled from "styled-components";

//@ts-ignore
import Avatar from "@docspace/components/avatar";
//@ts-ignore
import Text from "@docspace/components/text";
//@ts-ignore
import Button from "@docspace/components/button";

const StyledContainer = styled.div`
  width: 100%;

  height: auto;

  .button-container {
    width: 100%;

    margin-top: 24px;

    display: flex;
    gap: 16px;
  }
`;

const StyledRow = styled.div`
  width: 100%;

  height: 49px;

  box-sizing: border-box;

  display: flex;

  align-items: center;
  gap: 8px;

  div {
    display: flex;
    flex-direction: column;

    .description {
      color: #858585;
    }
  }
`;

interface ISelectUser {
  self: ISelf;
  onOAuthLogin: () => void;
  showLoginForm: () => void;
}

const SelectUser = ({ self, onOAuthLogin, showLoginForm }: ISelectUser) => {
  return (
    <StyledContainer>
      <StyledRow className="row">
        <Avatar
          size={"small"}
          userName={self.displayName}
          source={self.hasAvatar ? self.avatarSmall : ""}
        />
        <div>
          <Text>{self.displayName}</Text>
          <Text className={"description"}>{self.email}</Text>
        </div>
      </StyledRow>

      <div className="button-container">
        <Button
          size={"normal"}
          scale
          primary
          label={"Continue"}
          onClick={onOAuthLogin}
        />
        <Button
          size={"normal"}
          scale
          label={"Cancel"}
          onClick={showLoginForm}
        />
      </div>
    </StyledContainer>
  );
};

export default SelectUser;
