import React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { mobile } from "@docspace/shared/utils";
import { getLogoFromPath } from "@docspace/common/utils";

const StyledNav = styled.div`
  display: none;
  height: 48px;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme?.login?.navBackground};

  svg {
    path:last-child {
      fill: ${(props) => props.theme.client?.home?.logoColor};
    }
  }
  @media ${mobile} {
    display: flex;
  }
`;

interface ISimpleNav extends IInitialState {
  theme: IUserTheme;
}

const SimpleNav = ({ theme, logoUrls }: ISimpleNav) => {
  const logo = logoUrls && Object.values(logoUrls)[0];

  const logoUrl = !logo
    ? undefined
    : !theme?.isBase
    ? getLogoFromPath(logo.path.dark)
    : getLogoFromPath(logo.path.light);

  return (
    <StyledNav id="login-header" theme={theme}>
      <img src={logoUrl} />
    </StyledNav>
  );
};

export default inject(({ loginStore }) => {
  return { theme: loginStore.theme };
})(observer(SimpleNav));
