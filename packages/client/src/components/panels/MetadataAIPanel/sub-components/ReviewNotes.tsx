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

import { Trans, useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import type { TMetadataAIMode, TMetadataAISummary } from "../types";
import styles from "../MetadataAIPanel.module.scss";

type ReviewNotesProps = {
  mode: TMetadataAIMode;
  summary: TMetadataAISummary;
  hasEmptyFields: boolean;
};

const ReviewNotes = ({ mode, summary, hasEmptyFields }: ReviewNotesProps) => {
  const { t } = useTranslation(["Metadata"]);
  const { count, notFound, skipped, hasUndone } = summary;

  const getResult = () => {
    if (!count) {
      return hasUndone
        ? t("Metadata:AIChangesUndone")
        : t("Metadata:AINoChanges");
    }

    if (mode === "fill") {
      return count === 1
        ? t("Metadata:AIFilledFields_one", { count })
        : t("Metadata:AIFilledFields_other", { count });
    }

    return count === 1
      ? t("Metadata:AISuggestedFields_one", { count })
      : t("Metadata:AISuggestedFields_other", { count });
  };

  return (
    <div className={styles.notes} data-testid="metadata_ai_review_notes">
      <Text
        className={styles.notesTitle}
        fontSize="12px"
        fontWeight={600}
        lineHeight="16px"
      >
        {getResult()}
      </Text>
      {notFound.length ? (
        <Text className={styles.notesText} fontSize="12px" lineHeight="16px">
          <Trans
            t={t}
            ns="Metadata"
            i18nKey="AINotFound"
            values={{ fields: notFound.join(", ") }}
            components={{ strong: <strong /> }}
          />
        </Text>
      ) : null}
      {hasEmptyFields ? (
        <Text className={styles.notesText} fontSize="12px" lineHeight="16px">
          {t("Metadata:AIEmptyFieldsNotSaved")}
        </Text>
      ) : null}
      {skipped.length ? (
        <Text className={styles.notesText} fontSize="12px" lineHeight="16px">
          <Trans
            t={t}
            ns="Metadata"
            i18nKey="AISkipped"
            values={{ files: skipped.join(", ") }}
            components={{ strong: <strong /> }}
          />
        </Text>
      ) : null}
    </div>
  );
};

export default ReviewNotes;
