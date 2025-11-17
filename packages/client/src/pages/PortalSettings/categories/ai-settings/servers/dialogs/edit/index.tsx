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
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { TServer, type TUpdateServer } from "@docspace/shared/api/ai/types";
import { type TData, toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "../../styles/AddEditDialog.module.scss";

import { useAdvancedSettings } from "../../hooks/useAdvancedSettings";
import { useBaseParams } from "../../hooks/useBaseParams";
import { useIcon } from "../../hooks/useIcon";

type EditDialogProps = {
  server: TServer;
  onClose: VoidFunction;

  updateMCP?: AISettingsStore["updateMCP"];
  aiSettingsUrl?: string;
};

const EditMCPDialogComponent = ({
  server,
  onClose,
  updateMCP,
  aiSettingsUrl,
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
    useAdvancedSettings(server?.headers);
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
        <form onSubmit={onSubmitAction} className={styles.bodyContainer}>
          <div className={styles.connectDocspace}>
            <Text className={styles.connectDocspaceDescription}>
              {t("AISettings:ConnectProductToYourDataAndTools", {
                productName: t("Common:ProductName"),
              })}
            </Text>
            {aiSettingsUrl ? (
              <Link
                className={styles.learnMoreLink}
                target={LinkTarget.blank}
                type={LinkType.page}
                fontWeight={600}
                isHovered
                href={aiSettingsUrl}
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
      aiSettingsUrl: settingsStore.aiSettingsUrl,
    };
  },
)(observer(EditMCPDialogComponent));
