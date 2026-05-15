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
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { TServer, type TUpdateServer } from "@docspace/shared/api/ai/types";
import { type TData, toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "../../styles/AddEditDialog.module.scss";

import { useAdvancedSettings } from "../../hooks/useAdvancedSettings";
import { useBaseParams } from "../../hooks/useBaseParams";
import { useIcon } from "../../hooks/useIcon";
import { getBrandName } from "@docspace/shared/constants/brands";

type EditDialogProps = {
  server: TServer;
  onClose: VoidFunction;

  updateMCP?: AISettingsStore["updateMCP"];
  mcpServersSettingsUrl?: SettingsStore["mcpServersSettingsUrl"];
};

const EditMCPDialogComponent = ({
  server,
  onClose,
  updateMCP,
  mcpServersSettingsUrl,
}: EditDialogProps) => {
  const { t } = useTranslation(["AISettings", "Common", "OAuth"]);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [loading, setLoading] = React.useState(false);

  const { getBaseParams, baseParamsComponent, baseParamsChanged } =
    useBaseParams({
      url: server?.endpoint,
      name: server?.name,
      description: server?.description,
    });
  const { headersComponent, getAPIHeaders, advancedSettingsChanged } =
    useAdvancedSettings(server?.headers, server?.needReset);
  const { iconComponent, getIcon, iconChanged } = useIcon(server?.icon?.icon32);

  const hasChanges =
    baseParamsChanged || advancedSettingsChanged || iconChanged;

  const onSubmitAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasChanges) return;

    const headers = getAPIHeaders();
    const baseParams = getBaseParams();

    const icon = getIcon();

    if (!baseParams) return;

    setLoading(true);

    const formData: Omit<TUpdateServer, "updateIcon"> = {
      endpoint: baseParams.url,
      name: baseParams.name,
      description: baseParams.description,
      headers,
      icon,
    };

    const updateData: TUpdateServer = {};

    if (baseParams.url !== server.endpoint) {
      updateData.endpoint = formData.endpoint;
    }
    if (baseParams.name !== server.name) {
      updateData.name = formData.name;
    }
    if (baseParams.description !== server.description) {
      updateData.description = formData.description;
    }

    if (advancedSettingsChanged) {
      updateData.headers = formData.headers;
    }

    if (iconChanged) {
      if (icon) updateData.icon = icon;
      updateData.updateIcon = true;
    }

    try {
      await updateMCP?.(server.id, updateData);

      toastr.success(t("AISettings:ServerUpdatedSuccess"));

      onClose();
    } catch (e) {
      toastr.error(e as TData);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = () => {
    if (hasChanges) submitButtonRef.current?.click();
  };

  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
    >
      <ModalDialog.Header>{t("Common:MCPServer")}</ModalDialog.Header>
      <ModalDialog.Body>
        <form
          onSubmit={onSubmitAction}
          className={styles.bodyContainer}
          data-testid="edit-mcp-form"
        >
          <div className={styles.connectDocspace}>
            <Text className={styles.connectDocspaceDescription}>
              {t("AISettings:ConnectProductToYourDataAndTools", {
                productName: getBrandName("ProductName"),
              })}
            </Text>
            {mcpServersSettingsUrl ? (
              <Link
                className={styles.learnMoreLink}
                target={LinkTarget.blank}
                type={LinkType.page}
                fontWeight={600}
                isHovered
                href={mcpServersSettingsUrl}
                color="accent"
              >
                {t("Common:LearnMore")}
              </Link>
            ) : null}
          </div>
          {iconComponent}
          {baseParamsComponent}
          {headersComponent}
          <button
            type="submit"
            ref={submitButtonRef}
            hidden
            aria-label="submit"
          />
        </form>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:SaveButton")}
          scale
          onClick={handleSubmitClick}
          isLoading={loading}
          isDisabled={!hasChanges}
          testId="mcp-save-button"
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          isDisabled={loading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export const EditMCPDialog = inject(
  ({ aiSettingsStore, settingsStore }: TStore) => {
    return {
      updateMCP: aiSettingsStore.updateMCP,
      mcpServersSettingsUrl: settingsStore.mcpServersSettingsUrl,
    };
  },
)(observer(EditMCPDialogComponent));
