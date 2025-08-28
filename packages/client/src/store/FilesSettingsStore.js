// (c) Copyright Ascensio System SIA 2009-2025
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
import { RoomsType } from "@docspace/shared/enums";
import axios from "axios";
import { makeAutoObservable } from "mobx";
import { presentInArray } from "@docspace/shared/utils";
import {
  iconSize24,
  iconSize32,
  iconSize64,
  iconSize96,
} from "@docspace/shared/utils/image-helpers";
import { HTML_EXST, EBOOK_EXST } from "@docspace/shared/constants";
import {
  getIconPathByFolderType,
  isPublicPreview,
  insertEditorPreloadFrame,
} from "@docspace/shared/utils/common";
import { toastr } from "@docspace/shared/components/toast";

class FilesSettingsStore {
  thirdPartyStore;

  treeFoldersStore;

  publicRoomStore;

  pluginStore;

  authStore;

  settingsStore;

  /**
   *  @type {import("@docspace/shared/api/files/types").TFilesSettings=}
   */
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

  chunkUploadSize = 1024 * 1023; // 1024 * 1023; //~0.999mb

  maxUploadThreadCount = 15;

  maxUploadFilesCount = 5;

  displayFileExtension = null;

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

  extsDiagram = [];

  internalFormats = {};

  masterFormExtension = "";

  canSearchByContent = false;

  hideConfirmRoomLifetime = false;

  hideConfirmCancelOperation = false;

