import React from "react";

import { Text } from "@docspace/shared/components";
import { Link } from "@docspace/shared/components";

import EmptyScreenPluginsUrl from "PUBLIC_DIR/images/empty_screen_plugins.svg?url";
import EmptyScreenPluginsDarkUrl from "PUBLIC_DIR/images/empty_screen_plugins_dark.svg?url";

import EmptyFolderContainer from "SRC_DIR/components/EmptyContainer/EmptyContainer";

import UploadButton from "./button";

const EmptyScreen = ({
  t,
  onAddAction,
  theme,
  currentColorScheme,

  withUpload,
}) => {
  const imageSrc = theme.isBase
    ? EmptyScreenPluginsUrl
    : EmptyScreenPluginsDarkUrl;

  return (
    <EmptyFolderContainer
      headerText={t("NoPlugins")}
      descriptionText={<Text>{withUpload && t("Description")}</Text>}
      style={{ gridColumnGap: "39px" }}
      buttonStyle={{ marginTop: "16px" }}
      imageSrc={imageSrc}
      buttons={withUpload && <UploadButton t={t} addPlugin={onAddAction} />}
    />
  );
};

export default EmptyScreen;
