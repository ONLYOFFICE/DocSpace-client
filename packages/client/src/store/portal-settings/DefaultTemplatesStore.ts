import { editGroup } from "SRC_DIR/helpers/contacts";
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

import { makeAutoObservable } from "mobx";

import {
  getDefaultTemplates,
  setDefaultTemplates,
  resetDefaultTemplates,
  uploadTemplateFromDevice,
} from "@docspace/shared/api/files";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { TData } from "@docspace/ui-kit/components/toast";
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
      fileExst: item.fileExtension,
      isModified: !!item?.selectedFile,
      title: item?.fileTitle || this.getTitleByExt(item.fileExtension),
      lastModified: item?.lastModified,
      viewUrl: item?.viewUrl || "",
      fileSize: item?.fileSize || 0,
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
      const res = await resetDefaultTemplates(fileExtension);
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
