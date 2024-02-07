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
import useSelectFileDialog from "@/hooks/useSelectFileDialog";
import useTheme from "@/hooks/useTheme";
import useI18N from "@/hooks/useI18N";

import SelectFolderDialog from "./SelectFolderDialog";
import SelectFileDialog from "./SelectFileDialog";

const Editor = ({
  config,
  editorUrl,
  settings,
  successAuth,
  user,
}: EditorProps) => {
  const fileInfo = config?.file;
  const documentserverUrl = editorUrl.docServiceUrl;
  const instanceId = config?.document?.referenceData.instanceId;

  const { i18n } = useI18N({ settings, user });
  const { theme } = useTheme({ user });
  const { socketHelper } = useSocketHelper({ socketUrl: settings.socketUrl });
  const {
    onSDKRequestSaveAs,
    onCloseSelectFolderDialog,
    onSubmitSelectFolderDialog,
    getIsDisabledSelectFolderDialog,
    isVisibleSelectFolderDialog,
    titleSelectorFolderDialog,
  } = useSelectFolderDialog({});
  const {
    onSDKRequestInsertImage,
    onSDKRequestReferenceSource,
    onSDKRequestSelectDocument,
    onSDKRequestSelectSpreadsheet,
    onCloseSelectFileDialog,
    onSubmitSelectFileDialog,
    getIsDisabledSelectFileDialog,

    selectFileDialogFileTypeDetection,

    selectFileDialogVisible,
  } = useSelectFileDialog({ instanceId });

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

  if (successAuth && newConfig.events) {
    newConfig.events.onRequestInsertImage = onSDKRequestInsertImage;
    // restore for 1.4 editor version
    // newConfig.events.onRequestSelectSpreadsheet = onSDKRequestSelectSpreadsheet;
    // newConfig.events.onRequestSelectDocument = onSDKRequestSelectDocument;
    // newConfig.events.onRequestReferenceSource = onSDKRequestReferenceSource;
    if (!user.isVisitor) newConfig.events.onRequestSaveAs = onSDKRequestSaveAs;
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
            getIsDisabled={getIsDisabledSelectFolderDialog}
          />
        )}
        {selectFileDialogVisible && !!socketHelper && (
          <SelectFileDialog
            socketHelper={socketHelper}
            isVisible={selectFileDialogVisible}
            onSubmit={onSubmitSelectFileDialog}
            onClose={onCloseSelectFileDialog}
            getIsDisabled={getIsDisabledSelectFileDialog}
            fileTypeDetection={selectFileDialogFileTypeDetection}
            fileInfo={fileInfo}
          />
        )}
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default Editor;
