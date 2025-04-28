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
import { useNavigate, useLocation } from "react-router";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";
import { TTranslation } from "@docspace/shared/types";
import { toastr } from "@docspace/shared/components/toast";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Text } from "@docspace/shared/components/text";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { size } from "@docspace/shared/utils";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { DeviceType } from "@docspace/shared/enums";
import styles from "./InvitationSettings.module.scss";
import { LearnMoreWrapper } from "../StyledSecurity";
import InvitationLoader from "../sub-components/loaders/invitation-loader";

const InvitationSettings = ({
  t,
  isInit,
  setInvitationSettings,
  allowInvitingMembers,
  allowInvitingGuests,
  currentDeviceType,
  getInvitationSettings,
  tReady,
}: {
  t: TTranslation;
  isInit: boolean;
  setInvitationSettings: (
    allowInvitingMembers: boolean,
    allowInvitingGuests: boolean,
  ) => void;
  allowInvitingMembers: boolean;
  allowInvitingGuests: boolean;
  currentDeviceType: DeviceType;
  getInvitationSettings: () => void;
  tReady: boolean;
}) => {
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isCheckedContacts, setIsCheckedContacts] =
    useState(allowInvitingMembers);
  const [isCheckedGuests, setIsCheckedGuests] = useState(allowInvitingGuests);

  const navigate = useNavigate();
  const location = useLocation();

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("invitation-settings") &&
      navigate("/portal-settings/security/access-portal");
  };

  const load = async () => {
    if (isInit) return;

    setIsLoading(true);
    getInvitationSettings();
    setIsLoading(false);
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
    load();
    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (
      isLoading ||
      typeof allowInvitingMembers !== "boolean" ||
      typeof allowInvitingGuests !== "boolean"
    )
      return;

    const currentSettings = getFromSessionStorage("currentInvitationSettings");
    const defaultSettings = getFromSessionStorage("defaultInvitationSettings");

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, [isLoading, allowInvitingMembers, allowInvitingGuests]);

  useEffect(() => {
    if (isLoading) return;

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

      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
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
    (currentDeviceType !== DeviceType.desktop && isLoading) ||
    !tReady ||
    typeof allowInvitingMembers !== "boolean" ||
    typeof allowInvitingGuests !== "boolean"
  ) {
    return <InvitationLoader />;
  }

  return (
    <>
      <LearnMoreWrapper>
        <Text fontSize="13px" fontWeight="400">
          {t("InvitationSettingsDescription", {
            productName: t("Common:ProductName"),
          })}
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
            <Text
              fontSize="13px"
              fontWeight="600"
              lineHeight="20px"
              onClick={onChangeContacts}
            >
              {t("InvitationSettingsContacts", {
                productName: t("Common:ProductName"),
              })}
            </Text>
          </div>

          <Text
            fontSize="12px"
            fontWeight="400"
            lineHeight="16px"
            className={styles.checkboxDescription}
          >
            {t("InvitationSettingsContactsDescription", {
              productName: t("Common:ProductName"),
            })}
          </Text>
        </div>

        <div>
          <div className={styles.checkboxContainer}>
            <Checkbox
              className={styles.checkbox}
              isChecked={isCheckedGuests}
              onChange={onChangeGuests}
            />
            <Text
              fontSize="13px"
              fontWeight="600"
              lineHeight="20px"
              onClick={onChangeGuests}
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
              productName: t("Common:ProductName"),
            })}
          </Text>
        </div>
      </div>

      <SaveCancelButtons
        className={styles.saveCancelButtons}
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        isSaving={isSaving}
      />
    </>
  );
};

export const InvitationSettingsSection = inject(
  ({ settingsStore, setup }: TStore) => {
    const {
      getInvitationSettings,
      setInvitationSettings,
      allowInvitingMembers,
      allowInvitingGuests,
      currentDeviceType,
    } = settingsStore;

    const { isInit } = setup;

    return {
      isInit,
      getInvitationSettings,
      setInvitationSettings,
      allowInvitingMembers,
      allowInvitingGuests,
      currentDeviceType,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(InvitationSettings)));
