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
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import Section from "@docspace/shared/components/section";

import SectionWrapper from "SRC_DIR/components/Section";
import PrivateRoute from "SRC_DIR/components/PrivateRouteWrapper";
import Dialogs from "SRC_DIR/pages/Home/Section/ContactsBody/Dialogs";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";

import { SectionHeaderContent, SectionBodyContent } from "./Section";

class Profile extends React.Component {
  componentDidMount() {
    const {
      fetchProfile,
      profile,
      t,

      setIsEditTargetUser,

      isVisitor,
      selectedTreeNode,
      setSelectedNode,
      setIsProfileLoaded,
      getTfaType,
    } = this.props;

    const userId = "@self";

    setIsEditTargetUser(false);

    isVisitor
      ? !selectedTreeNode.length && setSelectedNode(["@rooms"])
      : setSelectedNode(["accounts"]);

    setDocumentTitle(t("Common:Profile"));
    this.documentElement = document.getElementsByClassName("hidingHeader");
    // const queryString = ((location && location.search) || "").slice(1);
    // const queryParams = queryString.split("&");
    // const arrayOfQueryParams = queryParams.map((queryParam) =>
    //   queryParam.split("=")
    // );
    // const linkParams = Object.fromEntries(arrayOfQueryParams);

    // if (linkParams.email_change && linkParams.email_change === "success") {
    //   toastr.success(t("ChangeEmailSuccess"));
    // }

    getTfaType();

    if (!profile || profile.userName !== userId) {
      fetchProfile(userId).finally(() => {
        setIsProfileLoaded(true);
      });
    }

    if (!profile && this.documentElement) {
      for (let i = 0; i < this.documentElement.length; i++) {
        this.documentElement[i].style.transition = "none";
      }
    }
  }

  componentDidUpdate() {
    const { profile } = this.props;
    // const { userId } = match.params;
    // const prevUserId = prevProps.match.params.userId;

    // if (userId !== undefined && userId !== prevUserId) {

    //   fetchProfile(userId);
    // }

    if (profile && this.documentElement) {
      for (let i = 0; i < this.documentElement.length; i++) {
        this.documentElement[i].style.transition = "";
      }
    }
  }

  render() {
    // console.log("Profile render");

    const { profile, setIsLoading } = this.props;

    return (
      <>
        <SectionWrapper withBodyAutoFocus viewAs="profile">
          <Section.SectionHeader>
            <SectionHeaderContent
              profile={profile}
              setIsLoading={setIsLoading}
            />
          </Section.SectionHeader>

          <Section.SectionBody>
            <SectionBodyContent profile={profile} />
          </Section.SectionBody>
        </SectionWrapper>
        <Dialogs />
      </>
    );
  }
}

Profile.propTypes = {
  fetchProfile: PropTypes.func.isRequired,
  profile: PropTypes.object,
};

const ComponentPure = inject(
  ({
    authStore,
    settingsStore,
    peopleStore,
    userStore,
    clientLoadingStore,
    tfaStore,
    treeFoldersStore,
  }) => {
    const { language } = authStore;

    const {
      setIsProfileLoaded,
      setIsSectionHeaderLoading,
      setIsSectionBodyLoading,
      setIsSectionFilterLoading,
    } = clientLoadingStore;

    const setIsLoading = () => {
      setIsSectionHeaderLoading(true, false);
      setIsSectionFilterLoading(true, false);
      setIsSectionBodyLoading(true, false);
    };

    const { targetUserStore } = peopleStore;
    const {
      getTargetUser: fetchProfile,
      targetUser: profile,
      isEditTargetUser,
      setIsEditTargetUser,
    } = targetUserStore;

    const { selectedTreeNode, setSelectedNode } = treeFoldersStore;

    const { getTfaType } = tfaStore;

    return {
      language,
      fetchProfile,
      profile,

      isEditTargetUser,
      setIsEditTargetUser,

      showCatalog: settingsStore.showCatalog,

      selectedTreeNode,
      setSelectedNode,
      isVisitor: userStore.user.isVisitor,
      setIsProfileLoaded,
      setIsLoading,
      getTfaType,
    };
  },
)(observer(withTranslation(["Profile", "Common"])(withCultureNames(Profile))));

export const Component = () => {
  return (
    <PrivateRoute>
      <ComponentPure />
    </PrivateRoute>
  );
};

Component.displayName = "Profile";
