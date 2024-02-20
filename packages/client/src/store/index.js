import {
  authStore,
  userStore,
  tfaStore,
  bannerStore,
  currentTariffStatusStore,
  currentQuotaStore,
  paymentQuotasStore,
  settingsStore,
} from "@docspace/shared/store";

import PaymentStore from "./PaymentStore";
import WizardStore from "./WizardStore";
import SettingsSetupStore from "./SettingsSetupStore";
import ConfirmStore from "./ConfirmStore";
import BackupStore from "./BackupStore";
import CommonStore from "./CommonStore";

import ProfileActionsStore from "./ProfileActionsStore";
import SsoFormStore from "./SsoFormStore";

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
import PeopleStore from "./PeopleStore";
import OformsStore from "./OformsStore";

import AccessRightsStore from "./AccessRightsStore";
import TableStore from "./TableStore";
import CreateEditRoomStore from "./CreateEditRoomStore";
import PublicRoomStore from "./PublicRoomStore";

import WebhooksStore from "./WebhooksStore";
import ClientLoadingStore from "./ClientLoadingStore";

import PluginStore from "./PluginStore";
import InfoPanelStore from "./InfoPanelStore";

const selectedFolderStore = new SelectedFolderStore(settingsStore);

const pluginStore = new PluginStore(
  settingsStore,
  selectedFolderStore,
  userStore,
);

const paymentStore = new PaymentStore(
  userStore,
  currentTariffStatusStore,
  currentQuotaStore,
  paymentQuotasStore,
);
const wizardStore = new WizardStore();
const setupStore = new SettingsSetupStore(tfaStore, authStore, settingsStore);
const confirmStore = new ConfirmStore();
const backupStore = new BackupStore();
const commonStore = new CommonStore(settingsStore);

const ssoStore = new SsoFormStore();

const tagsStore = new TagsStore();

const publicRoomStore = new PublicRoomStore();

const infoPanelStore = new InfoPanelStore(userStore);

const treeFoldersStore = new TreeFoldersStore(
  selectedFolderStore,
  settingsStore,
  publicRoomStore,
);

const clientLoadingStore = new ClientLoadingStore();

const filesSettingsStore = new FilesSettingsStore(
  thirdPartyStore,
  treeFoldersStore,
  publicRoomStore,
  pluginStore,
  authStore,
  settingsStore,
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
  infoPanelStore,
  userStore,
  currentTariffStatusStore,
  settingsStore,
);

const mediaViewerDataStore = new MediaViewerDataStore(
  filesStore,
  publicRoomStore,
);

const oformsStore = new OformsStore(settingsStore, infoPanelStore, userStore);

const secondaryProgressDataStore = new SecondaryProgressDataStore();
const primaryProgressDataStore = new PrimaryProgressDataStore();
const versionHistoryStore = new VersionHistoryStore(filesStore, settingsStore);

const dialogsStore = new DialogsStore(
  authStore,
  treeFoldersStore,
  filesStore,
  selectedFolderStore,
  versionHistoryStore,
  infoPanelStore,
);

const peopleStore = new PeopleStore(
  authStore,
  setupStore,
  accessRightsStore,
  dialogsStore,
  infoPanelStore,
  userStore,
  tfaStore,
  settingsStore,
  clientLoadingStore,
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
  infoPanelStore,
  userStore,
  currentTariffStatusStore,
  peopleStore,
);

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
  userStore,
);

const hotkeyStore = new HotkeyStore(
  filesStore,
  dialogsStore,
  filesSettingsStore,
  filesActionsStore,
  treeFoldersStore,
  uploadDataStore,
  selectedFolderStore,
);

const profileActionsStore = new ProfileActionsStore(
  authStore,
  filesStore,
  peopleStore,
  treeFoldersStore,
  selectedFolderStore,
  pluginStore,
  userStore,
  settingsStore,
);

peopleStore.profileActionsStore = profileActionsStore;

const tableStore = new TableStore(
  authStore,
  treeFoldersStore,
  userStore,
  settingsStore,
);

infoPanelStore.filesSettingsStore = filesSettingsStore;
infoPanelStore.filesStore = filesStore;
infoPanelStore.peopleStore = peopleStore;
infoPanelStore.selectedFolderStore = selectedFolderStore;
infoPanelStore.treeFoldersStore = treeFoldersStore;
infoPanelStore.publicRoomStore = publicRoomStore;

const createEditRoomStore = new CreateEditRoomStore(
  filesStore,
  filesActionsStore,
  selectedFolderStore,
  tagsStore,
  thirdPartyStore,
  settingsStore,
  infoPanelStore,
  currentQuotaStore,
  clientLoadingStore,
);

const webhooksStore = new WebhooksStore(settingsStore);

const store = {
  authStore,
  userStore,
  tfaStore,
  bannerStore,
  currentTariffStatusStore,
  currentQuotaStore,
  paymentQuotasStore,
  settingsStore,

  paymentStore,
  wizardStore,
  setup: setupStore,
  confirm: confirmStore,
  backup: backupStore,
  common: commonStore,
  infoPanelStore,
  ssoStore,
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
  clientLoadingStore,
  publicRoomStore,

  pluginStore,
};

export default store;
