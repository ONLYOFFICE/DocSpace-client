/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import api from "@docspace/shared/api";
import {
  setFavoritesSetting,
  setRecentSetting,
  setOrganizeGrouping,
} from "@docspace/shared/api/files";
import type { TAccessControlSettings } from "@docspace/shared/api/files";
import type {
  TDocServiceLocation,
  TFileLink,
  TFilesSettings,
  TThirdParties,
  TThirdPartyCapabilities,
} from "@docspace/shared/api/files/types";
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
import { HTML_EXST, EBOOK_EXST } from "@docspace/shared/constants";
import {
  getIconPathByFolderType,
  isPublicPreview,
  insertEditorPreloadFrame,
} from "@docspace/shared/utils/common";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";
import SocketHelper, { SocketEvents } from "@docspace/ui-kit/utils/socket";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import i18n from "../i18n";
import type PluginStore from "./PluginStore";
import type PublicRoomStore from "./PublicRoomStore";
import type { ThirdPartyStore } from "./ThirdPartyStore";
import type TreeFoldersStore from "./TreeFoldersStore";
import type { TTreeFolder } from "./TreeFoldersStore";

type TFilesApiWithForceSave = typeof api.files & {
  storeForceSave: (data: boolean) => Promise<boolean>;
  forceSave: (data: boolean) => Promise<boolean>;
};

class FilesSettingsStore {
  thirdPartyStore: ThirdPartyStore;

  treeFoldersStore: TreeFoldersStore;

  publicRoomStore: PublicRoomStore;

  pluginStore: PluginStore;

  authStore: AuthStore;

  settingsStore: SettingsStore;

  filesSettings: TFilesSettings | null = null;

  isErrorSettings: boolean | null = null;

  expandedSetting: unknown = null;

  confirmDelete: boolean | null = null;

  enableThirdParty: boolean | null = null;

  forcesave: boolean | null = null;

  storeForcesave: boolean | null = null;

  storeOriginalFiles: boolean | null = null;

  favoritesSection: boolean | null = null;

  recentSection: boolean | null = null;

  hideConfirmConvertSave: boolean | null = null;

  keepNewFileName: boolean | null = null;

  openEditorInSameTab: boolean | null = null;

  chunkUploadSize = 1024 * 1023; // 1024 * 1023; //~0.999mb

  maxUploadThreadCount = 15;

  maxUploadFilesCount = 5;

  displayFileExtension: boolean | null = null;

  settingsIsLoaded = false;

  extsImagePreviewed: string[] = [];

  extsMediaPreviewed: string[] = [];

  extsWebPreviewed: string[] = [];

  extsWebEdited: string[] = [];

  extsWebEncrypt: string[] = [];

  extsWebReviewed: string[] = [];

  extsWebCustomFilterEditing: string[] = [];

  extsWebRestrictedEditing: string[] = [];

  extsWebCommented: string[] = [];

  extsWebTemplate: string[] = [];

  extsCoAuthoring: string[] = [];

  extsMustConvert: string[] = [];

  // The initial value is an empty array, but /files/settings replaces it with
  // a map of source extension -> target extensions (see TFilesSettings).
  extsConvertible: TFilesSettings["extsConvertible"] | string[] = [];

  extsUploadable: string[] = [];

  extsArchive: string[] = [];

  extsVideo: string[] = [];

  extsAudio: string[] = [];

  extsImage: string[] = [];

  extsSpreadsheet: string[] = [];

  extsPresentation: string[] = [];

  extsDocument: string[] = [];

  extsDiagram: string[] = [];

  internalFormats: Partial<TFilesSettings["internalFormats"]> = {};

  masterFormExtension = "";

  canSearchByContent = false;

  hideConfirmRoomLifetime = false;

  hideConfirmCancelOperation = false;

  organizeRoomsGrouping = false;

  // Shown unless this user has turned it off. Defaulting to `true` rather than
  // to "unknown" is deliberate: it is the right value for everyone who has
  // never hidden the banner, and it stands only until `getFilesSettings`
  // resolves and overwrites it with the stored one.
  showQuickActions = true;

  extsFilesVectorized: string[] = [];

  externalShare = true;

  defaultShareLinkInternal = false;

  externalShareApplyToDocuments = true;

  externalShareApplyToRooms = true;

  blockExistingLinksOnRestrict = true;

  // `undefined` is included because setDocumentServiceLocation is fed the
  // result of getDocumentServiceLocation, which resolves to undefined when
  // the request is cancelled.
  documentServiceLocation: TDocServiceLocation | null | undefined = null;

