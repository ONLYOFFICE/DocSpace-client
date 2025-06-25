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

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import toLower from "lodash/toLower";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import {
  TextInput,
  InputType,
  InputSize,
} from "@docspace/shared/components/text-input";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { validatePortalName } from "@docspace/shared/utils/common";

import type { TDomainValidator } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";

import { useStores } from "@/hooks/useStores";

const StyledModal = styled(ModalDialog)`
  #modal-dialog {
    min-height: 326px;
  }

  .create-portal-input-block {
    padding: 16px 0;
  }

  .cancel-btn {
    display: inline-block;
    margin-inline-start: 8px;
  }

  .create-portal-checkbox {
    margin-bottom: 10px;
  }

  .create-portal-input {
    width: 100%;
  }

  .error-text {
    color: ${({ theme }) => theme.management.errorColor};
  }

  .sub-text {
    color: ${({ theme }) => theme.management.textColor};
  }
`;

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
      <StyledModal
        isLarge
        visible={visible}
        onClose={onClose}
        displayType={ModalDialogType.modal}
      >
        <ModalDialog.Header>
          {t("CreatingPortal", { productName: t("Common:ProductName") })}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <Text noSelect>
            {t("CreateSpaceDescription", {
              productName: t("Common:ProductName"),
            })}
          </Text>
          <div className="create-portal-input-block">
            <Text
              fontSize="13px"
              fontWeight="600"
              style={{ paddingBottom: "5px" }}
            >
              {t("PortalName")}
            </Text>
            <TextInput
              type={InputType.text}
              size={InputSize.base}
              onChange={onHandleName}
              value={name}
              hasError={!!registerError}
              placeholder={t("EnterName")}
              className="create-portal-input"
              isAutoFocussed
            />
            <div>
              <Text className="error-text" fontSize="12px" fontWeight="400">
                {registerError}
              </Text>
            </div>
            <div style={{ marginTop: "6px", wordWrap: "break-word" }}>
              <Text
                className="sub-text"
                fontSize="12px"
                fontWeight="400"
              >{`${name}.${baseDomain}`}</Text>
            </div>
          </div>
          <div>
            <Checkbox
              className="create-portal-checkbox"
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
      </StyledModal>
    );
  },
);
