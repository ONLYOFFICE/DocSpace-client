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

import {
  authStore,
  userStore,
  tfaStore,
  currentTariffStatusStore,
  currentQuotaStore,
  settingsStore,
} from "@docspace/shared/store";

import PaymentStore from "./PaymentStore";
import ServicesStore from "./ServicesStore";
import StorageManagement from "./StorageManagement";
import WizardStore from "./WizardStore";
import SettingsSetupStore from "./SettingsSetupStore";
import ConfirmStore from "./ConfirmStore";
import BackupStore from "./BackupStore";
import CommonStore from "./CommonStore";
import GuidanceStore from "./GuidanceStore";

import ProfileActionsStore from "./ProfileActionsStore";
import SsoFormStore from "./SsoFormStore";
import LdapFormStore from "./LdapFormStore";

import FilesStore from "./FilesStore";
import SelectedFolderStore from "./SelectedFolderStore";
import TreeFoldersStore from "./TreeFoldersStore";
import thirdPartyStore from "./ThirdPartyStore";
import FilesSettingsStore from "./FilesSettingsStore";
import FilesActionsStore from "./FilesActionsStore";
import MediaViewerDataStore from "./MediaViewerDataStore";
import UploadDataStore from "./UploadDataStore";
import SecondaryProgressDataStore from "./SecondaryProgressDataStore";
import PrimaryProgressDataStore from "./PrimaryProgressDataStore";

import VersionHistoryStore from "./VersionHistoryStore";
import DialogsStore from "./DialogsStore";
import filesSelectorInput from "./FilesSelectorInput";
import ContextOptionsStore from "./ContextOptionsStore";
import HotkeyStore from "./HotkeyStore";

import TagsStore from "./TagsStore";
import PeopleStore from "./contacts/PeopleStore";
import OformsStore from "./OformsStore";

import AccessRightsStore from "./AccessRightsStore";
import TableStore from "./TableStore";
import CreateEditRoomStore from "./CreateEditRoomStore";
import PublicRoomStore from "./PublicRoomStore";

import WebhooksStore from "./WebhooksStore";
import ClientLoadingStore from "./ClientLoadingStore";
import ImportAccountsStore from "./ImportAccountsStore";

import PluginStore from "./PluginStore";
import InfoPanelStore from "./InfoPanelStore";
import CampaignsStore from "./CampaignsStore";
import IndexingStore from "./IndexingStore";
import EditGroupStore from "./contacts/EditGroupStore";

import AvatarEditorDialogStore from "./AvatarEditorDialogStore";

import OAuthStore from "./OAuthStore";
import AiRoomStore from "./AiRoomStore";

import BrandingStore from "./portal-settings/BrandingStore";
import AISettingsStore from "./portal-settings/AISettingsStore";
import CreateEditAgentStore from "./CreateEditAgentStore";

import DefaultTemplatesStore from "./portal-settings/DefaultTemplatesStore";

import TelegramStore from "./TelegramStore";

const aiRoomStore = new AiRoomStore();

const selectedFolderStore = new SelectedFolderStore(settingsStore);

const pluginStore = new PluginStore(
  settingsStore,
  selectedFolderStore,
  userStore,
  currentTariffStatusStore,
);

const paymentStore = new PaymentStore(
  userStore,
  currentTariffStatusStore,
  currentQuotaStore,
);
const servicesStore = new ServicesStore(currentTariffStatusStore, paymentStore);

const wizardStore = new WizardStore();
const confirmStore = new ConfirmStore();
const backupStore = new BackupStore(
  authStore,
  thirdPartyStore,
  currentQuotaStore,
  currentTariffStatusStore,
  settingsStore,
  paymentStore,
);
const commonStore = new CommonStore(settingsStore);

const ssoStore = new SsoFormStore(settingsStore);
const ldapStore = new LdapFormStore(currentQuotaStore, settingsStore);

const tagsStore = new TagsStore();

