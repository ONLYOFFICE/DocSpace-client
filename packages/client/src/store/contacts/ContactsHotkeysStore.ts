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
import { isMobile } from "@docspace/shared/utils";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import { TGroup } from "@docspace/shared/api/groups/types";
import { TABLE_HEADER_HEIGHT } from "@docspace/shared/components/table/Table.constants";
import GroupsStore from "./GroupsStore";

type UsersStore = TStore["peopleStore"]["usersStore"];

type TUserItem = ReturnType<UsersStore["getPeopleListItem"]>;

type AccountsType = TUserItem | TGroup;

class ContactsHotkeysStore {
  peopleStore;

  hotkeyCaret: AccountsType | null = null;

  hotkeyCaretStart: AccountsType | null = null;

  selectionAreaIsEnabled: boolean = true;

  withContentSelection: boolean = false;

  elemOffset: number = 0;

  constructor(peopleStore: TStore["peopleStore"]) {
    this.peopleStore = peopleStore;
    makeAutoObservable(this);
  }

  get contactsList() {
    return this.peopleStore.usersStore!.contactsTab !== "groups"
      ? this.peopleStore.usersStore!.peopleList
      : this.peopleStore.groupsStore!.groups;
  }

  get contactsSelection() {
    return this.peopleStore.usersStore!.contactsTab !== "groups"
      ? this.peopleStore.usersStore!.selection
      : this.peopleStore.groupsStore!.selection;
  }

  get caretIndex() {
    const item = this.hotkeyCaret
      ? this.hotkeyCaret
      : this.contactsSelection.length
        ? this.contactsSelection.length === 1
          ? this.contactsSelection[0]
          : this.contactsSelection[this.contactsSelection.length - 1]
        : null;

    const caretIndex = this.contactsList.findIndex((f) => f.id === item?.id);

    if (caretIndex !== -1) return caretIndex;

    return null;
  }

  get prevFile() {
    if (this.caretIndex !== -1 && this.caretIndex !== null) {
      const prevCaretIndex = this.caretIndex - 1;
      return this.contactsList[prevCaretIndex];
    }

    return null;
  }

  get nextFile() {
    if (this.caretIndex !== -1 && this.caretIndex !== null) {
      const nextCaretIndex = this.caretIndex + 1;
      return this.contactsList[nextCaretIndex];
    }

    return null;
  }

  selectBottom = () => {
    if (!this.hotkeyCaret && !this.contactsSelection.length)
      return this.selectFirstFile();
    if (this.nextFile)
      this.setSelectionWithCaret([this.nextFile] as
        | UsersStore["selection"]
        | GroupsStore["selection"]);
  };

  selectUpper = () => {
    if (!this.hotkeyCaret && !this.contactsSelection.length)
      return this.selectFirstFile();
    if (this.prevFile)
      this.setSelectionWithCaret([this.prevFile] as
        | UsersStore["selection"]
        | GroupsStore["selection"]);
  };

  setSelection = (
    selection: GroupsStore["selection"] | UsersStore["selection"],
  ) => {
    if (this.peopleStore.usersStore!.contactsTab !== "groups") {
      return this.peopleStore.usersStore!.setSelection(
        selection as UsersStore["selection"],
      );
    }

    return this.peopleStore.groupsStore!.setSelection(
      selection as GroupsStore["selection"],
    );
  };

  setHotkeyCaret = (hotkeyCaret: AccountsType | null) => {
    if (hotkeyCaret || this.hotkeyCaret) {
      this.hotkeyCaret = hotkeyCaret;
    }
  };

  setHotkeyCaretStart = (hotkeyCaretStart: AccountsType | null) => {
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

  setSelectionWithCaret = (
    selection: GroupsStore["selection"] | UsersStore["selection"],
  ) => {
    this.setSelection(selection);
    this.setCaret(selection[0]);
    this.setHotkeyCaretStart(selection[0]);
  };

  selectFirstFile = () => {
    if (this.contactsList.length) {
      // scroll to first element
      const scroll = isMobile()
        ? document.querySelector(
            "#customScrollBar > .scroll-wrapper > .scroller",
          )
        : document.getElementsByClassName("section-scroll")[0];

      scroll?.scrollTo(0, 0);

      this.setSelection([this.contactsList[0]] as
        | GroupsStore["selection"]
        | UsersStore["selection"]);
      this.setCaret(this.contactsList[0]);
      this.setHotkeyCaretStart(this.contactsList[0]);
    }
  };

  deselectAll = () => {
    const { setSelected } =
      this.peopleStore.usersStore!.contactsTab !== "groups"
        ? this.peopleStore.usersStore!
        : this.peopleStore.groupsStore!;

    this.elemOffset = 0;
    setSelected("none");
  };

  selectAll = () => {
    const { selectAll } =
      this.peopleStore.usersStore!.contactsTab !== "groups"
        ? this.peopleStore.usersStore!
        : this.peopleStore.groupsStore!;

    selectAll();
  };

  openItem = () => {
    const someDialogIsOpen = checkDialogsOpen();

    const item = this.contactsSelection[0];

    if (
      this.peopleStore.usersStore!.contactsTab !== "groups" ||
      this.contactsSelection.length !== 1 ||
      someDialogIsOpen ||
      !("name" in item)
    )
      return;

    this.peopleStore.groupsStore!.openGroupAction(item.id, true, item.name);
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

    const selection = this.contactsSelection.length
      ? this.contactsSelection
      : this.contactsList;

    if (!this.hotkeyCaret) {
      const scroll = document.getElementsByClassName(
        "section-scroll",
      ) as HTMLCollectionOf<HTMLElement>;

      if (scroll && scroll[0]) {
        const scrollElem = scroll[0]?.firstChild as HTMLElement;
        scrollElem?.focus();
      }
    }

    if (!this.hotkeyCaret && selection?.length) {
      this.setCaret(selection[0], !(e.ctrlKey || e.metaKey || e.shiftKey));
      this.setHotkeyCaretStart(selection[0]);
    }

    if (!this.hotkeyCaret || isDefaultKeys) return e;
  };

  setSelectionAreaIsEnabled = (selectionAreaIsEnabled: boolean) => {
    this.selectionAreaIsEnabled = selectionAreaIsEnabled;
  };

  setWithContentSelection = (withContentSelection: boolean) => {
    this.withContentSelection = withContentSelection;
  };

  enableSelection = (e: KeyboardEvent) => {
    if (e.type === "keydown" && this.selectionAreaIsEnabled) {
      this.setSelectionAreaIsEnabled(false);
      this.setWithContentSelection(true);
    } else if (e.type === "keyup") {
      this.setSelectionAreaIsEnabled(true);
    }
    e.preventDefault();
  };
}

export default ContactsHotkeysStore;
