import { makeAutoObservable } from "mobx";
import { getLogoFromPath } from "@docspace/shared/utils";
import {
  getDomainName,
  setDomainName,
  setPortalName,
  createNewPortal,
  checkDomain,
} from "@docspace/shared/api/management";
import { TNewPortalData } from "SRC_DIR/types/spaces";

class SpacesStore {
  settingsStore = null;

  createPortalDialogVisible = false;
  deletePortalDialogVisible = false;
  domainDialogVisible = false;
  spaceCreatedDialogVisible = false;

  referenceLink: URL | string = "";

  currentPortal = false;

  constructor(settingsStore) {
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  getPortalDomain = async () => {
    const res = await getDomainName();
    const { settings } = res;

    this.settingsStore.setPortalDomain(settings);
  };

  get isConnected() {
    return (
      this.settingsStore.baseDomain &&
      this.settingsStore.baseDomain !== "localhost" &&
      this.settingsStore.tenantAlias &&
      this.settingsStore.tenantAlias !== "localhost"
    );
  }

  get faviconLogo() {
    const logos = this.settingsStore.whiteLabelLogoUrls;
    if (!logos) return;

    return getLogoFromPath(logos[2]?.path?.light);
  }

  setPortalName = async (portalName: string) => {
    try {
      const res = await setPortalName(portalName);
      this.settingsStore.setTenantAlias(portalName);
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  setDomainName = async (domain: string) => {
    try {
      const res = await setDomainName(domain);
      const { settings } = res;
      this.settingsStore.setPortalDomain(settings);
    } catch (error) {
      console.log(error);
    }
  };

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
  };

  setReferenceLink = (link: URL | string) => {
    this.referenceLink = link;
  };

  setCreatePortalDialogVisible = (createPortalDialogVisible: boolean) => {
    this.createPortalDialogVisible = createPortalDialogVisible;
  };

  setChangeDomainDialogVisible = (domainDialogVisible: boolean) => {
    this.domainDialogVisible = domainDialogVisible;
  };

  setDeletePortalDialogVisible = (deletePortalDialogVisible: boolean) => {
    this.deletePortalDialogVisible = deletePortalDialogVisible;
  };
  setSpaceCreatedDialogVisible = (spaceCreatedDialogVisible: boolean) => {
    this.spaceCreatedDialogVisible = spaceCreatedDialogVisible;
  };
}

export default SpacesStore;
