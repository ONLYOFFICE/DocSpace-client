// (c) Copyright Ascensio System SIA 2009-2024
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

import { EmployeeStatus } from "@docspace/shared/enums";
import { computed, makeObservable } from "mobx";

class HeaderMenuStore {
  constructor(peopleStore) {
    this.peopleStore = peopleStore;
    makeObservable(this, {
      isHeaderVisible: computed,
      isHeaderIndeterminate: computed,
      isHeaderChecked: computed,
    });
  }

  get cbMenuItems() {
    const { users } = this.peopleStore.usersStore;

    let cbMenu = ["all"];

    for (let user of users) {
      switch (user.status) {
        case EmployeeStatus.Active:
          cbMenu.push("active");
          break;
        case EmployeeStatus.Pending:
          cbMenu.push("pending");
          break;
        case EmployeeStatus.Disabled:
          cbMenu.push("disabled");
          break;
      }
    }

    cbMenu = cbMenu.filter((item, index) => cbMenu.indexOf(item) === index);

    return cbMenu;
  }
  getMenuItemId = (item) => {
    switch (item) {
      case "active":
        return "selected_active";
      case "pending":
        return "selected_pending";
      case "disabled":
        return "selected_disabled";
      case "all":
        return "selected_all";
    }
  };
  getCheckboxItemLabel = (t, item) => {
    switch (item) {
      case "active":
        return t("Common:Active");
      case "pending":
        return t("PeopleTranslations:PendingInviteTitle");
      case "disabled":
        return t("PeopleTranslations:DisabledEmployeeStatus");
      case "all":
        return t("All");
    }
  };

  // People

  get isHeaderVisible() {
    const { selection } = this.peopleStore.selectionStore;
    return selection.length > 0;
  }

  get isHeaderIndeterminate() {
    const { selection } = this.peopleStore.selectionStore;
    const { users } = this.peopleStore.usersStore;

    return (
      this.isHeaderVisible &&
      !!selection.length &&
      selection.length < users.length
    );
  }
  get isHeaderChecked() {
    const { selection } = this.peopleStore.selectionStore;
    const { users } = this.peopleStore.usersStore;

    return this.isHeaderVisible && selection.length === users.length;
  }

  // Groups

  get isGroupsHeaderVisible() {
    const { selection } = this.peopleStore.groupsStore;
    return selection?.length > 0;
  }

  get isGroupsHeaderIndeterminate() {
    const { selection, groups } = this.peopleStore.groupsStore;

    return (
      this.isGroupsHeaderVisible &&
      !!selection?.length &&
      selection?.length < groups?.length
    );
  }

  get isGroupsHeaderChecked() {
    const { selection, groups } = this.peopleStore.groupsStore;
    return this.isGroupsHeaderVisible && selection?.length === groups?.length;
  }
}

export default HeaderMenuStore;
