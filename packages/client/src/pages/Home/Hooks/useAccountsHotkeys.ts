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
      if (someDialogIsOpen) return;

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
  useHotkeys("Ctrl+Shift+c", copySelectedTextFn, hotkeysFilter);

  // Open context menu
  useHotkeys("Shift+c", openContextMenu, {
    ...hotkeysFilter,
    ...{ keyup: true },
  });
};

export default useAccountsHotkeys;
