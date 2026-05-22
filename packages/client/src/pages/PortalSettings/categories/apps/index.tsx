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

import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getBrandName } from "@docspace/shared/constants/brands";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { useAppsCatalog } from "SRC_DIR/helpers/apps-catalog";
import AppsStore from "SRC_DIR/store/AppsStore";

import {
  InstallAiFormsDialog,
  InstallDocsCloudDialog,
} from "../../../Dashboard/InstallModuleDialog";

import styles from "./Apps.module.scss";

type AppsProps = {
  isEnabled?: AppsStore["isEnabled"];
  enable?: AppsStore["enable"];
  activate?: AppsStore["activate"];
  uninstallAiForms?: AppsStore["uninstallAiForms"];
  uninstallDocsCloud?: AppsStore["uninstallDocsCloud"];
  ensureLoaded?: AppsStore["ensureLoaded"];
};

const Apps = ({
  isEnabled,
  enable,
  activate,
  uninstallAiForms,
  uninstallDocsCloud,
  ensureLoaded,
}: AppsProps) => {
  const { t, ready } = useTranslation(["Settings", "Common", "OAuth"]);
  const navigate = useNavigate();
  const apps = useAppsCatalog();
  const [installDialogVisible, setInstallDialogVisible] = React.useState(false);
  const [docsCloudDialogVisible, setDocsCloudDialogVisible] =
    React.useState(false);
  const [enableAiRoomsVisible, setEnableAiRoomsVisible] = React.useState(false);
  const [enableAiRoomsLoading, setEnableAiRoomsLoading] = React.useState(false);

  useEffect(() => {
    ensureLoaded?.();
  }, [ensureLoaded]);

  useEffect(() => {
    if (ready) setDocumentTitle(t("OAuth:Apps"));
  }, [ready, t]);

  const handleConfirmEnableAiRooms = async () => {
    setEnableAiRoomsLoading(true);
    try {
      await enable?.("ai-rooms", true);
      setEnableAiRoomsVisible(false);
    } catch (err) {
      console.error("Failed to enable ai-rooms", err);
      toastr.error(t("Common:SomethingWentWrong"));
    } finally {
      setEnableAiRoomsLoading(false);
    }
  };

  const handleToggle = async (
    id: string,
    next: boolean,
    supported: boolean,
  ) => {
    if (!supported) {
      toastr.info(t("Common:UnderDevelopment"));
      return;
    }
    try {
      if (id === "ai-forms") {
        if (next) {
          const activated = await activate?.("ai-forms");
          if (activated === false) setInstallDialogVisible(true);
        } else {
          await uninstallAiForms?.();
        }
        return;
      }
      if (id === "docs-cloud") {
        if (next) {
          const activated = await activate?.("docs-cloud");
          if (activated === false) setDocsCloudDialogVisible(true);
        } else {
          await uninstallDocsCloud?.();
        }
      }

      if (id === "ai-rooms") {
        if (next) {
          setEnableAiRoomsVisible(true);
        } else {
          await enable?.("ai-rooms", false);
        }
        return;
      }
      await enable?.(id, next);
    } catch (err) {
      console.error(`Failed to ${next ? "enable" : "disable"} app ${id}`, err);
      toastr.error(t("Common:SomethingWentWrong"));
    }
  };

  return (
    <div className={styles.body}>
      <Text as="p" className={styles.description}>
        {t("Settings:AppsDescription", {
          productName: getBrandName("ProductName"),
        })}
      </Text>

      <div className={styles.list}>
        {apps.map((app) => {
          const enabled = app.alwaysOn ? true : (isEnabled?.(app.id) ?? false);

          return (
            <div key={app.id} className={styles.item}>
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
              <div className={styles.controls}>
                <ToggleButton
                  className={styles.toggle}
                  isChecked={enabled}
                  isDisabled={app.alwaysOn}
                  onChange={() => handleToggle(app.id, !enabled, app.supported)}
                />
                <Button
                  className={styles.settingsBtn}
                  label={t("Common:Settings")}
                  size={ButtonSize.small}
                  isDisabled={!app.href || !enabled}
                  onClick={() => {
                    if (app.href) navigate(`${app.href}?section=settings`);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <InstallAiFormsDialog
        visible={installDialogVisible}
        onClose={() => setInstallDialogVisible(false)}
        onInstalled={() => {
          setInstallDialogVisible(false);
          navigate("/ai-forms");
        }}
      />
      <InstallDocsCloudDialog
        visible={docsCloudDialogVisible}
        onClose={() => setDocsCloudDialogVisible(false)}
        onInstalled={() => {
          setDocsCloudDialogVisible(false);
          navigate("/docs-cloud");
        }}
      />
<EnableAiRoomsDialog
        visible={enableAiRoomsVisible}
        isLoading={enableAiRoomsLoading}
        onClose={() => setEnableAiRoomsVisible(false)}
        onConfirm={handleConfirmEnableAiRooms}

      />
    </div>
  );
};

export const Component = inject(({ appsStore }: TStore) => ({
  isEnabled: appsStore.isEnabled,
  enable: appsStore.enable,
  activate: appsStore.activate,
  uninstallAiForms: appsStore.uninstallAiForms,
  uninstallDocsCloud: appsStore.uninstallDocsCloud,
  ensureLoaded: appsStore.ensureLoaded,
}))(observer(Apps));

export default Component;

