import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { Text } from "@docspace/shared/components/text";
import { getConvertedSize } from "@docspace/shared/utils/common";

import Diagram from "./sub-components/Diagram";
import RecalculateButton from "./sub-components/RecalculateButton";
import {
  StyledDiscSpaceUsedComponent,
  StyledMainTitle,
} from "./StyledComponent";
import { ChangeQuotaDialog } from "SRC_DIR/components/dialogs";

const DiskSpaceUsedComponent = (props) => {
  const {
    usedTotalStorageSizeCount,
    maxTotalSizeByQuota,
    standalone,
    isSetQuota,
  } = props;

  const { t } = useTranslation("Settings");
  const [isVisibleDialog, setIsVisibleDialog] = useState();
  const [size, setSize] = useState();

  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);
  const totalSize = getConvertedSize(t, maxTotalSizeByQuota);

  const onClick = () => {
    setIsVisibleDialog(true);
  };
  const onSaveClick = () => {
    setIsVisibleDialog(false);
  };

  const onCloseClick = () => {
    setIsVisibleDialog(false);
  };

  const onSetQuotaBytesSize = (bytes) => {
    setSize(bytes);
  };
  return (
    <StyledDiscSpaceUsedComponent>
      <ChangeQuotaDialog
        visible={isVisibleDialog}
        onSaveClick={onSaveClick}
        onCloseClick={onCloseClick}
        onSetQuotaBytesSize={onSetQuotaBytesSize}
      />

      <StyledMainTitle fontSize="16px" fontWeight={700}>
        {t("DiskSpaceUsed")}
      </StyledMainTitle>
      {(!standalone || (standalone && isSetQuota)) && (
        <Text fontWeight={700} className="disk-space_title">
          {t("TotalStorage", {
            size: totalSize,
          })}
        </Text>
      )}
      <Text fontWeight={700} className="disk-space_title">
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
