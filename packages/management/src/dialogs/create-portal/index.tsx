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
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import toLower from "lodash/toLower";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import {
  TextInput,
  InputType,
  InputSize,
} from "@docspace/ui-kit/components/text-input";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { validatePortalName } from "@docspace/shared/utils/common";

import type { TDomainValidator } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";

import { useStores } from "@/hooks/useStores";
import styles from "../dialogs.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const CreatePortalDialog = observer(
  ({
    baseDomain,
    domainValidator,
    user,
  }: {
    baseDomain: string;
    domainValidator: TDomainValidator;
    user: TUser;
  }) => {
    const [visit, setVisit] = React.useState<boolean>(false);
    const [restrictAccess, setRestrictAccess] = React.useState<boolean>(false);
    const [registerError, setRegisterError] = React.useState<null | string>(
      null,
    );
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const { spacesStore } = useStores();
    const router = useRouter();

    const {
      createPortalDialogVisible: visible,
      setCreatePortalDialogVisible,
      createNewPortal,
    } = spacesStore;

    const { t } = useTranslation(["Management", "Common"]);

    const [name, setName] = React.useState<string>("");

    const onHandleName = (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(toLower(e.target.value));
      if (registerError) setRegisterError(null);
    };

    const onClose = () => {
      setCreatePortalDialogVisible(false);
    };

    const onHandleClick = async () => {
      const firstName = user?.firstName;
      const lastName = user?.lastName;
      const email = user?.email;

      const data = {
        firstName,
        lastName,
        email,
        portalName: name,
        limitedAccessSpace: restrictAccess,
      };

      const protocol = window?.location?.protocol;

      const isValidPortalName = validatePortalName(
        name,
        domainValidator,
        setRegisterError,
        t,
      );

      if (isValidPortalName) {
        setIsLoading(true);
        await createNewPortal(data)
          .then(async (d) => {
            const { tenant } = d as TNewPortalResponse;
            if (visit) {
              const portalUrl = `${protocol}//${tenant?.domain}/`;

              return window.open(portalUrl, "_self");
            }

            // await settingsStore.getAllPortals();
            onClose();
            router.refresh();
          })
          .catch((error) => {
            setRegisterError(error?.response?.data?.message);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    };

    return (
      <ModalDialog
        isLarge
        visible={visible}
        onClose={onClose}
        displayType={ModalDialogType.modal}
      >
        <ModalDialog.Header>
          {t("CreatingPortal", { productName: getBrandName("ProductName") })}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <Text>
            {t("CreateSpaceDescription", {
              productName: getBrandName("ProductName"),
            })}
          </Text>
          <div className={styles.createPortalInputBlock}>
            <Text
              fontSize="13px"
              fontWeight="600"
              style={{ paddingBottom: "5px" }}
            >
              {t("PortalName", {
                productName: getBrandName("ProductName"),
              })}
            </Text>
            <TextInput
              testId="create-portal-input"
              type={InputType.text}
              size={InputSize.base}
              onChange={onHandleName}
              value={name}
              hasError={!!registerError}
              placeholder={t("EnterSpaceName")}
              isAutoFocussed
              scale
            />
            <div>
              <Text
                className={styles.errorText}
                fontSize="12px"
                fontWeight="400"
              >
                {registerError}
              </Text>
            </div>
            <div style={{ marginTop: "6px", wordWrap: "break-word" }}>
              <Text
                className={styles.subText}
                fontSize="12px"
                fontWeight="400"
              >{`${name}.${baseDomain}`}</Text>
            </div>
          </div>
          <div className={styles.createPortalCheckboxes}>
            <Checkbox
              label={t("VisitSpace")}
              onChange={() => setVisit((v) => !v)}
              isChecked={visit}
            />
            <Checkbox
              label={t("RestrictAccess")}
              onChange={() => setRestrictAccess((access) => !access)}
              isChecked={restrictAccess}
            />
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            testId="create-portal-button"
            isLoading={isLoading}
            key="CreateButton"
            label={t("Common:Create")}
            size={ButtonSize.normal}
            scale
            primary
            onClick={onHandleClick}
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
  },
);
