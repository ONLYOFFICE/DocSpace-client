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

import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { DELETE_TAG_DONT_SHOW_AGAIN_KEY } from "../TagManagement.constants";

interface ModalState {
  isOpen: boolean;
  tagToDelete?: string;
  resolve?: (value: boolean) => void;
}

interface UseDeleteConfirmationReturn {
  isModalOpen: boolean;
  tagToDelete: string | undefined;
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  requestConfirmation: (tag: string) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export function useDeleteConfirmation(): UseDeleteConfirmationReturn {
  const [isChecked, setIsChecked] = useLocalStorage<boolean>(
    DELETE_TAG_DONT_SHOW_AGAIN_KEY,
    false,
  );

  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  // The question, for as long as it is unanswered. Kept beside the state so
  // that going away can answer it: the caller is waiting on this promise, and
  // a promise that never settles leaves it waiting for the rest of the page's
  // life - with the delete it was about neither sent nor abandoned.
  const pending = useRef<((value: boolean) => void) | null>(null);

  useEffect(() => {
    return () => {
      pending.current?.(false);
      pending.current = null;
    };
  }, []);

  const requestConfirmation = useCallback(
    async (tag: string): Promise<boolean> => {
      if (isChecked) {
        return true;
      }

      return new Promise<boolean>((resolve) => {
        pending.current = resolve;
        setModalState({ isOpen: true, tagToDelete: tag, resolve });
      });
    },
    [isChecked],
  );

  const handleConfirm = useCallback(() => {
    pending.current = null;

    setModalState((prev) => {
      if (prev.resolve) {
        prev.resolve(true);
      }
      return { isOpen: false };
    });
  }, []);

  const handleCancel = useCallback(() => {
    pending.current = null;

    setModalState((prev) => {
      if (prev.resolve) {
        prev.resolve(false);
      }
      return { isOpen: false };
    });
  }, []);

  return {
    isModalOpen: modalState.isOpen,
    tagToDelete: modalState.tagToDelete,
    isChecked,
    setIsChecked,
    requestConfirmation,
    handleConfirm,
    handleCancel,
  };
}