  extsFilesVectorized = [];

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
    settingsItems.forEach((key) => {
      this[key] = settings[key];
    });
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
          (this.settingsStore.isFrame && !this.authStore.isAuthenticated)
        )
          return;

        return axios
          .all([
            api.files.getThirdPartyCapabilities(),
            api.files.getThirdPartyList(),
          ])
          .then(([capabilities, providers]) => {
            capabilities.forEach((item) => {
              item.splice(1, 1);
            });

            this.thirdPartyStore.setThirdPartyCapabilities(capabilities); // TODO: Out of bounds read: 1
            this.thirdPartyStore.setThirdPartyProviders(providers);
          });
      })
      .then(() => {
        api.files
          .getDocumentServiceLocation()
          .then(({ docServicePreloadUrl }) => {
            if (docServicePreloadUrl) {
              insertEditorPreloadFrame(docServicePreloadUrl);
            }
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

  setHideConfirmCancelOperation = (data) => {
    api.files
      .changeHideConfirmCancelOperation(data)
      .then((res) => this.setFilesSetting("hideConfirmCancelOperation", res))
      .catch((e) => toastr.error(e));
  };

  setKeepNewFileName = async (data) => {
    return api.files
      .changeKeepNewFileName(data)
      .then((res) => this.setFilesSetting("keepNewFileName", res))
      .catch((e) => toastr.error(e));
  };

  setDisplayFileExtension = (data) => {
    api.files
      .enableDisplayFileExtension(data)
      .then((res) => this.setFilesSetting("displayFileExtension", res))
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
          capabilities.forEach((item) => {
            item.splice(1, 1);
          });
          this.thirdPartyStore.setThirdPartyCapabilities(capabilities); // TODO: Out of bounds read: 1
          this.thirdPartyStore.setThirdPartyProviders(providers);
        });
    }
    return Promise.resolve();
  };

  setForceSave = (data) =>
    api.files.forceSave(data).then((res) => this.setForcesave(res));

  getDocumentServiceLocation = () => api.files.getDocumentServiceLocation();

  changeDocumentServiceLocation = (
    docServiceUrl,
    secretKey,
    authHeader,
    internalUrl,
    portalUrl,
    sslVerification,
  ) =>
    api.files.changeDocumentServiceLocation(
      docServiceUrl,
      secretKey,
      authHeader,
      internalUrl,
      portalUrl,
      sslVerification,
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

  isEbook = (extension) => presentInArray(EBOOK_EXST, extension);

  isDocument = (extension) => presentInArray(this.extsDocument, extension);

  isDiagram = (extension) => presentInArray(this.extsDiagram, extension);

  isMasterFormExtension = (extension) => this.masterFormExtension === extension;

  isPresentation = (extension) =>
    presentInArray(this.extsPresentation, extension);

  isSpreadsheet = (extension) =>
    presentInArray(this.extsSpreadsheet, extension);

  /**
   * @param {number} size
   * @param {string} fileExst
   * @param {string} providerKey
   * @param {*} contentLength
   * @param {RoomsType} roomType
   * @param {boolean } isArchive
   * @param {FolderType} folderType
   * @returns {string}
   */
  getIcon = (
    size = 32,
    fileExst = null,
    providerKey = null, // eslint-disable-line @typescript-eslint/no-unused-vars
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
      const isEbookItem = this.isEbook(fileExst);

      const icon = this.getFileIcon(
        fileExst,
        size,
        isArchiveItem,
        isImageItem,
        isSoundItem,
        isHtmlItem,
        isEbookItem,
      );
      return icon;
    }
    if (roomType) {
      return this.getRoomsIcon(roomType, isArchive, 32);
    }
    if (folderType) {
      return this.getIconByFolderType(folderType, size);
    }
    return this.getFolderIcon(size);
  };

  getIconByFolderType = (folderType, size = 32) => {
    const path = getIconPathByFolderType(folderType);
    return this.getIconBySize(path, size);
  };

  getIconBySize = (path, size = 32) => {
    const getOrDefault = (container) =>
      container.has(path) ? container.get(path) : container.get("file.svg");

    switch (+size) {
      case 24:
        return getOrDefault(iconSize24);
      case 32:
        return getOrDefault(iconSize32);
      case 64:
        return getOrDefault(iconSize64);
      case 96:
        return getOrDefault(iconSize96);
      default:
        return getOrDefault(iconSize32);
    }
  };

  getRoomsIcon = (roomType, isArchive, size = 32) => {
    let path = "";

    if (isArchive) {
      path = "archiveRoom.svg";
    } else {
      switch (roomType) {
        case RoomsType.CustomRoom:
          path = "customRoom.svg";
          break;
        case RoomsType.AIRoom:
          path = "aiRoom.svg";
          break;
        case RoomsType.EditingRoom:
          path = "editingRoom.svg";
          break;
        case RoomsType.PublicRoom:
          path = "publicRoom.svg";
          break;
        case RoomsType.VirtualDataRoom:
          path = "virtualRoom.svg";
          break;
        case RoomsType.FormRoom:
          path = "formRoom.svg";
          break;
        default:
          path = "customRoom.svg";
      }
    }

    return this.getIconBySize(path, size);
  };

  getFolderIcon = (size = 32) => {
    return this.getIconBySize("folder.svg", size);
  };

  getIconUrl = (extension, size) => {
    const { enablePlugins } = this.settingsStore;
    const { fileItemsList } = this.pluginStore;

    const path = `${extension.replace(/^\./, "")}.svg`;

    if (enablePlugins && fileItemsList) {
      const fileItem = fileItemsList.find(
        ({ value }) => value.extension === extension && value.fileIcon,
      );
      if (fileItem) {
        return fileItem.value.fileIcon;
      }
    }

    return this.getIconBySize(path, size);
  };

  getFileIcon = (
    extension,
    size = 32,
    archive = false,
    image = false,
    sound = false,
    html = false,
    ebook = false,
  ) => {
    let path = "";

    if (archive) path = "archive.svg";

    if (image) path = "image.svg";

    if (sound) path = "sound.svg";

    if (html) path = "html.svg";

    if (ebook) path = "ebook.svg";

    if (path) return this.getIconBySize(path, size);

    return this.getIconUrl(extension, size);
  };

  getIconSrc = (ext, size = 32) => {
    let path = "";

    if (presentInArray(this.extsArchive, ext, true)) path = "archive.svg";

    if (presentInArray(this.extsImage, ext, true)) path = "image.svg";

    if (presentInArray(this.extsAudio, ext, true)) path = "sound.svg";

    if (presentInArray(HTML_EXST, ext, true)) path = "html.svg";

    if (presentInArray(EBOOK_EXST, ext, true)) path = "ebook.svg";

    if (path) return this.getIconBySize(path, size);

    const extension = ext.toLowerCase();

    return this.getIconUrl(extension, size);
  };

  hideConfirmRoomLifetimeSetting = (set) => {
    return api.rooms
      .hideConfirmRoomLifetime(set)
      .then((res) => {
        this.setFilesSetting("hideConfirmRoomLifetime", res);
      })
      .catch((e) => toastr.error(e));
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
