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

"use client";

import type { TInviteOutcome } from "@docspace/shared/services/private-room/room-member-flows";
import { Heading } from "@onlyoffice/apps-ui-kit/components/heading";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import type { TTranslation } from "@docspace/shared/types";

import styles from "../InvitePanel.module.scss";

type InviteResultProps = {
  t: TTranslation;
  outcome: TInviteOutcome;
};

const namesOf = (members: { id: string; displayName?: string }[]) =>
  members.map((member) => member.displayName || member.id).join(", ");

const InviteResult = ({ t, outcome }: InviteResultProps) => {
  const { granted, pending, skipped, failed } = outcome;
  const withoutKey = skipped.filter((member) => member.reason === "no-key");
  const withRefusedKey = skipped.filter(
    (member) => member.reason === "key-mismatch-refused",
  );
  const missingFileCount = new Set(
    pending.flatMap((entry) => entry.missingFileIds),
  ).size;

  return (
    <div data-testid="invite_panel_result">
      {granted.length ? (
        <section data-testid="invite_panel_result_granted">
          <Heading className={styles.subHeader}>{t("Common:Invited")}</Heading>
          <Text>{namesOf(granted)}</Text>
        </section>
      ) : null}

      {pending.length ? (
        <section data-testid="invite_panel_result_pending">
          <Heading className={styles.subHeader}>
            {t("Common:EncryptedAccessPending")}
          </Heading>
          <Text>{namesOf(pending.map((entry) => entry.member))}</Text>
          <Text className={styles.description}>
            {failed
              ? t("Common:EncryptedReencryptFailed")
              : t("Common:EncryptedReencryptPartialFailure", {
                  count: missingFileCount,
                })}
          </Text>
        </section>
      ) : null}

      {skipped.length ? (
        <section data-testid="invite_panel_result_skipped">
          {withoutKey.length ? (
            <Text className={styles.description}>
              {t("Common:EncryptedSkippedNoKeys", {
                users: namesOf(withoutKey),
              })}
            </Text>
          ) : null}
          {withRefusedKey.length ? (
            <Text className={styles.description}>
              {t("Common:EncryptedSkippedKeyMismatch", {
                users: namesOf(withRefusedKey),
              })}
            </Text>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};

export default InviteResult;
