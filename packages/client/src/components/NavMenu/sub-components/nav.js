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

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { isMobileOnly, isMobile } from "react-device-detect";
import { globalColors } from "@docspace/shared/themes";
import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledNav = styled.nav.attrs(injectDefaultTheme)`
  background-color: ${(props) => props.theme.nav.backgroundColor};
  height: 100%;

  inset-inline-start: 0;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  top: 0;
  transition: width 0.3s ease-in-out;
  width: ${(props) => (props.opened ? "240px" : "0")};
  z-index: 200;
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .version-box {
    position: absolute;

    @media (orientation: landscape) {
      position: ${isMobileOnly && "relative"};
      margin-top: 16px;
    }

    ${(props) =>
      props.numberOfModules &&
      `@media (max-height: ${props.numberOfModules * 52 + 80}px) {
      position: ${!isMobile && "relative"};
      margin-top: 16px;
    }`}

    bottom: 8px;

    inset-inline-start: 16px;

    white-space: nowrap;
    a:focus {
      outline: 0;
    }
  }
`;

const StyledScrollbar = styled(Scrollbar)`
  width: ${(props) => (props.opened ? 240 : 56)};
`;

const Nav = React.memo((props) => {
  // console.log("Nav render");
  const { opened, onMouseEnter, onMouseLeave, children, numberOfModules } =
    props;
  return (
    <StyledNav
      opened={opened}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      numberOfModules={numberOfModules}
    >
      <StyledScrollbar>{children}</StyledScrollbar>
    </StyledNav>
  );
});

Nav.displayName = "Nav";

Nav.propTypes = {
  opened: PropTypes.bool,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Nav;
