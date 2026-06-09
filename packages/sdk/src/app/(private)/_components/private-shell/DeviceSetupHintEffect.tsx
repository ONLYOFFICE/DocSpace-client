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

// PARITY-SOURCE: packages/client/src/components/EncryptionProviderWrapper.jsx
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko

"use client";

import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { useEncryption } from "@docspace/shared/context/encryption";
import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";

const DEVICE_SETUP_HINT_SESSION_KEY = "encryption-device-setup-hint-shown";

// In (private) the whole route is encryption-aware, so we don't gate by
// selectedFolderStore.private the way the main-client wrapper does. We only
// suppress the toast once the user already has a configured envelope.
const DeviceSetupHintEffect: React.FC = () => {
  const { hasConfiguredKey } = useEncryption();
  const { t } = useTranslation(["Common"]);

  React.useEffect(() => {
    if (hasConfiguredKey) return;
    try {
      if (sessionStorage.getItem(DEVICE_SETUP_HINT_SESSION_KEY) === "1") return;
      sessionStorage.setItem(DEVICE_SETUP_HINT_SESSION_KEY, "1");
    } catch {
      // sessionStorage throws in private-mode Safari; fall through.
    }

    toastr.info(
      <Trans
        i18nKey="Common:EncryptionDeviceSetupHint"
        t={t}
        components={[
          <Link
            key="setup"
            tag="a"
            isHovered
            color="accent"
            onClick={() => {
              toastr.clear();
              window.open("/profile/keys-management", "_blank");
            }}
          />,
        ]}
      />,
      null,
      30000,
      true,
    );
  }, [hasConfiguredKey, t]);

  return null;
};

export default DeviceSetupHintEffect;
