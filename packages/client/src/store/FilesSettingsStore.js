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

import api from "@docspace/shared/api";
import {
  setFavoritesSetting,
  setRecentSetting,
} from "@docspace/shared/api/files";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import axios from "axios";
import { makeAutoObservable } from "mobx";
import { presentInArray } from "@docspace/shared/utils";
import {
  iconSize24,
  iconSize32,
  iconSize64,
  iconSize96,
} from "@docspace/shared/utils/image-helpers";
import { HTML_EXST } from "@docspace/shared/constants";
import {
  getIconPathByFolderType,
  isPublicPreview,
} from "@docspace/shared/utils/common";
import { toastr } from "@docspace/shared/components/toast";

class FilesSettingsStore {
  thirdPartyStore;
  treeFoldersStore;
  publicRoomStore;
  pluginStore;
  authStore;
  settingsStore;

  filesSettings = null;

  isErrorSettings = null;
  expandedSetting = null;

  confirmDelete = null;
  enableThirdParty = null;
  forcesave = null;
  storeForcesave = null;
  storeOriginalFiles = null;
  favoritesSection = null;
  recentSection = null;
  hideConfirmConvertSave = null;
  keepNewFileName = null;
  openEditorInSameTab = null;
  thumbnails1280x720 = window.ClientConfig?.thumbnails1280x720 || false;
  chunkUploadSize = 1024 * 1023; // 1024 * 1023; //~0.999mb
  maxUploadThreadCount = 15;
  maxUploadFilesCount = 5;

  settingsIsLoaded = false;

  extsImagePreviewed = [];
  extsMediaPreviewed = [];
  extsWebPreviewed = [];
  extsWebEdited = [];
  extsWebEncrypt = [];
  extsWebReviewed = [];
  extsWebCustomFilterEditing = [];
  extsWebRestrictedEditing = [];
  extsWebCommented = [];
  extsWebTemplate = [];
  extsCoAuthoring = [];
  extsMustConvert = [];
  extsConvertible = [];
  extsUploadable = [];
  extsArchive = [];
  extsVideo = [];
  extsAudio = [];
  extsImage = [];
  extsSpreadsheet = [];
  extsPresentation = [];
  extsDocument = [];
  internalFormats = {};
  masterFormExtension = "";
  canSearchByContent = false;

  ebook = [".fb2", ".ibk", ".prc", ".epub"];

  constructor(
    thirdPartyStore,
    treeFoldersStore,
    publicRoomStore,
    pluginStore,
    authStore,
    settingsStore,
  ) {
    makeAutoObservable(this);

    this.thirdPartyStore = thirdPartyStore;
    this.treeFoldersStore = treeFoldersStore;
    this.publicRoomStore = publicRoomStore;
    this.pluginStore = pluginStore;
    this.authStore = authStore;
    this.settingsStore = settingsStore;
  }

  setIsLoaded = (isLoaded) => {
    this.settingsIsLoaded = isLoaded;
  };

  get uploadThreadCount() {
    return this.maxUploadThreadCount / this.maxUploadFilesCount;
  }

  get isLoadedSettingsTree() {
    return (
      this.confirmDelete !== null &&
      this.enableThirdParty !== null &&
      this.forcesave !== null &&
      this.storeForcesave !== null &&
      this.storeOriginalFiles !== null
    );
  }

  setFilesSettings = (settings) => {
    this.filesSettings = settings;
    const settingsItems = Object.keys(settings);
    for (let key of settingsItems) {
      this[key] = settings[key];
    }
  };

  setIsErrorSettings = (isError) => {
    this.isErrorSettings = isError;
  };

  setExpandSettingsTree = (expandedSetting) => {
    this.expandedSetting = expandedSetting;
  };

  getFilesSettings = () => {
    if (this.isLoadedSettingsTree) return Promise.resolve();

    return api.files
      .getSettingsFiles()
      .then((settings) => {
        this.setFilesSettings(settings);
        this.setIsLoaded(true);

        if (
          !settings.enableThirdParty ||
          this.publicRoomStore.isPublicRoom ||
          isPublicPreview() ||
          (this.settingsStore.isFrame && this.authStore.isAuthenticated)
        )
          return;

        return axios
          .all([
            api.files.getThirdPartyCapabilities(),
            api.files.getThirdPartyList(),
          ])
          .then(([capabilities, providers]) => {
            for (let item of capabilities) {
              item.splice(1, 1);
            }
            this.thirdPartyStore.setThirdPartyCapabilities(capabilities); //TODO: Out of bounds read: 1
            this.thirdPartyStore.setThirdPartyProviders(providers);
          });
      })
      .catch(() => this.setIsErrorSettings(true));
  };

