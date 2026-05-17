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

"use client";

import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";

import { deletePortal } from "@docspace/shared/api/management";

import { useStores } from "@/hooks/useStores";
import { getBrandName } from "@docspace/shared/constants/brands";

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
          t("PortalDeleted", { productName: getBrandName("ProductName") }),
        );
        router.refresh();
      } else {
        toastr.success(
          <Trans
            i18nKey="DeleteRequestSuccess"
            ns="Management"
            values={{
              productName: getBrandName("ProductName"),
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
          : t("Common:DeletePortal", {
              productName: getBrandName("ProductName"),
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
              ns="Management"
              values={{
                productName: getBrandName("ProductName"),
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
            ns="Management"
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
          testId="delete-space-button"
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
