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

/* eslint-disable no-underscore-dangle */

export class EmailSettings {
  constructor() {
    this.allowDomainPunycode = false;
    this.allowLocalPartPunycode = false;
    this.allowDomainIp = false;
    this.allowStrictLocalPart = true;
    this.allowSpaces = false;
    this.allowName = false;
    this.allowLocalDomainName = false;
  }

  static equals = (
    settings1: { [key: string]: boolean | string },
    settings2: { [key: string]: boolean | string },
  ) => {
    const instance1 = EmailSettings.parse(settings1);
    const instance2 = EmailSettings.parse(settings2);
    const comparedProperties = [
      "allowDomainPunycode",
      "allowLocalPartPunycode",
      "allowDomainIp",
      "allowStrictLocalPart",
      "allowSpaces",
      "allowName",
      "allowLocalDomainName",
    ];
    const propLength = comparedProperties.length;
    for (let i = 0; i < propLength; i += 1) {
      const comparedProp = comparedProperties[i];
      // @ts-expect-error Need review this
      if (instance1[comparedProp] !== instance2[comparedProp]) {
        return false;
      }
    }
    return true;
  };

  get allowDomainPunycode() {
    return this._allowDomainPunycode;
  }

  set allowDomainPunycode(value) {
    if (value !== undefined && typeof value === "boolean") {
      this._allowDomainPunycode = value;
    } else {
      throw new TypeError(
        `Invalid value ${value} for allowDomainPunycode option. Use boolean value`,
      );
    }
  }

  get allowLocalPartPunycode() {
    return this._allowLocalPartPunycode;
  }

  set allowLocalPartPunycode(value) {
    if (value !== undefined && typeof value === "boolean") {
      this._allowLocalPartPunycode = value;
    } else {
      throw new TypeError(
        `Invalid value ${value} for allowLocalPartPunycode option. Use boolean value`,
      );
    }
  }

  get allowDomainIp() {
    return this._allowDomainIp;
  }

  set allowDomainIp(value) {
    if (value !== undefined && typeof value === "boolean") {
      this._allowDomainIp = value;
    } else {
      throw new TypeError(
        `Invalid value ${value} for allowDomainIp option. Use boolean value`,
      );
    }
  }

  get allowStrictLocalPart() {
    return this._allowStrictLocalPart;
  }

  set allowStrictLocalPart(value) {
    if (value !== undefined && typeof value === "boolean") {
      this._allowStrictLocalPart = value;
    } else {
      throw new TypeError(
        `Invalid value ${value} for allowStrictLocalPart option. Use boolean value`,
      );
    }
  }

  get allowSpaces() {
    return this._allowSpaces;
  }

  set allowSpaces(value) {
    if (value !== undefined && typeof value === "boolean") {
      this._allowSpaces = value;
    } else {
      throw new TypeError(
        `Invalid value ${value} for allowSpaces option. Use boolean value`,
      );
    }
  }

  get allowName() {
    return this._allowName;
  }

  set allowName(value) {
    if (value !== undefined && typeof value === "boolean") {
      this._allowName = value;
    } else {
      throw new TypeError(
        `Invalid value ${value} for allowName option. Use boolean value`,
      );
    }
  }

  get allowLocalDomainName() {
    return this._allowLocalDomainName;
  }

  set allowLocalDomainName(value) {
    if (value !== undefined && typeof value === "boolean") {
      this._allowLocalDomainName = value;
    } else {
      throw new TypeError(
        `Invalid value ${value} for allowLocalDomainName option. Use boolean value`,
      );
    }
  }

  toObject() {
    return {
      allowDomainPunycode: this.allowDomainPunycode,
      allowLocalPartPunycode: this.allowLocalPartPunycode,
      allowDomainIp: this.allowDomainIp,
      allowStrictLocalPart: this.allowStrictLocalPart,
      allowSpaces: this.allowSpaces,
      allowName: this.allowName,
      allowLocalDomainName: this.allowLocalDomainName,
    };
  }

  disableAllSettings() {
    this.allowDomainPunycode = true;
    this.allowLocalPartPunycode = true;
    this.allowDomainIp = true;
    this.allowStrictLocalPart = false;
    this.allowSpaces = true;
    this.allowName = true;
    this.allowLocalDomainName = true;
  }

  static parse = (settings: { [key: string]: string | boolean }) => {
    if (settings instanceof EmailSettings) return settings;

    if (typeof settings !== "object") throw new Error("Invalid argument");

    const defaultSettings = new EmailSettings();
    Object.keys(settings).forEach((key: string | boolean) => {
      // @ts-expect-error Need review this
      if (!(key in defaultSettings) || defaultSettings[key] === settings[key])
        return;

      // @ts-expect-error Need review this
      defaultSettings[key] = settings[key];
    });

    return defaultSettings;
  };

  _allowDomainIp: unknown;

  _allowDomainPunycode: unknown;

  _allowLocalDomainName: unknown;

  _allowLocalPartPunycode: unknown;

  _allowName: unknown;

  _allowSpaces: unknown;

  _allowStrictLocalPart: unknown;
}
