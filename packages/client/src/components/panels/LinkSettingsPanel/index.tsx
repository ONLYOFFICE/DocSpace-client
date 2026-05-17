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

import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { DateTime } from "luxon";
import {
  now,
  addToDate,
  subtractFromDate,
  parseToDateTime,
  isAfter,
} from "@docspace/ui-kit/utils/date";
import { ReactSVG } from "react-svg";
import classNames from "classnames";
import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/icons/12/person-plus.react.svg?url";
import ButtonAlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";

import { Text } from "@docspace/ui-kit/components/text";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { DateTimePicker } from "@docspace/ui-kit/components/date-time-picker";
import { InputType, TextInput } from "@docspace/ui-kit/components/text-input";
import LinkRolesDropdown from "./sub-components/LinkRolesDropdown";
import styles from "./LinkSettingsPanel.module.scss";
import { LinkSettingsPanelProps } from "./LinkSettingsPanel.types";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { TOption } from "@docspace/ui-kit/components/combobox";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { LANGUAGE } from "@docspace/shared/constants";
import { getConstName } from "@docspace/shared/constants/consts";

const MAX_USERS_COUNT = 1000;

const LinkSettingsPanel = ({
  culture,
  isVisible,
  filteredAccesses,
  onBackClick,
  onClose,
  onSubmit,
  linkSelectedAccess,
  setLinkSelectedAccess,
  activeLink,
  defaultAccess,
  showUsersLimitWarning,
  isContacts,
}: LinkSettingsPanelProps) => {
  const { t, ready } = useTranslation(["Common", "Files"]);
  const locale = getCookie(LANGUAGE) ?? culture ?? "en";

  const usersNumber = activeLink.currentUseCount ?? 0;
  const maxUsersNumber = activeLink.maxUseCount ?? 1;
  const limitIsChecked = !activeLink.maxUseCount ? false : true;

  const isEdit = Object.keys(activeLink).length === 0 ? false : true;
  const date = activeLink.expirationDate
    ? parseToDateTime(activeLink.expirationDate)
    : isEdit
      ? null
      : addToDate(now(), 7, "days");

  const [userLimitIsChecked, setUserLimitIsChecked] = useState(limitIsChecked);
  const [limitDate, setLimitDate] = useState<DateTime | null>(date);
  const [maxNumber, setMaxNumber] = useState(String(maxUsersNumber));
  const [hasError, setHasError] = useState(false);

  const showLimitError = userLimitIsChecked
    ? Number(maxNumber) <= usersNumber
    : false;

  const showExpiredError = isAfter(now(), limitDate);

  const currentAccess = filteredAccesses.find(
    (a) =>
      a.access ==
      (linkSelectedAccess?.access ?? activeLink?.access ?? defaultAccess),
  );

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && !/^\d+$/.test(e.target.value)) {
      return;
    }

    setHasError(false);

    if (
      Number(e.target.value) <= 0 ||
      +e.target.value < +usersNumber ||
      Number(e.target.value) >= MAX_USERS_COUNT
    ) {
      setHasError(true);
    }

    setMaxNumber(e.target.value);
  };

  const onSubmitChanges = () => {
    const defaultLink = filteredAccesses.find(
      (a) => a.access === currentAccess?.access,
    );
    if (defaultLink) {
      const linkToSubmit = {
        ...defaultLink,
        expirationDate: limitDate ? limitDate.toISO() : null,
        maxUseCount: userLimitIsChecked ? Number(maxNumber) : null,
        currentUseCount: usersNumber,
      } as TOption & {
        expirationDate: string;
        maxUseCount: number;
        currentUseCount: number;
      };

      onSubmit(linkToSubmit);
    }
  };

  return (
    <ModalDialog
      visible={isVisible}
      backdropVisible={false}
      displayType={ModalDialogType.aside}
      onClose={onClose}
      onBackClick={onBackClick}
      withBodyScroll
      isLoading={!ready}
      onSubmit={onSubmitChanges}
      withForm
      withoutPadding
      isBackButton
    >
      <ModalDialog.Header>{t("Common:LinkSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.linkSettingsBody}>
          <div className={styles.userLimitBlock}>
            {!isContacts ? (
              <>
                <Text
                  fontSize="16px"
                  fontWeight={700}
                  className={styles.linkSettingsText}
                >
                  {t("Common:RoleForLink")}
                </Text>
                <LinkRolesDropdown
                  currentAccess={currentAccess}
                  accesses={filteredAccesses}
                  linkSelectedAccess={linkSelectedAccess}
                  setLinkSelectedAccess={setLinkSelectedAccess}
                />
              </>
            ) : null}

            <div className={styles.linkSettingsUserLimit}>
              <Text
                fontSize="16px"
                fontWeight={700}
                className={styles.linkSettingsText}
              >
                {t("Common:UserLimit")}
              </Text>
              <ToggleButton
                className={styles.linkSettingsToggle}
                isChecked={userLimitIsChecked}
                onChange={() => setUserLimitIsChecked(!userLimitIsChecked)}
              />
            </div>

            <Text
              fontSize="12px"
              fontWeight={400}
              className={styles.linkSettingsDescriptionText}
            >
              {t("Files:UserLimitDescription")}
            </Text>

            {userLimitIsChecked ? (
              <div className={styles.userLimitInputBlock}>
                <div className={styles.userLimitInputBlockText}>
                  <Text
                    fontSize="13px"
                    fontWeight={600}
                    as="div"
                    className={styles.userLimitInputText}
                  >
                    <Trans
                      t={t}
                      ns="Files"
                      i18nKey="MaxNumber"
                      values={{ usersCount: MAX_USERS_COUNT }}
                      components={{
                        1: (
                          <Text
                            fontWeight={600}
                            fontSize="13px"
                            className={styles.userLimitText}
                          />
                        ),
                      }}
                    />
                  </Text>
                  {showUsersLimitWarning ? (
                    <HelpButton
                      place="right"
                      iconNode={<ButtonAlertIcon />}
                      tooltipContent={
                        <Text>{t("Files:LinkSettingsUsersLimitToast")}</Text>
                      }
                      className={styles.linkSettingsHelpButton}
                    />
                  ) : null}
                </div>
                <TextInput
                  className={styles.userLimitTextInput}
                  type={InputType.text}
                  value={maxNumber}
                  scale
                  maxLength={4}
                  onChange={onInputChange}
                  hasError={hasError}
                  testId="link-settings_users-limit"
                />
                <Text
                  fontSize="12px"
                  fontWeight={400}
                  className={classNames(styles.linkSettingsDescriptionText, {
                    [styles.isError]: showLimitError,
                  })}
                >
                  {showLimitError
                    ? t("Files:LinkSettingsLimitExceeded")
                    : t("Files:LinkSettingsLimitDescription")}
                </Text>
                <div className={styles.joinedUsersBlock}>
                  <div className={styles.joinedUsersCell}>
                    <ReactSVG
                      className={styles.joinedUsersIcon}
                      src={PersonPlusReactSvgUrl}
                    />
                    <Text fontSize="13px" fontWeight={400}>
                      {usersNumber}/{maxNumber ? maxNumber : 1}
                    </Text>
                  </div>
                  <Text
                    fontSize="12px"
                    fontWeight={400}
                    className={styles.linkSettingsDescriptionText}
                  >
                    {t("Files:LinkSettingsJoinedUsers")}
                  </Text>
                </div>
              </div>
            ) : null}
          </div>

          <Text
            fontSize="16px"
            fontWeight={700}
            className={styles.linkSettingsText}
          >
            {t("Common:LimitByTimePeriod")}
          </Text>

          <Text
            fontSize="12px"
            fontWeight={400}
            className={classNames(styles.linkSettingsSubDescriptionText, {
              [styles.isError]: showExpiredError,
            })}
          >
            {showExpiredError
              ? t("Common:LinkSettingsExpired")
              : t("Common:LinkValidUntil")}
          </Text>
          <DateTimePicker
            id="link-settings_date-time-picker"
            locale={locale}
            hasError={false}
            onChange={(date) => setLimitDate(date)}
            openDate={new Date()}
            className={styles.linkSettingsDatePicker}
            selectDateText={t("Common:SelectDate")}
            initialDate={limitDate}
            minDate={subtractFromDate(now(), 1, "days") ?? undefined}
            maxDate={maxDate}
            useMaxTime={!activeLink.expirationDate}
            translations={{ AM: t("Common:AM"), PM: getConstName("PM") }}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="send-invitation"
          scale
          size={ButtonSize.normal}
          primary
          label={t("Common:SaveAndCopy")}
          type="submit"
          testId="link-settings_modal_save_button"
          isDisabled={hasError || showLimitError || showExpiredError}
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          onClick={onBackClick}
          label={t("Common:CancelButton")}
          testId="link-settings_modal_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default LinkSettingsPanel;
