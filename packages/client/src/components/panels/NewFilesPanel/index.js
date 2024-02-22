import { useState, useEffect, useMemo } from "react";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Loader } from "@docspace/shared/components/loader";
import { Text } from "@docspace/shared/components/text";
import { Heading } from "@docspace/shared/components/heading";
import { Aside } from "@docspace/shared/components/aside";
import { Row } from "@docspace/shared/components/row";
import { Button } from "@docspace/shared/components/button";
import { withTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";

import { ReactSVG } from "react-svg";
import {
  StyledAsidePanel,
  StyledContent,
  StyledHeaderContent,
  StyledBody,
  StyledFooter,
  StyledSharingBody,
  StyledLink,
} from "../StyledPanels";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import { DialogAsideSkeleton } from "@docspace/shared/skeletons/dialog";
import withLoader from "../../../HOCs/withLoader";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import FilesFilter from "@docspace/shared/api/files/filter";
import { DeviceType } from "@docspace/shared/enums";

const SharingBodyStyle = { height: `calc(100vh - 156px)` };

const NewFilesPanel = (props) => {
  const {
    setNewFilesPanelVisible,
    getIcon,
    getFolderIcon,
    newFiles,
    markAsRead,
    setMediaViewerData,
    addFileToRecentlyViewed,
    playlist,
    currentFolderId,
    setIsLoading,
    t,
    visible,
    isLoading,
    currentDeviceType,
    fileItemsList,
    enablePlugins,
  } = props;

  const [listFiles, setListFiles] = useState(newFiles);
  const [inProgress, setInProgress] = useState(false);
  const [currentOpenFileId, setCurrentOpenFileId] = useState(null);

  const onClose = () => {
    if (inProgress) return;
    setNewFilesPanelVisible(false);
  };

  const getItemIcon = (item) => {
    const extension = item.fileExst;
    const icon = extension
      ? getIcon(24, extension)
      : getFolderIcon(item.providerKey, 24);

    const svgLoader = () => <div style={{ width: "24px" }} />;

    return (
      <ReactSVG
        beforeInjection={(svg) => svg.setAttribute("style", "margin-top: 4px")}
        src={icon}
        loading={svgLoader}
      />
    );
  };

  const onMarkAsRead = () => {
    if (inProgress) return;
    setInProgress(true);

    const files = [];
    const folders = [];

    for (let item of listFiles) {
      if (item.fileExst) files.push(item);
      else folders.push(item);
    }

    const fileIds = files.map((f) => f.id);
    const folderIds = folders.map((f) => f.id);

    markAsRead(folderIds, fileIds)
      .then(() => {
        return Promise.resolve(); //hasNew ? refreshFiles() :
      })
      .catch((err) => toastr.error(err))
      .finally(() => {
        setInProgress(false);
        onClose();
      });
  };

  const onNewFileClick = (e) => {
    if (inProgress) return;

    setInProgress(true);

    const { id, extension: fileExst } = e.target.dataset;

    setCurrentOpenFileId(id);

    const fileIds = fileExst ? [id] : [];
    const folderIds = fileExst ? [] : [id];

    const item = newFiles.find((file) => file.id.toString() === id);

    markAsRead(folderIds, fileIds, item)
      .then(() => {
        onFileClick(item);

        const newListFiles = listFiles.filter(
          (file) => file.id.toString() !== id,
        );

        setListFiles(newListFiles);
        if (!newListFiles.length) onClose();
      })
      .catch((err) => {
        toastr.error(err);
      })
      .finally(() => {
        setInProgress(false);
        setCurrentOpenFileId(null);
      });
  };

  const onFileClick = (item) => {
    const {
      id,
      fileExst,
      webUrl,
      fileType,
      providerKey,
      rootFolderType,

      title,
    } = item;

    if (!fileExst) {
      const categoryType = getCategoryTypeByFolderType(rootFolderType, id);

      const state = { title, rootFolderType, isRoot: false };
      setIsLoading(true);

      const url = getCategoryUrl(categoryType, id);

      const filter = FilesFilter.getDefault();
      filter.folder = id;

      window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`, { state });

      setInProgress(false);
      onClose();
    } else {
      const canEdit = [5, 6, 7].includes(fileType); //TODO: maybe dirty

      const isMediaActive = playlist.findIndex((el) => el.fileId === id) !== -1;

      const isMedia =
        item?.viewAccessibility?.ImageView ||
        item?.viewAccessibility?.MediaView;

      if (canEdit && providerKey) {
        return addFileToRecentlyViewed(id)
          .then(() => console.log("Pushed to recently viewed"))
          .catch((e) => console.error(e))
          .finally(
            window.open(
              combineUrl(
                window.DocSpaceConfig?.proxy?.url,
                config.homepage,
                `/doceditor?fileId=${id}`,
              ),
              window.DocSpaceConfig?.editor?.openOnNewPage ? "_blank" : "_self",
            ),
          );
      }

      if (isMedia) {
        if (currentFolderId !== item.folderId) {
          const categoryType = getCategoryTypeByFolderType(
            rootFolderType,
            item.folderId,
          );

          const state = {
            title: "",
            rootFolderType,

            isRoot: false,
          };
          setIsLoading(true);

          const url = getCategoryUrl(categoryType, item.folderId);

          const filter = FilesFilter.getDefault();
          filter.folder = item.folderId;

          window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`, { state });

          const mediaItem = { visible: true, id };
          setMediaViewerData(mediaItem);

          setInProgress(false);
          onClose();
        } else {
          const mediaItem = { visible: true, id };
          setMediaViewerData(mediaItem);

          return onClose();
        }

        return;
      }

      if (fileItemsList && enablePlugins) {
        let currPluginItem = null;

        fileItemsList.forEach((i) => {
          if (i.key === item.fileExst) currPluginItem = i.value;
        });

        if (currPluginItem) {
          const correctDevice = currPluginItem.devices
            ? currPluginItem.devices.includes(currentDeviceType)
            : true;
          if (correctDevice) return currPluginItem.onClick(item);
        }
      }

      return window.open(webUrl, "_blank");
    }
  };

  const filesListNode = useMemo(() => {
    return listFiles.map((file) => {
      const element = getItemIcon(file);

      return (
        <Row
          key={file.id}
          element={element}
          inProgress={currentOpenFileId === file.id.toString()}
        >
          <StyledLink
            onClick={onNewFileClick}
            containerWidth="100%"
            type="page"
            fontWeight={600}
            isTextOverflow
            truncate
            title={file.title}
            fontSize="14px"
            className="files-new-link"
            data-id={file.id}
            data-extension={file.fileExst}
          >
            {file.title}
          </StyledLink>
        </Row>
      );
    });
  }, [onNewFileClick, getItemIcon, currentOpenFileId]);

  const element = (
    <StyledAsidePanel visible={visible}>
      <Backdrop
        onClick={onClose}
        visible={visible}
        zIndex={310}
        isAside={true}
      />
      <Aside className="header_aside-panel" visible={visible} onClose={onClose}>
        <StyledContent>
          <StyledHeaderContent>
            <Heading className="files-operations-header" size="medium" truncate>
              {t("NewFiles")}
            </Heading>
          </StyledHeaderContent>
          {!isLoading ? (
            <StyledBody className="files-operations-body">
              <StyledSharingBody style={SharingBodyStyle}>
                {filesListNode}
              </StyledSharingBody>
            </StyledBody>
          ) : (
            <div key="loader" className="panel-loader-wrapper">
              <Loader type="oval" size="16px" className="panel-loader" />
              <Text as="span">{`${t("Common:LoadingProcessing")} ${t(
                "Common:LoadingDescription",
              )}`}</Text>
            </div>
          )}
          <StyledFooter>
            <Button
              className="new_files_panel-button new_file_panel-first-button"
              label={t("Viewed")}
              size="normal"
              primary
              onClick={onMarkAsRead}
              isLoading={inProgress}
            />
            <Button
              className="new_files_panel-button"
              label={t("Common:CloseButton")}
              size="normal"
              isDisabled={inProgress}
              onClick={onClose}
            />
          </StyledFooter>
        </StyledContent>
      </Aside>
    </StyledAsidePanel>
  );

  return currentDeviceType === DeviceType.mobile ? (
    <Portal element={element} />
  ) : (
    element
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    mediaViewerDataStore,
    filesActionsStore,
    selectedFolderStore,
    dialogsStore,
    filesSettingsStore,
    clientLoadingStore,
    pluginStore,
  }) => {
    const { addFileToRecentlyViewed, hasNew, refreshFiles } = filesStore;

    const { setIsSectionFilterLoading, isLoading } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const { playlist, setMediaViewerData, setCurrentItem } =
      mediaViewerDataStore;
    const { getIcon, getFolderIcon } = filesSettingsStore;
    const { markAsRead } = filesActionsStore;
    const { id: currentFolderId } = selectedFolderStore;

    const {
      setNewFilesPanelVisible,
      newFilesPanelVisible: visible,
      newFilesIds,
      newFiles,
    } = dialogsStore;

    const { fileItemsList } = pluginStore;

    return {
      fileItemsList,
      enablePlugins: settingsStore.enablePlugins,
      visible,
      newFiles,
      newFilesIds,
      isLoading,
      playlist,
      setCurrentItem,
      currentFolderId,
      setMediaViewerData,
      addFileToRecentlyViewed,
      getIcon,
      getFolderIcon,
      markAsRead,
      setNewFilesPanelVisible,
      theme: settingsStore.theme,
      hasNew,
      refreshFiles,
      setIsLoading,
      currentDeviceType: settingsStore.currentDeviceType,
    };
  },
)(
  withTranslation(["NewFilesPanel", "Common"])(
    withLoader(observer(NewFilesPanel))(<DialogAsideSkeleton isPanel />),
  ),
);
