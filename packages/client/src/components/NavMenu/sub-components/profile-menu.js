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

import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";

import React from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { Avatar } from "@docspace/shared/components/avatar";
import { DropDown } from "@docspace/shared/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Portal } from "@docspace/shared/components/portal";

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