  setFilesSetting = (setting, val) => {
    this[setting] = val;
  };

  setStoreOriginal = (data, setting) =>
    api.files
      .storeOriginal(data)
      .then((res) => this.setFilesSetting(setting, res))
      .catch((e) => toastr.error(e));

  setConfirmDelete = (data, setting) =>
    api.files
      .changeDeleteConfirm(data)
      .then((res) => this.setFilesSetting(setting, res))
      .catch((e) => toastr.error(e));

  setStoreForceSave = (data) =>
    api.files.storeForceSave(data).then((res) => this.setStoreForcesave(res));

  setStoreForcesave = (val) => (this.storeForcesave = val);

  setThumbnails1280x720 = (enabled) => {
    this.thumbnails1280x720 = enabled;
  };

  setKeepNewFileName = (data) => {
    api.files
      .changeKeepNewFileName(data)
      .then((res) => this.setFilesSetting("keepNewFileName", res))
      .catch((e) => toastr.error(e));
  };

  setOpenEditorInSameTab = (data) => {
    api.files
      .changeOpenEditorInSameTab(data)
      .then((res) => this.setFilesSetting("openEditorInSameTab", res))
      .catch((e) => toastr.error(e));
  };

  setEnableThirdParty = async (data, setting) => {
    const res = await api.files.enableThirdParty(data);
    this.setFilesSetting(setting, res);

    if (data) {
      return axios
        .all([
          api.files.getThirdPartyCapabilities(),
          api.files.getThirdPartyList(),
        ])
        .then(([capabilities, providers]) => {
          for (let item of capabilities) {
            item.splice(1, 1);
          }
          this.thirdPartyStore.setThirdPartyCapabilities(capabilities); //TODO: Out of bounds read: 1
          this.thirdPartyStore.setThirdPartyProviders(providers);
        });
    } else {
      return Promise.resolve();
    }
  };

  setForceSave = (data) =>
    api.files.forceSave(data).then((res) => this.setForcesave(res));

  getDocumentServiceLocation = () => api.files.getDocumentServiceLocation();

  changeDocumentServiceLocation = (docServiceUrl, internalUrl, portalUrl) =>
    api.files.changeDocumentServiceLocation(
      docServiceUrl,
      internalUrl,
      portalUrl,
    );

  setForcesave = (val) => (this.forcesave = val);

  updateRootTreeFolders = () => {
    const { getFoldersTree, setTreeFolders } = this.treeFoldersStore;
    getFoldersTree().then((root) => setTreeFolders(root));
  };

  setFavoritesSetting = (set, setting) => {
    return setFavoritesSetting(set).then((res) => {
      this.setFilesSetting(setting, res);
      this.updateRootTreeFolders();
    });
  };

  setRecentSetting = (set, setting) => {
    return setRecentSetting(set).then((res) => {
      this.setFilesSetting(setting, res);
      this.updateRootTreeFolders();
    });
  };

  hideConfirmConvert = async (save = true) => {
    const hideConfirmConvertSave = await api.files.hideConfirmConvert(save);
    this.hideConfirmConvertSave = hideConfirmConvertSave;
  };

  canViewedDocs = (extension) =>
    presentInArray(this.extsWebPreviewed, extension);

  canConvert = (extension) => presentInArray(this.extsMustConvert, extension);

  // isMediaOrImage = (fileExst) => { TODO: no need, use the data from item
  //   if (
  //     this.extsVideo.includes(fileExst) ||
  //     this.extsImage.includes(fileExst) ||
  //     this.extsAudio.includes(fileExst)
  //   ) {
  //     return true;
  //   }
  //   return false;
  // };

  isArchive = (extension) => presentInArray(this.extsArchive, extension);

  isImage = (extension) => presentInArray(this.extsImage, extension);

  isSound = (extension) => presentInArray(this.extsAudio, extension);

  isHtml = (extension) => presentInArray(HTML_EXST, extension);

  isEbook = (extension) => presentInArray(this.ebook, extension);

