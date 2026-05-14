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

import EditLinkPanel from "@docspace/shared/dialogs/EditLinkPanel";
import { getPortalPasswordSettings } from "@docspace/shared/api/settings";
import type { TPasswordSettings } from "@docspace/shared/api/settings/types";

import useDeviceType from "@/hooks/useDeviceType";
import { useInfoPanelStore } from "../../_store/InfoPanelStore";

import InfoPanelHeader from "./Header";
import InfoPanelBody from "./Body";

export { InfoPanelHeader, InfoPanelBody };

/**
 * EditLinkPanel is rendered as a sibling top-level dialog,
 * driven by InfoPanelStore.editLinkPanelIsVisible.
 */
export const InfoPanelEditLinkDialog = observer(() => {
  const infoPanelStore = useInfoPanelStore();
  const { currentDeviceType } = useDeviceType();
  const { i18n } = useTranslation();

  const {
    editLinkPanelIsVisible,
    setEditLinkPanelIsVisible,
    linkParams,
    setLinkParams,
    selection,
  } = infoPanelStore;

  const [passwordSettings, setPasswordSettings] =
    React.useState<TPasswordSettings>();

  const handleGetPortalPasswordSettings = React.useCallback(async () => {
    try {
      const res = await getPortalPasswordSettings();
      setPasswordSettings(res);
    } catch (error) {
      console.error("Error fetching password settings:", error);
    }
  }, []);

  const onClose = React.useCallback(() => {
    setEditLinkPanelIsVisible(false);
    setLinkParams(null);
  }, [setEditLinkPanelIsVisible, setLinkParams]);

  if (!editLinkPanelIsVisible || !linkParams || !selection) return null;

  return (
    <EditLinkPanel
      withBackButton
      item={selection}
      link={linkParams.link}
      language={i18n.language}
      visible={editLinkPanelIsVisible}
      setIsVisible={setEditLinkPanelIsVisible}
      updateLink={linkParams.updateLink}
      setLinkParams={setLinkParams}
      currentDeviceType={currentDeviceType}
      passwordSettings={passwordSettings}
      getPortalPasswordSettings={handleGetPortalPasswordSettings}
      onClose={onClose}
    />
  );
});

export default InfoPanelBody;
