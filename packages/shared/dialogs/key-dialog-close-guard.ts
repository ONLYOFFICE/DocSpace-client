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

import { useCallback, useEffect, useRef, useState } from "react";

/** The key dialogs open at z-index 410; their close confirmation sits above. */
export const KEY_DIALOG_CONFIRMATION_Z_INDEX = 411;

type Options = {
  visible: boolean;
  /** Whether closing now would throw away what the user typed or was shown. */
  dirty: boolean;
  /** The dialog's own cancel: clears its state and tells the caller. */
  onCancel: () => void;
};

/**
 * Close guard of a key dialog. The cross, Escape and a swipe go through
 * `requestClose`, which asks first while the dialog is dirty; the dialog's own
 * actions keep calling its cancel directly.
 * Spec: private-rooms/key-management, "Closing a key dialog with typed input asks for confirmation".
 */
export const useKeyDialogCloseGuard = ({
  visible,
  dirty,
  onCancel,
}: Options) => {
  const [confirming, setConfirming] = useState(false);
  // The dialog and its confirmation both hear the same Escape keyup on
  // window, in whichever order they subscribed. The ref answers the dialog's
  // handler before React re-renders, and it is cleared only after the current
  // event has finished dispatching, so the dialog does not reopen the
  // confirmation the confirmation just closed.
  const confirmingRef = useRef(false);
  const dirtyRef = useRef(dirty);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    dirtyRef.current = dirty;
    onCancelRef.current = onCancel;
  });

  const open = useCallback(() => {
    confirmingRef.current = true;
    setConfirming(true);
  }, []);

  const close = useCallback(() => {
    setConfirming(false);
    window.setTimeout(() => {
      confirmingRef.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    if (!visible) close();
  }, [visible, close]);

  const requestClose = useCallback(() => {
    if (confirmingRef.current) return;
    if (dirtyRef.current) {
      open();
      return;
    }
    onCancelRef.current();
  }, [open]);

  const discard = useCallback(() => {
    close();
    onCancelRef.current();
  }, [close]);

  return {
    requestClose,
    confirming,
    confirmation: {
      visible: confirming,
      zIndex: KEY_DIALOG_CONFIRMATION_Z_INDEX,
      onClose: close,
      onCancel: close,
      onConfirm: discard,
    },
  };
};
