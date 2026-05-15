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

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import {
  TextInput,
  InputSize,
  InputType,
} from "@docspace/ui-kit/components/text-input";
import { toastr } from "@docspace/ui-kit/components/toast";
import { parseDomain } from "@docspace/shared/utils/common";

import { useStores } from "@/hooks/useStores";
import styles from "../dialogs.module.scss";

export const ChangeDomainDialog = observer(() => {
  const { t } = useTranslation(["Management", "Common"]);
  const router = useRouter();
  const { spacesStore } = useStores();
  const [domainNameError, setDomainNameError] =
    React.useState<null | Array<string>>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {
    setDomainName,
    setChangeDomainDialogVisible,
    domainDialogVisible: visible,
  } = spacesStore;

  const [domain, setDomain] = React.useState("");

  const onHandleDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (domainNameError) setDomainNameError(null);
    setDomain(e.target.value);
  };

  const onClose = () => {
    setChangeDomainDialogVisible(false);
  };

  const onClickDomainChange = async () => {
    const isValidDomain = parseDomain(domain, setDomainNameError, t);

    if (!isValidDomain) return;

    try {
      setIsLoading(true);
      await setDomainName(domain);
      onClose();
    } catch (err) {
      toastr.error(err!);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <ModalDialog
      visible={visible}
      isLarge
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("DomainSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px">{t("ChangeDomainDescription")}</Text>
        <div className={styles.createPortalInputBlock}>
          <Text
            fontSize="13px"
            fontWeight="600"
            style={{ paddingBottom: "5px" }}
          >
            {t("DomainName")}
          </Text>
          <TextInput
            testId="change-domain-input"
            type={InputType.text}
            size={InputSize.base}
            hasError={!!domainNameError}
            onChange={onHandleDomain}
            value={domain}
            placeholder={t("EnterDomainName")}
            scale
          />
          <div>
            {domainNameError
              ? domainNameError.map((err) => (
                  <Text
                    className={styles.errorText}
                    key={err.toString()}
                    fontSize="12px"
                    fontWeight="400"
                  >
                    {err.toString()}
                  </Text>
                ))
              : null}
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          testId="change-domain-button"
          isLoading={isLoading}
          key="CreateButton"
          label={t("Common:ChangeButton")}
          onClick={onClickDomainChange}
          size={ButtonSize.normal}
          primary
          scale
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
