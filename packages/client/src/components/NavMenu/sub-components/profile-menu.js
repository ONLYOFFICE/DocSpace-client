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

import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";

import React from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { Avatar } from "@docspace/ui-kit/components/avatar";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Portal } from "@docspace/ui-kit/components/portal";

import styles from "../nav.module.scss";

class ProfileMenu extends React.Component {
  renderDropDown = () => {
    const {
      avatarRole,
      avatarSource,
      children,
      className,
      displayName,
      clickOutsideAction,
      open,
      forwardedRef,
      isBannerVisible,
    } = this.props;
    // console.log("Current theme: ", this.props.theme);

    return (
      <DropDown
        className={classNames(styles.profileMenuDropDown, className, {
          [styles.withBanner]: isBannerVisible,
        })}
        directionX="right"
        open={open}
        clickOutsideAction={clickOutsideAction}
        forwardedRef={forwardedRef}
        isDefaultMode={false}
        withBlur
        isBannerVisible={isBannerVisible}
        withPortal
      >
        <DropDownItem className={styles.profileMenu}>
          <div className={styles.menuContainer}>
            <Avatar
              className="avatar"
              size="medium"
              role={avatarRole}
              source={avatarSource}
              userName={displayName}
              hideRoleIcon
            />
            <div>
              <div className={styles.mainLabelContainer}>{displayName}</div>
              <div
                className={styles.controlContainer}
                onClick={clickOutsideAction}
              >
                <CrossIcon className={styles.crossIcon} />
              </div>
            </div>
          </div>
        </DropDownItem>
        {children}
      </DropDown>
    );
  };

  render() {
    const { open } = this.props;

    const element = this.renderDropDown();

    const root = document.getElementById("root");

    const wrapper = <div>{element}</div>;

    return <Portal element={wrapper} appendTo={root} visible={open} />;
  }
}

ProfileMenu.displayName = "ProfileMenu";

ProfileMenu.propTypes = {
  avatarRole: PropTypes.oneOf(["owner", "admin", "guest", "user"]),
  avatarSource: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  displayName: PropTypes.string,
  open: PropTypes.bool,
  clickOutsideAction: PropTypes.func,
};

export default inject(({ settingsStore }) => {
  const { isBannerVisible } = settingsStore;

  return { isBannerVisible };
})(observer(ProfileMenu));
