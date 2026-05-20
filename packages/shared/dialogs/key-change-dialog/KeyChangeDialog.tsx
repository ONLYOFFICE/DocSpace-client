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

function formatDurationSince(ts: number, now: number = Date.now()): string {
  const ms = Math.max(0, now - ts);
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
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
              <Text className={styles.activeFor}>
                {t("Common:KeyChangedActiveFor", {
                  duration: formatDurationSince(knownFirstSeenAt, Date.now()),
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

          <details className={styles.disclosure}>
            <summary className={styles.disclosureSummary}>
              {t("Common:KeyChangedWhyTitle")}
            </summary>
            <div className={styles.disclosureBody}>
              <Text fontSize="12px" color="var(--text-secondary)">
                {t("Common:KeyChangedWhyIntro")}
              </Text>
              <ul className={styles.reasonList}>
                <li>
                  <Text fontSize="12px" color="var(--text-secondary)">
                    {t("Common:KeyChangedReasonReset")}
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" color="var(--text-secondary)">
                    {t("Common:KeyChangedReasonRecovery")}
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" color="var(--text-secondary)">
                    {t("Common:KeyChangedReasonDevice")}
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" color="var(--text-secondary)">
                    {t("Common:KeyChangedReasonAttack")}
                  </Text>
                </li>
              </ul>
              <Text fontSize="12px" color="var(--text-secondary)">
                {t("Common:KeyChangedVerifyOutOfBand")}
              </Text>
            </div>
          </details>
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
