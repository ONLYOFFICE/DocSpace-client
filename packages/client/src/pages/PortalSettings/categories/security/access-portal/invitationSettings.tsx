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
import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { inject, observer } from "mobx-react";

import { Checkbox } from "@docspace/shared/components/checkbox";
import { Text } from "@docspace/shared/components/text";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { size } from "@docspace/shared/utils";

import styles from "./InvitationSettings.module.scss";
import { LearnMoreWrapper } from "../StyledSecurity";

const InvitationSettings = (props) => {
  const {
    t,
    isInit,
    getInvitationSettings,
    loadSettings,
    setInvitationSettings,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckedContacts, setIsCheckedContacts] = useState(false);
  const [isCheckedGuests, setIsCheckedGuests] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("invitation-settings") &&
      navigate("/portal-settings/security/access-portal");
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);

    if (!isInit) loadSettings().then(() => setIsLoading(true));
    else setIsLoading(true);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const onChangeContacts = () => {
    setIsCheckedContacts(!isCheckedContacts);
  };

  const onChangeGuests = () => {
    setIsCheckedGuests(!isCheckedGuests);
  };

  const onSaveClick = () => {
    setInvitationSettings(false, true);
  };

  return (
    <>
      <LearnMoreWrapper>
        <Text fontSize="13px" fontWeight="400">
          {t("InvitationSettingsDescription")}
        </Text>
      </LearnMoreWrapper>

      <div className={styles.content}>
        <div>
          <div className={styles.checkboxContainer}>
            <Checkbox
              className={styles.checkbox}
              isChecked={isCheckedContacts}
              onChange={onChangeContacts}
            />
            <Text fontSize="13px" fontWeight="600" lineHeight="20px">
              {t("InvitationSettingsContacts")}
            </Text>
          </div>

          <Text
            fontSize="12px"
            fontWeight="400"
            lineHeight="16px"
            className={styles.checkboxDescription}
          >
            {t("InvitationSettingsContactsDescription")}
          </Text>
        </div>

        <div>
          <div className={styles.checkboxContainer}>
            <Checkbox
              className={styles.checkbox}
              isChecked={isCheckedGuests}
              onChange={onChangeGuests}
            />
            <Text fontSize="13px" fontWeight="600" lineHeight="20px">
              {t("InvitationSettingsGuests")}
            </Text>
          </div>

          <Text
            fontSize="12px"
            fontWeight="400"
            lineHeight="16px"
            className={styles.checkboxDescription}
          >
            {t("InvitationSettingsGuestsDescription")}
          </Text>
        </div>
      </div>

      <SaveCancelButtons
        className={styles.saveCancelButtons}
        onSaveClick={onSaveClick}
        // onCancelClick={onCancelClick}
        // showReminder={showReminder}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        // isSaving={isSaving}
      />
    </>
  );
};

export const InvitationSettingsSection = inject(
  ({ settingsStore, setup }: TStore) => {
    const { getInvitationSettings, setInvitationSettings } = settingsStore;

    const { isInit } = setup;

    const loadSettings = async () => {
      await getInvitationSettings();
    };

    return {
      isInit,
      getInvitationSettings,
      loadSettings,
      setInvitationSettings,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(InvitationSettings)));
