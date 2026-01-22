// (c) Copyright Ascensio System SIA 2009-2026
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
import { useNavigate } from "react-router";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { getLogoUrl } from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { LanguageCombobox } from "@docspace/shared/components/language-combobox";
import { setLanguageForUnauthorized } from "@docspace/shared/utils/common";
import { Button } from "@docspace/shared/components/button";

import PersonDefaultReactSvg from "PUBLIC_DIR/images/person.default.react.svg";

import i18n from "../../../i18n";
import styles from "../nav.module.scss";

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
  const logo = getLogoUrl(
    WhiteLabelLogoType.LightSmall,
    !theme.isBase,
    false,
    "",
    true,
  );

  const currentCultureName = i18n.language;

  const onSelect = (culture) => {
    const { key } = culture;
    setLanguageForUnauthorized(key, i18n);
  };

  const showSignInButton = !isFrame && isPublicRoom && !isAuthenticated;

  return (
    <header
      isLoaded={isLoaded}
      className={classNames(styles.unAuthHeader, "navMenuHeaderUnAuth")}
    >
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
        <Button
          className={classNames(styles.unAuthButton, "header-mobile-sign-in")}
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
    </header>
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
