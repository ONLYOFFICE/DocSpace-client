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

import { makeAutoObservable } from "mobx";
import { isMobile } from "@docspace/shared/utils";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import { TUser, TUserGroup } from "@docspace/shared/api/people/types";
import { TABLE_HEADER_HEIGHT } from "@docspace/shared/components/table/Table.constants";

type AccountsType = TUser | TUserGroup;

class ContactsHotkeysStore {
  peopleStore;

  hotkeyCaret: AccountsType | null = null;

  hotkeyCaretStart: AccountsType | null = null;

  elemOffset: number = 0;

  constructor(peopleStore: any) {
    this.peopleStore = peopleStore;
    makeAutoObservable(this);
  }

  get isAccountsPage() {
    const groupId = new URLSearchParams(window.location.search).get("group");

    return window.location.pathname.includes("/accounts/people") || groupId;
  }

  get accountsList() {
    return this.isAccountsPage
      ? this.peopleStore.usersStore.peopleList
      : this.peopleStore.groupsStore.groups;
  }

  get accountsSelection() {
    return this.isAccountsPage
      ? this.peopleStore.usersStore.selection
      : this.peopleStore.groupsStore.selection;
  }

  get caretIndex() {
    const item = this.hotkeyCaret
      ? this.hotkeyCaret
      : this.accountsSelection.length
        ? this.accountsSelection.length === 1
          ? this.accountsSelection[0]
          : this.accountsSelection[this.accountsSelection.length - 1]
        : null;

    const caretIndex = this.accountsList.findIndex((f) => f.id === item?.id);

    if (caretIndex !== -1) return caretIndex;
    return null;
  }

  get prevFile() {
    if (this.caretIndex !== -1) {
      const prevCaretIndex = this.caretIndex - 1;
      return this.accountsList[prevCaretIndex];
    }

    return null;
  }

  get nextFile() {
    if (this.caretIndex !== -1) {
      const nextCaretIndex = this.caretIndex + 1;
      return this.accountsList[nextCaretIndex];
    }
    return null;
  }

  selectBottom = () => {
    if (!this.hotkeyCaret && !this.accountsSelection.length)
      return this.selectFirstFile();
    if (this.nextFile) this.setSelectionWithCaret([this.nextFile]);
  };

  selectUpper = () => {
    if (!this.hotkeyCaret && !this.accountsSelection.length)
      return this.selectFirstFile();
    if (this.prevFile) this.setSelectionWithCaret([this.prevFile]);
  };

  setSelection = (selection: AccountsType[]) => {
    return this.isAccountsPage
      ? this.peopleStore.usersStore.setSelection(selection)
      : this.peopleStore.groupsStore.setSelection(selection);
  };

  setHotkeyCaret = (hotkeyCaret: AccountsType | null) => {
    if (hotkeyCaret || this.hotkeyCaret) {
      this.hotkeyCaret = hotkeyCaret;
    }
  };

  setHotkeyCaretStart = (hotkeyCaretStart: AccountsType) => {
    this.hotkeyCaretStart = hotkeyCaretStart;
  };

  getItemOffset = () => {
    const className = `${this.hotkeyCaret?.id}`;

    let item = document.getElementsByClassName(className);

    if (this.peopleStore.viewAs === "table") {
      item = item && item[0]?.getElementsByClassName("table-container_cell");
    }

    if (item && item[0]) {
      const el = item[0] as HTMLElement;
      const windowItem = el.closest(".window-item") as HTMLElement;

      const offset = windowItem?.offsetTop;

      const offsetTop = offset ?? el.offsetTop;

      return { offsetTop, item };
    }

    return { offsetTop: null, item: null };
  };

