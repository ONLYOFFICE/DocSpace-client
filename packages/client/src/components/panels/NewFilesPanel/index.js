// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useState, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { Loader } from "@docspace/shared/components/loader";
import { Text } from "@docspace/shared/components/text";
import { Row } from "@docspace/shared/components/row";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { DialogAsideSkeleton } from "@docspace/shared/skeletons/dialog";

import FilesFilter from "@docspace/shared/api/files/filter";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";

import { StyledNewFilesBody, StyledLink } from "../StyledPanels";
import withLoader from "../../../HOCs/withLoader";

import config from "PACKAGE_FILE";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

const NewFilesPanel = (props) => {
  const {
    setNewFilesPanelVisible,
    getIcon,
    getFolderIcon,
    newFiles,
    markAsRead,
    setIsLoading,
    t,
    visible,
    isLoading,
    currentDeviceType,
    fileItemsList,
    enablePlugins,
    openOnNewPage,
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

    onFileClick(item);
    markAsRead(folderIds, fileIds, item)
      .then(() => {
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

      const isMedia =
        item?.viewAccessibility?.ImageView ||
        item?.viewAccessibility?.MediaView;

      if (canEdit && providerKey) {
        return window.open(
          combineUrl(
            window.ClientConfig?.proxy?.url,
            config.homepage,
            `/doceditor?fileId=${id}`,
          ),
          openOnNewPage ? "_blank" : "_self",
        );
      }

      if (isMedia) {
        return window.open(
          combineUrl(MEDIA_VIEW_URL, id),
          openOnNewPage ? "_blank" : "_self",
        );
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

      return window.open(webUrl, openOnNewPage ? "_blank" : "_self");
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

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
    >
      <ModalDialog.Header>{t("NewFiles")}</ModalDialog.Header>
      <ModalDialog.Body>
        {!isLoading ? (
          <StyledNewFilesBody>{filesListNode}</StyledNewFilesBody>
        ) : (
          <div key="loader" className="panel-loader-wrapper">
            <Loader type="oval" size="16px" className="panel-loader" />
            <Text as="span">{`${t("Common:LoadingProcessing")} ${t(
              "Common:LoadingDescription",
            )}`}</Text>
          </div>
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          scale
          label={t("Viewed")}
          size="normal"
          primary
          onClick={onMarkAsRead}
          isLoading={inProgress}
        />
        <Button
          scale
          label={t("Common:CloseButton")}
          size="normal"
          isDisabled={inProgress}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    mediaViewerDataStore,
    filesActionsStore,
    dialogsStore,
    filesSettingsStore,
    clientLoadingStore,
    pluginStore,
  }) => {
    const { hasNew, refreshFiles } = filesStore;

    const { setIsSectionFilterLoading, isLoading } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const { setCurrentItem } = mediaViewerDataStore;
    const { getIcon, getFolderIcon, openOnNewPage } = filesSettingsStore;
    const { markAsRead } = filesActionsStore;

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
      setCurrentItem,
      getIcon,
      getFolderIcon,
      markAsRead,
      setNewFilesPanelVisible,
      theme: settingsStore.theme,
      hasNew,
      refreshFiles,
      setIsLoading,
      currentDeviceType: settingsStore.currentDeviceType,
      openOnNewPage,
    };
  },
)(
  withTranslation(["NewFilesPanel", "Common"])(
    withLoader(observer(NewFilesPanel))(<DialogAsideSkeleton isPanel />),
  ),
);
