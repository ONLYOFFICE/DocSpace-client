/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
