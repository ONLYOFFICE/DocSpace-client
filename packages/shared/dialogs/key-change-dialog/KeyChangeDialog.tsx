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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";

import { getPublicKeyFingerprint } from "../../services/encryption/identity";

import type { KeyChangeDialogProps } from "./KeyChangeDialog.types";
import styles from "./KeyChangeDialog.module.scss";

function formatFingerprint(hex: string): string {
  const groups: string[] = [];
  for (let i = 0; i < hex.length; i += 8) {
    groups.push(hex.slice(i, i + 8));
  }
  return groups.join(" ");
}

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "—";
  }
}

const KeyChangeDialog: React.FC<KeyChangeDialogProps> = ({
  visible,
  displayName,
  userId,
  knownPublicKey,
  newPublicKey,
  knownFirstSeenAt,
  knownLastSeenAt,
  onAccept,
  onRefuse,
}) => {
  const { t, ready } = useTranslation(["Common"]);
  const [knownFp, setKnownFp] = useState<string>("");
  const [newFp, setNewFp] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getPublicKeyFingerprint(knownPublicKey),
      getPublicKeyFingerprint(newPublicKey),
    ]).then(([oldFp, newest]) => {
      if (cancelled) return;
      setKnownFp(formatFingerprint(oldFp));
      setNewFp(formatFingerprint(newest));
    });
    return () => {
      cancelled = true;
    };
  }, [knownPublicKey, newPublicKey]);

  const subject = displayName || userId;

  return (
    <ModalDialog
      zIndex={1011}
      visible={visible}
      onClose={onRefuse}
      displayType={ModalDialogType.modal}
      isLoading={!ready}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {t("Common:KeyChangedTitle")}
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container}>
          <Text className={styles.description}>
            {t("Common:KeyChangedDescription", { user: subject })}
          </Text>

          <div className={styles.warningBox}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:KeyChangedWarning")}
            </Text>
          </div>

          <div className={styles.fingerprintsTable}>
            <div className={styles.fingerprintRow}>
              <Text fontSize="12px" className={styles.fingerprintLabel}>
                {t("Common:KeyChangedKnownFingerprint")}
              </Text>
              <Text className={styles.fingerprintValue}>
                {knownFp || "..."}
              </Text>
              <Text className={styles.metaLine}>
                {t("Common:KeyChangedFirstSeen", {
                  date: formatDate(knownFirstSeenAt),
                })}
                {" | "}
                {t("Common:KeyChangedLastSeen", {
                  date: formatDate(knownLastSeenAt),
                })}
              </Text>
            </div>
            <div className={styles.fingerprintRow}>
              <Text fontSize="12px" className={styles.fingerprintLabel}>
                {t("Common:KeyChangedNewFingerprint")}
              </Text>
              <Text className={styles.fingerprintValue}>
                {newFp || "..."}
              </Text>
            </div>
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          scale
          key="RefuseButton"
          onClick={onRefuse}
          size={ButtonSize.normal}
          label={t("Common:KeyChangedRefuse")}
          tabIndex={1}
        />
        <Button
          scale
          primary
          key="AcceptButton"
          onClick={onAccept}
          size={ButtonSize.normal}
          label={t("Common:KeyChangedAccept")}
          tabIndex={2}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default KeyChangeDialog;
