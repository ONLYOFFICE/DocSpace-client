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

/**
 * Lets non-React code (the upload pipeline) ask the host UI to show the
 * "set up encryption on this device" hint on demand, for example when an
 * upload into a private room is refused because the uploader has no key.
 *
 * The passive variant of the hint fires once per session when a key-less
 * user enters a private room; an explicit request bypasses that session gate
 * because it answers a concrete action the user just took.
 *
 * The handler is plain: no React or i18n dependencies in this module. The
 * host (EncryptionProviderWrapper in the client) registers a toast-driven
 * implementation.
 */

type DeviceSetupHintHandler = () => void;
let registeredHandler: DeviceSetupHintHandler | null = null;

export const registerDeviceSetupHintHandler = (
  handler: DeviceSetupHintHandler,
) => {
  registeredHandler = handler;
};

export const clearDeviceSetupHintHandler = () => {
  registeredHandler = null;
};

/**
 * Show the device-setup hint now. Returns true when a handler was registered
 * and ran, false when nothing is listening (SDK pages, tests).
 */
export const requestDeviceSetupHint = (): boolean => {
  if (!registeredHandler) return false;
  try {
    registeredHandler();
    return true;
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: surface handler bugs in dev; production build strips console.
    console.error("[device-setup-hint] handler threw:", e);
    return false;
  }
};
