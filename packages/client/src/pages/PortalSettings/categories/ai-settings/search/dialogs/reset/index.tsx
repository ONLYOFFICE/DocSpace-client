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
import { Trans, useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import { inject, observer } from "mobx-react";

type ResetWebSearchDialogProps = {
  onSuccess?: VoidFunction;
  onClose: VoidFunction;
  restoreWebSearch?: AISettingsStore["restoreWebSearch"];
};

const ResetWebSearchDialogComponent = ({
  onSuccess,
  onClose,
  restoreWebSearch,
}: ResetWebSearchDialogProps) => {
  const { t } = useTranslation(["AISettings", "Common", "OAuth", "Settings"]);

  const [loading, setLoading] = React.useState(false);

  const onSubmitAction = async () => {
    setLoading(true);

    try {
      await restoreWebSearch?.();
      toastr.success(t("AISettings:WebSearchDisabledSuccess"));
      onSuccess?.();
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
      <ModalDialog.Header>{t("Settings:ResetSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          <Trans t={t} i18nKey="ResetWebSearchDescription" ns="AISettings" />
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("OAuth:Reset")}
          scale
          onClick={onSubmitAction}
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

export const ResetWebSearchDialog = inject(({ aiSettingsStore }: TStore) => {
  return {
    restoreWebSearch: aiSettingsStore.restoreWebSearch,
  };
})(observer(ResetWebSearchDialogComponent));
