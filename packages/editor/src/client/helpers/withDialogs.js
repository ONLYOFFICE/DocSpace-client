import React, { useState, useEffect } from "react";
import { getPresignedUri, getReferenceData } from "@docspace/shared/api/files";
import { getRestoreProgress } from "@docspace/shared/api/portal";
import { FilesSelectorFilterTypes, FilterType } from "@docspace/shared/enums";
import { EDITOR_ID } from "@docspace/shared/constants";
import { useTranslation } from "react-i18next";
import SharingDialog from "../components/SharingDialog";
import SelectFileDialog from "../components/SelectFileDialog";
import SelectFolderDialog from "../components/SelectFolderDialog";

const insertImageAction = "imageFileType";
const mailMergeAction = "mailMergeFileType";
const compareFilesAction = "documentsFileType";
const setReferenceSourceAction = "referenceSourceType";

const withDialogs = (WrappedComponent) => {
  return (props) => {
    const [isVisible, setIsVisible] = useState(false);
    const [filesType, setFilesType] = useState("");
    const [isFileDialogVisible, setIsFileDialogVisible] = useState(false);

    const { t } = useTranslation(["Editor", "Common"]);

    const { config, fileId, mfReady, sharingSettings } = props;
    const fileInfo = config?.file;

    useEffect(() => {
      if (window.authStore) {
        initSocketHelper();
      }
    }, [mfReady]);

    const initSocketHelper = async () => {
      await window.authStore.authStore.init(true);

      const { socketHelper } = window.authStore.settingsStore;
      socketHelper.emit({
        command: "subscribe",
        data: { roomParts: "backup-restore" },
      });
      socketHelper.on("restore-backup", () => {
        getRestoreProgress()
          .then((response) => {
            if (!response) {
              console.log("Skip denyEditingRights - empty progress response");
              return;
            }
            const message = t("Common:PreparationPortalTitle");
            const docEditor =
              typeof window !== "undefined" &&
              window.DocEditor?.instances[EDITOR_ID];

            docEditor?.denyEditingRights(message);
          })
          .catch((e) => {
            console.error("getRestoreProgress", e);
          });
      });
    };

    const onCancel = () => {
      setIsVisible(false);
    };

    const loadUsersRightsList = (docEditor) => {
      window.SharingDialog.convertSharingUsers(sharingSettings).then(
        (sharingSettings) => {
          docEditor.setSharingSettings({
            sharingSettings,
          });
        },
      );
    };

    const sharingDialog = (
      <SharingDialog
        mfReady={mfReady}
        isVisible={isVisible}
        fileInfo={fileInfo}
        onCancel={onCancel}
        loadUsersRightsList={loadUsersRightsList}
        filesSettings={props.filesSettings}
      />
    );

    // const selectFileDialog = (
    //   <SelectFileDialog
    //     isVisible={isFileDialogVisible}
    //     onSelectFile={onSelectFile}
    //     onCloseFileDialog={onCloseFileDialog}
    //     {...fileTypeDetection()}
    //     filesListTitle={selectFilesListTitle()}
    //     settings={props.filesSettings}
    //     mfReady={mfReady}
    //     successAuth={props.successAuth}
    //   />
    // );

    return (
      <WrappedComponent
        {...props}
        sharingDialog={sharingDialog}
        onSDKRequestSharingSettings={onSDKRequestSharingSettings}
        loadUsersRightsList={loadUsersRightsList}
        isVisible={isVisible}
        selectFileDialog={selectFileDialog}
        onSDKRequestInsertImage={onSDKRequestInsertImage}
        onSDKRequestSelectSpreadsheet={onSDKRequestSelectSpreadsheet}
        onSDKRequestSelectDocument={onSDKRequestSelectDocument}
        onSDKRequestReferenceSource={onSDKRequestReferenceSource}
        isFileDialogVisible={isFileDialogVisible}
        selectFolderDialog={selectFolderDialog}
        onSDKRequestSaveAs={onSDKRequestSaveAs}
        isFolderDialogVisible={isFolderDialogVisible}
      />
    );
  };
};

export default withDialogs;
