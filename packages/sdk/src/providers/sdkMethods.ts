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

"use client";

import { useEffect, useRef } from "react";

/**
 * A handler of one SDK method. Receives the payload the host passed to the
 * instance method and returns the value the host resolves with.
 */
export type TSdkMethodHandler = (data: unknown) => unknown;

const handlers = new Map<string, TSdkMethodHandler>();

/**
 * Registers the handler of an SDK method for the page that is currently
 * mounted. Returns the unregister function.
 */
export const registerSdkMethod = (
  name: string,
  handler: TSdkMethodHandler,
): (() => void) => {
  handlers.set(name, handler);
  return () => {
    if (handlers.get(name) === handler) handlers.delete(name);
  };
};

export const getSdkMethod = (name: string): TSdkMethodHandler | undefined =>
  handlers.get(name);

/**
 * Registers SDK method handlers for the lifetime of the calling component.
 * The latest handlers are always called, so they may close over render state.
 */
export const useSdkMethods = (
  methods: Record<string, TSdkMethodHandler | undefined>,
) => {
  const ref = useRef(methods);
  ref.current = methods;

  const names = Object.keys(methods).sort().join(",");

  useEffect(() => {
    const unregister = names
      .split(",")
      .filter(Boolean)
      .map((name) =>
        registerSdkMethod(name, (data) => ref.current[name]?.(data)),
      );

    return () => {
      unregister.forEach((fn) => fn());
    };
  }, [names]);
};
