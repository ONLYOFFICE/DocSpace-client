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
