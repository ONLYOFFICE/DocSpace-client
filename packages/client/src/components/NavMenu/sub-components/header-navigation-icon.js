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
import { ReactSVG } from "react-svg";
import { Badge } from "@docspace/shared/components/badge";
import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledContainer = styled.div.attrs(injectDefaultTheme)`
  position: relative;
  width: 20px;
  height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-inline-end: 22px;

  .navigation-item__svg {
    height: 20px;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    svg {
      width: 20px;
      height: 20px;
      path {
        fill: ${(props) =>
          props.active
            ? props.theme.header.productColor
            : props.theme.header.linkColor};
      }
    }
  }

  .navigation-item__badge {
    position: absolute;
    top: -8px;

    inset-inline-end: -8px;

    width: 12px;
    height: 12px;

    display: flex;
    align-items: center;
    justify-content: center;

    div {
      width: 2px;
      height: 12px;

      display: flex;
      align-items: center;
      justify-content: center;

      p {
        font-weight: 800;
        font-size: 9px;
        line-height: 12px;
      }
    }
  }
`;

const HeaderNavigationIcon = ({
  id,
  iconUrl,
  link,
  active,
  badgeNumber,
  onItemClick,
  onBadgeClick,
  url,
  ...rest
}) => {
  return (
    <StyledContainer active={active} {...rest}>
      <ReactSVG
        onClick={onItemClick}
        className="navigation-item__svg"
        src={iconUrl}
        {...rest}
      />

      {badgeNumber > 0 ? (
        <Badge
          className="navigation-item__badge"
          label={badgeNumber}
          onClick={onBadgeClick}
        />
      ) : null}
    </StyledContainer>
  );
};

HeaderNavigationIcon.propTypes = {
  id: PropTypes.string,
  iconUrl: PropTypes.string,
  link: PropTypes.string,
  active: PropTypes.bool,
  badgeNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func,
  onBadgeClick: PropTypes.func,
  url: PropTypes.string,
};

export default React.memo(HeaderNavigationIcon);
