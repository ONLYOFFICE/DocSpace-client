import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { Text } from "@docspace/shared/components/text";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { toastr } from "@docspace/shared/components/toast";

import Diagram from "./sub-components/Diagram";
import RecalculateButton from "./sub-components/RecalculateButton";
import {
  StyledDiscSpaceUsedComponent,
  StyledMainTitle,
} from "./StyledComponent";

import { ChangeQuotaDialog } from "SRC_DIR/components/dialogs";
import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";
import { setTenantQuotaSettings } from "@docspace/shared/api/settings";

const DiskSpaceUsedComponent = (props) => {
  const {
    usedTotalStorageSizeCount,
    maxTotalSizeByQuota,
    standalone,
    portalInfo,
  } = props;

  const { t } = useTranslation("Settings");
  const [isVisibleDialog, setIsVisibleChangeQuotaDialog] = useState();
  const [size, setSize] = useState();
  const [isLoading, setIsLoading] = useState();

  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);
  const totalSize =
    maxTotalSizeByQuota > 0 ? getConvertedSize(t, maxTotalSizeByQuota) : null;

  const onClick = () => {
    setIsVisibleChangeQuotaDialog(true);
  };
  const onSaveClick = async () => {
    setIsLoading(true);

    try {
      await setTenantQuotaSettings({
        TenantId: portalInfo.tenantId,
        Quota: size,
      });

      toastr.success(t("Common:StorageQuotaSet"));
    } catch (e) {
      toastr.error(e);
    }

    setIsLoading(false);
    setIsVisibleChangeQuotaDialog(false);
  };

  const onCloseClick = () => {
    setIsVisibleChangeQuotaDialog(false);
  };

  const onSetQuotaBytesSize = (bytes) => {
    setSize(bytes);
  };

  const ref = useRef(null);

  const getContextModel = () => {
    return [
      {
        key: "create",
        label: t("Common:ChangeQuota"),
        icon: ChangQuotaReactSvgUrl,
        onClick: () => setIsVisibleChangeQuotaDialog(true),
      },
      {
        key: "template-info",
        label: t("Common:DisableQuota"),
        icon: DisableQuotaReactSvgUrl,
      },
    ];
  };

  const onClickContextMenu = (e) => {
    ref.current.show(e);
  };

  const unlimitedStorageSize = maxTotalSizeByQuota === -1;

  return (
    <StyledDiscSpaceUsedComponent>
      <ChangeQuotaDialog
        visible={isVisibleDialog}
        onSaveClick={onSaveClick}
        onCloseClick={onCloseClick}
        onSetQuotaBytesSize={onSetQuotaBytesSize}
        isLoading={isLoading}
        isDiskSpace
      />
      <StyledMainTitle fontSize="16px" fontWeight={700}>
        {t("DiskSpaceUsed")}
      </StyledMainTitle>
      <div className="disk-space_content">
        <div className="disk-space_size-info">
          {(!standalone || (standalone && !unlimitedStorageSize)) && (
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
          {standalone && unlimitedStorageSize && (
            <ColorTheme
              themeId={ThemeId.Link}
              fontWeight={700}
              onClick={onClick}
              className="disk-space_link"
            >
              {t("Common:ManageStorageQuota")}
            </ColorTheme>
          )}
        </div>
        {standalone && !unlimitedStorageSize && (
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

export default inject(({ auth, storageManagement }) => {
  const { currentQuotaStore, settingsStore } = auth;
  const { maxTotalSizeByQuota, usedTotalStorageSizeCount } = currentQuotaStore;
  const { portalInfo } = storageManagement;
  const { standalone } = settingsStore;

  return {
    maxTotalSizeByQuota,
    usedTotalStorageSizeCount,
    portalInfo,
    standalone,
  };
})(observer(DiskSpaceUsedComponent));
