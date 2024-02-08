import { makeAutoObservable } from "mobx";

import {
  getMachineName,
  getIsLicenseRequired,
  setLicense,
} from "@docspace/shared/api/settings";

class WizardStore {
  isWizardLoaded = false;

  isLicenseRequired = false;

  machineName = "unknown";

  licenseUpload: null | string = null;

  constructor() {
    makeAutoObservable(this);
  }

  setIsWizardLoaded = (isWizardLoaded: boolean) => {
    this.isWizardLoaded = isWizardLoaded;
  };

  setMachineName = (machineName: string) => {
    this.machineName = machineName;
  };

  setIsRequiredLicense = (isRequired: boolean) => {
    this.isLicenseRequired = isRequired;
  };

  setLicenseUpload = (message: null | string) => {
    this.licenseUpload = message;
  };

  resetLicenseUploaded = () => {
    this.setLicenseUpload(null);
  };

  getMachineName = async (token: string) => {
    const machineName = await getMachineName(token);
    this.machineName = machineName;
  };

  getIsRequiredLicense = async () => {
    const isRequired = await getIsLicenseRequired();

    this.setIsRequiredLicense(isRequired);
  };

  setLicense = async (confirmKey: string, data: FormData) => {
    const message = await setLicense(confirmKey, data);

    this.setLicenseUpload(message);
  };
}

export default WizardStore;
