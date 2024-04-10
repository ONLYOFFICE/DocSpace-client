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

import React from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { tablet } from "@docspace/shared/utils";

const truncateCss = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const commonCss = css`
  margin: 0;
  font-family: "Open Sans";
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  font-style: normal;
  font-weight: 600;
`;

const StyledTileContent = styled.div`
  width: 100%;
  display: inline-flex;
`;

const MainContainerWrapper = styled.div`
  ${commonCss};

  display: flex;
  align-self: center;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: auto;`
      : `margin-right: auto;`}
`;

const MainContainer = styled.div`
  height: 20px;

  @media ${tablet} {
    ${truncateCss};
  }
`;

const TileContent = (props) => {
  const { children, id, className, style, onClick } = props;

  return (
    <StyledTileContent
      id={id}
      className={className}
      style={style}
      onClick={onClick}
    >
      <MainContainerWrapper
        mainContainerWidth={children.props && children.props.containerWidth}
      >
        <MainContainer className="row-main-container">{children}</MainContainer>
      </MainContainerWrapper>
    </StyledTileContent>
  );
};

TileContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  sideColor: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default TileContent;
