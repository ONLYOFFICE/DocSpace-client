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

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "styled-components";
import { withTranslation, Trans } from "react-i18next";
import { Badge } from "@docspace/shared/components/badge";
import { toastr } from "@docspace/shared/components/toast";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { TextInput } from "@docspace/shared/components/text-input";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { isMobileDevice } from "@docspace/shared/utils";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { PortalRenamingDialog } from "SRC_DIR/components/dialogs";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { globalColors } from "@docspace/shared/themes";
import LoaderCustomization from "../sub-components/loaderCustomization";
import { StyledSettingsComponent } from "./StyledSettings";
import checkScrollSettingsBlock from "../utils";

const PortalRenamingComponent = (props) => {
  const {
    t,
    setPortalRename,
    isMobileView,
    tReady,
    isLoaded,
    setIsLoadedPortalRenaming,
    isLoadedPage,
    tenantAlias,
    initSettings,
    setIsLoaded,
    domain,
    isSettingPaid,
    standalone,
    currentColorScheme,
    renamingSettingsUrl,
    domainValidator,
    setPortalName,
    portalName,
  } = props;

  const navigate = useNavigate();

  let portalNameFromSessionStorage = getFromSessionStorage("portalName");

  const portalNameDefaultFromSessionStorage =
    getFromSessionStorage("portalNameDefault");

  const portalNameInitially =
    portalNameFromSessionStorage === null ||
    portalNameFromSessionStorage === "none"
      ? tenantAlias
      : portalNameFromSessionStorage;

  const portalNameDefaultInitially =
    portalNameDefaultFromSessionStorage === null ||
    portalNameDefaultFromSessionStorage === "none"
      ? tenantAlias
      : portalNameDefaultFromSessionStorage;

  const [portalNameDefault, setPortalNameDefault] = useState(
    portalNameDefaultInitially,
  );

  const [isLoadingPortalNameSave, setIsLoadingPortalNameSave] = useState(false);

  const [showReminder, setShowReminder] = useState(false);

  const [hasScroll, setHasScroll] = useState(false);

  const errorValueFromSessionStorage = getFromSessionStorage("errorValue");

  const [errorValue, setErrorValue] = useState(errorValueFromSessionStorage);

  const isLoadedSetting = isLoaded && tReady;

  const [isCustomizationView, setIsCustomizationView] = useState(false);

  const [isShowModal, setIsShowModal] = useState(false);

  const theme = useTheme();

  const checkInnerWidth = useCallback(() => {
    if (!isMobileDevice()) {
      setIsCustomizationView(true);

      const currentUrl = window.location.href.replace(
        window.location.origin,
        "",
      );

      const newUrl = "/portal-settings/customization/general";
      if (newUrl === currentUrl) return;

      navigate(newUrl);
    } else {
      setIsCustomizationView(false);
    }
  }, [isMobileDevice, setIsCustomizationView]);

  useEffect(() => {
    setDocumentTitle(
      t("PortalRenaming", { productName: t("Common:ProductName") }),
    );
    setPortalName(portalNameInitially);
    const page = isMobileView ? "language-and-time-zone" : "general";
    if (!isLoaded) initSettings(page).then(() => setIsLoaded(true));

    const checkScroll = checkScrollSettingsBlock();
    checkInnerWidth();

    window.addEventListener("resize", checkInnerWidth);

    const scrollPortalName = checkScroll();

    if (scrollPortalName !== hasScroll) {
      setHasScroll(scrollPortalName);
    }

    return () => window.removeEventListener("resize", checkInnerWidth);
  }, []);

  const settingIsEqualInitialValue = (value) => {
    const defaultValue = JSON.stringify(portalNameDefault);
    const currentValue = JSON.stringify(value);
    return defaultValue === currentValue;
  };

  const checkChanges = () => {
    let hasChanged = false;

    const valueFromSessionStorage = getFromSessionStorage("portalName");
    if (
      valueFromSessionStorage !== "none" &&
      valueFromSessionStorage !== null &&
      !settingIsEqualInitialValue(valueFromSessionStorage)
    ) {
      hasChanged = true;
    }

    if (hasChanged !== showReminder) {
      setShowReminder(hasChanged);
    }
  };

  useEffect(() => {
    if (isLoadedSetting) setIsLoadedPortalRenaming(isLoadedSetting);

    if (portalNameDefault || portalName) {
      checkChanges();
    }
  }, [isLoadedSetting, portalNameDefault, portalName]);

  const onCloseModal = () => {
    setIsShowModal(false);
  };

  const onSavePortalRename = () => {
    if (errorValue) return;

    setIsLoadingPortalNameSave(true);

    setPortalRename(portalName)
      .then((confirmUrl) => {
        onCloseModal();
        toastr.success(t("SuccessfullySavePortalNameMessage"));

        setPortalName(portalName);
        setPortalNameDefault(portalName);
        sessionStorage.clear();

        window.location.replace(confirmUrl);
      })
      .catch((error) => {
        let errorMessage = "";
        if (typeof error === "object") {
          errorMessage =
            error?.response?.data?.error?.message ||
            error?.statusText ||
            error?.message ||
            "";
        } else {
          errorMessage = error;
        }

        toastr.error(errorMessage);
        setIsShowModal(false);
        setErrorValue(errorMessage);
        saveToSessionStorage("errorValue", errorMessage);
      })
      .finally(() => {
        setIsLoadingPortalNameSave(false);
      });

    saveToSessionStorage("portalName", portalName);
    saveToSessionStorage("portalNameDefault", portalName);
  };

  const onCancelPortalName = () => {
    portalNameFromSessionStorage = getFromSessionStorage("portalName");

    saveToSessionStorage("errorValue", null);

    setErrorValue(null);

    if (
      portalNameFromSessionStorage !== "none" &&
      portalNameFromSessionStorage !== null &&
      !settingIsEqualInitialValue(portalNameFromSessionStorage)
    ) {
      setPortalName(portalNameDefault);
      saveToSessionStorage("portalName", "none");
      setShowReminder(false);
    }
  };

  const onValidateInput = (value) => {
    const validDomain = new RegExp(domainValidator.regex);

    switch (true) {
      case value === "":
        setErrorValue(t("PortalNameEmpty"));
        saveToSessionStorage("errorValue", t("PortalNameEmpty"));
        break;
      case value.length < domainValidator.minLength ||
        value.length > domainValidator.maxLength:
        setErrorValue(
          t("PortalNameLength", {
            minLength: domainValidator.minLength,
            maxLength: domainValidator.maxLength,
          }),
        );
        saveToSessionStorage(
          "errorValue",
          t("PortalNameLength", {
            minLength: domainValidator.minLength,
            maxLength: domainValidator.maxLength,
          }),
        );
        break;
      case !validDomain.test(value):
        setErrorValue(t("PortalNameIncorrect"));
        saveToSessionStorage("errorValue", t("PortalNameIncorrect"));
        break;
      default:
        saveToSessionStorage("errorValue", null);
        setErrorValue(null);
    }
  };

  const onChangePortalName = (e) => {
    const value = e.target.value;

    onValidateInput(value);

    setPortalName(value);

    if (settingIsEqualInitialValue(value)) {
      saveToSessionStorage("portalName", "none");
      saveToSessionStorage("portalNameDefault", "none");
    } else {
      saveToSessionStorage("portalName", value);
    }

    checkChanges();
  };

  const onOpenModal = () => {
    setIsShowModal(true);
  };

  const hasError = errorValue !== null;

  const settingsBlock = (
    <div className="settings-block">
      <FieldContainer
        id="fieldContainerPortalRenaming"
        className="field-container-width"
        labelText={`${t("PortalRenamingLabelText")}`}
        isVertical
      >
        <TextInput
          tabIndex={10}
          id="textInputContainerPortalRenaming"
          scale
          value={portalName}
          testId="customization_portal_renaming_text_input"
          onChange={onChangePortalName}
          isDisabled={
            (!isSettingPaid && !standalone) || isLoadingPortalNameSave
          }
          hasError={hasError}
          placeholder={`${t("Common:EnterName")}`}
        />
        <div className="errorText">{errorValue}</div>
      </FieldContainer>
    </div>
  );

  return !isLoadedPage ? (
    <LoaderCustomization portalRenaming />
  ) : (
    <StyledSettingsComponent
      hasScroll={hasScroll}
      className="category-item-wrapper"
      isSettingPaid={isSettingPaid}
      standalone={standalone}
      withoutExternalLink={!renamingSettingsUrl}
    >
      {isCustomizationView && !isMobileView ? (
        <div className="category-item-heading">
          <div className="category-item-title">
            {t("PortalRenaming", { productName: t("Common:ProductName") })}
          </div>
          {!isSettingPaid && !standalone ? (
            <Badge
              className="paid-badge"
              fontWeight="700"
              backgroundColor={
                theme.isBase
                  ? globalColors.favoritesStatus
                  : globalColors.favoriteStatusDark
              }
              label={t("Common:Paid")}
              isPaidBadge
            />
          ) : null}
        </div>
      ) : null}

      <div className="category-item-description">
        <Text fontSize="13px" fontWeight={400}>
          {t("PortalRenamingDescriptionText", { domain })}
        </Text>
        <Text fontSize="13px" fontWeight={400}>
          <Trans t={t} i18nKey="PortalRenamingNote" />
        </Text>
        {renamingSettingsUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={renamingSettingsUrl}
            dataTestId="portal_renaming_learn_more"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>
      {settingsBlock}
      <SaveCancelButtons
        tabIndex={11}
        id="buttonsPortalRenaming"
        className="save-cancel-buttons"
        onSaveClick={onOpenModal}
        onCancelClick={onCancelPortalName}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        showReminder={showReminder}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        displaySettings
        hasScroll={hasScroll}
        saveButtonDisabled={!!errorValue}
        additionalClassSaveButton="portal-renaming-save"
        additionalClassCancelButton="portal-renaming-cancel"
        saveButtonDataTestId="customization_portal_renaming_save_button"
        cancelButtonDataTestId="customization_portal_renaming_cancel_button"
      />
      <PortalRenamingDialog
        visible={isShowModal}
        onClose={onCloseModal}
        onSave={onSavePortalRename}
        isSaving={isLoadingPortalNameSave}
      />
    </StyledSettingsComponent>
  );
};

export const PortalRenaming = inject(
  ({ settingsStore, setup, common, currentQuotaStore }) => {
    const {
      tenantAlias,
      baseDomain,
      currentColorScheme,
      standalone,
      renamingSettingsUrl,
      domainValidator,
    } = settingsStore;
    const { setPortalRename } = setup;
    const {
      isLoaded,
      setIsLoadedPortalRenaming,
      initSettings,
      setIsLoaded,
      setPortalName,
      portalName,
    } = common;
    const { isCustomizationAvailable } = currentQuotaStore;

    return {
      setPortalRename,
      isLoaded,
      setIsLoadedPortalRenaming,
      tenantAlias,
      initSettings,
      setIsLoaded,
      domain: baseDomain,
      currentColorScheme,
      renamingSettingsUrl,
      domainValidator,
      portalName,
      setPortalName,
      isSettingPaid: isCustomizationAvailable,
      standalone,
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common"])(observer(PortalRenamingComponent)),
  ),
);