  scrollToCaret = () => {
    const { offsetTop, item } = this.getItemOffset();

    const scroll = isMobile()
      ? document.querySelector("#customScrollBar > .scroll-wrapper > .scroller")
      : document.getElementsByClassName("section-scroll")[0];

    const stickySection = document.querySelector(".section-sticky-container");
    const stickySectionHeight =
      stickySection?.getBoundingClientRect().height ?? 0;

    const tableHeaderHeight =
      this.peopleStore.viewAs === "table" ? TABLE_HEADER_HEIGHT : 0;

    const scrollRect = scroll?.getBoundingClientRect();

    if (scrollRect && scroll) {
      if (item && item[0]) {
        const el = item[0] as HTMLElement;
        const rect = el.getBoundingClientRect();

        if (
          scrollRect.top + scrollRect.height - rect.height > rect.top &&
          scrollRect.top + stickySectionHeight + tableHeaderHeight < rect.top
        ) {
          // console.log("element is visible");
        } else {
          scroll.scrollTo(0, offsetTop - scrollRect.height / 2);
          // console.log("element is not visible");
        }
      } else {
        scroll?.scrollTo(0, this.elemOffset - scrollRect.height / 2);
      }
    }
  };

  setCaret = (caret: AccountsType, withScroll: boolean = true) => {
    this.setHotkeyCaret(caret);
    if (withScroll) this.scrollToCaret();

    const { offsetTop } = this.getItemOffset();
    if (offsetTop) this.elemOffset = offsetTop;
  };

  setSelectionWithCaret = (selection: AccountsType[]) => {
    this.setSelection(selection);
    this.setCaret(selection[0]);
    this.setHotkeyCaretStart(selection[0]);
  };

  selectFirstFile = () => {
    if (this.accountsList.length) {
      // scroll to first element
      const scroll = isMobile()
        ? document.querySelector(
            "#customScrollBar > .scroll-wrapper > .scroller",
          )
        : document.getElementsByClassName("section-scroll")[0];

      scroll?.scrollTo(0, 0);

      this.setSelection([this.accountsList[0]]);
      this.setCaret(this.accountsList[0]);
      this.setHotkeyCaretStart(this.accountsList[0]);
    }
  };

  deselectAll = () => {
    const { setSelected } = this.isAccountsPage
      ? this.peopleStore.usersStore
      : this.peopleStore.groupsStore;

    this.elemOffset = 0;
    setSelected("none");
  };

  selectAll = () => {
    const { selectAll } = this.isAccountsPage
      ? this.peopleStore.usersStore
      : this.peopleStore.groupsStore;

    selectAll();
  };

  openItem = () => {
    const someDialogIsOpen = checkDialogsOpen();
    if (
      this.isAccountsPage ||
      this.accountsSelection.length !== 1 ||
      someDialogIsOpen
    )
      return;

    const item = this.accountsSelection[0];
    this.peopleStore.groupsStore.openGroupAction(item.id, true, item.name);
  };

  activateHotkeys = (e: KeyboardEvent) => {
    const infiniteLoaderComponent = document.getElementsByClassName(
      "ReactVirtualized__List",
    )[0] as HTMLElement;

    if (infiniteLoaderComponent) {
      infiniteLoaderComponent.tabIndex = -1;
    }

    const someDialogIsOpen = checkDialogsOpen();
    const elementTarget = e.target as HTMLElement;
    const inputTarget = e.target as HTMLInputElement;

    if (
      someDialogIsOpen ||
      (elementTarget?.tagName === "INPUT" &&
        inputTarget?.type !== "checkbox") ||
      elementTarget?.tagName === "TEXTAREA"
    )
      return e;

    const isDefaultKeys =
      ["PageUp", "PageDown", "Home", "End"].indexOf(e.code) > -1;

    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        e.code,
      ) > -1
    ) {
      e.preventDefault();
    }

    const selection = this.accountsSelection.length
      ? this.accountsSelection
      : this.accountsList;

    if (!this.hotkeyCaret) {
      const scroll = document.getElementsByClassName(
        "section-scroll",
      ) as HTMLCollectionOf<HTMLElement>;

      if (scroll && scroll[0]) {
        const scrollElem = scroll[0]?.firstChild as HTMLElement;
        scrollElem?.focus();
      }
    }

    if (!this.hotkeyCaret && selection.length) {
      this.setCaret(selection[0], !(e.ctrlKey || e.metaKey || e.shiftKey));
      this.setHotkeyCaretStart(selection[0]);
    }

    if (!this.hotkeyCaret || isDefaultKeys) return e;
  };
}

export default ContactsHotkeysStore;
