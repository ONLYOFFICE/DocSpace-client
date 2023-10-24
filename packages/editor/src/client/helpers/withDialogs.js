import React, { useState, useEffect } from "react";
import { getPresignedUri } from "@docspace/common/api/files";
import {
  EDITOR_ID,
  FilesSelectorFilterTypes,
  FilterType,
} from "@docspace/common/constants";
import { useTranslation } from "react-i18next";
//import SharingDialog from "../components/SharingDialog";
import SelectFileDialog from "../components/SelectFileDialog";
import SelectFolderDialog from "../components/SelectFolderDialog";

const insertImageAction = "imageFileType";
const mailMergeAction = "mailMergeFileType";
const compareFilesAction = "documentsFileType";

const withDialogs = (WrappedComponent) => {
  return (props) => {
    //const [isVisible, setIsVisible] = useState(false);
    const [filesType, setFilesType] = useState("");
    const [isFileDialogVisible, setIsFileDialogVisible] = useState(false);
    const [isFolderDialogVisible, setIsFolderDialogVisible] = useState(false);
    const [titleSelectorFolder, setTitleSelectorFolder] = useState("");
    const [urlSelectorFolder, setUrlSelectorFolder] = useState("");
    const [extension, setExtension] = useState();

    const [actionEvent, setActionEvent] = useState();

    const { t } = useTranslation(["Editor", "Common"]);

    const {
      config,
      fileId,
      mfReady,
      //sharingSettings
    } = props;
    const fileInfo = config?.file;

    useEffect(() => {
      if (window.authStore) {
        initSocketHelper();
      }
    }, [mfReady]);

    const initSocketHelper = async () => {
      await window.authStore.auth.init(true);

      const { socketHelper } = window.authStore.auth.settingsStore;
      socketHelper.emit({
        command: "subscribe",
        data: { roomParts: "backup-restore" },
      });
      socketHelper.on("restore-backup", () => {
        const message = t("Common:PreparationPortalTitle");
        const docEditor =
          typeof window !== "undefined" &&
          window.DocEditor?.instances[EDITOR_ID];

        docEditor?.denyEditingRights(message);
      });
    };

    // const onSDKRequestSharingSettings = () => {
    //   setIsVisible(true);
    // };

    // const onCancel = () => {
    //   setIsVisible(false);
    // };

    // const loadUsersRightsList = (docEditor) => {
    //   window.SharingDialog.convertSharingUsers(sharingSettings).then(
    //     (sharingSettings) => {
    //       docEditor.setSharingSettings({
    //         sharingSettings,
    //       });
    //     }
    //   );
    // };

    const onCloseFileDialog = () => {
      setIsFileDialogVisible(false);
      setActionEvent(null);
    };

    const onSDKRequestSelectDocument = (event) => {
      console.log("onSDKRequestSelectDocument", { event });
      setActionEvent(event);
      setFilesType(compareFilesAction);
      setIsFileDialogVisible(true);
    };

    const onSDKRequestSelectSpreadsheet = (event) => {
      console.log("onSDKRequestSelectSpreadsheet", { event });
      setActionEvent(event);
      setFilesType(mailMergeAction);
      setIsFileDialogVisible(true);
    };

    const onSDKRequestInsertImage = (event) => {
      console.log("onSDKRequestInsertImage", { event });
      setActionEvent(event);
      setFilesType(insertImageAction);
      setIsFileDialogVisible(true);
    };

    const insertImage = (link) => {
      const token = link.token;

      const docEditor =
        typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

      docEditor?.insertImage({
        ...actionEvent.data,
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    };

    const mailMerge = (link) => {
      const token = link.token;

      const docEditor =
        typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

      docEditor?.setRequestedSpreadsheet({
        ...actionEvent.data,
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    };

    const compareFiles = (link) => {
      const token = link.token;

      const docEditor =
        typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

      docEditor?.setRequestedDocument({
        ...actionEvent.data,
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    };

    const fileTypeDetection = () => {
      if (filesType === insertImageAction) {
        return {
          isSelect: true,
          filterParam: FilesSelectorFilterTypes.IMG,
        };
      }
      if (filesType === mailMergeAction) {
        return {
          isSelect: true,
          filterParam: FilesSelectorFilterTypes.XLSX,
        };
      }
      if (filesType === compareFilesAction) {
        return {
          isSelect: true,
          filterParam: FilesSelectorFilterTypes.DOCX,
        };
      }
    };

    const onSelectFile = async (file) => {
      try {
        const link = await getPresignedUri(file.id);

        if (filesType === insertImageAction) insertImage(link);
        if (filesType === mailMergeAction) mailMerge(link);
        if (filesType === compareFilesAction) compareFiles(link);
      } catch (e) {
        console.error(e);
      }
    };

    const getFileTypeTranslation = () => {
      switch (filesType) {
        case mailMergeAction:
          return t("MailMergeFileType");
        case insertImageAction:
          return t("ImageFileType");
        case compareFilesAction:
          return t("DocumentsFileType");
      }
    };

    const selectFilesListTitle = () => {
      const type = getFileTypeTranslation();
      return filesType === mailMergeAction
        ? type
        : t("SelectFilesType", { fileType: type });
    };

    const onSDKRequestSaveAs = (event) => {
      setTitleSelectorFolder(event.data.title);
      setUrlSelectorFolder(event.data.url);
      setExtension(event.data.title.split(".").pop());

      setIsFolderDialogVisible(true);
    };

    const onCloseFolderDialog = () => {
      setIsFolderDialogVisible(false);
    };

    const getSavingInfo = async (title, folderId, openNewTab) => {
      const savingInfo = await window.filesUtils.SaveAs(
        title,
        urlSelectorFolder,
        folderId,
        openNewTab
      );

      if (savingInfo) {
        const docEditor =
          typeof window !== "undefined" &&
          window.DocEditor?.instances[EDITOR_ID];

        const convertedInfo = savingInfo.split(": ").pop();

        docEditor?.showMessage(convertedInfo);
      }
    };

    const onClickSaveSelectFolder = (e, folderId, fileTitle, openNewTab) => {
      const currentExst = fileTitle.split(".").pop();

      const title =
        currentExst !== extension
          ? fileTitle.concat(`.${extension}`)
          : fileTitle;

      if (openNewTab) {
        window.filesUtils.SaveAs(
          title,
          urlSelectorFolder,
          folderId,
          openNewTab
        );
      } else {
        getSavingInfo(title, folderId, openNewTab);
      }
    };

    // const sharingDialog = (
    //   <SharingDialog
    //     mfReady={mfReady}
    //     isVisible={isVisible}
    //     fileInfo={fileInfo}
    //     onCancel={onCancel}
    //     loadUsersRightsList={loadUsersRightsList}
    //     filesSettings={props.filesSettings}
    //   />
    // );

    const selectFileDialog = (
      <SelectFileDialog
        isVisible={isFileDialogVisible}
        onSelectFile={onSelectFile}
        onCloseFileDialog={onCloseFileDialog}
        {...fileTypeDetection()}
        filesListTitle={selectFilesListTitle()}
        settings={props.filesSettings}
        mfReady={mfReady}
        successAuth={props.successAuth}
      />
    );

    const selectFolderDialog = (
      <SelectFolderDialog
        successAuth={props.successAuth}
        folderId={fileInfo?.folderId}
        isVisible={isFolderDialogVisible}
        onCloseFolderDialog={onCloseFolderDialog}
        onClickSaveSelectFolder={onClickSaveSelectFolder}
        titleSelectorFolder={titleSelectorFolder}
        mfReady={mfReady}
      />
    );

    return (
      <WrappedComponent
        {...props}
        //sharingDialog={sharingDialog}
        // onSDKRequestSharingSettings={onSDKRequestSharingSettings}
        //  loadUsersRightsList={loadUsersRightsList}
        //isVisible={isVisible}
        selectFileDialog={selectFileDialog}
        onSDKRequestInsertImage={onSDKRequestInsertImage}
        onSDKRequestSelectSpreadsheet={onSDKRequestSelectSpreadsheet}
        onSDKRequestSelectDocument={onSDKRequestSelectDocument}
        isFileDialogVisible={isFileDialogVisible}
        selectFolderDialog={selectFolderDialog}
        onSDKRequestSaveAs={onSDKRequestSaveAs}
        isFolderDialogVisible={isFolderDialogVisible}
      />
    );
  };
};

export default withDialogs;
