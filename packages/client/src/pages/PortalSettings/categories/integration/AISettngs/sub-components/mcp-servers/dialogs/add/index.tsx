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
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import type { TAddNewServer } from "@docspace/shared/api/ai/types";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { type TData, toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "../../styles/AddEditDialog.module.scss";

import { useAdvancedSettings } from "../../hooks/useAdvancedSettings";
import { useBaseParams } from "../../hooks/useBaseParams";
import { useIcon } from "../../hooks/useIcon";

type AddMCPDialogProps = {
  onClose: VoidFunction;
  addNewMCP?: AISettingsStore["addNewMCP"];
};

const AddMCPDialogComponent = ({ onClose, addNewMCP }: AddMCPDialogProps) => {
  const { t } = useTranslation(["Common", "AISettings"]);

  const [loading, setLoading] = React.useState(false);

  const { getBaseParams, baseParamsComponent, baseParamsChanged } =
    useBaseParams();
  const { headersComponent, getAPIHeaders, advancedSettingsChanged } =
    useAdvancedSettings();
  const { iconComponent, getIcon, iconChanged } = useIcon();

  const hasChanges =
    baseParamsChanged || advancedSettingsChanged || iconChanged;

  const onSubmitAction = async () => {
    const headers = getAPIHeaders();
    const baseParams = getBaseParams();

    // TODO: Add icon to request after changing API
    const icon = getIcon();
    console.log(icon);

    if (!baseParams) return;

    setLoading(true);

    const data: TAddNewServer = {
      endpoint: baseParams.url,
      name: baseParams.name,
      description: baseParams.description,
      headers,
    };

    try {
      await addNewMCP?.(data);
      toastr.success(t("AISettings:ServerAddedSuccess"));
      onClose();
    } catch (e) {
      console.error(e);
      toastr.error(e as TData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
    >
      <ModalDialog.Header>{t("AISettings:MCPServer")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.bodyContainer}>
          <div className={styles.connectDocspace}>
            <Text className={styles.connectDocspaceDescription}>
              {t("AISettings:MCPConnectDescription", {
                productName: t("Common:ProductName"),
              })}
            </Text>
            <Link
              className={styles.learnMoreLink}
              target={LinkTarget.blank}
              type={LinkType.page}
              fontWeight={600}
              isHovered
              href=""
              color="accent"
            >
              {t("Common:LearnMore")}
            </Link>
          </div>
          {iconComponent}
          {baseParamsComponent}
          {headersComponent}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:SaveButton")}
          scale
          onClick={onSubmitAction}
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

export const AddMCPDialog = inject(({ aiSettingsStore }: TStore) => {
  return {
    addNewMCP: aiSettingsStore.addNewMCP,
  };
})(observer(AddMCPDialogComponent));
