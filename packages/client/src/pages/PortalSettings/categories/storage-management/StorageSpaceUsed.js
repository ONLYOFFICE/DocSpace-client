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

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { ChangeStorageQuotaDialog } from "@docspace/shared/dialogs/change-storage-quota";
import { Link } from "@docspace/shared/components/link";

import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";

import Diagram from "./sub-components/Diagram";
import RecalculateButton from "./sub-components/RecalculateButton";
import {
  StyledDiscSpaceUsedComponent,
  StyledMainTitle,
} from "./StyledComponent";

const DiskSpaceUsedComponent = (props) => {
  const {
    usedTotalStorageSizeCount,
    maxTotalSizeByQuota,
    standalone,
    isTenantCustomQuotaSet,
    portalInfo,
    updateTenantCustomQuota,
  } = props;

  const { t } = useTranslation(["Settings", "Common"]);
  const [isVisibleDialog, setIsVisibleChangeQuotaDialog] = useState();
  const [isDisableQuota, setIsDisableQuota] = useState();

  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);
  const totalSize =
    maxTotalSizeByQuota > 0 ? getConvertedSize(t, maxTotalSizeByQuota) : null;

  const ref = useRef(null);

  const onChangeDialogClick = () => {
    setIsVisibleChangeQuotaDialog(true);
    isDisableQuota && setIsDisableQuota(false);
  };
  const onDisableDialogClick = () => {
    setIsVisibleChangeQuotaDialog(true);
    setIsDisableQuota(true);
  };
  const getContextModel = () => {
    return [
      {
        key: "change-quota",
        label: t("Common:ChangeQuota"),
        icon: ChangQuotaReactSvgUrl,
        onClick: onChangeDialogClick,
      },
      {
        key: "disable-quota",
        label: t("Common:DisableQuota"),
        icon: DisableQuotaReactSvgUrl,
        onClick: onDisableDialogClick,
      },
    ];
  };

  const onClickContextMenu = (e) => {
    ref.current.show(e);
  };
  const updateFunction = (storage) => {
    updateTenantCustomQuota(storage);
  };

  const onClose = () => {
    setIsVisibleChangeQuotaDialog(false);
  };

  return (
    <StyledDiscSpaceUsedComponent>
      {standalone && isVisibleDialog ? (
        <ChangeStorageQuotaDialog
          isDisableQuota={isDisableQuota}
          isVisible={isVisibleDialog}
          updateFunction={updateFunction}
          onClose={onClose}
          portalInfo={portalInfo}
        />
      ) : null}
      <StyledMainTitle fontSize="16px" fontWeight={700}>
        {t("DiskSpaceUsed")}
      </StyledMainTitle>
      <div className="disk-space_content">
        <div className="disk-space_size-info">
          {!standalone || (standalone && isTenantCustomQuotaSet) ? (
            <Text fontWeight={400} fontSize="14px" className="disk-space_title">
              {t("TotalStorage", {
                size: totalSize,
              })}
            </Text>
          ) : null}
          <Text fontWeight={400} fontSize="14px" className="disk-space_title">
            {t("UsedStorage", {
              size: usedSize,
            })}
          </Text>
          {standalone && !isTenantCustomQuotaSet ? (
            <Link
              fontWeight={600}
              onClick={onChangeDialogClick}
              className="disk-space_link"
              color="accent"
              dataTestId="disk_space_link"
            >
              {t("Common:ManageStorageQuota")}
            </Link>
          ) : null}
        </div>
        {standalone && isTenantCustomQuotaSet ? (
          <div className="disk-space_icon">
            <ContextMenu
              dataTestId="disk_space_context_menu"
              ref={ref}
              getContextModel={getContextModel}
            />
            <ContextMenuButton
              onClick={onClickContextMenu}
              getData={getContextModel}
              directionX="right"
              displayType="toggle"
              testId="disk_space_context_menu_button"
            />
          </div>
        ) : null}
      </div>
      <Diagram />
      <RecalculateButton />
    </StyledDiscSpaceUsedComponent>
  );
};

export default inject(
  ({ settingsStore, currentQuotaStore, storageManagement }) => {
    const {
      isTenantCustomQuotaSet,
      usedTotalStorageSizeCount,
      maxTotalSizeByQuota: maxSizeByTariff,
      tenantCustomQuota,
      updateTenantCustomQuota,
    } = currentQuotaStore;
    const { portalInfo } = storageManagement;
    const { standalone } = settingsStore;

    const maxTotalSizeByQuota = standalone
      ? tenantCustomQuota
      : maxSizeByTariff;

    return {
      isTenantCustomQuotaSet,
      usedTotalStorageSizeCount,
      standalone,
      maxTotalSizeByQuota,
      portalInfo,
      updateTenantCustomQuota,
    };
  },
)(observer(DiskSpaceUsedComponent));
