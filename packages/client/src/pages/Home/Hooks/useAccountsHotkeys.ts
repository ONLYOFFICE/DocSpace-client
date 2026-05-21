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

import { useEffect, useState, useCallback } from "react";
import { useHotkeys, Options } from "react-hotkeys-hook";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";
import { copySelectedText } from "@docspace/shared/utils/copy";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";

interface AccountsHotkeysProps {
  enabledHotkeys: boolean;
  isUsersLoading: boolean;

  selectBottom: () => void;
  selectUpper: () => void;
  activateHotkeys: (e: KeyboardEvent) => void;
  selectAll: () => void;
  deselectAll: () => void;
  openItem: () => void;
  onClickBack: (fromHotkeys: boolean) => void;
  enableSelection: ContactsHotkeysStore["enableSelection"];
  viewAs: PeopleStore["viewAs"];
  selection: UsersStore["selection"] | GroupsStore["selection"];
  openContextMenu: ContactsHotkeysStore["openContextMenu"];
}

const useAccountsHotkeys = ({
  enabledHotkeys,
  isUsersLoading,
  selectBottom,
  selectUpper,
  activateHotkeys,
  selectAll,
  deselectAll,
  openItem,
  onClickBack,
  enableSelection,
  viewAs,
  selection,
  openContextMenu,
}: AccountsHotkeysProps) => {
  const [isEnabled, setIsEnabled] = useState(true);

  const hotkeysFilter = {
    filter: (ev) => {
      const eElement = ev.target as HTMLElement;
      const eInputElement = ev.target as HTMLInputElement;
      return (
        eInputElement?.type === "checkbox" || eElement?.tagName !== "INPUT"
      );
    },
    filterPreventDefault: false,
    enableOnTags: ["INPUT"],
    enabled: enabledHotkeys && !isUsersLoading && isEnabled,
  } as Options;

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const someDialogIsOpen = checkDialogsOpen();
      setIsEnabled(!someDialogIsOpen);

      activateHotkeys(e);
    },
    [activateHotkeys],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  const onClickBackAction = () => {
    deselectAll();
    onClickBack(true);
  };

  useHotkeys(
    "*",
    (e) => {
      const someDialogIsOpen = checkDialogsOpen();
      const contextMenuIsOpen =
        document.getElementsByClassName("p-contextmenu").length;
      if (someDialogIsOpen || contextMenuIsOpen) return;

      if (
        (e.key === "Alt" && (e.ctrlKey || e.metaKey)) ||
        ((e.key === "Meta" || e.key === "Control") && e.altKey)
      ) {
        return enableSelection(e);
      }

      if (e.shiftKey || e.ctrlKey || e.type === "keyup") return;

      switch (e.key) {
        case "ArrowDown":
        case "j": {
          return selectBottom();
        }

        case "ArrowUp":
        case "k": {
          return selectUpper();
        }

        default:
          break;
      }
    },
    { ...hotkeysFilter, keyup: true, keydown: true },
  );

  // Select all accounts
  useHotkeys(
    "shift+a, ctrl+a, command+a",
    (e) => {
      e.preventDefault();
      selectAll();
    },
    hotkeysFilter,
  );

  // Deselect all accounts
  useHotkeys("shift+n, ESC", deselectAll, hotkeysFilter);

  // Open item
  useHotkeys("Enter", () => openItem(), hotkeysFilter);

  // Back to parent folder
  useHotkeys("Backspace", onClickBackAction, hotkeysFilter);

  const copySelectedTextFn = (e: KeyboardEvent): void => {
    if (!selection.length) return;
    e.preventDefault();

    copySelectedText(e, viewAs, selection);
  };

  // Copy selected items to clipboard
  useHotkeys(
    "Ctrl+Shift+c, command+Shift+c",
    copySelectedTextFn,
    hotkeysFilter,
  );

  // Open context menu
  useHotkeys("Shift+c", openContextMenu, {
    ...hotkeysFilter,
    ...{ keyup: true },
  });
};

export default useAccountsHotkeys;
