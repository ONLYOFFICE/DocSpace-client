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

import { useTranslation } from "react-i18next";
import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { Button, ButtonSize } from "../../components/button";
import { Link, LinkTarget } from "../../components/link";
import { Text } from "../../components/text";
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
