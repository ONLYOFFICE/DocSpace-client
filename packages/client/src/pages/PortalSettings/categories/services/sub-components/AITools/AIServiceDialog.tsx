// (c) Copyright Ascensio System SIA 2009-2026
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
// (c) Copyright Ascensio System SIA 2009-2026
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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import styles from "../../styles/BackupServiceDialog.module.scss";

import GetStartedBody from "./sub-components/GetStartedBody";
import PricingBillingBody from "./sub-components/PricingBillingBody";
import TopUpContainer from "./sub-components/TopUpContainer";

interface AIServiceDialogProps {
  visible: boolean;
  onClose: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  isEnabled?: boolean;
  formatWalletCurrency?: (
    item: number | null,
    fractionDigits: number,
  ) => string;
  logoText?: string;
  isTopUpVisible?: boolean;
}

type DialogView = "get-started" | "pricing" | "top-up";

const AIServiceDialog: React.FC<AIServiceDialogProps> = ({
  visible,
  onClose,
  logoText,
  isTopUpVisible,
}) => {
  const { t } = useTranslation(["Services", "Common", "Payments"]);

  const [view, setView] = useState<DialogView>(
    isTopUpVisible ? "top-up" : "get-started",
  );

  const onTopUpClick = () => {
    setView("top-up");
  };

  const onGetStartedClick = () => {
    setView("get-started");
  };

  const onPricingBillingClick = () => {
    setView("pricing");
  };

  const container =
    view === "top-up" ? (
      <TopUpContainer
        visible={view === "top-up"}
        onCloseTopUpModal={onClose}
        onBackClick={onGetStartedClick}
        isTopUpVisible={isTopUpVisible}
      />
    ) : view === "pricing" ? (
      <PricingBillingBody
        onBack={onGetStartedClick}
        visible={view === "pricing"}
        onClose={onClose}
        onTopUpClick={onTopUpClick}
      />
    ) : null;

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
      containerVisible={view !== "get-started"}
    >
      <ModalDialog.Container>{container}</ModalDialog.Container>
      <ModalDialog.Header>
        {t("Services:OrganizationAI", { organizationName: logoText })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.dialogBody}>
          <GetStartedBody
            onPricingBillingClick={onPricingBillingClick}
            onTopUpClick={onTopUpClick}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <div className={styles.closeFooter}>
          <Button
            key="OkButton"
            label={t("Payments:TopUp")}
            size={ButtonSize.normal}
            primary
            scale
            isDisabled={false}
            onClick={onTopUpClick}
            isLoading={false}
            testId="top_up_button"
          />
          <Button
            key="CancelButton"
            label={t("Common:CancelButton")}
            size={ButtonSize.normal}
            scale
            onClick={onClose}
            isDisabled={false}
            testId="cancel_top_up_button"
          />
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ paymentStore, settingsStore }: TStore) => {
  const { formatWalletCurrency } = paymentStore;
  const { logoText } = settingsStore;
  return {
    isEnabled: true,

    formatWalletCurrency,
    logoText,
  };
})(observer(AIServiceDialog));
