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

import { AddButton } from "@docspace/ui-kit/components/add-button";
import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

import styles from "SRC_DIR/components/dialogs/ChangePortalOwnerDialog/ChangePortalOwner.module.scss";

const ChoiceNewOwner = ({ t, targetUser, onTogglePeopleSelector }) => {
  if (targetUser)
    return (
      <div className={styles.selectedOwnerContainer}>
        <div className={styles.selectedOwner}>
          <Text className="text">
            {targetUser.displayName ? targetUser.displayName : targetUser.label}
          </Text>
        </div>

        <Link
          type="action"
          isHovered
          fontWeight={600}
          onClick={onTogglePeopleSelector}
        >
          {t("ChangePortalOwner:ChangeUser")}
        </Link>
      </div>
    );

  return (
    <div className={styles.peopleSelector}>
      <AddButton
        className="selector-add-button"
        onClick={onTogglePeopleSelector}
        label={t("Translations:ChooseFromList")}
        titleText={t("Translations:ChooseFromList")}
        noSelect
      />
    </div>
  );
};

const NewOwner = ({ t, targetUser, onTogglePeopleSelector }) => {
  return (
    <>
      <div className={styles.peopleSelectorInfo}>
        <Text className={styles.newOwner}>
          {t("DataReassignmentDialog:NewDataOwner")}
        </Text>
        <Text className={styles.description}>
          {t("DataReassignmentDialog:UserToWhomTheDataWillBeTransferred")}
        </Text>
      </div>

      <ChoiceNewOwner
        t={t}
        targetUser={targetUser}
        onTogglePeopleSelector={onTogglePeopleSelector}
      />
    </>
  );
};

export default NewOwner;
