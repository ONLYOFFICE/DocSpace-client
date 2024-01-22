import authStore from "@docspace/common/store/AuthStore";
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
import SettingsStore from "./SettingsStore";
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

const selectedFolderStore = new SelectedFolderStore(authStore.settingsStore);

const pluginStore = new PluginStore(authStore, selectedFolderStore);

const paymentStore = new PaymentStore();
const wizardStore = new WizardStore();
const setupStore = new SettingsSetupStore();
const confirmStore = new ConfirmStore();
const backupStore = new BackupStore();
const commonStore = new CommonStore();

const ssoStore = new SsoFormStore();

const tagsStore = new TagsStore();

const publicRoomStore = new PublicRoomStore();

const infoPanelStore = new InfoPanelStore();

const treeFoldersStore = new TreeFoldersStore(
  selectedFolderStore,
  authStore,
  publicRoomStore
);

const clientLoadingStore = new ClientLoadingStore();

const settingsStore = new SettingsStore(
  thirdPartyStore,
  treeFoldersStore,
  publicRoomStore,
  pluginStore,
  authStore
);

const accessRightsStore = new AccessRightsStore(authStore, selectedFolderStore);

const filesStore = new FilesStore(
  authStore,
  selectedFolderStore,
  treeFoldersStore,
  settingsStore,
  thirdPartyStore,
  accessRightsStore,
  clientLoadingStore,
  pluginStore,
  publicRoomStore,
  infoPanelStore
);

const mediaViewerDataStore = new MediaViewerDataStore(
  filesStore,
  settingsStore,
  publicRoomStore
);

const oformsStore = new OformsStore(authStore);

const secondaryProgressDataStore = new SecondaryProgressDataStore();
const primaryProgressDataStore = new PrimaryProgressDataStore();
const versionHistoryStore = new VersionHistoryStore(filesStore);

const dialogsStore = new DialogsStore(
  authStore,
  treeFoldersStore,
  filesStore,
  selectedFolderStore,
  versionHistoryStore,
  infoPanelStore
);

const peopleStore = new PeopleStore(
  authStore,
  setupStore,
  accessRightsStore,
  dialogsStore,
  infoPanelStore
);

const uploadDataStore = new UploadDataStore(
  authStore,
  treeFoldersStore,
  selectedFolderStore,
  filesStore,
  secondaryProgressDataStore,
  primaryProgressDataStore,
  dialogsStore,
  settingsStore
);

const filesActionsStore = new FilesActionsStore(
  authStore,
  uploadDataStore,
  treeFoldersStore,
  filesStore,
  selectedFolderStore,
  settingsStore,
  dialogsStore,
  mediaViewerDataStore,
  accessRightsStore,
  clientLoadingStore,
  publicRoomStore,
  pluginStore,
  infoPanelStore
);

const contextOptionsStore = new ContextOptionsStore(
  authStore,
  dialogsStore,
  filesActionsStore,
  filesStore,
  mediaViewerDataStore,
  treeFoldersStore,
  uploadDataStore,
  versionHistoryStore,
  settingsStore,
  selectedFolderStore,
  publicRoomStore,
  oformsStore,
  pluginStore,
  infoPanelStore
);

const hotkeyStore = new HotkeyStore(
  filesStore,
  dialogsStore,
  settingsStore,
  filesActionsStore,
  treeFoldersStore,
  uploadDataStore,
  selectedFolderStore
);

const profileActionsStore = new ProfileActionsStore(
  authStore,
  filesStore,
  peopleStore,
  treeFoldersStore,
  selectedFolderStore,
  pluginStore
);

peopleStore.profileActionsStore = profileActionsStore;

const tableStore = new TableStore(authStore, treeFoldersStore);

infoPanelStore.authStore = authStore;
infoPanelStore.settingsStore = settingsStore;
infoPanelStore.filesStore = filesStore;
infoPanelStore.peopleStore = peopleStore;
infoPanelStore.selectedFolderStore = selectedFolderStore;
infoPanelStore.treeFoldersStore = treeFoldersStore;

const createEditRoomStore = new CreateEditRoomStore(
  filesStore,
  filesActionsStore,
  selectedFolderStore,
  tagsStore,
  thirdPartyStore,
  authStore.settingsStore,
  infoPanelStore,
  authStore.currentQuotaStore,
  clientLoadingStore
);

const webhooksStore = new WebhooksStore(authStore);

const store = {
  auth: authStore,
  payments: paymentStore,
  wizard: wizardStore,
  setup: setupStore,
  confirm: confirmStore,
  backup: backupStore,
  common: commonStore,
  infoPanelStore,
  ssoStore,
  profileActionsStore,

  filesStore,

  settingsStore,
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
