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

import PrivateRoomSvgUrl from "PUBLIC_DIR/images/icons/32/room/private.svg?url";
import { Trans } from "react-i18next";
import { TFunction } from "i18next";

import { TRoomStorageLocation } from "@docspace/shared/utils/rooms";

import { connectedCloudsTypeTitleTranslation as getProviderTypeTitle } from "SRC_DIR/helpers/filesUtils";

import styles from "../../CreateEditRoomDialog.module.scss";

import PermanentSetting from "./PermanentSetting";

type PermanentSettingsProps = {
  t: TFunction;
  isThirdparty: boolean;
  storageLocation: TRoomStorageLocation;
  isPrivate?: boolean;
};

const PermanentSettings = ({
  t,
  isThirdparty,
  storageLocation,
  isPrivate,
}: PermanentSettingsProps) => {
  const thirdpartyTitle = getProviderTypeTitle(storageLocation?.providerKey, t);
  const thirdpartyFolderName = isThirdparty ? storageLocation?.title : "";
  const thirdpartyPath = "";

  const isVisible = isThirdparty || isPrivate;

  return (
    <div
      className={`${styles.permanentSettings}${!isVisible ? ` ${styles.displayNone}` : ""}`}
    >
      {isThirdparty ? (
        <PermanentSetting
          type="storageLocation"
          icon={storageLocation.iconSrc}
          title={thirdpartyTitle}
          isFull={false}
          content={
            <Trans
              i18nKey="ThirdPartyStoragePermanentSettingDescription"
              ns="CreateEditRoomDialog"
              t={t}
              values={{
                thirdpartyTitle,
                thirdpartyFolderName,
                thirdpartyPath,
              }}
              components={{ strong: <strong /> }}
            />
          }
        />
      ) : null}
      {isPrivate ? (
        <PermanentSetting
          type="privacy"
          icon={PrivateRoomSvgUrl}
          title={t("Common:PrivateRoomTitle")}
          isFull={false}
          content={t("Common:PrivateRoomDescription")}
        />
      ) : null}
    </div>
  );
};

export default PermanentSettings;
