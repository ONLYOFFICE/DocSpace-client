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

import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import UnmuteReactSvgUrl from "PUBLIC_DIR/images/unmute.react.svg?url";
import MuteReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import CatalogAIAgentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import ActionsDocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import ActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FormBlankReactSvgUrl from "PUBLIC_DIR/images/form.blank.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import PluginMoreReactSvgUrl from "PUBLIC_DIR/images/plugin.more.react.svg?url";
import TemplateGalleryReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.template.react.svg?url";
import { isMobile, isTablet } from "react-device-detect";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import type { TTranslation } from "@docspace/shared/types";
import type { TOformFile } from "@docspace/shared/api/oforms/types";
import {
  RoomsType,
  FolderType,
  FilterType,
  SearchArea,
} from "@docspace/shared/enums";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import { isFolder } from "@docspace/shared/utils/typeGuards";
import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";
import { onSuggestOformChanges, onUploadAction } from "./helpers";
import type { TContextItem, TContextOption } from "./helpers";
import type ContextOptionsStore from "../ContextOptionsStore";

export const getFormGalleryContextOptionsImpl = (
  self: ContextOptionsStore,
  item: TOformFile | { attributes: { name_form: string } } | null,
  t: TTranslation,
  navigate?: unknown,
): ContextMenuModel[] => {
  return [
    {
      key: "create",
      label: t("Common:Create"),
      onClick: () => self.onCreateTemplate(navigate),
    },
    {
      key: "template-info",
      label: t("FormGallery:TemplateInfo"),
      onClick: () => self.onShowOformTemplateInfo(item as TOformFile),
    },
    {
      key: "separator",
      isSeparator: true,
    },
    {
      key: "suggest-changes",
      label: t("FormGallery:SuggestChanges"),
      onClick: () => onSuggestOformChanges(item as TOformFile),
    },
  ];
};

export const getRoomsRootContextOptionsImpl = (
  self: ContextOptionsStore,
  item: TContextItem,
  t: TTranslation,
): { pinOptions: TContextOption[]; muteOptions: TContextOption[] } => {
  const { id, rootFolderId } = self.selectedFolderStore;
  const isRootRoom = item.isRoom && rootFolderId === id;

  if (!isRootRoom) return { pinOptions: [], muteOptions: [] };

  const pinOptions = [
    {
      id: "option_pin-room",
      key: "pin-room",
      label: t("Common:PinToTop"),
      icon: PinReactSvgUrl,
      onClick: () => self.onClickPin("pin", item.id, t, item.isAIAgent),
      disabled:
        self.publicRoomStore.isPublicRoom ||
        Boolean(item.external && item.isLinkExpired),
    },
    {
      id: "option_unpin-room",
      key: "unpin-room",
      label: t("Common:Unpin"),
      icon: UnpinReactSvgUrl,
      onClick: () => self.onClickPin("unpin", item.id, t, item.isAIAgent),
      disabled:
        self.publicRoomStore.isPublicRoom ||
        Boolean(item.external && item.isLinkExpired),
    },
  ];

  const canMute =
    item.security?.Mute && !self.publicRoomStore.isPublicRoom && item.inRoom;

  const muteOptions = [
    {
      id: "option_unmute-room",
      key: "unmute-room",
      label: t("Common:EnableNotifications"),
      icon: UnmuteReactSvgUrl,
      onClick: () => self.onClickMute("unmute", item, t),
      disabled: !canMute,
    },
    {
      id: "option_mute-room",
      key: "mute-room",
      label: t("Common:DisableNotifications"),
      icon: MuteReactSvgUrl,
      onClick: () => self.onClickMute("mute", item, t),
      disabled: !canMute,
    },
  ];

  return { pinOptions, muteOptions };
};

export const getContextOptionsPlusFormRoomImpl = (
  self: ContextOptionsStore,
  t: TTranslation,
  {
    formActions,
    templateGallery,
    createNewFolder,
  }: {
    formActions: TContextOption[];
    templateGallery: TContextOption[];
    createNewFolder: TContextOption;
  },
) => {
  const uploadReadyPDFFrom: TContextOption = {
    id: "personal_upload-ready-Pdf-from",
    className: "main-button_drop-down_sub",
    icon: ActionsUploadReactSvgUrl,
    label: t("Common:UploadPDFForm"),
    key: "personal_upload-ready-Pdf-from",
    items: [
      {
        id: "personal_upload-from-docspace",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("Common:FromPortal"),
        key: "personal_upload-from-docspace",
        onClick: () => self.onShowFormRoomSelectFileDialog(FilterType.PDFForm),
      },
      {
        id: "personal_upload-from-device",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("Common:FromDevice"),
        key: "personal_upload-from-device",
        onClick: () => onUploadAction("pdf"),
      },
    ],
  };

  return [
    ...formActions,
    createNewFolder,
    ...templateGallery,
    {
      isSeparator: true,
      key: "separator-1",
    },
    uploadReadyPDFFrom,
  ];
};

