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

import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { useAppsCatalog } from "SRC_DIR/helpers/apps-catalog";
import type AppsStore from "SRC_DIR/store/AppsStore";

import styles from "./Apps.module.scss";

type AppsProps = {
  isInstalled?: AppsStore["isInstalled"];
  isLoaded?: boolean;
  enable?: AppsStore["enable"];
  ensureLoaded?: AppsStore["ensureLoaded"];
};

// Settings -> Apps (standalone only): switches the sidebar sections on and off
// for the whole portal. A switched-off app moves to the sidebar's
// "Not installed" group, and its URLs redirect to the dashboard.
const Apps = ({
  isInstalled,
  isLoaded = false,
  enable,
  ensureLoaded,
}: AppsProps) => {
  const { t, ready } = useTranslation(["Settings", "Common"]);
  const apps = useAppsCatalog();
  // The app whose switch is being saved, so it cannot be flipped twice.
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  useEffect(() => {
    ensureLoaded?.();
  }, [ensureLoaded]);

  useEffect(() => {
    if (ready) setDocumentTitle(t("Common:AppsSectionTitle"));
  }, [ready, t]);

  const handleToggle = async (id: string, next: boolean) => {
    setPendingId(id);
    try {
      await enable?.(id, next);
    } catch (err) {
      console.error(`Failed to ${next ? "enable" : "disable"} app ${id}`, err);
      toastr.error(t("Common:SomethingWentWrong"));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className={styles.body}>
      <Text as="p" className={styles.description}>
        {t("Settings:AppsDescription")}
      </Text>

      <div className={styles.list}>
        {apps.map((app) => {
          const enabled = app.alwaysOn || (isInstalled?.(app.id) ?? true);
          // `isInstalled` is optimistic until the list arrives (and stays so
          // if it fails to load), so a switch is locked until it shows the
          // real state rather than letting an admin flip a guess.
          const isLocked = app.alwaysOn || !isLoaded || pendingId === app.id;

          return (
            <div
              key={app.id}
              className={styles.item}
              data-testid={`settings-app-${app.id}`}
            >
              <span className={styles.icon} data-enabled={enabled}>
                {app.icon}
              </span>
              <div className={styles.info}>
                <Text as="p" className={styles.title} isBold>
                  {app.title}
                </Text>
                <Text as="p" className={styles.itemDescription}>
                  {app.description}
                </Text>
              </div>
              <ToggleButton
                className={styles.toggle}
                isChecked={enabled}
                isDisabled={isLocked}
                onChange={() => handleToggle(app.id, !enabled)}
                dataTestId={`settings-app-toggle-${app.id}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Component = inject(({ appsStore }: TStore) => ({
  isInstalled: appsStore.isInstalled,
  isLoaded: appsStore.isLoaded,
  enable: appsStore.enable,
  ensureLoaded: appsStore.ensureLoaded,
}))(observer(Apps));

export default Component;
