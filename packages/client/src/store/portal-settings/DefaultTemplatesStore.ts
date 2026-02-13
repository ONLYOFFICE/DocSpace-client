import { editGroup } from "SRC_DIR/helpers/contacts";
// (c) Copyright Ascensio System SIA 2009-2026
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
  getDefaultTemplates,
  setDefaultTemplates,
  uploadTemplateFromDevice,
} from "@docspace/shared/api/files";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { TDefaultTemplateItem } from "@docspace/shared/types";
import { TDefaultTemplate } from "@docspace/shared/api/files/types";

import i18n from "SRC_DIR/i18n";

class DefaultTemplatesStore {
  templates: TDefaultTemplateItem[] | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  getFilterParam = (ext: string) => {
    switch (ext) {
      case ".docx":
        return FilesSelectorFilterTypes.DOCX;
      case ".xlsx":
        return FilesSelectorFilterTypes.XLSX;
      case ".pptx":
        return FilesSelectorFilterTypes.PPTX;
      case ".pdf":
        return FilesSelectorFilterTypes.PDFForm;
      default:
        return FilesSelectorFilterTypes.ALL;
    }
  };

  getTitleByExt = (ext: string) => {
    switch (ext) {
      case ".docx":
        return i18n.t("Settings:BlankDocument");
      case ".xlsx":
        return i18n.t("Settings:BlankSpreadsheet");
      case ".pptx":
        return i18n.t("Settings:BlankPresentation");
      case ".pdf":
        return i18n.t("Settings:BlankForm");
    }
  };

  formTemplatesArray = (templates: TDefaultTemplate[]) => {
    const templatesArr = templates.map((item) => ({
      id: item?.selectedFile || null,
      extension: item.fileExtension,
      isModified: !!item?.selectedFile,
      title: item?.fileTitle || this.getTitleByExt(item.fileExtension),
      lastModified: item?.lastModified,
      viewUrl: item?.viewUrl || "",
    }));
    this.templates = templatesArr;
  };

  getTemplates = async () => {
    try {
      const res = await getDefaultTemplates();
      this.formTemplatesArray(res);
    } catch (e) {
      toastr.error((e as TData) ?? i18n.t("Common:Error"));
    }
  };

  setTemplate = async (selectedFile: number | null, fileExtension: string) => {
    try {
      const res = await setDefaultTemplates(selectedFile, fileExtension);
      this.formTemplatesArray(res);
      toastr.success(i18n.t("Settings:DefaultTemplateApplied"));
    } catch (e) {
      toastr.error((e as TData) ?? i18n.t("Common:Error"));
    }
  };

  resetTemplate = async (fileExtension: string) => {
    try {
      const res = await setDefaultTemplates(null, fileExtension);
      this.formTemplatesArray(res);
      toastr.success(i18n.t("Settings:DefaultTemplateRestored"));
    } catch (e) {
      toastr.error((e as TData) ?? i18n.t("Common:Error"));
    }
  };

  uploadTemplate = async (
    event: React.ChangeEvent<HTMLInputElement>,
    extension: string,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadTemplateFromDevice(file, extension);
      this.formTemplatesArray(res);
      toastr.success(i18n.t("Settings:DefaultTemplateApplied"));
    } catch (e) {
      toastr.error((e as TData) ?? i18n.t("Common:Error"));
    } finally {
      event.target.value = "";
    }
  };
}

export default DefaultTemplatesStore;
