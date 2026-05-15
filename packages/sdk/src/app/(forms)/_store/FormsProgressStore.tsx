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

import React from "react";
import { makeAutoObservable } from "mobx";

import type { FloatingButtonIcons } from "@docspace/ui-kit/components/floating-button";

export type FormsProgressIcon = keyof typeof FloatingButtonIcons;

const COMPLETED_HIDE_DELAY = 2000;
const ALERT_HIDE_DELAY = 3000;

class FormsProgressStore {
  icon: FormsProgressIcon | null = null;
  percent: number = 0;
  completed: boolean = false;
  alert: boolean = false;

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get isBusy() {
    return this.icon !== null && !this.completed && !this.alert;
  }

  start = (icon: FormsProgressIcon) => {
    this.clearHideTimer();
    this.icon = icon;
    this.percent = 0;
    this.completed = false;
    this.alert = false;
  };

  update = (percent: number) => {
    if (this.icon === null) return;
    this.percent = Math.max(0, Math.min(100, Math.round(percent)));
  };

  finish = () => {
    if (this.icon === null) return;
    this.percent = 100;
    this.completed = true;
    this.alert = false;
    this.scheduleReset(COMPLETED_HIDE_DELAY);
  };

  error = () => {
    if (this.icon === null) return;
    this.percent = 100;
    this.completed = false;
    this.alert = true;
    this.scheduleReset(ALERT_HIDE_DELAY);
  };

  reset = () => {
    this.clearHideTimer();
    this.icon = null;
    this.percent = 0;
    this.completed = false;
    this.alert = false;
  };

  private scheduleReset = (delay: number) => {
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      this.reset();
    }, delay);
  };

  private clearHideTimer = () => {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  };
}

const FormsProgressStoreContext =
  React.createContext<FormsProgressStore | null>(null);

export const FormsProgressStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsProgressStore(), []);
  return (
    <FormsProgressStoreContext.Provider value={store}>
      {children}
    </FormsProgressStoreContext.Provider>
  );
};

export const useFormsProgressStore = () => {
  const store = React.useContext(FormsProgressStoreContext);
  if (!store)
    throw new Error(
      "useFormsProgressStore must be used within FormsProgressStoreContextProvider",
    );
  return store;
};