const clientLoadingStore = new ClientLoadingStore(settingsStore);
const publicRoomStore = new PublicRoomStore(clientLoadingStore);

const infoPanelStore = new InfoPanelStore(userStore);
const indexingStore = new IndexingStore(selectedFolderStore);

const treeFoldersStore = new TreeFoldersStore(
  selectedFolderStore,
  settingsStore,
  publicRoomStore,
);

const filesSettingsStore = new FilesSettingsStore(
  thirdPartyStore,
  treeFoldersStore,
  publicRoomStore,
  pluginStore,
  authStore,
  settingsStore,
);

const setupStore = new SettingsSetupStore(
  tfaStore,
  authStore,
  settingsStore,
  thirdPartyStore,
  filesSettingsStore,
);

const accessRightsStore = new AccessRightsStore(
  authStore,
  selectedFolderStore,
  userStore,
);

const filesStore = new FilesStore(
  authStore,
  selectedFolderStore,
  treeFoldersStore,
  filesSettingsStore,
  thirdPartyStore,
  accessRightsStore,
  clientLoadingStore,
  pluginStore,
  publicRoomStore,
  userStore,
  currentTariffStatusStore,
  settingsStore,
  indexingStore,
  aiRoomStore,
);

const guidanceStore = new GuidanceStore();

publicRoomStore.filesStore = filesStore;

const mediaViewerDataStore = new MediaViewerDataStore(
  filesStore,
  publicRoomStore,
  selectedFolderStore,
  pluginStore,
);

const oformsStore = new OformsStore(settingsStore, userStore, treeFoldersStore);

const secondaryProgressDataStore = new SecondaryProgressDataStore(
  treeFoldersStore,
  mediaViewerDataStore,
);
const primaryProgressDataStore = new PrimaryProgressDataStore(
  filesStore,
  selectedFolderStore,
);
const versionHistoryStore = new VersionHistoryStore(filesStore, settingsStore);

const dialogsStore = new DialogsStore(
  authStore,
  treeFoldersStore,
  filesStore,
  selectedFolderStore,
  versionHistoryStore,
  infoPanelStore,
);

filesStore.dialogsStore = dialogsStore;

const profileActionsStore = new ProfileActionsStore(
  authStore,
  filesStore,
  treeFoldersStore,
  selectedFolderStore,
  pluginStore,
  userStore,
  settingsStore,
  currentTariffStatusStore,
  infoPanelStore,
  clientLoadingStore,
);

const peopleStore = new PeopleStore(
  accessRightsStore,
  userStore,
  tfaStore,
  settingsStore,
  clientLoadingStore,
  profileActionsStore,
  dialogsStore,
  currentQuotaStore,
  treeFoldersStore,
  setupStore,
  filesStore,
  selectedFolderStore,
);

const uploadDataStore = new UploadDataStore(
  settingsStore,
  treeFoldersStore,
  selectedFolderStore,
  filesStore,
  secondaryProgressDataStore,
  primaryProgressDataStore,
  dialogsStore,
  filesSettingsStore,
  aiRoomStore,
);

const filesActionsStore = new FilesActionsStore(
  settingsStore,
  uploadDataStore,
  treeFoldersStore,
  filesStore,
  selectedFolderStore,
  filesSettingsStore,
  dialogsStore,
  mediaViewerDataStore,
  accessRightsStore,
  clientLoadingStore,
  publicRoomStore,
  pluginStore,
  userStore,
  currentTariffStatusStore,
  peopleStore,
  currentQuotaStore,
  indexingStore,
  versionHistoryStore,
  aiRoomStore,
);

mediaViewerDataStore.filesActionsStore = filesActionsStore;
secondaryProgressDataStore.filesActionsStore = filesActionsStore;
versionHistoryStore.filesActionsStore = filesActionsStore;

