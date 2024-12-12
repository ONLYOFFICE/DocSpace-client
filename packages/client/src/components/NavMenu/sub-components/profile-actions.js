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
import styled, { css } from "styled-components";

import { Avatar, AvatarSize } from "@docspace/shared/components/avatar";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Link } from "@docspace/shared/components/link";
import api from "@docspace/shared/api";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Button } from "@docspace/shared/components/button";
import { getUserType } from "@docspace/shared/utils/common";
import ProfileMenu from "./profile-menu";

const StyledDiv = styled.div`
  width: 32px;
  height: 32px;
`;

const StyledButtonWrapper = styled.div`
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
`;

const StyledDropDownItem = styled(DropDownItem)`
  padding: 0px 16px;
  .drop-down-icon {
    margin-inline-end: 12px;
    height: 22px;
  }
`;

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

  setOpened = (opened) => {
    this.setState({ opened });
  };

  componentDidMount() {
    if (this.props.userIsUpdate) {
      this.getAvatar();
    } else {
      this.setState((prevState) => ({ avatar: prevState.user.avatar }));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.user !== prevProps.user) {
      this.setState({ user: this.props.user });
      this.getAvatar();
    }

    if (this.props.opened !== prevProps.opened) {
      this.setOpened(this.props.opened);
    }

    if (this.props.userIsUpdate !== prevProps.userIsUpdate) {
      this.getAvatar();
      this.props.setUserIsUpdate(false);
    }
  }

  onClose = (e) => {
    const path = e.path || (e.composedPath && e.composedPath());
    const dropDownItem = path ? path.find((x) => x === this.ref.current) : null;
    if (dropDownItem) return;

    const navElement = document.getElementsByClassName("profileMenuIcon");

    if (navElement?.length > 0) {
      navElement[0].style.setProperty("z-index", 180, "important");
    }

    this.setOpened(!this.state.opened);
  };

  onClick = (action, e) => {
    action.onClick && action.onClick(e);

    const navElement = document.getElementsByClassName("profileMenuIcon");

    if (navElement?.length > 0) {
      navElement[0].style.setProperty("z-index", 210, "important");
    }

    this.setOpened(!this.state.opened);
  };

  onClickItemLink = (e) => {
    this.setOpened(!this.state.opened);

    e.preventDefault();
  };

  getAvatar = async () => {
    const user = await api.people.getUser();
    const avatar = user?.hasAvatar ? user.avatar : DefaultUserPhoto;
    this.setState({ avatar });
  };

  render() {
    // console.log("Layout sub-component ProfileActions render");
    const { user, opened, avatar } = this.state;
    const userRole = getUserType(user);

    return (
      <StyledDiv isProduct={this.props.isProduct} ref={this.ref}>
        <Avatar
          onClick={this.onClick}
          role={userRole}
          size={AvatarSize.min}
          source={avatar}
          userName={user.displayName}
          className="icon-profile-menu"
          hideRoleIcon
        />
        <ProfileMenu
          className="profile-menu"
          avatarRole={userRole}
          avatarSource={avatar}
          displayName={user.displayName}
          email={user.email}
          open={opened}
          clickOutsideAction={this.onClose}
          forwardedRef={this.ref}
        >
          <div style={{ paddingTop: "8px" }}>
            {this.props.userActions.map(
              (action, index) =>
                action &&
                (action?.isButton ? (
                  <StyledButtonWrapper key={action.key}>
                    <Button
                      size="normal"
                      scale
                      label={action.label}
                      onClick={action.onClick}
                    />
                  </StyledButtonWrapper>
                ) : (
                  <Link
                    noHover
                    key={action.key}
                    href={action.url}
                    onClick={this.onClickItemLink}
                  >
                    <StyledDropDownItem {...action} noHover />
                  </Link>
                )),
            )}
          </div>
        </ProfileMenu>
      </StyledDiv>
    );
  }
}

ProfileActions.propTypes = {
  opened: PropTypes.bool,
  user: PropTypes.object,
  userActions: PropTypes.array,
  userIsUpdate: PropTypes.bool,
  setUserIsUpdate: PropTypes.func,
  isProduct: PropTypes.bool,
};

ProfileActions.defaultProps = {
  opened: false,
  user: {},
  userActions: [],
  userIsUpdate: false,
  isProduct: false,
};

export default ProfileActions;
