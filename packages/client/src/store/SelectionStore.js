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

import { makeAutoObservable } from "mobx";

class SelectionStore {
  selection = [];

  selected = "none";

  constructor(settingsSetupStore) {
    this.settingsSetupStore = settingsSetupStore;
    makeAutoObservable(this);
  }

  setSelection = (selection) => {
    this.selection = selection;
  };

  selectUser = (user) => {
    return this.selection.push(user);
  };

  deselectUser = (user) => {
    if (!user) {
      this.selected = "none";
      this.selection = [];
      return;
    }

    const newData = this.selection.filter((el) => el.id !== user.id);
    return (this.selection = newData);
  };

  selectAll = () => {
    const list = this.peopleStore.usersStore.peopleList;
    this.setSelection(list);
  };

  clearSelection = () => {
    return this.setSelection([]);
  };

  selectByStatus = (status) => {
    const list = this.peopleStore.usersStore.peopleList.filter(
      (u) => u.status === status,
    );

    return (this.selection = list);
  };

  getUserChecked = () => {
    switch (this.selected) {
      case "all":
        return true;
      default:
        return false;
    }
  };

  getUsersBySelected = (users) => {
    const newSelection = [];
    users.forEach((user) => {
      const checked = this.getUserChecked();

      if (checked) newSelection.push(user);
    });

    return newSelection;
  };

  isUserSelected = (userId) => {
    return this.selection.some((el) => el.id === userId);
  };

  setSelected = (selected) => {
    const { admins } = this.settingsSetupStore.security.accessRight;
    this.selected = selected;
    this.setSelection(this.getUsersBySelected(admins));

    return selected;
  };

  get isHeaderVisible() {
    return !!this.selection.length;
  }

  get isHeaderIndeterminate() {
    // console.log("RUN isHeaderIndeterminate");
    const { admins } = this.settingsSetupStore.security.accessRight;
    return (
      this.isHeaderVisible &&
      !!this.selection.length &&
      this.selection.length < admins.length
    );
  }

  get isHeaderChecked() {
    const { admins } = this.settingsSetupStore.security.accessRight;
    return this.isHeaderVisible && this.selection.length === admins.length;
  }
}

export default SelectionStore;