const contextOptionsStore = new ContextOptionsStore(
  settingsStore,
  dialogsStore,
  filesActionsStore,
  filesStore,
  mediaViewerDataStore,
  treeFoldersStore,
  uploadDataStore,
  versionHistoryStore,
  filesSettingsStore,
  selectedFolderStore,
  publicRoomStore,
  oformsStore,
  pluginStore,
  infoPanelStore,
  currentTariffStatusStore,
  currentQuotaStore,
  userStore,
  indexingStore,
  clientLoadingStore,
  guidanceStore,
);

const hotkeyStore = new HotkeyStore(
  filesStore,
  dialogsStore,
  filesSettingsStore,
  filesActionsStore,
  treeFoldersStore,
  uploadDataStore,
  selectedFolderStore,
  indexingStore,
);

const tableStore = new TableStore(
  authStore,
  treeFoldersStore,
  userStore,
  settingsStore,
  indexingStore,
  selectedFolderStore,
  peopleStore,
);

infoPanelStore.selectedFolderStore = selectedFolderStore;
infoPanelStore.filesStore = filesStore;
infoPanelStore.filesSettingsStore = filesSettingsStore;
infoPanelStore.peopleStore = peopleStore;
infoPanelStore.treeFoldersStore = treeFoldersStore;

const avatarEditorDialogStore = new AvatarEditorDialogStore(
  filesStore,
  settingsStore,
);

const createEditRoomStore = new CreateEditRoomStore(
  filesStore,
  filesActionsStore,
  selectedFolderStore,
  tagsStore,
  thirdPartyStore,
  settingsStore,
  currentQuotaStore,
  clientLoadingStore,
  dialogsStore,
  avatarEditorDialogStore,
);

const createEditAgentStore = new CreateEditAgentStore(
  filesStore,
  filesActionsStore,
  selectedFolderStore,
  tagsStore,
  settingsStore,
  currentQuotaStore,
  clientLoadingStore,
  dialogsStore,
  avatarEditorDialogStore,
);

const webhooksStore = new WebhooksStore(settingsStore);
const importAccountsStore = new ImportAccountsStore(
  currentQuotaStore,
  settingsStore,
  dialogsStore,
);
const storageManagement = new StorageManagement(
  filesStore,
  peopleStore,
  authStore,
  currentQuotaStore,
  settingsStore,
);

const oauthStore = new OAuthStore(userStore, settingsStore);

const campaignsStore = new CampaignsStore(settingsStore, userStore);

const editGroupStore = new EditGroupStore(peopleStore);

const brandingStore = new BrandingStore(settingsStore);

const aiSettingsStore = new AISettingsStore(settingsStore);

const defaultTemplatesStore = new DefaultTemplatesStore();

const telegramStore = new TelegramStore();

const store = {
  authStore,
  userStore,
  tfaStore,
  currentTariffStatusStore,
  currentQuotaStore,
  settingsStore,

  paymentStore,
  servicesStore,
  wizardStore,
  setup: setupStore,
  confirm: confirmStore,
  backup: backupStore,
  common: commonStore,
  infoPanelStore,
  ssoStore,
  ldapStore,

  profileActionsStore,

  filesStore,

  filesSettingsStore,
  mediaViewerDataStore,
  versionHistoryStore,
  uploadDataStore,
  dialogsStore,
  treeFoldersStore,
  selectedFolderStore,
  filesActionsStore,
  filesSelectorInput,
  contextOptionsStore,
  hotkeyStore,

  oformsStore,
  tableStore,

  tagsStore,

  peopleStore,

  accessRightsStore,
  createEditRoomStore,

  webhooksStore,
  importAccountsStore,
  clientLoadingStore,
  publicRoomStore,

  oauthStore,
  pluginStore,
  storageManagement,
  campaignsStore,
  indexingStore,
  editGroupStore,
  avatarEditorDialogStore,
  thirdPartyStore,

  brandingStore,

  guidanceStore,

  aiRoomStore,
  aiSettingsStore,
  telegramStore,
  createEditAgentStore,
  defaultTemplatesStore,
};

export default store;