  constructor(
    thirdPartyStore: ThirdPartyStore,
    treeFoldersStore: TreeFoldersStore,
    publicRoomStore: PublicRoomStore,
    pluginStore: PluginStore,
    authStore: AuthStore,
    settingsStore: SettingsStore,
  ) {
    makeAutoObservable(this);

    this.thirdPartyStore = thirdPartyStore;
    this.treeFoldersStore = treeFoldersStore;
    this.publicRoomStore = publicRoomStore;
    this.pluginStore = pluginStore;
    this.authStore = authStore;
    this.settingsStore = settingsStore;

    SocketHelper?.on(
      SocketEvents.UpdateExternalShareSettings,
      // SocketEvents.UpdateExternalShareSettings is not listed
      // in ui-kit's TListenEventCallbackMap, so `on` expects a zero-argument
      // listener, while the server actually sends the access-control settings
      // payload. The cast keeps the original callback untouched without
      // modifying libs/ui-kit.
      ((settings: TAccessControlSettings) => {
        this.externalShare = settings.externalShare;
        this.defaultShareLinkInternal = settings.defaultShareLinkInternal;
        this.externalShareApplyToDocuments =
          settings.externalShareApplyToDocuments;
        this.externalShareApplyToRooms = settings.externalShareApplyToRooms;
        this.blockExistingLinksOnRestrict =
          settings.blockExistingLinksOnRestrict;
      }) as () => void,
    );
  }

  setIsLoaded = (isLoaded: boolean) => {
    this.settingsIsLoaded = isLoaded;
  };

  get uploadThreadCount() {
    return this.maxUploadThreadCount / this.maxUploadFilesCount;
  }

  get isExternalShareRestricted() {
    return !this.externalShare;
  }

  isLinkRestrictedByAdmin = (
    item: { rootFolderType: FolderType },
    link: TFileLink,
  ) => {
    const isInRoom = item.rootFolderType === FolderType.Rooms;
    const appliesToItem = isInRoom
      ? this.externalShareApplyToRooms
      : this.externalShareApplyToDocuments;

    return (
      this.isExternalShareRestricted &&
      appliesToItem &&
      !link.sharedTo.internal
    );
  };

  isLinkBlockedByAdmin = (
    item: { rootFolderType: FolderType },
    link: TFileLink,
  ) => {
    return (
      this.isLinkRestrictedByAdmin(item, link) &&
      this.blockExistingLinksOnRestrict
    );
  };

  get isLoadedSettingsTree() {
    return (
      this.confirmDelete !== null &&
      this.enableThirdParty !== null &&
      this.forcesave !== null &&
      this.storeForcesave !== null &&
      this.storeOriginalFiles !== null
    );
  }

  setFilesSettings = (settings: TFilesSettings) => {
    this.filesSettings = settings;
    const settingsItems = Object.keys(settings) as (keyof TFilesSettings)[];
    settingsItems.forEach((key) => {
      // The original .js copies every key of the server response onto the
      // store instance, so the assignment stays dynamic.
      (this as unknown as Record<keyof TFilesSettings, unknown>)[key] =
        settings[key];
    });
  };

  setIsErrorSettings = (isError: boolean) => {
    this.isErrorSettings = isError;
  };

