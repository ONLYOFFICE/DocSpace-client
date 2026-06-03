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

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";
import { useTranslation } from "react-i18next";

import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { size } from "@docspace/shared/utils";
import type { TData } from "@docspace/ui-kit/components/toast";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import type { TAccessControlSettings } from "@docspace/shared/api/files";

import { getBrandName } from "@docspace/shared/constants/brands";

import AccessControlLoader from "../sub-components/loaders/access-control-loader";
import { MainContainer } from "../StyledSecurity";
import styles from "./AccessControl.module.scss";

const STORAGE_KEY_DEFAULT = "defaultAccessControlSettings";
const STORAGE_KEY_CURRENT = "currentAccessControlSettings";

type AccessControlProps = {
  externalShare: boolean;
  defaultShareLinkInternal: boolean;
  externalShareApplyToDocuments: boolean;
  externalShareApplyToRooms: boolean;
  blockExistingLinksOnRestrict: boolean;
  setAccessControlSettings: (settings: TAccessControlSettings) => Promise<void>;
  settingsIsLoaded: boolean;
  getFilesSettings: () => Promise<void>;
};

const AccessControl = ({
  externalShare,
  defaultShareLinkInternal,
  externalShareApplyToDocuments,
  externalShareApplyToRooms,
  blockExistingLinksOnRestrict,
  setAccessControlSettings,
  settingsIsLoaded,
  getFilesSettings,
}: AccessControlProps) => {
  const { t, ready } = useTranslation(["Settings", "Common"]);

  const [isAllowed, setIsAllowed] = useState(externalShare);
  const [isDefaultInternal, setIsDefaultInternal] = useState(
    defaultShareLinkInternal,
  );
  const [applyToDocuments, setApplyToDocuments] = useState(
    externalShareApplyToDocuments,
  );
  const [applyToRooms, setApplyToRooms] = useState(externalShareApplyToRooms);
  const [blockExisting, setBlockExisting] = useState(
    blockExistingLinksOnRestrict,
  );
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const checkWidth = useCallback(() => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("access-control") &&
      navigate("/portal-settings/security/access-portal");
  }, [location.pathname, navigate]);

  const buildSettings = (
    allowed: boolean,
    defaultInternal: boolean,
    docs: boolean,
    rooms: boolean,
    block: boolean,
  ): TAccessControlSettings => ({
    externalShare: allowed,
    defaultShareLinkInternal: defaultInternal,
    externalShareApplyToDocuments: docs,
    externalShareApplyToRooms: rooms,
    blockExistingLinksOnRestrict: block,
  });

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage(STORAGE_KEY_DEFAULT);
    if (defaultSettings) {
      saveToSessionStorage(STORAGE_KEY_CURRENT, defaultSettings);
      setIsAllowed(defaultSettings.externalShare);
      setIsDefaultInternal(defaultSettings.defaultShareLinkInternal);
      setApplyToDocuments(defaultSettings.externalShareApplyToDocuments);
      setApplyToRooms(defaultSettings.externalShareApplyToRooms);
      setBlockExisting(defaultSettings.blockExistingLinksOnRestrict);
    }
  };

  const getSettings = () => {
    const defaultData = buildSettings(
      externalShare,
      defaultShareLinkInternal,
      externalShareApplyToDocuments,
      externalShareApplyToRooms,
      blockExistingLinksOnRestrict,
    );

    saveToSessionStorage(STORAGE_KEY_DEFAULT, defaultData);
    saveToSessionStorage(STORAGE_KEY_CURRENT, defaultData);
    setIsAllowed(defaultData.externalShare);
    setIsDefaultInternal(defaultData.defaultShareLinkInternal);
    setApplyToDocuments(defaultData.externalShareApplyToDocuments);
    setApplyToRooms(defaultData.externalShareApplyToRooms);
    setBlockExisting(defaultData.blockExistingLinksOnRestrict);
  };

  useEffect(() => {
    if (!settingsIsLoaded) {
      getFilesSettings();
    }
  }, []);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [checkWidth]);

  useEffect(() => {
    const currentSettings = getFromSessionStorage(STORAGE_KEY_CURRENT);
    const defaultSettings = getFromSessionStorage(STORAGE_KEY_DEFAULT);

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      // Unsaved edits from a previous navigation are intentionally discarded;
      // restoring server defaults is the expected UX on re-mount.
      getSettingsFromDefault();
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!settingsIsLoaded || !isLoaded) return;
    const currentSettings = getFromSessionStorage(STORAGE_KEY_CURRENT);
    const defaultSettings = getFromSessionStorage(STORAGE_KEY_DEFAULT);

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    }
  }, [settingsIsLoaded, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const defaultSettings = getFromSessionStorage(STORAGE_KEY_DEFAULT);
    const newSettings = buildSettings(
      isAllowed,
      isDefaultInternal,
      applyToDocuments,
      applyToRooms,
      blockExisting,
    );

    saveToSessionStorage(STORAGE_KEY_CURRENT, newSettings);
    setShowReminder(!isEqual(defaultSettings, newSettings));
  }, [
    isAllowed,
    isDefaultInternal,
    applyToDocuments,
    applyToRooms,
    blockExisting,
  ]);

  const onSaveClick = async () => {
    setIsSaving(true);
    try {
      const settings = buildSettings(
        isAllowed,
        isDefaultInternal,
        applyToDocuments,
        applyToRooms,
        blockExisting,
      );

      await setAccessControlSettings(settings);

      saveToSessionStorage(STORAGE_KEY_DEFAULT, settings);
      saveToSessionStorage(STORAGE_KEY_CURRENT, settings);
      setShowReminder(false);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error: unknown) {
      toastr.error(error as TData);
    }
    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage(STORAGE_KEY_DEFAULT);
    if (!defaultSettings) return;

    saveToSessionStorage(STORAGE_KEY_CURRENT, defaultSettings);
    setIsAllowed(defaultSettings.externalShare);
    setIsDefaultInternal(defaultSettings.defaultShareLinkInternal);
    setApplyToDocuments(defaultSettings.externalShareApplyToDocuments);
    setApplyToRooms(defaultSettings.externalShareApplyToRooms);
    setBlockExisting(defaultSettings.blockExistingLinksOnRestrict);
    setShowReminder(false);
  };

  const externalSharingOptions = useMemo(
    () => [
      {
        id: "external-sharing-allowed",
        label: t("Settings:ExternalSharingAllowed"),
        value: "true",
        dataTestId: "external_sharing_allowed",
      },
      {
        id: "external-sharing-restricted",
        label: t("Settings:ExternalSharingRestricted", {
          productName: getBrandName("ProductName"),
        }),
        value: "false",
        dataTestId: "external_sharing_restricted",
      },
    ],
    [t],
  );

  const defaultLinkTypeOptions = useMemo(
    () => [
      {
        id: "default-link-type-anyone",
        label: t("Common:AnyoneWithLink"),
        value: "false",
        dataTestId: "default_link_type_anyone",
      },
      {
        id: "default-link-type-docspace",
        label: t("Settings:DefaultLinkTypeInternal", {
          productName: getBrandName("ProductName"),
        }),
        value: "true",
        dataTestId: "default_link_type_docspace",
      },
    ],
    [t],
  );

  const linksBeforeRestrictionOptions = useMemo(
    () => [
      {
        id: "links-block-access",
        label: t("Settings:BlockAccessRecommended"),
        value: "true",
        dataTestId: "links_block_access",
      },
      {
        id: "links-allow-existing",
        label: t("Settings:AllowExistingUntilRemoved"),
        value: "false",
        dataTestId: "links_allow_existing",
      },
    ],
    [t],
  );

  if (!ready || !isLoaded) return <AccessControlLoader />;

  return (
    <MainContainer>
      <div className={styles.container}>
        <div className={styles.subSection}>
          <Text
            fontSize="14px"
            fontWeight="700"
            className={styles.subSectionTitle}
          >
            {t("Settings:ExternalSharingLinks")}
          </Text>
          <div
            className={`category-item-description ${styles.externalSharingDescription}`}
          >
            <Text fontSize="13px" fontWeight="400">
              {t("Settings:ExternalSharingLinksDescription")}
            </Text>
          </div>
          <RadioButtonGroup
            className={styles.radioGroup}
            fontSize="13px"
            fontWeight="400"
            name="external-sharing"
            orientation="vertical"
            spacing="8px"
            dataTestId="external_sharing_radio"
            options={externalSharingOptions}
            selected={String(isAllowed)}
            onClick={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIsAllowed(e.target.value === "true")
            }
          />
        </div>

        {isAllowed ? (
          <div className={styles.subSection}>
            <Text
              fontSize="14px"
              fontWeight="700"
              className={styles.subSectionTitle}
            >
              {t("Settings:DefaultSharingLinkType")}
            </Text>
            <div
              className={`category-item-description ${styles.sharingLinkDescription}`}
            >
              <Text fontSize="13px" fontWeight="400">
                {t("Settings:DefaultSharingLinkTypeDescription")}
              </Text>
            </div>
            <RadioButtonGroup
              className={styles.radioGroup}
              fontSize="13px"
              fontWeight="400"
              name="default-link-type"
              orientation="vertical"
              spacing="8px"
              dataTestId="default_link_type_radio"
              options={defaultLinkTypeOptions}
              selected={String(isDefaultInternal)}
              onClick={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIsDefaultInternal(e.target.value === "true")
              }
            />
          </div>
        ) : (
          <>
            <div className={styles.subSection}>
              <Text
                fontSize="13px"
                fontWeight="600"
                className={styles.appliesTo}
              >
                {t("Settings:AppliesTo")}
              </Text>

              <div>
                <Checkbox
                  dataTestId="applies_to_documents_checkbox"
                  isChecked={applyToDocuments}
                  onChange={() => setApplyToDocuments(!applyToDocuments)}
                  label={t("Settings:AppliesToDocuments", {
                    myDocuments: t("Common:MyDocuments"),
                  })}
                />
                <div
                  className={`category-item-description ${styles.checkboxDescription}`}
                >
                  <Text fontSize="13px" fontWeight="400" lineHeight="20px">
                    {t("Settings:AppliesToDocumentsDescription", {
                      myDocuments: t("Common:MyDocuments"),
                      productName: getBrandName("ProductName"),
                    })}
                  </Text>
                  <Text fontSize="13px" fontWeight="400" lineHeight="20px">
                    {t("Settings:LinkStopWorking")}
                  </Text>
                </div>
              </div>

              <div>
                <Checkbox
                  dataTestId="applies_to_rooms_checkbox"
                  isChecked={applyToRooms}
                  onChange={() => setApplyToRooms(!applyToRooms)}
                  label={t("Settings:AppliesToRooms", {
                    rooms: t("Common:Rooms"),
                  })}
                />
                <div
                  className={`category-item-description ${styles.checkboxDescription}`}
                >
                  <Text fontSize="13px" fontWeight="400" lineHeight="20px">
                    {t("Settings:AppliesToRoomsDescription", {
                      rooms: t("Common:Rooms"),
                      productName: getBrandName("ProductName"),
                    })}
                  </Text>
                  <Text fontSize="13px" fontWeight="400" lineHeight="20px">
                    {t("Settings:LinkStopWorking")}
                  </Text>
                  <Text fontSize="13px" fontWeight="600" lineHeight="20px">
                    {t("Settings:AppliesToRoomsWarning")}
                  </Text>
                </div>
              </div>
            </div>

            <div className={styles.linksSection}>
              <Text
                fontSize="13px"
                fontWeight="600"
                className={styles.appliesTo}
              >
                {t("Settings:LinksBeforeRestriction")}
              </Text>
              <RadioButtonGroup
                className={styles.radioGroup}
                fontSize="13px"
                fontWeight="400"
                name="links-before-restriction"
                orientation="vertical"
                spacing="8px"
                dataTestId="links_before_restriction_radio"
                options={linksBeforeRestrictionOptions}
                selected={String(blockExisting)}
                onClick={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBlockExisting(e.target.value === "true")
                }
              />
            </div>
          </>
        )}

        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={onSaveClick}
          onCancelClick={onCancelClick}
          showReminder={showReminder}
          reminderText={t("Common:YouHaveUnsavedChanges")}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:CancelButton")}
          displaySettings
          hasScroll={false}
          isSaving={isSaving}
          saveButtonDataTestId="access_control_save_button"
          cancelButtonDataTestId="access_control_cancel_button"
        />
      </div>
    </MainContainer>
  );
};

export const AccessControlSection = inject(({ filesSettingsStore }: TStore) => {
  const {
    externalShare,
    defaultShareLinkInternal,
    externalShareApplyToDocuments,
    externalShareApplyToRooms,
    blockExistingLinksOnRestrict,
    setAccessControlSettings,
    settingsIsLoaded,
    getFilesSettings,
  } = filesSettingsStore;

  return {
    externalShare,
    defaultShareLinkInternal,
    externalShareApplyToDocuments,
    externalShareApplyToRooms,
    blockExistingLinksOnRestrict,
    setAccessControlSettings,
    settingsIsLoaded,
    getFilesSettings,
  };
})(observer(AccessControl));
