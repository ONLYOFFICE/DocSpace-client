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
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/icons/12/person-plus.react.svg?url";
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

const LinkSettingsPanel = ({
  isVisible,
  filteredAccesses,
  onBackClick,
  onClose,
  onSubmit,
  linkSelectedAccess,
  setLinkSelectedAccess,
  activeLink,
  defaultAccess,
}: LinkSettingsPanelProps) => {
  const { t, ready } = useTranslation(["Common", "Files"]);

  const [userLimitIsChecked, setUserLimitIsChecked] = useState(true);
  const [limitDate, setLimitDate] = useState<moment.Moment | null>(null);
  const [maxNumber, setMaxNumber] = useState("20");

  const currentAccess = filteredAccesses.find(
    (a) =>
      a.access ===
      (activeLink?.access ?? linkSelectedAccess?.access ?? defaultAccess),
  );

  const usersNumber = 0; // TODO: Link settings

  console.log("limitDate", limitDate);

  return (
    <ModalDialog
      visible={isVisible}
      backdropVisible={false}
      displayType={ModalDialogType.aside}
      onClose={onClose}
      onBackClick={onBackClick}
      withBodyScroll
      isLoading={!ready}
      onSubmit={onSubmit}
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
                name="toggleUserLimit"
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
                <Text fontSize="13px" fontWeight={600}>
                  {t("Files:MaxNumber")}
                </Text>
                <TextInput
                  className={styles.userLimitTextInput}
                  type={InputType.text}
                  value={maxNumber}
                  scale
                  onChange={(e) => setMaxNumber(e.target.value)}
                />
                <Text
                  fontSize="12px"
                  fontWeight={400}
                  className={styles.linkSettingsDescriptionText}
                >
                  {t("Files:LinkSettingsLimitDescription")}
                </Text>
                <div className={styles.joinedUsersBlock}>
                  <div className={styles.joinedUsersCell}>
                    <ReactSVG
                      className={styles.joinedUsersIcon}
                      src={PersonPlusReactSvgUrl}
                    />
                    <Text fontSize="13px" fontWeight={400}>
                      {usersNumber}/{maxNumber}
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
          >
            {`${t("Common:LinkValidUntil")}:`}
          </Text>

          <DateTimePicker
            id="link-settings_date-time-picker"
            locale={moment.locale()}
            hasError={false}
            onChange={(date) => setLimitDate(date)}
            openDate={new Date()}
            className={styles.linkSettingsDatePicker}
            selectDateText={t("Common:SelectDate")}
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
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          testId="template_access_settings_modal_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default LinkSettingsPanel;
