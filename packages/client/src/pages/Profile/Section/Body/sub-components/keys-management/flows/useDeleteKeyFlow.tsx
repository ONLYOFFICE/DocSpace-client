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

import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";

import { ConfirmationModal } from "../modals/ConfirmationModal";

type Deps = {
  refreshKeysFromServer: () => Promise<void>;
};

export type DeleteKeyFlow = {
  request: (keyId: string) => void;
  isPending: boolean;
  pendingId: string | null;
  modals: ReactNode;
};

export function useDeleteKeyFlow({
  refreshKeysFromServer,
}: Deps): DeleteKeyFlow {
  const { t } = useTranslation(["Common"]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const request = useCallback((keyId: string) => {
    setConfirming(keyId);
  }, []);

  const onConfirm = useCallback(async () => {
    if (!confirming) return;
    setIsPending(true);
    setPendingId(confirming);
    setConfirming(null);
    try {
      await deleteEncryptionKey(confirming);
      SecretStorage.lock();
      await refreshKeysFromServer();
      toastr.success(t("Common:EncryptionKeyDeleted"));
    } catch (error) {
      toastr.error(t("Common:EncryptionError"));
      console.error("Key deletion failed:", error);
    } finally {
      setIsPending(false);
      setPendingId(null);
    }
  }, [confirming, refreshKeysFromServer, t]);

  const modals = confirming !== null ? (
    <ConfirmationModal
      visible
      title={t("Common:DeleteKey")}
      message={t("Common:DeleteKeyWarning")}
      onConfirm={onConfirm}
      onCancel={() => setConfirming(null)}
    />
  ) : null;

  return { request, isPending, pendingId, modals };
}
