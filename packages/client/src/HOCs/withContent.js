import React from "react";
import { inject, observer } from "mobx-react";
//import toastr from "@docspace/components/toast/toastr";
import {
  // FileAction,
  FileStatus,
  ShareAccessRights,
} from "@docspace/common/constants";
//import { combineUrl } from "@docspace/common/utils";
import getCorrectDate from "@docspace/components/utils/getCorrectDate";
import { LANGUAGE } from "@docspace/common/constants";
import config from "PACKAGE_FILE";
//import EditingWrapperComponent from "../components/EditingWrapperComponent";
import { getTitleWithoutExtension } from "SRC_DIR/helpers/filesUtils";
//import { getDefaultFileName } from "@docspace/client/src/helpers/filesUtils";
//import ItemIcon from "../components/ItemIcon";
import { getCookie } from "@docspace/components/utils/cookie";

export default function withContent(WrappedContent) {
  class WithContent extends React.Component {
    constructor(props) {
      super(props);

      let titleWithoutExt = props.titleWithoutExt;

      this.state = { itemTitle: titleWithoutExt };
    }

    componentDidUpdate(prevProps) {
      const { titleWithoutExt } = this.props;

      if (titleWithoutExt !== this.state.itemTitle) {
        this.setState({ itemTitle: titleWithoutExt });
      }
    }

    getStatusByDate = (create) => {
      const { culture, item } = this.props;
      const { created, updated } = item;

      const locale = getCookie(LANGUAGE) || culture;

      const date = create ? created : updated;

      const dateLabel = getCorrectDate(locale, date);

      return dateLabel;
    };

    render() {
      const {
        isDesktop,
        isTrashFolder,
        isArchiveFolder,
        item,
        onFilesClick,
        t,
        viewer,
        titleWithoutExt,
        isPublicRoom,
        publicRoomKey,
      } = this.props;

      const { access, createdBy, fileStatus, href } = item;

      const updatedDate = this.getStatusByDate(false);
      const createdDate = this.getStatusByDate(true);

      const fileOwner =
        createdBy &&
        ((viewer?.id === createdBy.id && t("Common:MeLabel")) ||
          createdBy.displayName);

      const accessToEdit =
        access === ShareAccessRights.FullAccess || // only badges?
        access === ShareAccessRights.None; // TODO: fix access type for owner (now - None)

      const linkStyles = isTrashFolder //|| window.innerWidth <= 1024
        ? { noHover: true }
        : { onClick: onFilesClick };

      if (!isDesktop && !isTrashFolder && !isArchiveFolder) {
        linkStyles.href = isPublicRoom
          ? `${href}&share=${publicRoomKey}`
          : href;
      }

      const newItems =
        item.new || (fileStatus & FileStatus.IsNew) === FileStatus.IsNew;
      const showNew = !!newItems;

      return (
        <WrappedContent
          titleWithoutExt={titleWithoutExt}
          updatedDate={updatedDate}
          createdDate={createdDate}
          fileOwner={fileOwner}
          accessToEdit={accessToEdit}
          linkStyles={linkStyles}
          newItems={newItems}
          showNew={showNew}
          isTrashFolder={isTrashFolder}
          onFilesClick={onFilesClick}
          isArchiveFolder={isArchiveFolder}
          {...this.props}
        />
      );
    }
  }

  return inject(
    (
      {
        filesStore,
        treeFoldersStore,
        auth,
        dialogsStore,
        uploadDataStore,
        publicRoomStore,
      },
      { item }
    ) => {
      const {
        createFile,
        createFolder,
        openDocEditor,
        renameFolder,
        setIsLoading,
        updateFile,
        viewAs,
        setIsUpdatingRowItem,
        isUpdatingRowItem,
        passwordEntryProcess,
        addActiveItems,
        setCreatedItem,
      } = filesStore;

      const { isPublicRoom, publicRoomKey } = publicRoomStore;

      const { clearActiveOperations, fileCopyAs } = uploadDataStore;
      const { isRecycleBinFolder, isPrivacyFolder, isArchiveFolder } =
        treeFoldersStore;

      const { replaceFileStream, setEncryptionAccess } = auth;

      const { culture, personal, folderFormValidation, isDesktopClient } =
        auth.settingsStore;

      const {
        setConvertPasswordDialogVisible,
        setConvertItem,
        setFormCreationInfo,
      } = dialogsStore;

      const titleWithoutExt = getTitleWithoutExtension(item, false);

      return {
        createFile,
        createFolder,
        culture,

        folderFormValidation,
        homepage: config.homepage,
        isDesktop: isDesktopClient,
        isPrivacy: isPrivacyFolder,
        isTrashFolder: isRecycleBinFolder,
        isArchiveFolder,
        openDocEditor,
        renameFolder,
        replaceFileStream,
        setEncryptionAccess,
        setIsLoading,
        updateFile,
        viewAs,
        viewer: auth.userStore.user,
        setConvertPasswordDialogVisible,
        setConvertItem,
        setFormCreationInfo,
        setIsUpdatingRowItem,
        isUpdatingRowItem,
        passwordEntryProcess,
        addActiveItems,
        clearActiveOperations,
        fileCopyAs,

        titleWithoutExt,

        setCreatedItem,
        personal,
        isPublicRoom,
        publicRoomKey,
      };
    }
  )(observer(WithContent));
}
