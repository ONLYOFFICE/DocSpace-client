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
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { BACKUP_SERVICE } from "@docspace/shared/constants";

import ServiceToggleSection from "../ServiceToggleSection";
import ServiceContent from "../ServiceContent";

import styles from "../../styles/BackupServiceDialog.module.scss";

interface BackupServiceDialogProps {
  visible: boolean;
  onClose: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  isEnabled?: boolean;
  description?: string;
  // backupServicePrice?: number;
  // formatWalletCurrency?: (
  //   item: number | null,
  //   fractionDigits: number,
  // ) => string;
}

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AIServiceDialog: React.FC<BackupServiceDialogProps> = ({
  visible,
  onClose,
  onToggle,
  isEnabled = false,
  description,
  // backupServicePrice,
  //formatWalletCurrency,
}) => {
  const { t } = useTranslation(["Services", "Common", "Payments"]);

  const handleToggleChange = () => {
    onToggle("ai", isEnabled);
    onClose();
  };

  const serviceOptions: ServiceOption[] = [];

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
    >
      <ModalDialog.Header>{t("Common:Backup")}</ModalDialog.Header>
      <ModalDialog.Body>
        <ServiceToggleSection
          isEnabled={isEnabled}
          onToggle={handleToggleChange}
          title={t("Common:Backup")}
          description={description}
          testId="service-ai-toggle-button"
        />
        <div className={styles.servicesList}>
          {serviceOptions.map((service) => (
            <ServiceContent
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:CloseButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          scale
          testId="service-backup-dialog-close-button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ paymentStore }: TStore) => {
  const { servicesQuotasFeatures, backupServicePrice, formatWalletCurrency } =
    paymentStore;

  const feature = servicesQuotasFeatures.get(BACKUP_SERVICE);
  return {
    isEnabled: feature?.value,
    description: feature?.priceTitle,
    backupServicePrice,
    formatWalletCurrency,
  };
})(observer(AIServiceDialog));
