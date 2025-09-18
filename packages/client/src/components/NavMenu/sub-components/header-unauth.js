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
import { useNavigate } from "react-router";
import { inject, observer } from "mobx-react";
import { globalColors } from "@docspace/shared/themes";
import { mobile, getLogoUrl, injectDefaultTheme } from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { LanguageCombobox } from "@docspace/shared/components/language-combobox";
import { setLanguageForUnauthorized } from "@docspace/shared/utils/common";
import { Button } from "@docspace/shared/components/button";

import PersonDefaultReactSvg from "PUBLIC_DIR/images/person.default.react.svg";

import i18n from "../../../i18n";

const Header = styled.header.attrs(injectDefaultTheme)`
  align-items: start;
  background-color: ${(props) => props.theme.header.backgroundColor};
  display: flex;
  width: 100vw;
  height: 48px;
  justify-content: center;

  .header-items-wrapper {
    width: 960px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media ${mobile} {
      width: 475px;
      display: flex;
      align-items: center;
      justify-content: center;
      //padding: 0 16px;
    }
  }

  .header-logo-wrapper {
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};
    height: 24px;
  }

  .header-logo-min_icon {
    display: none;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  .header-logo-icon {
    width: 100%;
    height: 24px;
    padding: 12px 0;
    cursor: pointer;
  }

  .language-combo-box {
    //margin: auto;
    // margin-right: 8px;
    position: absolute;
    inset-inline-end: 8px;
    top: 6px;
  }
`;

const StyledButton = styled(Button)`
  position: absolute;
  inset-inline-end: 8px;
  top: 8px;
  svg path {
    fill: ${globalColors.white};
  }
`;

const HeaderUnAuth = ({
  wizardToken,
  isAuthenticated,
  isLoaded,
  theme,
  cultures,
  isPublicRoom,
  moveToPublicRoom,
  rootFolderId,
  isFrame,
  onOpenSignInWindow,
  windowIsOpen,
}) => {
  const navigate = useNavigate();
  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);

  const currentCultureName = i18n.language;

  const onSelect = (culture) => {
    const { key } = culture;
    setLanguageForUnauthorized(key, i18n);
  };

  const showSignInButton = !isFrame && isPublicRoom && !isAuthenticated;

  return (
    <Header isLoaded={isLoaded} className="navMenuHeaderUnAuth">
      <div className="header-items-wrapper">
        {(!isAuthenticated || isPublicRoom) && isLoaded ? (
          <div>
            <a
              className="header-logo-wrapper"
              onClick={() => {
                if (isPublicRoom) moveToPublicRoom(rootFolderId);
                else navigate("/");
              }}
            >
              <img className="header-logo-icon" src={logo} alt="Logo" />
            </a>
          </div>
        ) : null}
      </div>
      {showSignInButton ? (
        <StyledButton
          className="header-mobile-sign-in"
          primary
          style={{ minWidth: "32px", padding: 0 }}
          size="small"
          icon={<PersonDefaultReactSvg />}
          onClick={() => onOpenSignInWindow()}
          isDisabled={windowIsOpen}
        />
      ) : null}

      {!wizardToken ? (
        <LanguageCombobox
          className="language-combo-box"
          onSelectLanguage={onSelect}
          cultures={cultures}
          selectedCulture={currentCultureName}
          withBorder={false}
          isMobileView
        />
      ) : null}
    </Header>
  );
};

HeaderUnAuth.displayName = "Header";

HeaderUnAuth.propTypes = {
  wizardToken: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isLoaded: PropTypes.bool,
};

export default inject(
  ({
    authStore,
    settingsStore,
    publicRoomStore,
    filesActionsStore,
    selectedFolderStore,
  }) => {
    const { enableAdmMess, wizardToken, theme, cultures, isFrame } =
      settingsStore;
    const { isPublicRoom, onOpenSignInWindow, windowIsOpen, validationData } =
      publicRoomStore;
    const { moveToPublicRoom } = filesActionsStore;
    const { navigationPath, id } = selectedFolderStore;

    const rootFolderId = navigationPath.length
      ? navigationPath[navigationPath.length - 1]?.id
      : id;

    const isAuthenticated =
      validationData?.isAuthenticated || authStore.isAuthenticated;

    return {
      enableAdmMess,
      wizardToken,
      isAuthenticated,
      isLoaded: true,
      theme,
      cultures,
      isPublicRoom,
      moveToPublicRoom,
      rootFolderId,
      isFrame,
      onOpenSignInWindow,
      windowIsOpen,
    };
  },
)(observer(HeaderUnAuth));
