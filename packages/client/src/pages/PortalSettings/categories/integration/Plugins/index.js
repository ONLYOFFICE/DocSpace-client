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

export default inject(({ auth, pluginStore }) => {
  const { pluginOptions, currentColorScheme, theme } = auth.settingsStore;

  const withUpload = pluginOptions.includes("upload");

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
