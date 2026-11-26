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

import { type FC, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type { TData } from "@onlyoffice/apps-ui-kit/components/toast";

import styles from "./AccessControl.module.scss";

type PrivateRoomLinksSwitchProps = {
  /** Private rooms are available on the portal and external links are allowed. */
  isShown: boolean;
  privateRoomLinks: boolean;
  setPrivateRoomLinks: (set: boolean) => Promise<boolean>;
};

/**
 * The portal setting for external links of private rooms. The change is sent
 * at once, and the switch shows the value the server answered.
 *
 * Spec: private-rooms/room-membership, "An administrator switches external links of private rooms"
 */
export const PrivateRoomLinksSwitch = ({
  isShown,
  privateRoomLinks,
  setPrivateRoomLinks,
}: PrivateRoomLinksSwitchProps) => {
  const { t } = useTranslation(["Settings", "Common"]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isShown) return null;

  const onChange = async () => {
    setIsSaving(true);
    try {
      await setPrivateRoomLinks(!privateRoomLinks);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error: unknown) {
      toastr.error(error as TData);
    }
    setIsSaving(false);
  };

  return (
    <div className={styles.subSection}>
      <ToggleButton
        className={styles.privateRoomLinksToggle}
        isChecked={privateRoomLinks}
        isDisabled={isSaving}
        onChange={onChange}
        label={t("Settings:PrivateRoomLinks")}
        dataTestId="private_room_links_toggle"
      />
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("Settings:PrivateRoomLinksDescription")}
        </Text>
      </div>
    </div>
  );
};

export const PrivateRoomLinksSwitchSection = inject(
  ({ filesSettingsStore, appsStore }: TStore) => ({
    isShown:
      appsStore.isPrivateRoomsSectionAvailable &&
      filesSettingsStore.externalShare,
    privateRoomLinks: filesSettingsStore.privateRoomLinks,
    setPrivateRoomLinks: filesSettingsStore.setPrivateRoomLinks,
  }),
)(observer(PrivateRoomLinksSwitch as unknown as FC));
