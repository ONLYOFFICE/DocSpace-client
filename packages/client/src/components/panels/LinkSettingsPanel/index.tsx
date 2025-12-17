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

import { useState } from "react";
import moment from "moment";
import { Trans, useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/icons/12/person-plus.react.svg?url";
import ButtonAlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";

import { Text } from "@docspace/shared/components/text";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { DateTimePicker } from "@docspace/shared/components/date-time-picker";
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import LinkRolesDropdown from "./sub-components/LinkRolesDropdown";
import styles from "./LinkSettingsPanel.module.scss";
import { LinkSettingsPanelProps } from "./LinkSettingsPanel.types";
import { HelpButton } from "@docspace/shared/components/help-button";
import { TOption } from "@docspace/shared/components/combobox";
import { globalColors } from "@docspace/shared/themes";
import { getCookie } from "@docspace/shared/utils";
import { LANGUAGE } from "@docspace/shared/constants";

const MAX_USERS_COUNT = 1000;

const LinkSettingsPanel = ({
  theme,
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
}: LinkSettingsPanelProps) => {
  const { t, ready } = useTranslation(["Common", "Files"]);
  const locale = getCookie(LANGUAGE) ?? culture ?? "en";

  const warningColor = theme?.isBase
    ? globalColors.lightErrorStatus
    : globalColors.darkErrorStatus;

  const usersNumber = activeLink.currentUseCount ?? 0;
  const maxUsersNumber = activeLink.maxUseCount ?? 1;
  const limitIsChecked = !activeLink.maxUseCount ? false : true;

  const isEdit = Object.keys(activeLink).length === 0 ? false : true;
  const date = activeLink.expirationDate
    ? moment(activeLink.expirationDate)
    : isEdit
      ? null
      : moment().add(7, "days");

  const [userLimitIsChecked, setUserLimitIsChecked] = useState(limitIsChecked);
  const [limitDate, setLimitDate] = useState<moment.Moment | null>(date);
  const [maxNumber, setMaxNumber] = useState(String(maxUsersNumber));
  const [hasError, setHasError] = useState(false);

  const showLimitError = userLimitIsChecked
    ? Number(maxNumber) <= usersNumber
    : false;

  const showExpiredError = moment(new Date()).isAfter(limitDate);

  const currentAccess = filteredAccesses.find(
    (a) =>
      a.access ===
      (linkSelectedAccess?.access ?? activeLink?.access ?? defaultAccess),
  );

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasError(false);

    if (
      !e.target.value ||
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
        expirationDate: limitDate ? moment(limitDate).toISOString() : null,
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
                />
                <Text
                  fontSize="12px"
                  fontWeight={400}
                  className={styles.linkSettingsDescriptionText}
                  color={showLimitError ? warningColor : undefined}
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
            className={styles.linkSettingsSubDescriptionText}
            color={showExpiredError ? warningColor : undefined}
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
            minDate={moment().subtract(1, "days")}
            maxDate={maxDate}
            useMaxTime={!activeLink.expirationDate}
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
          testId="template_access_settings_modal_save_button"
          isDisabled={hasError || showLimitError || showExpiredError}
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          onClick={onBackClick}
          label={t("Common:CancelButton")}
          testId="template_access_settings_modal_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default LinkSettingsPanel;
