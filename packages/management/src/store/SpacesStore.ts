import { makeAutoObservable } from "mobx";
import { getLogoFromPath } from "@docspace/common/utils";
import {
  deletePortal,
  getDomainName,
  setDomainName,
  setPortalName,
  createNewPortal,
  checkDomain,
} from "@docspace/common/api/management";
import { TNewPortalData } from "SRC_DIR/types/spaces";

class SpacesStore {
  authStore = null;

  createPortalDialogVisible = false;
  deletePortalDialogVisible = false;
  domainDialogVisible = false;
  currentPortal = false;

  constructor(authStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }

  getPortalDomain = async () => {
    const res = await getDomainName();
    const { settings } = res;

    this.authStore.settingsStore.setPortalDomain(settings);
  };

  get isConnected() {
    return (
      this.authStore.settingsStore.baseDomain &&
      this.authStore.settingsStore.baseDomain !== "localhost"
    );
  }

  get faviconLogo() {
    const logos = this.authStore.settingsStore.whiteLabelLogoUrls;
    if (!logos) return;

    return getLogoFromPath(logos[2]?.path?.light);
  }

  setPortalName = async (portalName: string) => {
    const res = await setPortalName(portalName);
    return res;
  }

  setDomainName = async (domain: string) => {
    const res = await setDomainName(domain);
    const { settings } = res;
    this.authStore.settingsStore.setPortalDomain(settings);
  }

  checkDomain = async (domain) => {
    const res = await checkDomain(domain);
    return res;
  };

  createNewPortal = async (data: TNewPortalData) => {
    const register = await createNewPortal(data);
    return register;
  };

  setCurrentPortal = (portal) => {
    this.currentPortal = portal;
  }

  setCreatePortalDialogVisible = (createPortalDialogVisible: boolean) => {
    this.createPortalDialogVisible = createPortalDialogVisible;
  };

  setChangeDomainDialogVisible = (domainDialogVisible: boolean) => {
    this.domainDialogVisible = domainDialogVisible;
  };

  setDeletePortalDialogVisible = (deletePortalDialogVisible: boolean) => {
    this.deletePortalDialogVisible = deletePortalDialogVisible;
  };
}

export default SpacesStore;
