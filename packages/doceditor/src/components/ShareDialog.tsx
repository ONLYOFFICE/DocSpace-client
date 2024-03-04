import React from "react";
import styled from "styled-components";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";

import Share from "@docspace/shared/components/share/Share.wrapper";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { NoUserSelect } from "@docspace/shared/utils/commonStyles";
import { Base, TTheme } from "@docspace/shared/themes";
import { TFile } from "@docspace/shared/api/files/types";

const StyledWrapper = styled.div`
  ${NoUserSelect}

  height: 100%;
  display: flex;
  flex-direction: column;

  .share-file_header {
    padding: 12px 16px;
    border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

    .share-file_heading {
      font-size: 21px;
      font-weight: 700;
      line-height: 28px;
    }
  }

  .share-file_body {
    padding: 16px;
  }

  .share-file_footer {
    margin-top: auto;
    padding: 16px;
    border-top: ${(props) => props.theme.filesPanels.sharing.borderBottom};
  }
`;

StyledWrapper.defaultProps = { theme: Base };

type SharingDialogProps = {
  fileInfo: TFile;
  onCancel: () => void;
  isVisible: boolean;
  theme: TTheme;
  i18n: i18n;
};

const SharingDialog = ({
  fileInfo,
  onCancel,
  isVisible,
  theme,
  i18n,
}: SharingDialogProps) => {
  const { t } = useTranslation(["Common"]);

  return (
    <>
      <Backdrop
        onClick={onCancel}
        visible={isVisible}
        zIndex={310}
        isAside={true}
        withoutBackground={false}
        withoutBlur={false}
      />
      <Aside visible={isVisible} onClose={onCancel} withoutBodyScroll>
        <StyledWrapper theme={theme}>
          <div className="share-file_header">
            <Text className="share-file_heading">{t("Common:Share")}</Text>
          </div>
          <div className="share-file_body">
            <Share infoPanelSelection={fileInfo} i18nProp={i18n} />
          </div>

          <div className="share-file_footer">
            <Button
              size={ButtonSize.normal}
              scale
              label={t("Common:CancelButton")}
              onClick={onCancel}
            />
          </div>
        </StyledWrapper>
      </Aside>
    </>
  );
};

export default SharingDialog;
