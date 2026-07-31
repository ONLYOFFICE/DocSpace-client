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
import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";
import { TTranslation } from "@docspace/shared/types";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { TColorScheme } from "@docspace/ui-kit/providers/theme/themes";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { size, isMobileDevice } from "@docspace/shared/utils";
import { type TData } from "@docspace/ui-kit/components/toast";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { DeviceType } from "@docspace/shared/enums";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TfaStore } from "@docspace/shared/store/TfaStore";
import SettingsSetupStore from "SRC_DIR/store/SettingsSetupStore";
import styles from "./InvitationSettings.module.scss";
import { LearnMoreWrapper } from "../StyledSecurity";
import InvitationLoader from "../sub-components/loaders/invitation-loader";
import useSecurity from "../useSecurity";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";
import { getBrandName } from "@docspace/shared/constants/brands";

const InvitationSettings = ({
  t,
  setInvitationSettings,
  allowInvitingMembers,
  allowInvitingGuests,
  currentDeviceType,
  tReady,
  settingsStore,
  tfaStore,
  setup,
  invitationSettingsUrl,
  currentColorScheme,
  isInit,
}: {
  t: TTranslation;

  setInvitationSettings: (
    allowInvitingMembers: boolean,
    allowInvitingGuests: boolean,
  ) => void;
  allowInvitingMembers: boolean;
  allowInvitingGuests: boolean;
  currentDeviceType: DeviceType;
  tReady: boolean;
  settingsStore: SettingsStore;
  tfaStore: TfaStore;
  setup: SettingsSetupStore;
  invitationSettingsUrl: string;
  currentColorScheme: TColorScheme;
  isInit: boolean;
}) => {
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isCheckedContacts, setIsCheckedContacts] =
    useState(allowInvitingMembers);
  const [isCheckedGuests, setIsCheckedGuests] = useState(allowInvitingGuests);

  const navigate = useNavigate();
  const location = useLocation();

  const defaultProps = createDefaultHookSettingsProps({
    settingsStore,
    tfaStore,
    setup,
  });

  const { getSecurityInitialValue } = useSecurity(defaultProps.security);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("invitation-settings") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage("defaultInvitationSettings");
    if (defaultSettings) {
      setIsCheckedContacts(defaultSettings.allowInvitingMembers);
      setIsCheckedGuests(defaultSettings.allowInvitingGuests);
    }
  };

  const getSettings = () => {
    const currentSettings = getFromSessionStorage("currentInvitationSettings");

    const defaultData = {
      allowInvitingMembers,
      allowInvitingGuests,
    };
    saveToSessionStorage("defaultInvitationSettings", defaultData);

    setIsCheckedContacts(
      currentSettings
        ? currentSettings.allowInvitingMembers
        : allowInvitingMembers,
    );
    setIsCheckedGuests(
      currentSettings
        ? currentSettings.allowInvitingGuests
        : allowInvitingGuests,
    );
  };

  useEffect(() => {
    if (isMobileDevice()) {
      getSecurityInitialValue();
      setIsLoaded(true);
    }
  }, [isMobileDevice]);

  useEffect(() => {
    if (isInit) {
      setIsLoaded(true);
    }
  }, [isInit]);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (
      typeof allowInvitingMembers !== "boolean" ||
      typeof allowInvitingGuests !== "boolean" ||
      !isLoaded
    )
      return;

    const currentSettings = getFromSessionStorage("currentInvitationSettings");
    const defaultSettings = getFromSessionStorage("defaultInvitationSettings");

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, [allowInvitingMembers, allowInvitingGuests, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const defaultSettings = getFromSessionStorage("defaultInvitationSettings");

    const newSettings = {
      allowInvitingMembers: isCheckedContacts,
      allowInvitingGuests: isCheckedGuests,
    };

    saveToSessionStorage("currentInvitationSettings", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [isCheckedContacts, isCheckedGuests]);

  const onChangeContacts = () => {
    setIsCheckedContacts(!isCheckedContacts);
  };

  const onChangeGuests = () => {
    setIsCheckedGuests(!isCheckedGuests);
  };

  const onSaveClick = async () => {
    setIsSaving(true);

    try {
      setInvitationSettings(isCheckedGuests, isCheckedContacts);

      saveToSessionStorage("currentInvitationSettings", {
        allowInvitingMembers: isCheckedContacts,
        allowInvitingGuests: isCheckedGuests,
      });
      saveToSessionStorage("defaultInvitationSettings", {
        allowInvitingMembers: isCheckedContacts,
        allowInvitingGuests: isCheckedGuests,
      });
      setShowReminder(false);

      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error as TData);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultInvitationSettings");
    saveToSessionStorage("currentInvitationSettings", defaultSettings);

    setIsCheckedContacts(
      defaultSettings?.allowInvitingMembers || allowInvitingMembers,
    );
    setIsCheckedGuests(
      defaultSettings?.allowInvitingGuests || allowInvitingGuests,
    );

    setShowReminder(false);
  };

  if (
    (currentDeviceType === DeviceType.mobile && !isLoaded) ||
    !tReady ||
    typeof allowInvitingMembers !== "boolean" ||
    typeof allowInvitingGuests !== "boolean"
  ) {
    return <InvitationLoader />;
  }

  return (
    <>
      <LearnMoreWrapper>
        <Text fontSize="13px" fontWeight="400" className={styles.contentText}>
          {t("InvitationSettingsDescription", {
            productName: getBrandName("ProductName"),
          })}
        </Text>

        {invitationSettingsUrl ? (
          <Link
            className="link-learn-more"
            dataTestId="invitation_settings_learn_more"
            color={currentColorScheme?.main?.accent ?? undefined}
            target={LinkTarget.blank}
            isHovered
            href={invitationSettingsUrl}
            fontWeight={600}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </LearnMoreWrapper>

      <div className={styles.content}>
        <div>
          <div className={styles.checkboxContainer}>
            <Checkbox
              className={styles.checkbox}
              dataTestId="invitation_settings_contacts_checkbox"
              isChecked={isCheckedContacts}
              onChange={onChangeContacts}
            />
            <Text
              fontSize="13px"
              fontWeight="600"
              lineHeight="20px"
              onClick={onChangeContacts}
              noSelect
            >
              {t("InviteViaContacts", {
                productName: getBrandName("ProductName"),
                sectionName: t("Common:Contacts"),
              })}
            </Text>
          </div>

          <Text
            fontSize="12px"
            fontWeight="400"
            lineHeight="16px"
            className={styles.checkboxDescription}
          >
            {t("ContactsInviteNote", {
              productName: getBrandName("ProductName"),
              sectionName: t("Common:Contacts"),
            })}
          </Text>
        </div>

        <div>
          <div className={styles.checkboxContainer}>
            <Checkbox
              className={styles.checkbox}
              dataTestId="invitation_settings_guests_checkbox"
              isChecked={isCheckedGuests}
              onChange={onChangeGuests}
            />
            <Text
              fontSize="13px"
              fontWeight="600"
              lineHeight="20px"
              onClick={onChangeGuests}
              noSelect
            >
              {t("InvitationSettingsGuests")}
            </Text>
          </div>

          <Text
            fontSize="12px"
            fontWeight="400"
            lineHeight="16px"
            className={styles.checkboxDescription}
          >
            {t("InvitationSettingsGuestsDescription", {
              productName: getBrandName("ProductName"),
            })}
          </Text>
        </div>
      </div>

      <SaveCancelButtons
        className={styles.saveCancelButtons}
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        isSaving={isSaving}
        saveButtonDataTestId="invitation_settings_save_button"
        cancelButtonDataTestId="invitation_settings_cancel_button"
      />
    </>
  );
};

export const InvitationSettingsSection = inject(
  ({ settingsStore, tfaStore, setup }: TStore) => {
    const {
      setInvitationSettings,
      allowInvitingMembers,
      allowInvitingGuests,
      currentDeviceType,
      invitationSettingsUrl,
      currentColorScheme,
    } = settingsStore;

    const { isInit } = setup;

    return {
      setInvitationSettings,
      allowInvitingMembers,
      allowInvitingGuests,
      currentDeviceType,
      settingsStore,
      tfaStore,
      setup,
      invitationSettingsUrl,
      currentColorScheme,
      isInit,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(InvitationSettings)));
