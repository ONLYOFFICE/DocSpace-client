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
import { getOperationsProgressTitle } from "SRC_DIR/helpers/filesUtils";

class PrimaryProgressDataStore {
  percent = 0;
  label = "";
  visible = false;
  icon = "upload";
  alert = false;
  loadingFile = null;
  errors = 0;
  disableUploadPanelOpen = false;

  conversionProgress = {
    percent: 0,
    label: "Convert",
    visible: false,
    icon: "convert",
    alert: false,
    errors: 0,
  };

  uploadProgress = {
    percent: 0,
    label: "Upload",
    visible: false,
    icon: "upload",
    alert: false,
    errors: 0,
  };

  constructor() {
    makeAutoObservable(this);
  }

  get primaryActiveOperations() {
    const primaryOperations = [this.conversionProgress, this.uploadProgress];

    return primaryOperations.filter((item) => item.visible);
  }

  get isFinishedActiveOperations() {
    return this.primaryActiveOperations.every(
      (item) => item.percent === 100 || item.percent > 100,
    );
  }
  setConversionProgress = (primaryProgressData) => {
    const progressDataItems = Object.keys(primaryProgressData);
    for (let key of progressDataItems) {
      this.conversionProgress[key] = primaryProgressData[key];
    }
  };

  setUploadProgress = (primaryProgressData) => {
    const progressDataItems = Object.keys(primaryProgressData);
    for (let key of progressDataItems) {
      this.uploadProgress[key] = primaryProgressData[key];
    }
  };

  clearConversionProgress = () => {
    this.conversionProgress = {
      visible: false,
      percent: 0,
      icon: "",
      alert: false,
      errors: 0,
      disableUploadPanelOpen: false,
    };
  };

  clearUploadProgress = () => {
    this.uploadProgress = {
      ...this.uploadProgress,
      visible: false,
      percent: 0,
      alert: false,
      errors: 0,
      disableUploadPanelOpen: false,
    };
  };

  clearPrimaryProgressData = () => {
    this.setPrimaryProgressBarData({
      visible: false,
      percent: 0,
      label: "",
      icon: "",
      alert: false,
      errors: 0,
      disableUploadPanelOpen: false,
    });
  };

  setPrimaryProgressBarShowError = (error) => {
    this.alert = error;
  };

  setPrimaryProgressBarErrors = (errors) => {
    this.errors = errors;
  };
}

export default PrimaryProgressDataStore;
