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
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { BACKUP_SERVICE } from "@docspace/shared/constants";

import ClockIcon from "PUBLIC_DIR/images/icons/32/clock.svg";
import ServiceIcon from "PUBLIC_DIR/images/icons/32/service.icon.svg";
import MoveIcon from "PUBLIC_DIR/images/icons/32/move.icon.svg";
import CloudsIcon from "PUBLIC_DIR/images/icons/32/clouds.icon.svg";
import HistoryIcon from "PUBLIC_DIR/images/icons/32/history.icon.svg";

import styles from "../../styles/BackupServiceDialog.module.scss";

interface BackupServiceDialogProps {
  visible: boolean;
  onClose: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  isEnabled?: boolean;
  description?: string;
}

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BackupServiceDialog: React.FC<BackupServiceDialogProps> = ({
  visible,
  onClose,
  onToggle,
  isEnabled = false,
  description,
}) => {
  const { t } = useTranslation(["Services", "Common"]);

  const handleToggleChange = () => {
    onToggle(BACKUP_SERVICE, isEnabled);
    onClose();
  };

  const serviceOptions: ServiceOption[] = [
    {
      id: "temporary",
      title: t("Common:TemporaryStorage"),
      description: t("TemporaryDescription"),
      icon: <ClockIcon />,
    },
    {
      id: "backup-room",
      title: t("Common:RoomsModule"),
      description: t("BackupRoomDescription", {
        sectionName: t("Common:MyFilesSection"),
      }),
      icon: <ServiceIcon />,
    },
    {
      id: "third-party-resource",
      title: t("Common:ThirdPartyResource"),
      description: t("ThirdPartyResourceDescription"),
      icon: <MoveIcon />,
    },
    {
      id: "third-party-storage",
      title: t("Common:ThirdPartyStorage"),
      description: t("ThirdPartyStorageDescription"),
      icon: <CloudsIcon />,
    },
    {
      id: "automatic-backup",
      title: t("Common:AutoBackup"),
      description: t("AutomaticBackupDescription"),
      icon: <HistoryIcon />,
    },
  ];

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
    >
      <ModalDialog.Header>{t("Common:Backup")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.backupToggleSection}>
          <div className={styles.toggleButton}>
            <ToggleButton isChecked={isEnabled} onChange={handleToggleChange} />
          </div>
          <div className={styles.textContent}>
            <Text fontSize="12px" fontWeight={600}>
              {t("Common:Backup")}
            </Text>
            <Text fontSize="12px" className={styles.backupDescription}>
              {description}
            </Text>
          </div>
        </div>
        <div className={styles.servicesList}>
          {serviceOptions.map((service) => (
            <div key={service.id} className={styles.serviceContent}>
              <div className={styles.iconContainer}>{service.icon}</div>
              <div className={styles.serviceInfo}>
                <Text fontSize="12px" fontWeight={600}>
                  {service.title}
                </Text>
                <Text fontSize="10px" className={styles.backupDescription}>
                  {service.description}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:CloseButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ paymentStore }: TStore) => {
  const { servicesQuotasFeatures } = paymentStore;
  const feature = servicesQuotasFeatures.get(BACKUP_SERVICE);
  return { isEnabled: feature?.value, description: feature?.priceTitle };
})(observer(BackupServiceDialog));
