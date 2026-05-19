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

export const SHOW_LOADER_TIMER = 200;
export const MIN_LOADER_TIMER = 500;

export function createLoader(
  loaderTimer = SHOW_LOADER_TIMER,
  minLoaderTimer = MIN_LOADER_TIMER,
) {
  let timer: number | undefined;
  let startedLoader: Date | undefined;

  const clearState = () => {
    startedLoader = undefined;
    timer = undefined;
  };

  const startLoader = (callback: VoidFunction) => {
    timer = window.setTimeout(() => {
      startedLoader = new Date();
      callback();
    }, loaderTimer);

    return timer;
  };

  const endLoader = (callback: VoidFunction): void => {
    if (startedLoader) {
      const currentDate = new Date();
      const diff = Math.abs(startedLoader.getTime() - currentDate.getTime());

      clearState();

      if (diff >= minLoaderTimer) {
        callback();
        return;
      }

      window.setTimeout(() => {
        callback();
      }, minLoaderTimer - diff);
    }

    clearInterval(timer);
    callback();
    clearState();
  };

  return { startLoader, endLoader };
}
