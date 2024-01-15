import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

import MenuIcon from "PUBLIC_DIR/images/menu.react.svg";
import { mobile } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

const StyledIconBox = styled.div`
  display: none;

  @media ${mobile} {
    display: flex;
  }

  align-items: center;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `padding-right: 16px;`
      : `padding-left: 16px;`}
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
`;

const StyledMenuIcon = styled(MenuIcon)`
  width: 20px;
  height: 20px;

  path {
    fill: ${(props) => props.theme.catalog.headerBurgerColor};
  }

  cursor: pointer;
`;

StyledMenuIcon.defaultProps = { theme: Base };

const HeaderCatalogBurger = (props) => {
  const { isProduct, onClick, ...rest } = props;

  return (
    <StyledIconBox onClick={onClick} name="catalog-burger" {...rest}>
      <StyledMenuIcon />
    </StyledIconBox>
  );
};

HeaderCatalogBurger.propTypes = {
  isProduct: PropTypes.bool,
  onClick: PropTypes.func,
};

export default React.memo(HeaderCatalogBurger);
