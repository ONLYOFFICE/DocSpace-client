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

import { ChangeQuotaDialog } from "SRC_DIR/components/dialogs";
import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";

const DiskSpaceUsedComponent = (props) => {
  const {
    usedTotalStorageSizeCount,
    maxTotalSizeByQuota,
    standalone,
    isSetQuota,
  } = props;

  const { t } = useTranslation("Settings");
  const [isVisibleDialog, setIsVisibleChangeQuotaDialog] = useState();
  const [size, setSize] = useState();

  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);
  const totalSize = getConvertedSize(t, maxTotalSizeByQuota);

  const onClick = () => {
    setIsVisibleChangeQuotaDialog(true);
  };
  const onSaveClick = () => {
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

  return (
    <StyledDiscSpaceUsedComponent>
      <ChangeQuotaDialog
        visible={isVisibleDialog}
        onSaveClick={onSaveClick}
        onCloseClick={onCloseClick}
        onSetQuotaBytesSize={onSetQuotaBytesSize}
        isDiskSpace
      />
      <StyledMainTitle fontSize="16px" fontWeight={700}>
        {t("DiskSpaceUsed")}
      </StyledMainTitle>
      <div className="disk-space_content">
        <div className="disk-space_size-info">
          {(!standalone || (standalone && isSetQuota)) && (
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
          {standalone && !isSetQuota && (
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
        <div className="disk-space_icon">
          <ContextMenu ref={ref} getContextModel={getContextModel} />
          <ContextMenuButton
            onClick={onClickContextMenu}
            getData={getContextModel}
            directionX="right"
            displayType="toggle"
          />
        </div>
      </div>
      <Diagram />
      <RecalculateButton />
    </StyledDiscSpaceUsedComponent>
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore, settingsStore } = auth;
  const { maxTotalSizeByQuota, usedTotalStorageSizeCount } = currentQuotaStore;

  const { standalone } = settingsStore;

  const isSetQuota = true;

  return {
    maxTotalSizeByQuota,
    usedTotalStorageSizeCount,
    isSetQuota,
    standalone,
  };
})(observer(DiskSpaceUsedComponent));
