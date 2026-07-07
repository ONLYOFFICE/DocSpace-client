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

import React from "react";
import { useTranslation, Trans } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import { RevokeDialogProps } from "../AuthorizedApps.types";
import { getBrandName } from "@docspace/shared/constants/brands";

const RevokeDialog = ({
  visible,
  onRevoke,
  onClose,
  selection,
  bufferSelection,
  currentDeviceType,
  logoText,
}: RevokeDialogProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const isMobile = currentDeviceType === "mobile";
  const isGroup = selection.length > 1;
  const name = bufferSelection?.name;

  const firstDesc = isGroup ? (
    <Trans
      t={t}
      i18nKey="RevokeConsentDescriptionGroup"
      ns="OAuth"
      values={{
        productName: getBrandName("ProductName"),
        organizationName: logoText,
      }}
    />
  ) : (
    <Trans
      t={t}
      i18nKey="RevokeConsentDescription"
      ns="OAuth"
      values={{
        name,
        productName: getBrandName("ProductName"),
        organizationName: logoText,
      }}
    />
  );
  const secondDesc = isGroup ? (
    <Trans
      t={t}
      i18nKey="RevokeConsentLoginGroup"
      ns="OAuth"
      values={{
        productName: getBrandName("ProductName"),
        organizationName: logoText,
      }}
    />
  ) : (
    <Trans
      t={t}
      i18nKey="RevokeConsentLogin"
      ns="OAuth"
      values={{
        name,
        productName: getBrandName("ProductName"),
        organizationName: logoText,
      }}
    />
  );

  const onRevokeAction = async () => {
    if (isRequestRunning) return;

    setIsRequestRunning(true);

    if (isGroup || selection.length) {
      await onRevoke(selection);
    } else {
      await onRevoke([bufferSelection.clientId]);
    }

    setIsRequestRunning(false);
    onClose();
  };

  const onCloseAction = () => {
    if (isRequestRunning) return;

    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      isLarge
      autoMaxHeight
      withFooterBorder={isMobile}
      onClose={onCloseAction}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("RevokeConsent")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text style={{ marginBottom: "16px" }}>{firstDesc}</Text>

        <Text>{secondDesc}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Revoke")}
          primary
          scale={isMobile}
          size={ButtonSize.normal}
          isLoading={isRequestRunning}
          onClick={onRevokeAction}
          testId="dialog_revoke_consent_button"
        />
        <Button
          label={t("Common:CancelButton")}
          scale={isMobile}
          size={ButtonSize.normal}
          isDisabled={isRequestRunning}
          onClick={onCloseAction}
          testId="dialog_revoke_consent_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RevokeDialog;
