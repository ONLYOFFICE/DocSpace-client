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

import { makeAutoObservable } from "mobx";
import {
  getDomainName,
  setDomainName,
  setPortalName,
  createNewPortal,
  checkDomain,
} from "@docspace/shared/api/management";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TNewPortalData, TPortals } from "SRC_DIR/types/spaces";

class SpacesStore {
  settingsStore: SettingsStore;

  createPortalDialogVisible = false;
  deletePortalDialogVisible = false;
  domainDialogVisible = false;

  currentPortal: TPortals | null = null;

  constructor(settingsStore: SettingsStore) {
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

  checkDomain = async (domain: string) => {
    const res = await checkDomain(domain);
    return res;
  };

  createNewPortal = async (data: TNewPortalData) => {
    const register = await createNewPortal(data);
    return register;
  };

  setCurrentPortal = (portal: TPortals) => {
    this.currentPortal = portal;
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
}

export default SpacesStore;