export const getFolderModelImpl = (
  self: ContextOptionsStore,
  t: TTranslation,
  isSectionMenu?: boolean,
) => {
  const { isLoading } = self.clientLoadingStore;
  const { security, roomType, parentRoomType, isFolder, isAIRoom } =
    self.selectedFolderStore;
  const { isPublicRoom } = self.publicRoomStore;

  // Window["DocSpace"]["location"]["state"] is declared as
  // `unknown` in shared types — the cast mirrors the original .js access.
  const stateCanCreate = (
    window?.DocSpace?.location?.state as { canCreate?: boolean } | undefined
  )?.canCreate;
  const isSettingsPage =
    window?.DocSpace?.location.pathname.includes("/settings");

  const currentCanCreate =
    isLoading && hasOwnProperty(window?.DocSpace?.location?.state, "canCreate")
      ? stateCanCreate
      : security?.Create;

  const canCreate = currentCanCreate && !isSettingsPage && !isPublicRoom;

  const someDialogIsOpen = checkDialogsOpen();

  if (!canCreate || (isSectionMenu && (isMobile || someDialogIsOpen)))
    return null;

  const {
    isRoomsFolder,
    isPrivacyFolder,
    isFlowsFolder,
    isAIAgentsFolder,
    isFormsFolder,
  } = self.treeFoldersStore;
  const { mainButtonItemsList } = self.pluginStore;
  const { enablePlugins, templateGalleryAvailable } = self.settingsStore;
  const isFormRoomType =
    roomType === RoomsType.FormRoom ||
    (parentRoomType === FolderType.FormRoom && isFolder);

  const createNewDoc: TContextOption = {
    id: "personal_new-document",
    key: "new-document",
    label: t("Common:NewDocument"),
    onClick: () => self.onCreate("docx"),
    icon: ActionsDocumentsReactSvgUrl,
  };

  const createNewSpreadsheet = {
    id: "personal_new-spreadsheet",
    key: "new-spreadsheet",
    label: t("Common:NewSpreadsheet"),
    onClick: () => self.onCreate("xlsx"),
    icon: SpreadsheetReactSvgUrl,
  };

  const createNewPresentation = {
    id: "personal_new-presentation",
    key: "new-presentation",
    label: t("Common:NewPresentation"),
    onClick: () => self.onCreate("pptx"),
    icon: ActionsPresentationReactSvgUrl,
  };

  const createTemplateForm = {
    id: "personal_template_black",
    key: "new-form",
    label: t("Translations:SubNewForm"),
    icon: FormBlankReactSvgUrl,
    onClick: () => self.onCreate("pdf", t),
  };

  const createTemplateNewFormFile = {
    id: "personal_template_new-form-file",
    key: "new-form-file",
    label: t("Translations:SubNewFormFile"),
    icon: FormFileReactSvgUrl,
    onClick: () => self.onCreateFormFromFile(t),
    disabled: isPrivacyFolder,
  };

  // const createTemplateSelectFormFile = {
  //   id: "personal_template_new-form-file",
  //   key: "new-form-file",
  //   label: t("Translations:SubNewFormFile"),
  //   icon: FormFileReactSvgUrl,
  //   onClick: () => self.onCreateFormFromFile(t),
  //   disabled: isPrivacyFolder,
  // };

  const createNewFolder: TContextOption = {
    id: "personal_new-folder",
    key: "new-folder",
    label: t("Common:NewFolder"),
    onClick: () => self.onCreate(),
    icon: CatalogFolderReactSvgUrl,
  };

  const uploadFiles = {
    key: "upload-files",
    label: t("Common:UploadFiles"),
    onClick: () => onUploadAction("file"),
    icon: ActionsUploadReactSvgUrl,
  };

  const uploadFolder = {
    key: "upload-folder",
    label: t("Common:UploadFolder"),
    onClick: () => onUploadAction("folder"),
    icon: ActionsUploadReactSvgUrl,
  };

  const templateGallery: TContextOption[] = templateGalleryAvailable
    ? [
        { key: "separator", isSeparator: true },
        {
          key: "template-gallery",
          label: t("Common:TemplateGallery"),
          onClick: () => self.onShowTemplateGallery(),
          icon: TemplateGalleryReactSvgUrl,
        },
      ]
    : [];

  const formActions = [
    {
      id: "personal_form-template",
      icon: FormReactSvgUrl,
      label: t("Translations:NewForm"),
      key: "new-form-base",
      items: [createTemplateForm, createTemplateNewFormFile],
    },
  ];

  if (isFormRoomType) {
    return self.getContextOptionsPlusFormRoom(t, {
      formActions,
      templateGallery,
      createNewFolder,
    });
  }

  if (isAIRoom) {
    // The upload options below feed the agent's knowledge base, so they
    // belong to the Knowledge tab only. Result Storage holds AI-generated
    // results — manual uploads there are rejected by the server, and the
    // "+ New" button rendered from this model only produced an error
    // (Bug 83436). Coerced comparison: a filter parsed from the URL keeps
    // searchArea as the raw query string ("6"), not a number.
    const searchArea = self.filesStore.filter?.searchArea;
    if (searchArea != null && Number(searchArea) === SearchArea.ResultStorage) {
      return null;
    }
    return [
      {
        id: "actions_upload-files-product",
        className: "main-button_drop-down",
        icon: MoveReactSvgUrl,
        label: t("EmptyView:UploadFromPortalTitle"),
        onClick: self.onShowAiKnowledgeSelectFileDialog,
        key: "upload-files-product",
      },
      {
        id: "actions_upload-files",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("EmptyView:UploadDeviceOptionTitle"),
        onClick: () => onUploadAction("file"),
        key: "upload-files",
      },
    ];
  }

  const showUploadFolder = !(isMobile || isTablet);

  const canCreateEncrypted = self.uploadDataStore.shouldEncryptCurrentUpload();

  const createNewPdfForm: TContextOption = {
    id: "personal_new-pdf-form",
    key: "new-pdf-form",
    label: t("Translations:NewForm"),
    icon: FormReactSvgUrl,
    onClick: () => self.onCreate("pdf", t),
  };

  const privateFolderActions = [
    ...(canCreateEncrypted
      ? [
          createNewDoc,
          createNewSpreadsheet,
          createNewPresentation,
          createNewPdfForm,
        ]
      : []),
    createNewFolder,
    { key: "separator", isSeparator: true },
    uploadFiles,
  ];

  const options: (TContextOption | null)[] = isAIAgentsFolder
    ? [
        {
          key: "new-agent",
          label: t("Common:NewAgent"),
          onClick: self.onCreateAgent,
          icon: CatalogAIAgentsReactSvgUrl,
        },
      ]
    : isFormsFolder
      ? [
          {
            key: "create-form-set",
            label: t("Common:CreateFormSet"),
            onClick: self.onCreateRoom,
            icon: CatalogRoomsReactSvgUrl,
          },
          {
            key: "template-gallery",
            label: t("Common:TemplateGallery"),
            onClick: () => self.onShowTemplateGallery(),
            icon: TemplateGalleryReactSvgUrl,
          },
        ]
      : isRoomsFolder
        ? isFlowsFolder
          ? []
          : [
              {
                key: "new-room",
                label: t("Common:NewRoom"),
                onClick: self.onCreateRoom,
                icon: CatalogRoomsReactSvgUrl,
              },
            ]
        : isPrivacyFolder
          ? privateFolderActions
          : [
              createNewDoc,
              createNewSpreadsheet,
              createNewPresentation,
              ...formActions,
              createNewFolder,
              ...templateGallery,
              { key: "separator", isSeparator: true },
              uploadFiles,
              showUploadFolder ? uploadFolder : null,
            ];
  if (
    !isAIAgents() &&
    mainButtonItemsList &&
    enablePlugins &&
    !isRoomsFolder &&
    !isFormsFolder &&
    !isPrivacyFolder
  ) {
    const pluginItems: TContextOption[] = [];

    mainButtonItemsList.forEach((option) => {
      // identical to the original `{ key, ...value }` spread
      // (value.key wins) — Object.assign avoids TS2783 on the literal.
      pluginItems.push(
        Object.assign({ key: option.key }, option.value) as TContextOption,
      );
    });

    options.splice(5, 0, {
      id: "actions_more-plugins",
      className: "main-button_drop-down",
      icon: PluginMoreReactSvgUrl,
      label: t("Common:More"),
      disabled: false,
      key: "more-plugins",
      items: pluginItems,
    });
  }

  return options;
};

