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
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0/legalcode
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

import { useCallback, useState } from "react";

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

  const requestConfirmation = useCallback(
    async (tag: string): Promise<boolean> => {
      if (isChecked) {
        return true;
      }

      return new Promise<boolean>((resolve) => {
        setModalState({ isOpen: true, tagToDelete: tag, resolve });
      });
    },
    [isChecked],
  );

  const handleConfirm = useCallback(() => {
    setModalState((prev) => {
      if (prev.resolve) {
        prev.resolve(true);
      }
      return { isOpen: false };
    });
  }, []);

  const handleCancel = useCallback(() => {
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
