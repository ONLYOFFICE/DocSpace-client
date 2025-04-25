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

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TUserStatisticsDialogProps,
  TUserStatistics,
} from "./UserStatisticsDialog.types";
import styles from "./UserStatisticsDialog.module.scss";
import { UserStatisticsInfo } from "./sub-components";

const MOCK_STATISTICS: TUserStatistics = {
  limit: 50,
  editingCount: 40,
  docspaceCount: 37,
  externalCount: 3,
};

const fetchStatistics = (): Promise<TUserStatistics> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_STATISTICS);
    }, 1000);
  });
};

const UserStatisticsDialog: React.FC<TUserStatisticsDialogProps> = ({
  visible,
  onClose,
  onDownloadAndReport,
}) => {
  const { t } = useTranslation(["Payments"]);

  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<TUserStatistics | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStatistics();
        setStatistics(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  return (
    <ModalDialog
      isLarge
      zIndex={312}
      onClose={onClose}
      visible={visible}
      isLoading={isLoading}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("EditUserStatistics")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.modalBodyContent}>
          <div className={styles.textContainer}>
            <Text className={styles.text}>{t("EditAccessInfo")}</Text>
            <Text className={styles.text} fontWeight={600}>
              {t("EditUserDefinition")}
            </Text>
          </div>

          <UserStatisticsInfo t={t} statistics={statistics} />

          <Text className={styles.text}>{t("EditLimitReachedInfo")}</Text>

          <Link
            className={styles.link}
            isHovered
            fontSize="15"
            fontWeight={600}
          >
            {t("LearnHowItIsCounted")}
          </Link>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={t("DownloadAndOpenReport")}
          size={ButtonSize.normal}
          primary
          onClick={onDownloadAndReport}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default UserStatisticsDialog;
