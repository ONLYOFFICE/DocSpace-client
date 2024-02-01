"use client";
import React from "react";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import IConfig from "@onlyoffice/document-editor-react/dist/esm/model/config";

import { EditorProps } from "@/types";
import useSocketHelper from "@/hooks/useSocketHelper";
import useSelectFolderDialog from "@/hooks/useSelectFolderDialog";
import SelectFolderDialog from "./SelectFolderDialog";

const Editor = ({ data }: EditorProps) => {
  const { config, editorUrl, settings, successAuth, user } = data;

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
    <>
      <DocumentEditor
        id={"docspace_editor"}
        documentServerUrl={documentserverUrl}
        config={newConfig}
        height="100%"
        width="100%"
        events_onDocumentReady={onDocumentReady}
      />

      {isVisibleSelectFolderDialog && socketHelper && (
        <SelectFolderDialog
          socketHelper={socketHelper}
          isVisible={isVisibleSelectFolderDialog}
          onSubmit={onSubmitSelectFolderDialog}
          onClose={onCloseSelectFolderDialog}
          titleSelectorFolder={titleSelectorFolderDialog}
          fileInfo={fileInfo}
        />
      )}
    </>
  );
};

export default Editor;