  isDocument = (extension) => presentInArray(this.extsDocument, extension);

  isMasterFormExtension = (extension) => this.masterFormExtension === extension;

  isPresentation = (extension) =>
    presentInArray(this.extsPresentation, extension);

  isSpreadsheet = (extension) =>
    presentInArray(this.extsSpreadsheet, extension);

  /**
   *
   * @param {number} [size = 24]
   * @param {string } [fileExst = null]
   * @param {string} [pproviderKey
   * @param {*} contentLength
   * @param {RoomsType | null} roomType
   * @param {boolean | null} isArchive
   * @param {FolderType} folderType
   * @returns {string | undefined}
   */
  getIcon = (
    size = 24,
    fileExst = null,
    providerKey = null,
    contentLength = null,
    roomType = null,
    isArchive = null,
    folderType = null,
  ) => {
    if (fileExst || contentLength) {
      const isArchiveItem = this.isArchive(fileExst);
      const isImageItem = this.isImage(fileExst);
      const isSoundItem = this.isSound(fileExst);
      const isHtmlItem = this.isHtml(fileExst);

      const icon = this.getFileIcon(
        fileExst,
        size,
        isArchiveItem,
        isImageItem,
        isSoundItem,
        isHtmlItem,
      );
      return icon;
    } else if (roomType) {
      return this.getRoomsIcon(roomType, isArchive, 32);
    } else if (folderType) {
      return this.getIconByFolderType(folderType, size);
    } else {
      return this.getFolderIcon(providerKey, size);
    }
  };

  getIconByFolderType = (folderType, size = 32) => {
    const path = getIconPathByFolderType(folderType);
    return this.getIconBySize(size, path);
  };

  getIconBySize = (size, path = 32) => {
    switch (+size) {
      case 24:
        return iconSize24.get(path);
      case 32:
        return iconSize32.get(path);
      case 64:
        return iconSize64.get(path);
      case 96:
        return iconSize96.get(path);
    }
  };

  getRoomsIcon = (roomType, isArchive, size = 32) => {
    let path = "";

    if (isArchive) {
      path = "archive.svg";
    } else {
      switch (roomType) {
        case RoomsType.CustomRoom:
          path = "custom.svg";
          break;
        case RoomsType.FillingFormsRoom:
          path = "filling.form.svg";
          break;
        case RoomsType.EditingRoom:
          path = "editing.svg";
          break;
        case RoomsType.ReadOnlyRoom:
          path = "view.only.svg";
          break;
        case RoomsType.ReviewRoom:
          path = "review.svg";
          break;
        case RoomsType.PublicRoom:
          path = "public.svg";
          break;
        case RoomsType.FormRoom:
          path = "form.svg";
      }
    }

    return this.getIconBySize(size, path);
  };

  getFolderIcon = (providerKey, size = 32) => {
    let path = "";

    switch (providerKey) {
      case "Box":
      case "BoxNet":
        path = "box.svg";
        break;
      case "DropBox":
      case "DropboxV2":
        path = "dropbox.svg";
        break;
      case "Google":
      case "GoogleDrive":
        path = "google.svg";
        break;
      case "OneDrive":
        path = "onedrive.svg";
        break;
      case "SharePoint":
        path = "sharepoint.svg";
        break;
      case "Yandex":
        path = "yandex.svg";
        break;
      case "kDrive":
        path = "kdrive.svg";
        break;
      case "WebDav":
        path = "webdav.svg";
        break;
      default:
        path = "folder.svg";
        break;
    }

    return this.getIconBySize(size, path);
  };

