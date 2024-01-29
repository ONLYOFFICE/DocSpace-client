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
  const { usedTotalStorageSizeCount, maxTotalSizeByQuota, standalone } = props;

  const { t } = useTranslation("Settings");
  const [isVisibleDialog, setIsVisibleChangeQuotaDialog] = useState();
  const [isDisableQuota, setIsDisableQuota] = useState();

  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);
  const totalSize =
    maxTotalSizeByQuota > 0 ? getConvertedSize(t, maxTotalSizeByQuota) : null;

  const ref = useRef(null);

  const getContextModel = () => {
    return [
      {
        key: "create",
        label: t("Common:ChangeQuota"),
        icon: ChangQuotaReactSvgUrl,
        onClick: () => {
          setIsVisibleChangeQuotaDialog(true);
          isDisableQuota && setIsDisableQuota(false);
        },
      },
      {
        key: "template-info",
        label: t("Common:DisableQuota"),
        icon: DisableQuotaReactSvgUrl,
        onClick: () => {
          setIsVisibleChangeQuotaDialog(true);
          setIsDisableQuota(true);
        },
      },
    ];
  };

  const onClickContextMenu = (e) => {
    ref.current.show(e);
  };
  const onSave = () => {
    setIsVisibleChangeQuotaDialog(false);
  };
  const onClose = () => {
    setIsVisibleChangeQuotaDialog(false);
  };
  const unlimitedStorageSize = maxTotalSizeByQuota === -1;

  return (
    <StyledDiscSpaceUsedComponent>
      {standalone && (
        <ChangeStorageQuotaDialog
          isDisableQuota={isDisableQuota}
          isVisible={isVisibleDialog}
          onSave={onSave}
          onClose={onClose}
        />
      )}
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

  const { standalone } = settingsStore;

  return {
    maxTotalSizeByQuota,
    usedTotalStorageSizeCount,
    standalone,
  };
})(observer(DiskSpaceUsedComponent));
