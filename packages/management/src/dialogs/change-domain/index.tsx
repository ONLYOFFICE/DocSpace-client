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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import {
  TextInput,
  InputSize,
  InputType,
} from "@docspace/shared/components/text-input";
import { toastr } from "@docspace/shared/components/toast";
import { parseDomain } from "@docspace/shared/utils/common";

import { useStores } from "@/hooks/useStores";

const StyledModal = styled(ModalDialog)`
  .create-portal-input-block {
    padding-top: 16px;
  }
  .create-portal-input {
    width: 100%;
  }

  .error-text {
    color: ${({ theme }) => theme.management.errorColor};
  }
`;

export const ChangeDomainDialog = observer(() => {
  const { t } = useTranslation(["Management", "Common"]);
  const router = useRouter();
  const { spacesStore } = useStores();
  const [domainNameError, setDomainNameError] =
    React.useState<null | Array<object>>(null);
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
    <StyledModal
      visible={visible}
      isLarge
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("DomainSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px">{t("ChangeDomainDescription")}</Text>
        <div className="create-portal-input-block">
          <Text
            fontSize="13px"
            fontWeight="600"
            style={{ paddingBottom: "5px" }}
          >
            {t("DomainName")}
          </Text>
          <TextInput
            type={InputType.text}
            size={InputSize.base}
            hasError={!!domainNameError}
            onChange={onHandleDomain}
            value={domain}
            placeholder={t("EnterDomain")}
            className="create-portal-input"
          />
          <div>
            {domainNameError
              ? domainNameError.map((err) => (
                  <Text
                    className="error-text"
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
    </StyledModal>
  );
});
