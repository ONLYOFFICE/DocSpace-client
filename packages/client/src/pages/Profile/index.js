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
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import Section from "@docspace/ui-kit/components/section";

import SectionWrapper from "SRC_DIR/components/Section";
import PrivateRoute from "SRC_DIR/components/PrivateRouteWrapper";
import Dialogs from "SRC_DIR/pages/Home/Section/ContactsBody/Dialogs";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";

import PluginDialog from "SRC_DIR/components/dialogs/PluginDialog";

import { SectionHeaderContent, SectionBodyContent } from "./Section";

class Profile extends React.Component {
  componentDidMount() {
    const {
      t,

      isVisitor,
      selectedTreeNode,
      setSelectedNode,
      getTfaType,
    } = this.props;

    isVisitor
      ? !selectedTreeNode.length && setSelectedNode(["@rooms"])
      : setSelectedNode(["accounts"]);

    setDocumentTitle(t("Common:Profile"));

    getTfaType();
  }

  render() {
    // console.log("Profile render");

    const { profile, setIsLoading, pluginDialogVisible } = this.props;

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
        {pluginDialogVisible && (
          <PluginDialog isVisible={pluginDialogVisible} key="plugin-dialog" />
        )}
      </>
    );
  }
}

const ComponentPure = inject(
  ({
    authStore,
    settingsStore,
    userStore,
    clientLoadingStore,
    tfaStore,
    treeFoldersStore,
    pluginStore,
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

    const { user: profile } = userStore;

    const { selectedTreeNode, setSelectedNode } = treeFoldersStore;

    const { getTfaType } = tfaStore;

    const { pluginDialogVisible } = pluginStore;

    return {
      language,
      profile,

      showCatalog: settingsStore.showCatalog,

      selectedTreeNode,
      setSelectedNode,
      isVisitor: userStore.user.isVisitor,
      setIsProfileLoaded,
      setIsLoading,
      getTfaType,
      pluginDialogVisible,
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
