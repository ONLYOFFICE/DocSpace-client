/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import type { TAiProvider } from "@docspace/shared/api/ai/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

type Props = {
  providerId: TAiProvider["id"];
  deleteAIProvider?: AISettingsStore["deleteAIProvider"];
  getAIConfig?: SettingsStore["getAIConfig"];
  onClose: VoidFunction;
};

const DeleteDialogComponent = ({
  providerId,
  deleteAIProvider,
  onClose,
  getAIConfig,
}: Props) => {
  const { t } = useTranslation(["Common", "AISettings"]);

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    try {
      await deleteAIProvider?.(providerId);
      await getAIConfig?.();

      toastr.success(t("AISettings:ProviderRemovedSuccess"));
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <ModalDialog visible displayType={ModalDialogType.modal} onClose={onClose}>
      <ModalDialog.Header>{t("AISettings:DeleteProvider")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{t("AISettings:DeleteProviderDescription")}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:Delete")}
          scale
          onClick={onSubmit}
          isLoading={loading}
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

export const DeleteAIProviderDialog = inject(
  ({ aiSettingsStore, settingsStore }: TStore) => {
    return {
      deleteAIProvider: aiSettingsStore.deleteAIProvider,
      getAIConfig: settingsStore.getAIConfig,
    };
  },
)(observer(DeleteDialogComponent));
