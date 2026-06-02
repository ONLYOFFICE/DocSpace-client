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

import React from "react";
import { inject, observer } from "mobx-react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";

import SdkIframe, {
  type SdkIframeHandle,
} from "SRC_DIR/components/SdkIframe";
import { InstallAiFormsDialog } from "SRC_DIR/pages/Dashboard/InstallModuleDialog";
import type { AiFormsSettings } from "SRC_DIR/pages/Dashboard/utils";

const SECTION_TO_PATH: Record<string, string> = {
  "in-progress": "/sdk/forms/in-progress",
  "completed-forms": "/sdk/forms/completed-forms",
  library: "/sdk/forms/library",
  settings: "/sdk/forms/settings",
};

const HOST_SECTIONS = new Set([
  "in-progress",
  "completed-forms",
  "library",
  "settings",
]);

const SECTION_TO_SDK: Record<string, string> = {
  "": "my-forms",
  "in-progress": "in-progress",
  "completed-forms": "completed-forms",
  library: "library",
  settings: "settings",
};

type AiFormsProps = {
  roomId: number | null;
  ensureAppsLoaded: () => void;
  fetchAppSettings: <T extends Record<string, unknown>>(
    id: string,
  ) => Promise<T | null>;
};

const AiForms = ({
  roomId,
  ensureAppsLoaded,
  fetchAppSettings,
}: AiFormsProps) => {
  const { t } = useTranslation(["Common"]);
  useDocumentTitle("Common:DashboardFormsTitle");
  const [searchParams, setSearchParams] = useSearchParams();
  const [settingsChecked, setSettingsChecked] = React.useState(false);
  const [showSetupDialog, setShowSetupDialog] = React.useState(false);
  const iframeRef = React.useRef<SdkIframeHandle | null>(null);
  const lastSdkSectionRef = React.useRef<string | null>(null);
  const initialSrcRef = React.useRef<string | null>(null);

  const searchParamsRef = React.useRef(searchParams);
  searchParamsRef.current = searchParams;
  const setSearchParamsRef = React.useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const handleSdkNavigate = React.useCallback((nextSection: string) => {
    lastSdkSectionRef.current = nextSection;
    const sp = searchParamsRef.current;
    const current = sp.get("section") ?? "";
    const target = HOST_SECTIONS.has(nextSection) ? nextSection : "";
    if (current === target) return;

    const next = new URLSearchParams(sp);
    if (target) next.set("section", target);
    else next.delete("section");
    setSearchParamsRef.current(next, { replace: true });
  }, []);

  const hostSection = searchParams.get("section") ?? "";
  const sdkSection = SECTION_TO_SDK[hostSection] ?? "my-forms";

  React.useEffect(() => {
    if (lastSdkSectionRef.current === sdkSection) return;
    iframeRef.current?.call("navigateSection", { section: sdkSection });
  }, [sdkSection]);

  React.useEffect(() => {
    ensureAppsLoaded();
  }, [ensureAppsLoaded]);

  // Always verify configuration against the server before deciding whether
  // to open the install flow — the cache may be empty on direct navigation.
  React.useEffect(() => {
    let cancelled = false;
    fetchAppSettings<AiFormsSettings>("ai-forms")
      .catch(() => null)
      .then((settings) => {
        if (cancelled) return;
        setShowSetupDialog(!settings?.roomId);
        setSettingsChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchAppSettings]);

  const handleSetupComplete = () => {
    setShowSetupDialog(false);
  };

  if (!settingsChecked) return null;

  if (roomId === null) {
    return (
      <>
        <InstallAiFormsDialog
          visible={showSetupDialog}
          onClose={handleSetupComplete}
          onInstalled={handleSetupComplete}
          skipConfirm={true}
        />
      </>
    );
  }

  if (initialSrcRef.current === null) {
    const basePath = SECTION_TO_PATH[hostSection] ?? "/sdk/forms/my-forms";
    const params = new URLSearchParams({ showMenu: "false" });
    if (roomId !== null) params.set("roomId", String(roomId));
    initialSrcRef.current = `${basePath}?${params}`;
  }

  return (
    <SdkIframe
      apiRef={iframeRef}
      src={initialSrcRef.current}
      title={t("Common:DashboardFormsTitle")}
      onNavigate={handleSdkNavigate}
    />
  );
};

const AiFormsConnected = inject<TStore>(({ appsStore }) => ({
  roomId: appsStore.getSettings<AiFormsSettings>("ai-forms")?.roomId ?? null,
  ensureAppsLoaded: appsStore.ensureLoaded,
  fetchAppSettings: appsStore.fetchAppSettings,
}))(observer(AiForms));

export { AiFormsConnected as AiForms };

export default AiFormsConnected;