  setExpandSettingsTree = (expandedSetting: unknown) => {
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
          .all<TThirdPartyCapabilities | TThirdParties>([
            api.files.getThirdPartyCapabilities(),
            api.files.getThirdPartyList(),
          ])
          .then(([capabilities, providers]) => {
            (capabilities as TThirdPartyCapabilities).forEach((item) => {
              item.splice(1, 1);
            });

            this.thirdPartyStore.setThirdPartyCapabilities(
              capabilities as TThirdPartyCapabilities,
            ); // TODO: Out of bounds read: 1
            this.thirdPartyStore.setThirdPartyProviders(
              providers as TThirdParties,
            );
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

  setFilesSetting = (setting: string, val: unknown) => {
    (this as unknown as Record<string, unknown>)[setting] = val;
  };

  setAccessControlSettings = async (settings: TAccessControlSettings) => {
    const res = await api.files.setAccessControlSettings(settings);
    this.externalShare = res.externalShare;
    this.defaultShareLinkInternal = res.defaultShareLinkInternal;
    this.externalShareApplyToDocuments = res.externalShareApplyToDocuments;
    this.externalShareApplyToRooms = res.externalShareApplyToRooms;
    this.blockExistingLinksOnRestrict = res.blockExistingLinksOnRestrict;
    return res;
  };

  setStoreOriginal = (data: boolean, setting: string) =>
    api.files
      .storeOriginal(data)
      .then((res) => this.setFilesSetting(setting, res))
      .catch((e) => toastr.error(e as string));

  setConfirmDelete = (data: boolean, setting: string) =>
    api.files
      .changeDeleteConfirm(data)
      .then((res) => this.setFilesSetting(setting, res))
      .catch((e) => toastr.error(e as string));

  setStoreForceSave = (data: boolean) =>
    (api.files as TFilesApiWithForceSave)
      .storeForceSave(data)
      .then((res) => this.setStoreForcesave(res));

  setStoreForcesave = (val: boolean) => (this.storeForcesave = val);

  setHideConfirmCancelOperation = (data: boolean) => {
    api.files
      .changeHideConfirmCancelOperation(data)
      .then((res) => this.setFilesSetting("hideConfirmCancelOperation", res))
      .catch((e) => toastr.error(e as string));
  };

  setKeepNewFileName = async (data: boolean) => {
    return api.files
      .changeKeepNewFileName(data)
      .then((res) => this.setFilesSetting("keepNewFileName", res))
      .catch((e) => toastr.error(e as string));
  };

  setDisplayFileExtension = (data: boolean) => {
    api.files
      .enableDisplayFileExtension(data)
      .then((res) => this.setFilesSetting("displayFileExtension", res))
      .catch((e) => toastr.error(e as string));
  };

  setOpenEditorInSameTab = (data: boolean) => {
    api.files
      .changeOpenEditorInSameTab(data)
      .then((res) => this.setFilesSetting("openEditorInSameTab", res))
      .catch((e) => toastr.error(e as string));
  };

  // Applied before the request resolves: the caller hides the banner and
  // raises its toast in the same gesture, so waiting for the round trip would
  // leave the tiles on screen under a toast announcing they are gone. A
  // rejected request puts the previous value back.
  setShowQuickActions = async (data: boolean) => {
    const previous = this.showQuickActions;
    this.showQuickActions = data;

    try {
      const res = await api.files.changeShowQuickActions(data);
      this.setFilesSetting("showQuickActions", res);
    } catch (e) {
      this.showQuickActions = previous;
      toastr.error(e as string);
    }
  };

  setOrganizeRoomsGrouping = async (data: boolean) => {
    try {
      const res = await setOrganizeGrouping(data);
      this.setFilesSetting("organizeRoomsGrouping", res);

      const message = res
        ? i18n.t("GroupingRooms:RoomGroupingEnabled")
        : i18n.t("GroupingRooms:RoomGroupingDisabled");
      toastr.success(message);

      return res;
    } catch (e) {
      toastr.error(e as string);
      throw e;
    }
  };

  setEnableThirdParty = async (data: boolean, setting: string) => {
    const res = await api.files.enableThirdParty(data);
    this.setFilesSetting(setting, res);

    if (data) {
      return axios
        .all<TThirdPartyCapabilities | TThirdParties>([
          api.files.getThirdPartyCapabilities(),
          api.files.getThirdPartyList(),
        ])
        .then(([capabilities, providers]) => {
          (capabilities as TThirdPartyCapabilities).forEach((item) => {
            item.splice(1, 1);
          });
          this.thirdPartyStore.setThirdPartyCapabilities(
            capabilities as TThirdPartyCapabilities,
          ); // TODO: Out of bounds read: 1
          this.thirdPartyStore.setThirdPartyProviders(
            providers as TThirdParties,
          );
        });
    }
    return Promise.resolve();
  };

  setForceSave = (data: boolean) =>
    (api.files as TFilesApiWithForceSave)
      .forceSave(data)
      .then((res) => this.setForcesave(res));

  getDocumentServiceLocation = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      // the original .js passes null for the optional
      // `version` argument (typed `number | string | undefined` in
      // shared/api); the cast keeps the runtime argument identical.
      return await api.files.getDocumentServiceLocation(
        null as unknown as undefined,
        abortController.signal,
      );
    } catch (error) {
      if (axios.isCancel(error)) return;

      throw error;
    }
  };

  setDocumentServiceLocation = (
    data: TDocServiceLocation | null | undefined,
  ) => {
    this.documentServiceLocation = data;
  };

  changeDocumentServiceLocation = (
    docServiceUrl: string,
    secretKey: string,
    authHeader: string,
    internalUrl: string,
    portalUrl: string,
    sslVerification: boolean,
  ) =>
    api.files.changeDocumentServiceLocation(
      docServiceUrl,
      secretKey,
      authHeader,
      internalUrl,
      portalUrl,
      sslVerification,
    );

  setForcesave = (val: boolean) => (this.forcesave = val);

  updateRootTreeFolders = () => {
    const { getFoldersTree, setTreeFolders } = this.treeFoldersStore;
    // treeFoldersStore.getFoldersTree() returns void (it does
    // not return the api promise), so `.then` here throws a TypeError at
    // runtime — the original .js has the same behavior. The cast keeps the
    // original call untouched.
    (getFoldersTree() as unknown as Promise<TTreeFolder[]>).then((root) =>
      setTreeFolders(root),
    );
  };

  setFavoritesSetting = (set: boolean, setting: string) => {
    return setFavoritesSetting(set).then((res) => {
      this.setFilesSetting(setting, res);
      this.updateRootTreeFolders();
    });
  };

  setRecentSetting = (set: boolean, setting: string) => {
    return setRecentSetting(set).then((res) => {
      this.setFilesSetting(setting, res);
      this.updateRootTreeFolders();
    });
  };

  hideConfirmConvert = async (save = true) => {
    const hideConfirmConvertSave = await api.files.hideConfirmConvert(save);
    this.hideConfirmConvertSave = hideConfirmConvertSave;
  };

  canViewedDocs = (extension: string) =>
    presentInArray(this.extsWebPreviewed, extension);

  canConvert = (extension: string) =>
    presentInArray(this.extsMustConvert, extension);

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

  isArchive = (extension: string) =>
    presentInArray(this.extsArchive, extension);

  isImage = (extension: string) => presentInArray(this.extsImage, extension);

  isSound = (extension: string) => presentInArray(this.extsAudio, extension);

  isHtml = (extension: string) => presentInArray(HTML_EXST, extension);

  isEbook = (extension: string) => presentInArray(EBOOK_EXST, extension);

  isDocument = (extension: string) =>
    presentInArray(this.extsDocument, extension);

  isDiagram = (extension: string) =>
    presentInArray(this.extsDiagram, extension);

  isMasterFormExtension = (extension: string) =>
    this.masterFormExtension === extension;

  isPresentation = (extension: string) =>
    presentInArray(this.extsPresentation, extension);

  isSpreadsheet = (extension: string) =>
    presentInArray(this.extsSpreadsheet, extension);

  getIcon = (
    size = 32,
    fileExst: string | null = null,
    providerKey: string | null = null,
    contentLength: string | null = null,
    roomType: RoomsType | null = null,
    isArchive: boolean | null = null,
    folderType: FolderType | null = null,
  ): string => {
    if (fileExst || contentLength) {
      // when only contentLength is set, fileExst is null and
      // was passed through to presentInArray unchanged in the original .js
      // (presentInArray tolerates it); the non-null assertions keep that
      // runtime intact.
      const isArchiveItem = this.isArchive(fileExst!);
      const isImageItem = this.isImage(fileExst!);
      const isSoundItem = this.isSound(fileExst!);
      const isHtmlItem = this.isHtml(fileExst!);
      const isEbookItem = this.isEbook(fileExst!);

      const icon = this.getFileIcon(
        fileExst!,
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

  getIconByFolderType = (folderType: FolderType, size = 32) => {
    const path = getIconPathByFolderType(folderType);
    return this.getIconBySize(path, size);
  };

  getIconBySize = (path: string, size = 32) => {
    // the "file.svg" fallback key is always present in the
    // iconSize* maps (built from IconNames.File in
    // shared/utils/image-helpers), so Map.get can never return undefined
    // here; the non-null assertions only encode that invariant.
    const getOrDefault = (container: Map<string, string>) =>
      container.has(path) ? container.get(path)! : container.get("file.svg")!;

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

  getRoomsIcon = (
    roomType: RoomsType,
    isArchive: boolean | null,
    size = 32,
  ) => {
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

  getIconUrl = (extension: string, size?: number) => {
    const path = `${extension.replace(/^\./, "")}.svg`;
    return this.getIconBySize(path, size);
  };

  getPluginFileIconUrl = (extension: string) => {
    const { enablePlugins } = this.settingsStore;
    const { fileItemsList } = this.pluginStore;

    if (!isAIAgents() && enablePlugins && fileItemsList) {
      const fileItem = fileItemsList.find(
        ({ value }) => value.extension === extension && value.fileIcon,
      );
      if (fileItem) {
        return fileItem.value.fileIcon;
      }
    }
  };

  getFileIcon = (
    extension: string,
    size = 32,
    archive = false,
    image = false,
    sound = false,
    html = false,
    ebook = false,
  ) => {
    let path = "";

    const pluginIconUrl = this.getPluginFileIconUrl(extension);

    if (pluginIconUrl) return pluginIconUrl;

    if (archive) path = "archive.svg";

    if (image) path = "image.svg";

    if (sound) path = "sound.svg";

    if (html) path = "html.svg";

    if (ebook) path = "ebook.svg";

    if (path) return this.getIconBySize(path, size);

    return this.getIconUrl(extension, size);
  };

  getIconSrc = (ext: string, size = 32) => {
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

  hideConfirmRoomLifetimeSetting = (set: boolean) => {
    return (api.rooms.hideConfirmRoomLifetime(set) as Promise<boolean>)
      .then((res) => {
        this.setFilesSetting("hideConfirmRoomLifetime", res);
      })
      .catch((e) => toastr.error(e as string));
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
