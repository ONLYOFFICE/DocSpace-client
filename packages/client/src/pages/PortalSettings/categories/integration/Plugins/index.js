// (c) Copyright Ascensio System SIA 2010-2024
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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import Header from "./sub-components/header";
import UploadButton from "./sub-components/button";
import PluginItem from "./sub-components/plugin";

import {
  PluginListContainer,
  StyledContainer,
  StyledEmptyContainer,
} from "./StyledPlugins";
import EmptyScreen from "./sub-components/EmptyScreen";
import ListLoader from "./sub-components/ListLoader";

const PluginPage = ({
  withUpload,

  pluginList,

  openSettingsDialog,

  updatePlugin,

  addPlugin,

  currentColorScheme,
  theme,
  isLoading,
  isEmptyList,
}) => {
  const { t } = useTranslation(["WebPlugins", "Common"]);

  React.useEffect(() => {
    setDocumentTitle(t("Common:Plugins"));
  }, []);

  return (
    <>
      {isLoading || (!isEmptyList && pluginList.length === 0) ? (
        <StyledContainer>
          <ListLoader withUpload={withUpload} />
        </StyledContainer>
      ) : isEmptyList ? (
        <StyledEmptyContainer>
          <EmptyScreen
            t={t}
            theme={theme}
            onAddAction={addPlugin}
            currentColorScheme={currentColorScheme}
            withUpload={withUpload}
          />
        </StyledEmptyContainer>
      ) : (
        <StyledContainer>
          {/* <Header
            t={t}
            currentColorScheme={currentColorScheme}
           
            withUpload={withUpload}
          /> */}
          {withUpload && <UploadButton t={t} addPlugin={addPlugin} />}
          <PluginListContainer>
            {pluginList.map((plugin) => (
              <PluginItem
                key={`plugin-${plugin.name}-${plugin.version}`}
                openSettingsDialog={openSettingsDialog}
                updatePlugin={updatePlugin}
                {...plugin}
              />
            ))}
          </PluginListContainer>
        </StyledContainer>
      )}
    </>
  );
};

export default inject(({ settingsStore, pluginStore }) => {
  const { pluginOptions, currentColorScheme, theme } = settingsStore;

  const withUpload = pluginOptions.upload;

  const {
    pluginList,
    updatePlugin,
    setCurrentSettingsDialogPlugin,
    setSettingsPluginDialogVisible,

    addPlugin,

    isLoading,
    isEmptyList,
  } = pluginStore;

  const openSettingsDialog = (pluginName) => {
    setSettingsPluginDialogVisible(true);
    setCurrentSettingsDialogPlugin({ pluginName });
  };

  return {
    withUpload,

    pluginList,

    updatePlugin,

    openSettingsDialog,

    addPlugin,

    currentColorScheme,
    theme,
    isLoading,
    isEmptyList,
  };
})(observer(PluginPage));
