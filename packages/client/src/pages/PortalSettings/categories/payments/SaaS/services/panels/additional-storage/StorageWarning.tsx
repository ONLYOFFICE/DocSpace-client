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

import React from "react";

import { inject, observer } from "mobx-react";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg";

import { Text } from "@docspace/ui-kit/components/text";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import styles from "../../styles/StorageSummary.module.scss";
import { useServicesActions } from "../../hooks/useServicesActions";
import { Link } from "@docspace/ui-kit/components";

type StorageWarningProps = {
  currentStoragePlanSize?: number;
  title?: string;
  onCancelChange?: () => void;
  isCancelLoading?: boolean;
  style?: React.CSSProperties;
};

const StorageWarning: React.FC<StorageWarningProps> = ({
  currentStoragePlanSize,
  title,
  onCancelChange,
  isCancelLoading,
  style,
}) => {
  const { t } = useServicesActions();

  const isCancellationMode = !!onCancelChange;

  return (
    <div className={styles.warningBlock} style={style}>
      <div className={styles.warningTitle}>
        <InfoIcon />
        {title ? (
          <Text fontWeight={600} className={styles.warningColor}>
            {title}
          </Text>
        ) : (
          <Text fontWeight={600}>{t("Important")}</Text>
        )}
      </div>

      <Text>
        {t("Warning", {
          amount: `${currentStoragePlanSize} ${t("Common:Gigabyte")}`,
          storageUnit: t("Common:Gigabyte"),
        })}
      </Text>

      {isCancellationMode ? (
        <div className={styles.cancelChangeRow}>
          <Link
            textDecoration="underline dashed"
            onClick={isCancelLoading ? () => {} : onCancelChange}
            fontWeight={600}
            color="accent"
          >
            {t("Payments:CancelChange")}
          </Link>
          {isCancelLoading ? (
            <div className={styles.loaderContainer}>
              <Loader
                color=""
                size="16px"
                type={LoaderTypes.track}
                className={styles.refreshLoader}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default inject(({ currentTariffStatusStore }: TStore) => {
  const { currentStoragePlanSize } = currentTariffStatusStore;

  return {
    currentStoragePlanSize,
  };
})(observer(StorageWarning));
