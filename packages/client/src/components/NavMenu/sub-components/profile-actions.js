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

import { Avatar, AvatarSize } from "@docspace/ui-kit/components/avatar";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Link } from "@docspace/ui-kit/components/link";
import api from "@docspace/shared/api";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { Button } from "@docspace/ui-kit/components/button";
import {
  getUserAvatarRoleByType,
  getUserType,
} from "@docspace/shared/utils/common";
import ProfileMenu from "./profile-menu";

import styles from "../nav.module.scss";

class ProfileActions extends React.PureComponent {
  constructor(props) {
    super(props);

    this.ref = React.createRef();

    this.state = {
      opened: props.opened,
      user: props.user,
      avatar: "",
    };
  }

  componentDidMount() {
    const { userIsUpdate } = this.props;
    if (userIsUpdate) {
      this.getAvatar();
    } else {
      this.setState((prevState) => ({ avatar: prevState.user.avatar }));
    }
  }

  componentDidUpdate(prevProps) {
    const { user, opened, userIsUpdate, setUserIsUpdate } = this.props;
    if (user !== prevProps.user) {
      this.setState({ user });
      this.getAvatar();
    }

    if (opened !== prevProps.opened) {
      this.setOpened(opened);
    }

    if (userIsUpdate !== prevProps.userIsUpdate) {
      this.getAvatar();
      setUserIsUpdate(false);
    }
  }

  setOpened = (opened) => {
    this.setState({ opened });
  };

  onClose = (e) => {
    const { opened } = this.state;
    const path = e.path || (e.composedPath && e.composedPath());
    const dropDownItem = path ? path.find((x) => x === this.ref.current) : null;
    if (dropDownItem) return;

    const navElement = document.getElementsByClassName("profileMenuIcon");

    if (navElement?.length > 0) {
      navElement[0].style.setProperty("z-index", 180, "important");
    }

    this.setOpened(!opened);
  };

  onClick = (action, e) => {
    const { opened } = this.state;

    action.onClick && action.onClick(e);

    const navElement = document.getElementsByClassName("profileMenuIcon");

    if (navElement?.length > 0) {
      navElement[0].style.setProperty("z-index", 210, "important");
    }

    this.setOpened(!opened);
  };

  onClickItemLink = (e) => {
    const { opened } = this.state;
    this.setOpened(!opened);

    e.preventDefault();
  };

  getAvatar = async () => {
    const user = await api.people.getUser();
    const avatar = user?.hasAvatar ? user.avatar : DefaultUserPhoto;
    this.setState({ avatar });
  };

  render() {
    // console.log("Layout sub-component ProfileActions render");
    const { userActions } = this.props;
    const { user, opened, avatar } = this.state;
    const userRole = getUserType(user);
    const avatarRole = getUserAvatarRoleByType(userRole);

    return (
      <div className={styles.profileActions} ref={this.ref}>
        <Avatar
          onClick={this.onClick}
          role={avatarRole}
          size={AvatarSize.min}
          source={avatar}
          userName={user.displayName}
          className="icon-profile-menu"
          hideRoleIcon
        />
        <ProfileMenu
          className="profile-menu"
          avatarRole={avatarRole}
          avatarSource={avatar}
          displayName={user.displayName}
          email={user.email}
          open={opened}
          clickOutsideAction={this.onClose}
          forwardedRef={this.ref}
        >
          <div style={{ paddingTop: "8px" }}>
            {userActions.map(({ key, ...action }) => {
              return (
                <React.Fragment key={key}>
                  {action ? (
                    action?.isButton ? (
                      <div className={styles.buttonWrapper}>
                        <Button
                          size="normal"
                          scale
                          label={action.label}
                          onClick={action.onClick}
                        />
                      </div>
                    ) : (
                      <Link
                        noHover
                        href={action.url}
                        onClick={this.onClickItemLink}
                      >
                        <DropDownItem
                          {...action}
                          noHover
                          className={styles.dropDownItem}
                        />
                      </Link>
                    )
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        </ProfileMenu>
      </div>
    );
  }
}

ProfileActions.propTypes = {
  opened: PropTypes.bool,
  user: PropTypes.object,
  userActions: PropTypes.array,
  userIsUpdate: PropTypes.bool,
  setUserIsUpdate: PropTypes.func,
};

ProfileActions.defaultProps = {
  opened: false,
  user: {},
  userActions: [],
  userIsUpdate: false,
};

export default ProfileActions;