  getIconUrl = (extension, size) => {
    let path = "";

    switch (extension) {
      case ".avi":
        path = "avi.svg";
        break;
      case ".csv":
        path = "csv.svg";
        break;
      case ".djvu":
        path = "djvu.svg";
        break;
      case ".doc":
        path = "doc.svg";
        break;
      case ".docm":
        path = "docm.svg";
        break;
      case ".docx":
        path = "docx.svg";
        break;
      case ".dotx":
        path = "dotx.svg";
        break;
      case ".dvd":
        path = "dvd.svg";
        break;
      case ".epub":
        path = "epub.svg";
        break;
      case ".pb2":
      case ".fb2":
        path = "fb2.svg";
        break;
      case ".flv":
        path = "flv.svg";
        break;
      case ".fodt":
        path = "fodt.svg";
        break;
      case ".iaf":
        path = "iaf.svg";
        break;
      case ".ics":
        path = "ics.svg";
        break;
      case ".m2ts":
        path = "m2ts.svg";
        break;
      case ".mht":
        path = "mht.svg";
        break;
      case ".mkv":
        path = "mkv.svg";
        break;
      case ".mov":
        path = "mov.svg";
        break;
      case ".mp4":
        path = "mp4.svg";
        break;
      case ".mpg":
        path = "mpg.svg";
        break;
      case ".odp":
        path = "odp.svg";
        break;
      case ".ods":
        path = "ods.svg";
        break;
      case ".odt":
        path = "odt.svg";
        break;
      case ".otp":
        path = "otp.svg";
        break;
      case ".ots":
        path = "ots.svg";
        break;
      case ".ott":
        path = "ott.svg";
        break;
      case ".pdf":
        path = "pdf.svg";
        break;
      case ".pot":
        path = "pot.svg";
        break;
      case ".pps":
        path = "pps.svg";
        break;
      case ".ppsx":
        path = "ppsx.svg";
        break;
      case ".ppt":
        path = "ppt.svg";
        break;
      case ".pptm":
        path = "pptm.svg";
        break;
      case ".pptx":
        path = "pptx.svg";
        break;
      case ".rtf":
        path = "rtf.svg";
        break;
      case ".svg":
        path = "svg.svg";
        break;
      case ".txt":
        path = "txt.svg";
        break;
      case ".webm":
        path = "webm.svg";
        break;
      case ".xls":
        path = "xls.svg";
        break;
      case ".xlsm":
        path = "xlsm.svg";
        break;
      case ".xlsx":
        path = "xlsx.svg";
        break;
      case ".xlsb":
        path = "xlsb.svg";
        break;
      case ".xps":
        path = "xps.svg";
        break;
      case ".xml":
        path = "xml.svg";
        break;
      case ".oform":
        path = "oform.svg";
        break;
      case ".docxf":
        path = "docxf.svg";
        break;
      case ".sxc":
        path = "sxc.svg";
        break;
      case ".et":
        path = "et.svg";
        break;
      case ".ett":
        path = "ett.svg";
        break;
      case ".sxw":
        path = "sxw.svg";
        break;
      case ".stw":
        path = "stw.svg";
        break;
      case ".wps":
        path = "wps.svg";
        break;
      case ".wpt":
        path = "wpt.svg";
        break;
      case ".mhtml":
        path = "mhtml.svg";
        break;
      case ".dps":
        path = "dps.svg";
        break;
      case ".dpt":
        path = "dpt.svg";
        break;
      case ".sxi":
        path = "sxi.svg";
        break;
      default:
        const { enablePlugins } = this.settingsStore;

        if (enablePlugins) {
          const { fileItemsList } = this.pluginStore;

          if (fileItemsList) {
            fileItemsList.forEach(({ key, value }) => {
              if (value.extension === extension && value.fileIcon)
                path = value.fileIcon;
            });

            if (path) return path;
          }
        }

        path = "file.svg";

        break;
    }

    return this.getIconBySize(size, path);
  };

  getFileIcon = (
    extension,
    size = 32,
    archive = false,
    image = false,
    sound = false,
    html = false,
  ) => {
    let path = "";

    if (archive) path = "file_archive.svg";

    if (image) path = "image.svg";

    if (sound) path = "sound.svg";

    if (html) path = "html.svg";

    if (path) return this.getIconBySize(size, path);

    return this.getIconUrl(extension, size);
  };

  getIconSrc = (ext, size = 24) => {
    let path = "";

    if (presentInArray(this.extsArchive, ext, true)) path = "file_archive.svg";

    if (presentInArray(this.extsImage, ext, true)) path = "image.svg";

    if (presentInArray(this.extsAudio, ext, true)) path = "sound.svg";

    if (presentInArray(HTML_EXST, ext, true)) path = "html.svg";

    if (path) return this.getIconBySize(size, path);

    const extension = ext.toLowerCase();

    return this.getIconUrl(extension, size);
  };

  get openOnNewPage() {
    if (
      window.navigator.userAgent.includes("ZoomWebKit") ||
      window.navigator.userAgent.includes("ZoomApps")
    )
      return false;
    return !this.openEditorInSameTab;
  }
}

export default FilesSettingsStore;
