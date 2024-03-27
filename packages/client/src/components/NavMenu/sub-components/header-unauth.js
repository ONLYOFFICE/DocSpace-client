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
import PropTypes from "prop-types";
import styled from "styled-components";
import { Box } from "@docspace/shared/components/box";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/shared/themes";
import { mobile } from "@docspace/shared/utils";

const Header = styled.header`
  align-items: left;
  background-color: ${(props) => props.theme.header.backgroundColor};
  display: flex;
  width: 100vw;
  height: 48px;
  justify-content: center;

  .header-items-wrapper {
    width: 960px;

    @media ${mobile} {
      width: 475px;
      display: flex;
      align-items: center;
      justify-content: center;
      //padding: 0 16px;
    }
  }

  .header-logo-wrapper {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .header-logo-min_icon {
    display: none;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  .header-logo-icon {
    width: 100%;
    height: 100%;
    padding: 12px 0;
    cursor: pointer;
  }
`;

Header.defaultProps = { theme: Base };

const HeaderUnAuth = ({
  enableAdmMess,
  wizardToken,
  isAuthenticated,
  isLoaded,
  logoUrl,
  theme,
}) => {
  const { t } = useTranslation("NavMenu");

  const logo = !theme.isBase ? logoUrl?.path?.dark : logoUrl?.path?.light;

  return (
    <Header isLoaded={isLoaded} className="navMenuHeaderUnAuth">
      <Box
        displayProp="flex"
        justifyContent="space-between"
        alignItems="center"
        className="header-items-wrapper"
      >
        {!isAuthenticated && isLoaded ? (
          <div>
            <a className="header-logo-wrapper" href="/">
              <img className="header-logo-icon" src={logo} />
            </a>
          </div>
        ) : (
          <></>
        )}
      </Box>
    </Header>
  );
};

HeaderUnAuth.displayName = "Header";

HeaderUnAuth.propTypes = {
  enableAdmMess: PropTypes.bool,
  wizardToken: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isLoaded: PropTypes.bool,
};

export default inject(({ authStore, settingsStore }) => {
  const { isAuthenticated, isLoaded } = authStore;
  const { enableAdmMess, wizardToken, logoUrl, theme } = settingsStore;

  return {
    enableAdmMess,
    wizardToken,
    isAuthenticated,
    isLoaded,
    logoUrl,
    theme,
  };
})(observer(HeaderUnAuth));
