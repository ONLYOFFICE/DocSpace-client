// (c) Copyright Ascensio System SIA 2009-2026
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
