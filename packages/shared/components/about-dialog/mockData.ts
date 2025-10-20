// (c) Copyright Ascensio System SIA 2009-2025
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

import { TCompanyInfo } from "../../api/settings/types";
import { IBuildInfo } from "./About.types";

export const mockBuildInfo: IBuildInfo = {
  docSpace: "4.2.0",
  communityServer: "10.5.0",
  documentServer: "7.3.0",
};

export const mockCompanyInfo: TCompanyInfo = {
  companyName: "Company Name",
  email: "info@example.com",
  phone: "+1 (123) 456-7890",
  site: "https://www.example.com",
  address: "123 Main Street, Anytown, USA",
  hideAbout: false,
  isLicensor: true,
  isDefault: false,
};

export const mockPreviewCompanyInfo: TCompanyInfo = {
  companyName: "Preview Company",
  email: "preview@example.com",
  phone: "+1 (800) 555-1234",
  site: "https://www.preview.com",
  address: "456 Preview Ave, Preview City, USA",
  hideAbout: false,
  isLicensor: false,
  isDefault: true,
};

export const mockDefaultProps = {
  visible: true,
  onClose: () => {},
  buildVersionInfo: mockBuildInfo,
  previewData: mockCompanyInfo,
  companyInfoSettingsData: mockCompanyInfo,
  standalone: false,
  licenseAgreementsUrl: "https://www.example.com/license-agreements",
  isEnterprise: true,
  logoText: "Company Name",
};
