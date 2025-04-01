import React from "react";
import { makeAutoObservable } from "mobx";
import ShortUniqueId from "short-unique-id";

import FlowsApi from "../../../api/flows/flows.api";
import { getCookie } from "../../../utils";

import { toastr } from "../../toast";

import { FilePreviewType } from "../types/file";

export default class FilesStore {
  files: FilePreviewType[] = [];

  flowId: string;

  constructor(flowId: string) {
    this.flowId = flowId;
    makeAutoObservable(this);
  }

  setFiles = (files: FilePreviewType[]) => {
    this.files = files;
  };

  addFile = (file: FilePreviewType) => {
    this.files = [...this.files, file];
  };

  updateFile = (file: FilePreviewType) => {
    this.files = this.files.map((f) => (f.id === file.id ? file : f));
  };

  removeFile = (id: string) => {
    this.files = this.files.filter((file) => file.id !== id);
  };

  clearFiles = () => {
    this.files = [];
  };

  handleFiles = async (uploadedFiles: FileList) => {
    if (uploadedFiles) {
      const file = uploadedFiles[0];

      const uid = new ShortUniqueId();
      const newId = uid.randomUUID(3);

      const type = file.type.split("/")[0];
      const blob = file;

      this.addFile({
        file: blob,
        loading: true,
        error: false,
        id: newId,
        type,
      });

      const formData = new FormData();
      formData.append("file", blob);

      try {
        const data = await FlowsApi.uploadFile(formData, this.flowId);

        this.updateFile({
          file: blob,
          loading: false,
          error: false,
          id: newId,
          type,
          path: data.file_path,
        });
      } catch (error) {
        toastr.error(error as unknown as string);
        this.updateFile({
          file: blob,
          loading: false,
          error: true,
          id: newId,
          type,
        });
      }

      // mutate(
      //   { file: blob, id: currentFlowId },
      //   {
      //     onSuccess: (data) => {
      //       setFiles((prev) => {
      //         const newFiles = [...prev];
      //         const updatedIndex = newFiles.findIndex(
      //           (file) => file.id === newId,
      //         );
      //         newFiles[updatedIndex].loading = false;
      //         newFiles[updatedIndex].path = data.file_path;
      //         return newFiles;
      //       });
      //     },
      //     onError: (error) => {
      //       setFiles((prev) => {
      //         const newFiles = [...prev];
      //         const updatedIndex = newFiles.findIndex(
      //           (file) => file.id === newId,
      //         );
      //         newFiles[updatedIndex].loading = false;
      //         newFiles[updatedIndex].error = true;
      //         return newFiles;
      //       });
      //       setErrorData({
      //         title: "Error uploading file",
      //         list: [error.response?.data?.detail],
      //       });
      //     },
      //   },
      // );
    }
  };
}

export const FilesStoreContext = React.createContext<FilesStore>(undefined!);

export const FilesStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const flowId = getCookie("docspace_ai_chat");
  const store = React.useMemo(() => new FilesStore(flowId || ""), [flowId]);

  return (
    <FilesStoreContext.Provider value={store}>
      {children}
    </FilesStoreContext.Provider>
  );
};

export const useFilesStore = () => {
  return React.useContext(FilesStoreContext);
};
