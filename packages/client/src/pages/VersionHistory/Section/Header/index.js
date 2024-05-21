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

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import React from "react";
import styled, { css } from "styled-components";
import Headline from "@docspace/shared/components/headline/Headline";
import { IconButton } from "@docspace/shared/components/icon-button";
import { desktop, tablet } from "@docspace/shared/utils";

const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;

  .arrow-button {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -8px;
            margin-left: 15px;
          `
        : css`
            margin-left: -8px;
            margin-right: 15px;
          `}
    min-width: 17px;

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }

    @media ${tablet} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? css`
              padding: 8px 8px 8px 0;
              margin-right: -8px;
            `
          : css`
              padding: 8px 0 8px 8px;
              margin-left: -8px;
            `}
    }
  }

  .headline-header {
    @media ${desktop} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-right: -9px;`
          : `margin-left: -9px;`}
    }
  }
`;

const SectionHeaderContent = (props) => {
  const { title, onClickBack } = props;

  return (
    <StyledContainer>
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        // color="#A3A9AE"
        // hoverColor="#657077"
        isFill={true}
        onClick={onClickBack}
        className="arrow-button"
      />

      <Headline className="headline-header" type="content" truncate={true}>
        {title}
      </Headline>
    </StyledContainer>
  );
};

export default SectionHeaderContent;
