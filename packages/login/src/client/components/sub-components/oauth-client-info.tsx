import React from "react";
import styled from "styled-components";

//@ts-ignore
import Text from "@docspace/components/text";
//@ts-ignore
import Link from "@docspace/components/link";

const StyledOAuthContainer = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 8px;

  margin-bottom: 20px;

  img {
    width: 36px;
    height: 36px;
  }

  .row {
    width: 100%;
    text-align: center;
  }

  .login-link {
    cursor: normal;
  }
`;

interface IOAuthClientInfo {
  name: string;
  logo: string;
  isAuth: boolean;
}

const OAuthClientInfo = ({ name, logo, isAuth }: IOAuthClientInfo) => {
  return (
    <StyledOAuthContainer>
      <img src={logo} alt={"client-logo"} />
      <Text className={"row"} fontSize={"20px"} lineHeight={"30px"}>
        {isAuth ? "Selected account" : "Sign in"}{" "}
      </Text>
      <Text className={"row"}>
        to continue to{" "}
        <Link
          className={"login-link"}
          type="page"
          fontWeight="600"
          isHovered={false}
          noHover
        >
          {name}
        </Link>
      </Text>
    </StyledOAuthContainer>
  );
};

export default OAuthClientInfo;
