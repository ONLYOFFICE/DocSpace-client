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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";

import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { getTenantExtra } from "@docspace/shared/api/portal";
import {
  TUserStatisticsDialogProps,
  TUserStatistics,
} from "./UserStatisticsDialog.types";
import styles from "./UserStatisticsDialog.module.scss";
import { UserStatisticsInfo } from "./sub-components/UserStatisticsInfo";
import { TDocServerLicense } from "api/portal/types";

const parseStatistics = (statistics: TDocServerLicense): TUserStatistics => {
  const { users_count, users_expire, connections } = statistics;

  return {
    limit: users_count + users_expire + connections,
    editingCount: users_count + connections,
    externalCount: connections,
    usersCount: users_count,
  };
};

const UserStatisticsDialog = ({
  onClose,
  onDownloadAndReport,
}: TUserStatisticsDialogProps) => {
  const { t } = useTranslation(["Payments"]);

  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [statistics, setStatistics] = useState<TUserStatistics | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      setIsLoading(true);
      try {
        const { docServerLicense: data } = await getTenantExtra();
        const statistics = parseStatistics(data);
        setStatistics(statistics);
      } catch (error) {
        toastr.error(error!);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <ModalDialog
      isLarge
      zIndex={312}
      onClose={handleClose}
      visible={visible}
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

          <Link
            className={styles.modalLink}
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
