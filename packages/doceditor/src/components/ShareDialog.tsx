// (c) Copyright Ascensio System SIA 2009-2024
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
import styled from "styled-components";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";

import Share from "@docspace/shared/components/share/Share.wrapper";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";
import { Text } from "@docspace/shared/components/text";
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
        </StyledWrapper>
      </Aside>
    </>
  );
};

export default SharingDialog;

