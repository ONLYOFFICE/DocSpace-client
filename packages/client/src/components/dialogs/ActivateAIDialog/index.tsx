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

import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { getBrandName } from "@docspace/shared/constants/brands";

type ActivateAIDialogOwnProps = {
  visible: boolean;
  onClose: () => void;
  onActivate: () => void;
  isActivating?: boolean;
};

type ActivateAIDialogInjectedProps = {
  isAdmin?: boolean;
  isPayer?: boolean;
  isCardLinkedToPortal?: boolean;
  payerEmail?: string | null;
  payerDisplayName?: string | null;
};

type ActivateAIDialogProps = ActivateAIDialogOwnProps &
  ActivateAIDialogInjectedProps;

const ActivateAIDialogComponent = ({
  visible,
  onClose,
  onActivate,
  isActivating,
  isAdmin,
  isPayer,
  isCardLinkedToPortal,
  payerEmail,
  payerDisplayName,
}: ActivateAIDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const canActivate = isCardLinkedToPortal && isPayer;
  const canConnectTopayer = isCardLinkedToPortal && !isPayer && isAdmin;

  const payerLabel = payerDisplayName || payerEmail;

  const renderBody = () => {
    if (canActivate) {
      return (
        <>
          <Trans
            t={t}
            i18nKey="AIFeaturesActivateDescription"
            ns="Common"
            components={{
              1: (
                <Text
                  key="activate-ai-bold"
                  as="span"
                  lineHeight="20px"
                  fontWeight={600}
                />
              ),
            }}
          />
          <br />
          {t("Common:AIUsageChargedFromWallet")}
        </>
      );
    }

    if (canConnectTopayer) {
      return (
        <Trans
          t={t}
          i18nKey="ContactPayerToActivateAI"
          ns="Common"
          values={{ payerContact: payerLabel }}
          components={{
            1: (
              <Text
                key="activate-ai-bold"
                as="span"
                lineHeight="20px"
                fontWeight={600}
              />
            ),
            2:
              payerEmail && !payerDisplayName ? (
                <Link
                  key="activate-ai-payer-link"
                  type={LinkType.action}
                  color="accent"
                  href={`mailto:${payerEmail}`}
                />
              ) : (
                <Text key="activate-ai-payer-name" as="span" />
              ),
          }}
        />
      );
    }

    return (
      <Trans
        t={t}
        i18nKey="ContactAdminToActivateAI"
        ns="Common"
        values={{ productName: getBrandName("ProductName") }}
        components={{
          1: (
            <Text
              key="activate-ai-bold"
              as="span"
              lineHeight="20px"
              fontWeight={600}
            />
          ),
        }}
      />
    );
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={isActivating ? () => {} : onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Common:AIFeatures")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px" lineHeight="20px">
          {renderBody()}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        {canActivate ? (
          <>
            <Button
              label={t("Common:Activate")}
              size={ButtonSize.normal}
              onClick={onActivate}
              primary
              scale
              isLoading={isActivating}
              testId="activate-ai-dialog-activate-button"
            />
            <Button
              label={t("Common:CancelButton")}
              size={ButtonSize.normal}
              onClick={onClose}
              scale
              isDisabled={isActivating}
              testId="activate-ai-dialog-cancel-button"
            />
          </>
        ) : (
          <Button
            label={t("Common:OKButton")}
            size={ButtonSize.normal}
            onClick={onClose}
            scale
            testId="activate-ai-dialog-ok-button"
          />
        )}
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<
  TStore,
  ActivateAIDialogOwnProps,
  ActivateAIDialogInjectedProps
>(({ userStore, paymentStore, currentTariffStatusStore }) => {
  const { isAdmin } = userStore.user ?? {};
  const { isPayer, isCardLinkedToPortal } = paymentStore;
  const { walletCustomerEmail, walletCustomerInfo } = currentTariffStatusStore;

  return {
    isAdmin,
    isPayer,
    isCardLinkedToPortal,
    payerEmail: walletCustomerEmail,
    payerDisplayName: walletCustomerInfo?.displayName,
  };
})(observer(ActivateAIDialogComponent));

