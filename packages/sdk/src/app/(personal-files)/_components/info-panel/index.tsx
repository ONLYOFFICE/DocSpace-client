// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import Share from "@docspace/shared/components/share";
import EditLinkPanel, {
  type EditLinkPanelRef,
} from "@docspace/shared/dialogs/EditLinkPanel";
import { getPortalPasswordSettings } from "@docspace/shared/api/settings";
import type { TPasswordSettings } from "@docspace/shared/api/settings/types";

import useDeviceType from "@/hooks/useDeviceType";
import { useInfoPanelStore } from "../../_store/InfoPanelStore";
import { useDocsUserStore } from "../../_store/DocsUserStore";
import { useShareData } from "../../_hooks/useShareData";

const ShareAside = observer(() => {
  const infoPanelStore = useInfoPanelStore();
  const docsUserStore = useDocsUserStore();
  const { t, i18n } = useTranslation(["Common"]);
  const { currentDeviceType } = useDeviceType();

  const editLinkRef = React.useRef<EditLinkPanelRef>(null);
  const [passwordSettings, setPasswordSettings] =
    React.useState<TPasswordSettings>();

  const {
    isVisible,
    selection,
    shareChanged,
    setShareChanged,
    editLinkPanelIsVisible,
    setEditLinkPanelIsVisible,
    linkParams,
    setLinkParams,
    setEmbeddingPanelData,
    close,
  } = infoPanelStore;

  const { filesLink } = useShareData({ selection: isVisible ? selection : null });

  const selfId = docsUserStore.user?.id ?? "";

  const handleGetPortalPasswordSettings = React.useCallback(async () => {
    try {
      const res = await getPortalPasswordSettings();
      setPasswordSettings(res);
    } catch (error) {
      console.error("Error fetching password settings:", error);
    }
  }, []);

  const closeEditLinkPanel = React.useCallback(() => {
    setEditLinkPanelIsVisible(false);
    setLinkParams(null);
  }, [setEditLinkPanelIsVisible, setLinkParams]);

  const onClose = React.useCallback(() => {
    if (editLinkRef.current?.hasChanges()) {
      editLinkRef.current?.openChangesDialog("close");
      return;
    }
    closeEditLinkPanel();
    close();
  }, [close, closeEditLinkPanel]);

  return (
    <>
      <ModalDialog
        withBorder
        withBodyScroll
        scrollbarCreateContext
        visible={isVisible}
        onClose={onClose}
        displayType={ModalDialogType.aside}
        containerVisible={editLinkPanelIsVisible}
      >
        <ModalDialog.Container>
          {linkParams && selection ? (
            <EditLinkPanel
              ref={editLinkRef}
              withBackButton
              item={selection}
              link={linkParams.link}
              language={i18n.language}
              visible={editLinkPanelIsVisible}
              setIsVisible={closeEditLinkPanel}
              updateLink={linkParams.updateLink}
              setLinkParams={setLinkParams}
              currentDeviceType={currentDeviceType}
              passwordSettings={passwordSettings}
              getPortalPasswordSettings={handleGetPortalPasswordSettings}
              onClose={onClose}
            />
          ) : null}
        </ModalDialog.Container>

        <ModalDialog.Header>{t("Common:Share")}</ModalDialog.Header>
        <ModalDialog.Body>
          {selection ? (
              <Share
                infoPanelSelection={selection}
                fileLinkProps={filesLink}
                selfId={selfId}
                shareChanged={shareChanged}
                setShareChanged={setShareChanged}
                setEditLinkPanelIsVisible={setEditLinkPanelIsVisible}
                setLinkParams={setLinkParams}
                setEmbeddingPanelData={setEmbeddingPanelData}
                disabledSharedUser
                hideLinkTypeSelector
              />
          ) : null}
        </ModalDialog.Body>
      </ModalDialog>
    </>
  );
});

export default ShareAside;
