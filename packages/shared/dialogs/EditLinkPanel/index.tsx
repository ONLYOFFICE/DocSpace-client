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

import moment from "moment";
import { useTranslation } from "react-i18next";
import React, {
  useState,
  useEffect,
  useMemo,
  FC,
  useCallback,
  useImperativeHandle,
  useDeferredValue,
} from "react";

import FillFormsReactSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";

import { Button, ButtonSize } from "../../components/button";
import { toastr } from "../../components/toast";
import { Portal } from "../../components/portal";
import { useEventListener } from "../../hooks/useEventListener";
import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import {
  getLinkAccessRightOptions,
  getRoomLinkAccessOptions,
  getAccessTypeOptions,
  copyShareLink,
} from "../../components/share/Share.helpers";

import {
  isFile,
  isFolder,
  isFolderOrRoom,
  isRoom,
} from "../../utils/typeGuards";

import { ShareLinkService } from "../../services/share-link.service";
import type { TFileLink } from "../../api/files/types";
import type { TError } from "../../utils/axiosClient";
import type { TOption } from "../../components/combobox";

import UnsavedChangesDialog from "../unsaved-changes-dialog";

import {
  DeviceType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "../../enums";
import { StyledEditLinkBodyContent } from "./EditLinkPanel.styled";

import LinkBlock from "./LinkBlock";
import ToggleBlock from "./ToggleBlock";
import PasswordAccessBlock from "./PasswordAccessBlock";
import LimitTimeBlock from "./LimitTimeBlock";
import { RoleLinkBlock } from "./RoleLinkBlock";
import { AccessSelectorBlock } from "./AccessSelectorBlock";

import type {
  AccessOptionType,
  EditLinkPanelProps,
  ShareOptionType,
  EditLinkPanelRef,
} from "./EditLinkPanel.types";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";

const EditLinkPanel: FC<EditLinkPanelProps> = ({
  ref,
  link,
  item,
  language,

  visible,
  setIsVisible,

  setExternalLink,
  setLinkParams,

  currentDeviceType,
  passwordSettings,
  getPortalPasswordSettings,
  updateLink,
  searchParams,
  setSearchParams,
  withBackButton = false,
}) => {
  const { t } = useTranslation("Common");

  const accessLink = link?.access;
  const isLocked = !!link?.sharedTo?.password;
  const password = link?.sharedTo?.password ?? "";
  const date = link?.sharedTo?.expirationDate ?? null;
  const isDenyDownload = link?.sharedTo?.denyDownload ?? false;
  const isPrimaryLink = link?.sharedTo?.primary ?? false;

  const { isPublic, isFormRoom, isCustomRoom } = useMemo(() => {
    if (!isRoom(item))
      return {
        isPublic: false,
        isFormRoom: false,
        isCustomRoom: false,
      };

    return {
      isPublic: item.roomType === RoomsType.PublicRoom,
      isFormRoom: item.roomType === RoomsType.FormRoom,
      isCustomRoom: item.roomType === RoomsType.CustomRoom,
    };
  }, [item]);

  const accessOptions = useMemo(() => {
    if (!item.availableShareRights) return [];

    if (isFolderOrRoom(item))
      return getRoomLinkAccessOptions(
        t,
        item.availableShareRights,
        isPrimaryLink,
      );

    return getLinkAccessRightOptions(
      t,
      item.availableShareRights,
      isPrimaryLink,
    );
  }, [t, item, isPrimaryLink]);

  const linkAccessOptions = useMemo(() => getAccessTypeOptions(t, false), [t]);
  const [unsavedChangesDialogVisible, setUnsavedChangesDialog] =
    useState(false);

  const [selectedLinkAccess, setSelectedLinkAccess] = useState(() => {
    return (
      linkAccessOptions.find(
        (option) => option.internal === link?.sharedTo.internal,
      ) ?? linkAccessOptions[0]
    );
  });

  const [linkTitle, setLinkTitle] = useState(link?.sharedTo.title ?? "");

  const deferredLinkTitle = useDeferredValue(linkTitle);

  const [selectedAccessOption, setSelectedAccessOption] = useState(() => {
    if (isFormRoom) {
      return {
        key: "form-filling",
        label: "",
        access: ShareAccessRights.FormFilling,
        icon: FillFormsReactSvgUrl,
      };
    }

    return (
      accessOptions.find((option) => option.access === accessLink) ??
      accessOptions[accessOptions.length - 1] ??
      {}
    );
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState(password);
  const [expirationDate, setExpirationDate] = useState(date);

  const [isExpired, setIsExpired] = useState(() =>
    expirationDate
      ? new Date(expirationDate).getTime() <= new Date().getTime()
      : false,
  );

  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isPasswordErrorShow, setIsPasswordErrorShow] = useState(false);

  const [isSameDate, setIsSameDate] = useState(false);

  const [passwordAccessIsChecked, setPasswordAccessIsChecked] =
    useState(isLocked);

  const [denyDownload, setDenyDownload] = useState(isDenyDownload);

  const initData = useMemo(() => {
    return {
      passwordValue: password,
      passwordAccessIsChecked: isLocked,
      denyDownload: isDenyDownload,
      accessLink: accessLink ?? ShareAccessRights.ReadOnly,
      internal: link?.sharedTo?.internal ?? false,
      linkTitle: link?.sharedTo?.title ?? "",
    };
  }, [password, isLocked, isDenyDownload, accessLink, link]);

  const currentDate = useMemo(() => {
    return {
      passwordValue,
      passwordAccessIsChecked,
      denyDownload,
      accessLink: selectedAccessOption.access,
      internal: selectedLinkAccess.internal,
      linkTitle: deferredLinkTitle.trim(),
    };
  }, [
    passwordValue,
    passwordAccessIsChecked,
    denyDownload,
    selectedAccessOption.access,
    selectedLinkAccess.internal,
    deferredLinkTitle.trim(),
  ]);

  const hasChanges = useUnsavedChanges(initData, currentDate) || !isSameDate;

  const onPasswordAccessChange = () =>
    setPasswordAccessIsChecked(!passwordAccessIsChecked);

  const onDenyDownloadChange = () => setDenyDownload(!denyDownload);

  const onClose = useCallback(() => {
    setIsVisible(false);
  }, [setIsVisible]);

  const onClosePanel = (e?: React.MouseEvent) => {
    const checkChanges = !e;

    if (checkChanges && hasChanges) {
      setUnsavedChangesDialog(true);
      return;
    }

    onClose();
  };

  const handleSelectLinkAccess = (option: TOption) => {
    setSelectedLinkAccess(option as ShareOptionType);
  };

  const validateInputs = useCallback(() => {
    const errors = [];

    if (
      passwordAccessIsChecked &&
      (!passwordValue.trim() || !isPasswordValid)
    ) {
      errors.push("password");
    }

    if (
      expirationDate &&
      new Date(expirationDate).getTime() <= new Date().getTime()
    ) {
      errors.push("expiration");
    }

    return errors;
  }, [passwordAccessIsChecked, passwordValue, isPasswordValid, expirationDate]);

  const handleValidationErrors = (errors: string[]) => {
    if (errors.includes("password")) {
      setIsPasswordValid(false);
      setIsPasswordErrorShow(true);
    }
    if (errors.includes("expiration")) {
      setIsExpired(true);
    }
  };

  const buildUpdatedLink = useCallback(() => {
    const externalLink = link ?? { access: 2, sharedTo: {} };

    const updatedLink: TFileLink = {
      ...externalLink,
      access: selectedAccessOption.access,
      sharedTo: {
        ...externalLink.sharedTo,
        password: passwordAccessIsChecked ? passwordValue : undefined,
        denyDownload,
        internal: selectedLinkAccess.internal,
        ...(!isSameDate && expirationDate && { expirationDate }),
        title: deferredLinkTitle,
      },
    };

    return updatedLink;
  }, [
    link,
    selectedAccessOption.access,
    passwordAccessIsChecked,
    passwordValue,
    denyDownload,
    selectedLinkAccess.internal,
    isSameDate,
    expirationDate,
    deferredLinkTitle,
  ]);

  const executeApiCall = useCallback(
    async (updatedLink: TFileLink) => {
      try {
        const response = await ShareLinkService.editLink(item, updatedLink);

        setLinkParams({ link: response, item });

        if (isRoom(item)) {
          setExternalLink?.(response);
          copyShareLink(item, response, t);
        } else {
          updateLink?.(response);
        }

        return response;
      } catch (err) {
        console.error(err);
      }
    },
    [
      t,
      item,
      searchParams,
      isCustomRoom,
      updateLink,
      setLinkParams,
      setExternalLink,
      setSearchParams,
    ],
  );

  const handleApiError = (err: TError) => {
    const error = err?.response?.data?.error?.message ?? err?.message;
    toastr.error(error);
  };

  const onSave = useCallback(async () => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      handleValidationErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const updatedLink = buildUpdatedLink();

      await executeApiCall(updatedLink);
    } catch (err) {
      handleApiError(err as TError);
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [validateInputs, buildUpdatedLink, executeApiCall, onClose]);

  useEffect(() => {
    const isSameDateCheck =
      date || expirationDate ? moment(date).isSame(expirationDate) : true;
    setIsSameDate(isSameDateCheck);
  }, [date, expirationDate]);

  useEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter" && !unsavedChangesDialogVisible) {
      onSave();
    }
  });

  const getPasswordSettings = useCallback(async () => {
    setIsLoading(true);
    await getPortalPasswordSettings();
    setIsLoading(false);
  }, [getPortalPasswordSettings]);

  const getExpiredLinkText = () => {
    if (!link?.canEditExpirationDate) {
      const isParentFormRoom =
        !isRoom(item) && item.parentRoomType === FolderType.FormRoom;

      const isParentPublicRoom =
        !isRoom(item) && item.parentRoomType === FolderType.PublicRoom;

      if (isFormRoom || isParentFormRoom)
        return t("Common:LimitTimeBlockFormRoomDescription");
      if (isPublic || isParentPublicRoom)
        return t("Common:LimitTimeBlockPublicRoomDescription");

      return "";
    }

    if (isExpired) {
      return t("Common:LinkHasExpiredAndHasBeenDisabled");
    }

    return expirationDate
      ? `${t("Common:LinkValidUntil")}:`
      : t("Common:ChooseExpirationDate");
  };

  const getDisableDownloadText = () => {
    if (isRoom(item)) {
      return t("Common:PreventDownloadFilesAndFolders");
    }

    if (isFile(item)) {
      return t("Common:PreventDownloadFile");
    }

    if (isFolder(item)) {
      return t("Common:PreventDownloadFolder");
    }

    return t("Common:PreventDownloadFilesAndFolders");
  };

  useEffect(() => {
    if (!passwordSettings) {
      getPasswordSettings();
    }
  }, [passwordSettings, getPasswordSettings]);

  const handleSelectAccessOption = (option: TOption) => {
    // Ensure the option has the required properties for AccessOptionType
    if ("access" in option && typeof option.access !== "undefined") {
      setSelectedAccessOption(option as AccessOptionType);
    }
  };

  const onCloseUnsavedChangesDialog = () => {
    setUnsavedChangesDialog(false);
  };

  const expiredLinkText = getExpiredLinkText();

  const isPrimary = link?.sharedTo?.primary;

  const isValidLinkTitle = !!deferredLinkTitle.trim();

  const isDisabledSaveButton =
    !hasChanges || isLoading || isExpired || !isValidLinkTitle;

  const canChangeLifetime = link?.canEditExpirationDate;

  const disabledDenyDownload = link?.canEditDenyDownload === false;
  const canEditInternal = link?.canEditInternal;

  useImperativeHandle(
    ref,
    () => ({
      hasChanges: () => hasChanges,
      openChangesDialog: () => setUnsavedChangesDialog(true),
    }),
    [hasChanges, setUnsavedChangesDialog],
  );

  const editLinkPanelComponent = (
    <>
      <UnsavedChangesDialog
        visible={unsavedChangesDialogVisible}
        onClose={onCloseUnsavedChangesDialog}
        onCancel={onCloseUnsavedChangesDialog}
        onConfirm={() => {
          onCloseUnsavedChangesDialog();
          onClose();
        }}
      />

      <ModalDialog
        isLarge
        zIndex={310}
        withBodyScroll
        withoutPadding
        visible={visible}
        onClose={onClosePanel}
        onBackClick={onClosePanel}
        isBackButton={withBackButton}
        displayType={ModalDialogType.aside}
        dataTestId="edit_link_panel_modal"
      >
        <ModalDialog.Header>
          {isPrimary
            ? t("Common:EditSharedLink")
            : isPublic || isFormRoom
              ? t("Common:EditAdditionalLink")
              : t("Common:EditLink")}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <StyledEditLinkBodyContent className="edit-link_body">
            {accessOptions.length > 1 ? (
              <RoleLinkBlock
                t={t}
                accessOptions={accessOptions}
                selectedOption={selectedAccessOption}
                currentDeviceType={currentDeviceType}
                onSelect={handleSelectAccessOption}
              />
            ) : null}
            <LinkBlock
              t={t}
              isLoading={isLoading}
              linkNameValue={linkTitle}
              setLinkNameValue={setLinkTitle}
            />
            {canEditInternal ? (
              <AccessSelectorBlock
                options={linkAccessOptions}
                selectedOption={selectedLinkAccess}
                onSelect={handleSelectLinkAccess}
              />
            ) : null}
            <PasswordAccessBlock
              t={t}
              isLoading={isLoading}
              headerText={t("Common:PasswordAccess")}
              bodyText={t("Common:PasswordLink")}
              isChecked={passwordAccessIsChecked}
              isPasswordValid={isPasswordValid}
              passwordValue={passwordValue}
              setPasswordValue={setPasswordValue}
              setIsPasswordValid={setIsPasswordValid}
              onChange={onPasswordAccessChange}
              passwordSettings={passwordSettings}
              isPasswordErrorShow={isPasswordErrorShow}
              setIsPasswordErrorShow={setIsPasswordErrorShow}
            />
            {!isFormRoom ? (
              <ToggleBlock
                isLoading={isLoading}
                headerText={t("Common:DisableDownload")}
                bodyText={getDisableDownloadText()}
                isChecked={denyDownload || disabledDenyDownload}
                onChange={onDenyDownloadChange}
                isDisabled={disabledDenyDownload}
                tooltipContent={t("Common:RestrictionDownloadCopyRoom")}
                dataTestId="edit_link_panel_deny_download_toggle"
              />
            ) : null}

            <LimitTimeBlock
              language={language}
              isExpired={isExpired}
              isLoading={isLoading}
              bodyText={expiredLinkText}
              setIsExpired={setIsExpired}
              expirationDate={expirationDate}
              setExpirationDate={setExpirationDate}
              canChangeLifetime={canChangeLifetime}
              headerText={t("Common:LimitByTimePeriod")}
            />
          </StyledEditLinkBodyContent>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            scale
            primary
            onClick={onSave}
            size={ButtonSize.normal}
            label={t("Common:SaveButton")}
            isDisabled={isDisabledSaveButton}
            testId="edit_link_panel_save_button"
          />
          <Button
            scale
            onClick={onClose}
            isDisabled={isLoading}
            size={ButtonSize.normal}
            label={t("Common:CancelButton")}
            testId="edit_link_panel_cancel_button"
          />
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );

  const renderPortal = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={editLinkPanelComponent}
        appendTo={rootElement}
        visible={visible}
      />
    );
  };

  return currentDeviceType === DeviceType.mobile
    ? renderPortal()
    : editLinkPanelComponent;
};

export default EditLinkPanel;

export type { EditLinkPanelRef };
