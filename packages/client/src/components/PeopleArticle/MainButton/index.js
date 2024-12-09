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

import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import PlaneReactSvgUrl from "PUBLIC_DIR/images/plane.react.svg?url";
import ImportReactSvgUrl from "PUBLIC_DIR/images/import.react.svg?url";
import AddDepartmentReactSvgUrl from "PUBLIC_DIR/images/add.department.react.svg?url";
import AddGuestReactSvgUrl from "PUBLIC_DIR/images/add.guest.react.svg?url";
import AddEmployeeReactSvgUrl from "ASSETS/images/add.employee.react.svg?url";
import React from "react";
// import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { MainButton } from "@docspace/shared/components/main-button";
import { withTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";
import { inject, observer } from "mobx-react";
import config from "PACKAGE_FILE";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isMobile } from "react-device-detect";
import {
  isMobile as isMobileUtils,
  isTablet as isTabletUtils,
} from "@docspace/shared/utils";
import { ArticleButtonLoader } from "@docspace/shared/skeletons/article";
import MobileView from "./MobileView";

import withLoader from "../../../HOCs/withLoader";
import InviteDialog from "../../dialogs/InviteDialog/index";

const ArticleMainButtonContent = (props) => {
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const {
    homepage,
    toggleShowText,
    t,
    isAdmin,

    userCaption,

    sectionWidth,

    isMobileArticle,
  } = props;

  const navigate = useNavigate();

  const goToEmployeeCreate = () => {
    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, homepage, "/create/user"),
    );
    if (isMobile || isMobileUtils()) toggleShowText();
  };

  const onInvitationDialogClick = () => setDialogVisible((val) => !val);

  const separator = {
    key: "separator",
    isSeparator: true,
  };

  const menuModel = [
    {
      key: "create-user",
      icon: combineUrl(
        window.ClientConfig?.proxy?.url,
        homepage,
        AddEmployeeReactSvgUrl,
      ),
      label: userCaption,
      onClick: goToEmployeeCreate,
    },
  ];

  const links = [
    {
      key: "invite-link",
      icon: combineUrl(
        window.ClientConfig?.proxy?.url,
        InvitationLinkReactSvgUrl,
      ),
      label: t("PeopleTranslations:InviteLinkTitle"),
      onClick: onInvitationDialogClick,
    },
  ];

  return isAdmin ? (
    <>
      {isMobileArticle ? (
        <MobileView
          labelProps={t("Common:OtherOperations")}
          actionOptions={menuModel}
          buttonOptions={links}
          sectionWidth={sectionWidth}
        />
      ) : (
        <MainButton
          isDisabled={false}
          isDropdown
          text={t("Common:Actions")}
          model={[...menuModel, separator, ...links]}
          className="main-button_invitation-link"
        />
      )}

      {dialogVisible && (
        <InviteDialog
          visible={dialogVisible}
          onClose={onInvitationDialogClick}
          onCloseButton={onInvitationDialogClick}
        />
      )}
    </>
  ) : (
    <></>
  );
};

export default inject(({ authStore, settingsStore }) => {
  const { userCaption, guestCaption, groupCaption } = settingsStore.customNames;

  return {
    isAdmin: authStore.isAdmin,
    homepage: config.homepage,
    userCaption,
    guestCaption,
    groupCaption,
    toggleShowText: settingsStore.toggleShowText,
    isMobileArticle: settingsStore.isMobileArticle,
    showText: settingsStore.showText,
  };
})(
  withTranslation(["Article", "Common", "PeopleTranslations"])(
    withLoader(observer(ArticleMainButtonContent))(<ArticleButtonLoader />),
  ),
);
