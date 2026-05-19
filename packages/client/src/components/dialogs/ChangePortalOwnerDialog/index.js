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

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";
import { withTranslation } from "react-i18next";

import PeopleSelector from "@docspace/ui-kit/selectors/People";

import Filter from "@docspace/shared/api/people/filter";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Avatar } from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { AddButton } from "@docspace/ui-kit/components/add-button";
import { Button } from "@docspace/ui-kit/components/button";
import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";

import { EmployeeActivationStatus } from "@docspace/shared/enums";
import styles from "./ChangePortalOwner.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const ChangePortalOwnerDialog = ({
  t,
  visible,
  onClose,

  sendOwnerChange,

  displayName,
  avatar,
  id,
}) => {
  const [selectorVisible, setSelectorVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  const onBackClick = () => {
    setSelectorVisible(false);
  };

  const onTogglePeopleSelector = () => {
    if (isLoading) return;
    setSelectedUser(null);
    setSelectorVisible((val) => !val);
  };

  const onAccept = (item) => {
    setSelectorVisible(false);
    setSelectedUser({ ...item[0] });
  };

  const onChangeAction = () => {
    setIsLoading(true);
    sendOwnerChange(selectedUser.id)
      .then(() => {
        onClose && onClose();
        toastr.success(
          t("Settings:ConfirmEmailSended", {
            ownerName: displayName,
          }),
        );
      })
      .catch((error) => {
        toastr.error(error?.response?.data?.error?.message);
        onClose && onClose();
      });
  };

  const onCloseAction = () => {
    if (isLoading) return;
    onClose && onClose();
  };

  const onClearSelectedItem = () => {
    if (isLoading) return;
    setSelectedUser(null);
  };

  const ownerRights = [
    t("DoTheSame"),
    t("AppointAdmin"),
    t("SetAccessRights"),
    t("ManagePortal", { productName: getBrandName("ProductName") }),
    t("ManageUser"),
    t("ChangePortalOwner:ChangeOwner", {
      productName: getBrandName("ProductName"),
    }),
    t("BackupPortal", { productName: getBrandName("ProductName") }),
    t("DeactivateOrDeleteSpace", { productName: getBrandName("ProductName") }),
  ];

  const filter = React.useMemo(() => {
    const newFilter = new Filter();

    newFilter.employeeStatus = EmployeeActivationStatus.Activated;

    return newFilter;
  }, []);

  return (
    <ModalDialog
      displayType="aside"
      visible={visible}
      onClose={onCloseAction}
      withBodyScroll
      containerVisible={selectorVisible}
    >
      {selectorVisible ? (
        <ModalDialog.Container>
          <PeopleSelector
            withCancelButton
            cancelButtonLabel=""
            onCancel={onBackClick}
            excludeItems={[id]}
            submitButtonLabel=""
            disableSubmitButton={false}
            onSubmit={onAccept}
            withHeader
            headerProps={{
              onCloseClick: onCloseAction,
              onBackClick,
              withoutBackButton: false,
              headerLabel: "",
            }}
            currentUserId={id}
            disableDisabledUsers
            filter={filter}
            dataTestId="change_portal_owner_people_selector"
          />
        </ModalDialog.Container>
      ) : null}
      <ModalDialog.Header>{t("Translations:OwnerChange")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.ownerInfo}>
          <Avatar className="avatar" role="owner" source={avatar} size="big" />
          <div className={styles.info}>
            <Text className={styles.displayName} title={displayName}>
              {displayName}
            </Text>
            <Text className={styles.status} title={t("Common:Owner")}>
              {t("Common:Owner")}
            </Text>
          </div>
        </div>

        <div className={styles.peopleSelectorInfo}>
          <Text
            className={styles.newOwner}
            title={t("NewPortalOwner", {
              productName: getBrandName("ProductName"),
            })}
          >
            {t("NewPortalOwner", { productName: getBrandName("ProductName") })}
          </Text>
          <Text
            className={styles.description}
            title={t("ChangeInstruction", {
              productName: getBrandName("ProductName"),
            })}
          >
            {t("ChangeInstruction", { productName: getBrandName("ProductName") })}
          </Text>
        </div>

        {selectedUser ? (
          <div className={styles.selectedOwnerContainer}>
            <div className={styles.selectedOwner}>
              <Text className={styles.text}>{selectedUser.label}</Text>
              <ReactSVG
                className={styles.crossIcon}
                onClick={onClearSelectedItem}
                src={CrossReactSvgUrl}
                data-testid="change_portal_owner_clear_selected_owner_button"
              />
            </div>

            <Link
              type="action"
              isHovered
              fontWeight={600}
              onClick={onTogglePeopleSelector}
              dataTestId="change_portal_owner_change_user_link"
            >
              {t("ChangeUser")}
            </Link>
          </div>
        ) : (
          <div className={styles.peopleSelector}>
            <AddButton
              className="selector-add-button"
              onClick={onTogglePeopleSelector}
              label={t("Translations:ChooseFromList")}
              noSelect
              titleText={t("Translations:ChooseFromList")}
              testId="change_portal_owner_choose_from_list_button"
            />
          </div>
        )}

        <div className={styles.availableList}>
          <Text
            className={styles.listHeader}
            title={t("PortalOwnerCan", {
              productName: getBrandName("ProductName"),
            })}
          >
            {t("PortalOwnerCan", { productName: getBrandName("ProductName") })}
          </Text>

          {ownerRights?.map((item) => (
            <Text key={item} className={styles.listItem} title={item}>
              — {item};
            </Text>
          ))}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <div className={styles.footerWrapper}>
          <Text className={styles.info}>
            {t("Settings:AccessRightsChangeOwnerConfirmText")}
          </Text>
          <div className={styles.buttonWrapper}>
            <Button
              tabIndex={5}
              label={t("Common:ChangeButton")}
              size="normal"
              primary
              scale
              isDisabled={!selectedUser}
              onClick={onChangeAction}
              isLoading={isLoading}
              testId="change_portal_owner_change_button"
            />
            <Button
              tabIndex={5}
              label={t("Common:CancelButton")}
              size="normal"
              scale
              onClick={onCloseAction}
              isDisabled={isLoading}
              testId="change_portal_owner_cancel_button"
            />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ setup, userStore }) => {
  const { displayName, avatar, id } = userStore.user;
  const { sendOwnerChange } = setup;

  return { displayName, avatar, id, sendOwnerChange };
})(
  withTranslation(["ChangePortalOwner", "Common", "Translations", "Settings"])(
    observer(ChangePortalOwnerDialog),
  ),
);
