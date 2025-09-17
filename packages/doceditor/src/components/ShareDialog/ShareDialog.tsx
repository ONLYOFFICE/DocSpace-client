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

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";

import moment from "moment";
import "moment/min/locales.min";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import Share from "@docspace/shared/components/share";
import { injectDefaultTheme } from "@docspace/shared/utils";
import { getPortalPasswordSettings } from "@docspace/shared/api/settings";
import type { TFile } from "@docspace/shared/api/files/types";
import { NoUserSelect } from "@docspace/shared/utils/commonStyles";
import EditLinkPanel, {
  type EditLinkPanelRef,
} from "@docspace/shared/dialogs/EditLinkPanel";
import type { LinkParamsType, Nullable } from "@docspace/shared/types";
import { DeviceType } from "@docspace/shared/enums";
import { TPasswordSettings } from "@docspace/shared/api/settings/types";

const StyledWrapper = styled.div.attrs(injectDefaultTheme)`
  ${NoUserSelect}
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
  const ref = useRef<EditLinkPanelRef>(null);
  const [editLinkPanelVisible, setEditLinkPanelVisible] = useState(false);
  const [linkParams, setLinkParams] = useState<Nullable<LinkParamsType>>(null);
  const [passwordSettings, setPasswordSettings] = useState<TPasswordSettings>();

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  // Wrapper function to match the expected type for EditLinkPanel
  const handleGetPortalPasswordSettings = async (): Promise<void> => {
    try {
      const res = await getPortalPasswordSettings();
      setPasswordSettings(res);
    } catch (error) {
      console.error("Error fetching password settings:", error);
    }
  };

  const handleSetEditLinkPanelIsVisible = (value: boolean): void => {
    setEditLinkPanelVisible(value);
  };

  const closeEditLinkPanel = () => {
    setEditLinkPanelVisible(false);
    setLinkParams(null);
  };

  const onClosePanel = () => {
    if (ref.current?.hasChanges()) {
      ref.current?.openChangesDialog("close");
      return;
    }

    closeEditLinkPanel();
    onCancel();
  };

  return (
    <ModalDialog
      withBorder
      withBodyScroll
      visible={isVisible}
      scrollbarCreateContext
      onClose={onClosePanel}
      displayType={ModalDialogType.aside}
      containerVisible={editLinkPanelVisible}
    >
      <ModalDialog.Container>
        {linkParams ? (
          <EditLinkPanel
            ref={ref}
            withBackButton
            item={fileInfo}
            link={linkParams.link}
            language={i18n.language}
            visible={editLinkPanelVisible}
            setIsVisible={closeEditLinkPanel}
            updateLink={linkParams.updateLink}
            setLinkParams={setLinkParams}
            currentDeviceType={DeviceType.desktop}
            passwordSettings={passwordSettings}
            getPortalPasswordSettings={handleGetPortalPasswordSettings}
            onClose={onClosePanel}
          />
        ) : null}
      </ModalDialog.Container>

      <ModalDialog.Header>{t("Common:Share")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledWrapper>
          <div className="share-file_body">
            <Share
              isEditor
              infoPanelSelection={fileInfo}
              selfId={selfId ?? ""}
              onOpenPanel={onOpenPanel}
              onlyOneLink={fileInfo.isForm}
              setEditLinkPanelIsVisible={handleSetEditLinkPanelIsVisible}
              setLinkParams={setLinkParams}
            />
          </div>
        </StyledWrapper>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default SharingDialog;
