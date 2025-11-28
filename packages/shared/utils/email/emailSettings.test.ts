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
