/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { getLogoUrl } from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { LanguageCombobox } from "@docspace/shared/components/language-combobox";
import { setLanguageForUnauthorized } from "@docspace/shared/utils/common";
import { Button } from "@docspace/ui-kit/components/button";

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
