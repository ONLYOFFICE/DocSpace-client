"use client";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import IConfig from "@onlyoffice/document-editor-react/dist/esm/model/config";

const Editor = ({ config }: { config: IConfig }) => {
  const onDocumentReady = (event: object): void => {
    throw new Error("Function not implemented.");
  };

  //console.log({ config });

  const documentserverUrl = "http://192.168.1.65/ds-vpath"; //TODO: replace to api url

  return (
    <DocumentEditor
      id={"docspace_editor"}
      documentServerUrl={documentserverUrl}
      config={config}
      height="700px"
      width="100%"
      events_onDocumentReady={onDocumentReady}
    ></DocumentEditor>
  );
};

export default Editor;
