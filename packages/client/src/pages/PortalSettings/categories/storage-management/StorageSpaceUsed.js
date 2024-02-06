import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { Text } from "@docspace/shared/components/text";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { ContextMenu } from "@docspace/shared/components/context-menu";

import Diagram from "./sub-components/Diagram";
import RecalculateButton from "./sub-components/RecalculateButton";
import {
  StyledDiscSpaceUsedComponent,
  StyledMainTitle,
} from "./StyledComponent";

import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";
import ChangeStorageQuotaDialog from "SRC_DIR/components/dialogs/ChangeStorageQuotaDialog";

const DiskSpaceUsedComponent = (props) => {
  const {
    usedTotalStorageSizeCount,
    maxTotalSizeByQuota,
    standalone,
    isTenantCustomQuotaSet,
    portalInfo,
    updateTenantCustomQuota,
  } = props;

  const { t } = useTranslation("Settings");
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
      {standalone && (
        <ChangeStorageQuotaDialog
          isDisableQuota={isDisableQuota}
          isVisible={isVisibleDialog}
          updateFunction={updateFunction}
          onClose={onClose}
          portalInfo={portalInfo}
        />
      )}
      <StyledMainTitle fontSize="16px" fontWeight={700}>
        {t("DiskSpaceUsed")}
      </StyledMainTitle>
      <div className="disk-space_content">
        <div className="disk-space_size-info">
          {(!standalone || (standalone && isTenantCustomQuotaSet)) && (
            <Text
              fontWeight={700}
              fontSize={"14px"}
              className="disk-space_title"
            >
              {t("TotalStorage", {
                size: totalSize,
              })}
            </Text>
          )}
          <Text fontWeight={700} fontSize={"14px"} className="disk-space_title">
            {t("UsedStorage", {
              size: usedSize,
            })}
          </Text>
          {standalone && !isTenantCustomQuotaSet && (
            <ColorTheme
              themeId={ThemeId.Link}
              fontWeight={700}
              onClick={onChangeDialogClick}
              className="disk-space_link"
            >
              {t("Common:ManageStorageQuota")}
            </ColorTheme>
          )}
        </div>
        {standalone && isTenantCustomQuotaSet && (
          <div className="disk-space_icon">
            <ContextMenu ref={ref} getContextModel={getContextModel} />
            <ContextMenuButton
              onClick={onClickContextMenu}
              getData={getContextModel}
              directionX="right"
              displayType="toggle"
            />
          </div>
        )}
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
  }
)(observer(DiskSpaceUsedComponent));
