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

"use client";

import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { toastr } from "@docspace/shared/components/toast";

import { deletePortal } from "@docspace/shared/api/management";

import { useStores } from "@/hooks/useStores";

export const DeletePortalDialog = observer(() => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { spacesStore } = useStores();

  const {
    currentPortal,
    deletePortalDialogVisible: visible,
    setDeletePortalDialogVisible,
  } = spacesStore;

  const { t } = useTranslation(["Management", "Common"]);

  const { owner, domain, wizardSettings } = currentPortal || {};

  const { email } = owner || {};
  const isWizardCompleted = wizardSettings?.completed || false;

  const onClose = () => setDeletePortalDialogVisible(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const res = await deletePortal({ portalName: domain });

      if (res?.removed) {
        toastr.success(
          t("PortalDeleted", { productName: t("Common:ProductName") }),
        );
        router.refresh();
      } else {
        toastr.success(
          <Trans
            i18nKey="DeleteRequestSuccess"
            values={{
              productName: t("Common:ProductName"),
              email,
            }}
            components={{
              1: <strong />,
            }}
          />,
        );
      }
    } catch (e) {
      toastr.error(e!);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {isWizardCompleted
          ? t("SubmitDelete")
          : t("Settings:DeletePortal", {
              productName: t("Common:ProductName"),
            })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        {isWizardCompleted ? (
          <>
            <Text className="warning-text" fontSize="16px" fontWeight={700}>
              {t("Common:Warning")}!
            </Text>
            <Trans
              i18nKey="DeleteSetupPortalText"
              values={{
                productName: t("Common:ProductName"),
                domain,
                email,
              }}
              components={{
                1: <strong />,
              }}
            />
          </>
        ) : (
          <Trans
            i18nKey="DeleteEmptyPortalText"
            values={{
              domain,
            }}
            components={{
              1: <strong />,
            }}
          />
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          isLoading={isLoading}
          key="CreateButton"
          label={t("Common:Delete")}
          size={ButtonSize.normal}
          scale
          primary
          onClick={onDelete}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
});
