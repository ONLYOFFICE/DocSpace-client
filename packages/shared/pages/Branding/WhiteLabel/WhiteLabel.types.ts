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

export interface ILogoPath {
  light: string;
  dark: string;
}

export interface ILogoSize {
  width: number;
  height: number;
  isEmpty: boolean;
}

export interface ILogo {
  path: ILogoPath;
  size: ILogoSize;
  name: string;
  type: number;
}

export interface IWhiteLabelData {
  logoText: string;
  logo: Array<{
    key: string;
    value: Partial<ILogoPath>;
  }>;
}

export interface IHeaderProps {
  showNotAvailable: boolean;
  isSettingPaid: boolean;
  standalone: boolean;
  onUseTextAsLogo: () => void;
  isEmpty: boolean;
  logoTextWhiteLabel: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}
export interface IWhiteLabel {
  isSettingPaid: boolean;
  showNotAvailable: boolean;
  standalone: boolean;
  logoUrls: ILogo[];
  showAbout: boolean;
  onSave: (data: IWhiteLabelData) => void;
  onRestoreDefault: () => void;
  isSaving: boolean;
  enableRestoreButton: boolean;
  setLogoUrls: (logoUrls: ILogo[]) => void;
  isWhiteLabelLoaded: boolean;
  defaultWhiteLabelLogoUrls: ILogo[];
}

export interface ILogoProps {
  title?: string;
  src: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSettingPaid: boolean;
  onChangeText: string;
  inputId: string;
  linkId: string;
  imageClass?: string;
  name: string;
  dataTestId?: string;
}

export interface ILogoOptions {
  fontSize: number;
  text: string;
  width: number;
  height: number;
  alignCenter?: boolean;
  isEditor?: boolean;
}

export interface IUploadedDimensions {
  width: number;
  height: number;
}

export interface IUploadLogoResponse {
  Success: boolean;
  Message: string;
}
