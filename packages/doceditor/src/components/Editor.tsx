"use client";
import React from "react";
import { ThemeProvider } from "styled-components";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import IConfig from "@onlyoffice/document-editor-react/dist/esm/model/config";

import { Base, Dark, TColorScheme } from "@docspace/shared/themes";
import { getSystemTheme } from "@docspace/shared/utils";
import { ThemeKeys } from "@docspace/shared/enums";
import { getAppearanceTheme } from "@docspace/shared/api/settings";

import { EditorProps } from "@/types";
import useSocketHelper from "@/hooks/useSocketHelper";
import useSelectFolderDialog from "@/hooks/useSelectFolderDialog";

import SelectFolderDialog from "./SelectFolderDialog";
import { getI18NInstance } from "@/utils/i18n";
import { I18nextProvider } from "react-i18next";

const SYSTEM_THEME = getSystemTheme();

const Editor = ({
  config,
  editorUrl,
  settings,
  successAuth,
  user,
}: EditorProps) => {
  const i18n = getI18NInstance(user.cultureName || "en", settings.culture);

  const [currentColorTheme, setCurrentColorTheme] =
    React.useState<TColorScheme | null>(null);

  const { socketHelper } = useSocketHelper({ socketUrl: settings.socketUrl });

  const {
    onSDKRequestSaveAs,
    onCloseSelectFolderDialog,
    onSubmitSelectFolderDialog,
    isVisibleSelectFolderDialog,
    titleSelectorFolderDialog,
  } = useSelectFolderDialog({});

  const onDocumentReady = (): void => {
    throw new Error("Function not implemented.");
  };

  const getUserTheme = () => {
    let theme = user.theme;
    if (user.theme === ThemeKeys.SystemStr) theme = SYSTEM_THEME;

    if (theme === ThemeKeys.BaseStr)
      return { ...Base, currentColorTheme, interfaceDirection: "ltr" };

    return { ...Dark, currentColorTheme, interfaceDirection: "ltr" };
  };

  const getCurrentColorTheme = React.useCallback(async () => {
    const colorThemes = await getAppearanceTheme();

    const colorTheme = colorThemes.themes.find(
      (t) => t.id === colorThemes.selected,
    );

    if (colorTheme) setCurrentColorTheme(colorTheme);
  }, []);

  React.useEffect(() => {
    getCurrentColorTheme();
  }, [getCurrentColorTheme]);

  React.useEffect(() => {
    window.timezone = settings.timezone;
  }, [settings.timezone]);

  const theme = getUserTheme();

  const fileInfo = config?.file;
  const documentserverUrl = editorUrl.docServiceUrl;

  const newConfig: IConfig = {
    document: config.document,
    documentType: config.documentType,
    editorConfig: config.editorConfig,
    token: config.token,
    type: config.type,
    events: {},
  };

  if (successAuth && !user.isVisitor && newConfig.events) {
    newConfig.events.onRequestSaveAs = onSDKRequestSaveAs;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <DocumentEditor
          id={"docspace_editor"}
          documentServerUrl={documentserverUrl}
          config={newConfig}
          height="100%"
          width="100%"
          events_onDocumentReady={onDocumentReady}
        />

        {isVisibleSelectFolderDialog && !!socketHelper && (
          <SelectFolderDialog
            socketHelper={socketHelper}
            isVisible={isVisibleSelectFolderDialog}
            onSubmit={onSubmitSelectFolderDialog}
            onClose={onCloseSelectFolderDialog}
            titleSelectorFolder={titleSelectorFolderDialog}
            fileInfo={fileInfo}
          />
        )}
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default Editor;
