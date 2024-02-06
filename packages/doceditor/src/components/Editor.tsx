"use client";

import React from "react";
import { ThemeProvider } from "styled-components";
import { I18nextProvider } from "react-i18next";
import { i18n } from "i18next";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import IConfig from "@onlyoffice/document-editor-react/dist/esm/model/config";

import { EditorProps } from "@/types";
import useSocketHelper from "@/hooks/useSocketHelper";
import useSelectFolderDialog from "@/hooks/useSelectFolderDialog";
import useTheme from "@/hooks/useTheme";
import useI18N from "@/hooks/useI18N";

import SelectFolderDialog from "./SelectFolderDialog";

const Editor = ({
  config,
  editorUrl,
  settings,
  successAuth,
  user,
}: EditorProps) => {
  const fileInfo = config?.file;
  const documentserverUrl = editorUrl.docServiceUrl;

  const { i18n } = useI18N({ settings, user });
  const { socketHelper } = useSocketHelper({ socketUrl: settings.socketUrl });

  const { theme } = useTheme({ user });

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
    <I18nextProvider i18n={i18n || ({} as i18n)}>
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
