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

import { describe, it, expect } from "vitest";
import { EmailSettings } from "./index";

const defaultEmailSettingsObj = {
  allowDomainPunycode: false,
  allowLocalPartPunycode: false,
  allowDomainIp: false,
  allowStrictLocalPart: true,
  allowSpaces: false,
  allowName: false,
  allowLocalDomainName: false,
};
describe("emailSettings", () => {
  it("get default settings from instance", () => {
    const email = new EmailSettings();
    const settings = email.toObject();
    expect(settings).toStrictEqual(defaultEmailSettingsObj);
  });

  it("change and get settings from instance", () => {
    const emailSettingsObj = {
      allowDomainPunycode: false,
      allowLocalPartPunycode: false,
      allowDomainIp: false,
      allowStrictLocalPart: true,
      allowSpaces: false,
      allowName: false,
      allowLocalDomainName: true,
    };

    const emailSettings = new EmailSettings();
    emailSettings.allowLocalDomainName = true;
    const settings = emailSettings.toObject();

    expect(settings).toStrictEqual(emailSettingsObj);
  });

  it("set and get allowStrictLocalPart setting", () => {
    const emailSettings = new EmailSettings();
    emailSettings.allowStrictLocalPart = false;

    expect(emailSettings.allowStrictLocalPart).toBe(false);
  });

  it("disable settings", () => {
    const disabledSettings = {
      allowDomainPunycode: true,
      allowLocalPartPunycode: true,
      allowDomainIp: true,
      allowStrictLocalPart: false,
      allowSpaces: true,
      allowName: true,
      allowLocalDomainName: true,
    };
    const emailSettings = new EmailSettings();
    emailSettings.disableAllSettings();
    const newSettings = emailSettings.toObject();

    expect(newSettings).toStrictEqual(disabledSettings);
  });

  it("set invalid (non-boolean) value for allowLocalDomainName setting", () => {
    const emailSettings = new EmailSettings();

    try {
      emailSettings.allowLocalDomainName = "1";
    } catch (err) {
      const e = err as { name: string };
      expect(e.name).toBe("TypeError");
    }
  });

  it("set invalid (non-boolean) value for allowDomainPunycode setting", () => {
    const emailSettings = new EmailSettings();

    try {
      emailSettings.allowDomainPunycode = "1";
    } catch (err) {
      const e = err as { name: string };
      expect(e.name).toBe("TypeError");
    }
  });

  it("set invalid (non-boolean) value for allowLocalPartPunycode setting", () => {
    const emailSettings = new EmailSettings();

    try {
      emailSettings.allowLocalPartPunycode = "1";
    } catch (err) {
      const e = err as { name: string };
      expect(e.name).toBe("TypeError");
    }
  });

  it("set invalid (non-boolean) value for allowDomainIp setting", () => {
    const emailSettings = new EmailSettings();

    try {
      emailSettings.allowDomainIp = "1";
    } catch (err) {
      const e = err as { name: string };
      expect(e.name).toBe("TypeError");
    }
  });

  it("set invalid (non-boolean) value for allowStrictLocalPart setting", () => {
    const emailSettings = new EmailSettings();

    try {
      emailSettings.allowStrictLocalPart = "1";
    } catch (err) {
      const e = err as { name: string };
      expect(e.name).toBe("TypeError");
    }
  });

  it("set invalid (non-boolean) value for allowSpaces setting", () => {
    const emailSettings = new EmailSettings();

    try {
      emailSettings.allowSpaces = "1";
    } catch (err) {
      const e = err as { name: string };
      expect(e.name).toBe("TypeError");
    }
  });

  it("set invalid (non-boolean) value for allowName setting", () => {
    const emailSettings = new EmailSettings();

    try {
      emailSettings.allowName = "1";
    } catch (err) {
      const e = err as { name: string };
      expect(e.name).toBe("TypeError");
    }
  });

  // test EmailSettings.equals function

  it("is not equal email settings", () => {
    const emailSettings = new EmailSettings();
    const emailSettings2 = new EmailSettings();

    emailSettings.allowStrictLocalPart = false;
    // @ts-expect-error email settings is [key:string]:string
    const isEqual = EmailSettings.equals(emailSettings, emailSettings2);

    expect(isEqual).toBe(false);
  });

  it("is equal email settings", () => {
    const emailSettings = new EmailSettings();
    const emailSettings2 = new EmailSettings();
    // @ts-expect-error email settings is [key:string]:string
    const isEqual = EmailSettings.equals(emailSettings, emailSettings2);

    expect(isEqual).toBe(true);
  });

  // test checkAndEmailSettings.parse function

  it("passed instance of default EmailSettings, return same instance", () => {
    const emailSettings = new EmailSettings();
    // @ts-expect-error email settings is [key:string]:string
    const convertedSettings = EmailSettings.parse(emailSettings);

    expect(convertedSettings).toStrictEqual(emailSettings);
  });

  it("passed object with default settings, return instance of default EmailSettings", () => {
    const convertedSettings = EmailSettings.parse(defaultEmailSettingsObj);
    const emailSettings = new EmailSettings();

    expect(convertedSettings).toStrictEqual(emailSettings);
  });

  it("passed instance of EmailSettings, return same instance", () => {
    const emailSettings = new EmailSettings();
    emailSettings.allowLocalDomainName = true;
    // @ts-expect-error email settings is [key:string]:string
    const convertedSettings = EmailSettings.parse(emailSettings);

    expect(convertedSettings).toStrictEqual(emailSettings);
  });

  it("passed object with settings, return instance of EmailSettings", () => {
    const emailSettingsObj = {
      allowDomainPunycode: true,
      allowLocalPartPunycode: true,
      allowDomainIp: false,
      allowStrictLocalPart: true,
      allowSpaces: false,
      allowName: false,
      allowLocalDomainName: false,
    };

    const convertedSettings = EmailSettings.parse(emailSettingsObj);
    const emailSettings = new EmailSettings();
    emailSettings.allowDomainPunycode = true;
    emailSettings.allowLocalPartPunycode = true;

    expect(convertedSettings).toStrictEqual(emailSettings);
  });

  it("passed invalid object with settings, return instance of EmailSettings", () => {
    const emailSettingsObj = {
      temp: "temp",
      allowDomainPunycode: true,
      allowLocalPartPunycode: true,
      allowDomainIp: false,
      allowStrictLocalPart: true,
      allowSpaces: false,
      allowName: false,
      allowLocalDomainName: false,
    };

    const convertedSettings = EmailSettings.parse(emailSettingsObj);

    const emailSettings = new EmailSettings();
    emailSettings.allowDomainPunycode = true;
    emailSettings.allowLocalPartPunycode = true;

    expect(convertedSettings).toStrictEqual(emailSettings);
  });
});
