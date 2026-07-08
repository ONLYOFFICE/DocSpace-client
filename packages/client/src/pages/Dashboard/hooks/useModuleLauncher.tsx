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
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import type { AppId } from "SRC_DIR/helpers/apps-catalog";

import { InstallAiFormsDialog } from "../InstallModuleDialog";
import { InstallAiArbiterDialog } from "../InstallAiArbiterDialog";
import { EnableAiRoomsDialog } from "../EnableAiRoomsDialog";

type ModuleLauncherDeps = {
  // Re-enables a previously configured app; resolves false when the server
  // reports no configuration yet, signalling that the install dialog is needed.
  activate: (id: string) => Promise<boolean>;
  enable: (id: string, enabled: boolean) => Promise<unknown>;
  isAppEnabled: (id: string) => boolean;
};

type UseModuleLauncher = {
  // Resolves a module-card click: confirms the app is configured and either
  // navigates to it or opens the matching install/enable dialog.
  launchApp: (modId: AppId, href?: string) => Promise<void>;
  // Rendered install/enable dialogs — drop this once into the page tree.
  dialogs: React.ReactElement;
};

export const useModuleLauncher = ({
  activate,
  enable,
  isAppEnabled,
}: ModuleLauncherDeps): UseModuleLauncher => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  const [aiFormsDialogVisible, setAiFormsDialogVisible] = React.useState(false);
  const [arbiterDialogVisible, setArbiterDialogVisible] = React.useState(false);
  const [enableAiRoomsVisible, setEnableAiRoomsVisible] = React.useState(false);
  const [enableAiRoomsLoading, setEnableAiRoomsLoading] = React.useState(false);

  // Activate `id`, navigating to `href` on success and opening `openDialog`
  // when the app still needs setup. Shared by every activate-then-route app.
  const activateOrSetup = React.useCallback(
    async (id: AppId, href: string, openDialog: () => void) => {
      try {
        const activated = await activate(id);
        if (activated) navigate(href);
        else openDialog();
      } catch (err) {
        console.error(`Failed to activate ${id}`, err);
        toastr.error(t("Common:SomethingWentWrong"));
      }
    },
    [activate, navigate, t],
  );

  const launchApp = React.useCallback(
    async (modId: AppId, href?: string) => {
      // Apps may be shown as installed yet still lack their per-tenant
      // configuration, so we never navigate on the cached `installed` flag.
      // Each branch confirms setup (via `activate`) and opens the install
      // dialog when configuration is still missing.
      if (modId === "ai-forms") {
        await activateOrSetup("ai-forms", "/ai-forms", () =>
          setAiFormsDialogVisible(true),
        );
        return;
      }

      if (modId === "ai-arbiter") {
        await activateOrSetup("ai-arbiter", "/ai-arbiter", () =>
          setArbiterDialogVisible(true),
        );
        return;
      }

      if (modId === "ai-agents") {
        try {
          const activated = await activate("ai-agents");
          if (activated) navigate("/agents");
          else toastr.error(t("Common:SomethingWentWrong"));
        } catch (err) {
          console.error("Failed to activate ai-agents", err);
          toastr.error(t("Common:SomethingWentWrong"));
        }
        return;
      }

      if (modId === "ai-rooms") {
        setEnableAiRoomsVisible(true);
        return;
      }

      if (modId === "e2e-rooms") {
        try {
          if (!isAppEnabled("e2e-rooms")) {
            await enable("e2e-rooms", true);
          }
          navigate("/e2e-rooms");
        } catch (err) {
          console.error("Failed to enable e2e-rooms", err);
          toastr.error(t("Common:SomethingWentWrong"));
        }
        return;
      }

      // Always-on apps (e.g. ai-files) need no per-tenant setup — open directly.
      if (href) {
        navigate(href);
        return;
      }

      toastr.info(t("Common:UnderDevelopment"));
    },
    [activate, activateOrSetup, enable, isAppEnabled, navigate, t],
  );

  const handleConfirmEnableAiRooms = React.useCallback(async () => {
    setEnableAiRoomsLoading(true);
    try {
      await enable("ai-rooms", true);
      setEnableAiRoomsVisible(false);
      navigate("/ai-rooms");
    } catch (err) {
      console.error("Failed to enable ai-rooms", err);
      toastr.error(t("Common:SomethingWentWrong"));
    } finally {
      setEnableAiRoomsLoading(false);
    }
  }, [enable, navigate, t]);

  const dialogs = (
    <>
      <InstallAiFormsDialog
        visible={aiFormsDialogVisible}
        onClose={() => setAiFormsDialogVisible(false)}
        onInstalled={() => {
          setAiFormsDialogVisible(false);
          navigate("/ai-forms");
        }}
      />
      <InstallAiArbiterDialog
        visible={arbiterDialogVisible}
        onClose={() => setArbiterDialogVisible(false)}
        onInstalled={() => {
          setArbiterDialogVisible(false);
          navigate("/ai-arbiter");
        }}
      />
      <EnableAiRoomsDialog
        visible={enableAiRoomsVisible}
        isLoading={enableAiRoomsLoading}
        onClose={() => setEnableAiRoomsVisible(false)}
        onConfirm={handleConfirmEnableAiRooms}
      />
    </>
  );

  return { launchApp, dialogs };
};

export default useModuleLauncher;
