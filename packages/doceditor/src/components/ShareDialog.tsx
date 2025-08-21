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

import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/min/locales.min";
import Share from "@docspace/shared/components/share";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { NoUserSelect } from "@docspace/shared/utils/commonStyles";
import { TFile } from "@docspace/shared/api/files/types";
import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledWrapper = styled.div.attrs(injectDefaultTheme)`
  ${NoUserSelect}
  margin-top: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

type SharingDialogProps = {
  fileInfo: TFile;
  onCancel: () => void;
  isVisible: boolean;
  onOpenPanel: () => void;
  selfId?: string;
};

const SharingDialog = ({
  fileInfo,
  onCancel,
  isVisible,
  selfId,
  onOpenPanel,
}: SharingDialogProps) => {
  const { t, i18n } = useTranslation(["Common"]);

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  return (
    <ModalDialog
      visible={isVisible}
      onClose={onCancel}
      displayType={ModalDialogType.aside}
      withBodyScroll
      withBorder
    >
      <ModalDialog.Header>{t("Common:Share")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledWrapper>
          <div className="share-file_body">
            <Share
              infoPanelSelection={fileInfo}
              selfId={selfId ?? ""}
              onOpenPanel={onOpenPanel}
              onlyOneLink={fileInfo.isForm}
            />
          </div>
        </StyledWrapper>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default SharingDialog;
