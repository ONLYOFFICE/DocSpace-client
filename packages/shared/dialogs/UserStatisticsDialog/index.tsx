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

import { useTranslation } from "react-i18next";
import { ModalDialog, ModalDialogType } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { TUserStatisticsDialogProps } from "./UserStatisticsDialog.types";
import styles from "./UserStatisticsDialog.module.scss";
import { UserStatisticsInfo } from "./sub-components/UserStatisticsInfo";

const UserStatisticsDialog = ({
  onClose,
  isLoading,
  isVisible,
  statistics,
  docspaceFaqUrl,
  onDownloadAndReport,
}: TUserStatisticsDialogProps) => {
  const { t } = useTranslation(["Common"]);

  if (!statistics) {
    return null;
  }

  return (
    <ModalDialog
      isLarge
      zIndex={312}
      onClose={onClose}
      visible={isVisible}
      isLoading={isLoading}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("EditUserStatistics")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.modalBodyContent}>
          <div className={styles.textContainer}>
            <Text lineHeight="20px">{t("EditAccessInfo")}</Text>
            <Text lineHeight="20px" fontWeight={600}>
              {t("EditUserDefinition")}
            </Text>
          </div>

          <UserStatisticsInfo statistics={statistics} />

          <Text lineHeight="20px">{t("EditLimitReachedInfo")}</Text>

          {docspaceFaqUrl ? (
            <Link
              className={styles.modalLink}
              isHovered
              fontSize="15"
              target={LinkTarget.blank}
              href={docspaceFaqUrl}
              fontWeight={600}
              dataTestId="learn_how_counted_link"
            >
              {t("LearnHowItIsCounted")}
            </Link>
          ) : null}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className={styles.openReport}
          key="OkButton"
          label={t("DownloadAndOpenReport")}
          size={ButtonSize.normal}
          primary
          onClick={onDownloadAndReport}
          testId="download_and_open_report_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default UserStatisticsDialog;
