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

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import ButtonAlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";
import ClockIconUrl from "PUBLIC_DIR/images/clock.react.svg?url";
import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/icons/12/person-plus.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-common.svg?url";
import { useRef } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { getCookie, getCorrectDate } from "@docspace/shared/utils";
import { toastr } from "@docspace/shared/components/toast";

import { InputBlock } from "@docspace/shared/components/input-block";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Heading } from "@docspace/shared/components/heading";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";

import { filterPaidRoleOptions } from "@docspace/shared/utils/filterPaidRoleOptions";
import { filterNotReadOnlyOptions } from "@docspace/shared/utils/filterNotReadOnlyOptions";
import api from "@docspace/shared/api";
import { RoomsType } from "@docspace/shared/enums";
import AccessSelector from "../../../AccessSelector";
import PaidQuotaLimitError from "../../../PaidQuotaLimitError";

import styles from "../InvitePanel.module.scss";

import { getFreeUsersRoleArray, getFreeUsersTypeArray } from "../utils";
import { deleteInviteLink } from "@docspace/shared/api/portal";
import { now, parseToDateTime, isAfter } from "@docspace/shared/utils/date";
import { LANGUAGE } from "@docspace/shared/constants";

const ExternalLinks = ({
  t,
  roomId,
  roomType,
  shareLinks,
  setShareLinks,
  isOwner,
  isAdmin,
  onChangeExternalLinksVisible,
  externalLinksVisible,
  setActiveLink,
  activeLink,
  isMobileView,
  isUserTariffLimit,
  standalone,
  allowInvitingGuests,
  setLinkSettingsPanelVisible,
  onSelectAccess,
  copyLink,
  editLink,
  isLinksToggling,
  setIsLinksToggling,
  culture,
  setInviteContactsLink,
  hideSelector,
  setInvitePanelOptions,
}) => {
  const showUsersJoinedBlock = !!activeLink?.maxUseCount;
  const showLifetimeBlock = !!activeLink?.expirationDate;
  const showUsersLimitWarning =
    activeLink?.currentUseCount >= activeLink?.maxUseCount;
  const linkIsExpired = isAfter(now(), parseToDateTime(activeLink?.expirationDate));

  const locale = getCookie(LANGUAGE) ?? culture ?? "en";

  const inputsRef = useRef();

  const disableLink = async () => {
    shareLinks?.length &&
      (await api.rooms.setInvitationLinks(
        roomId,
        "Invite",
        0,
        shareLinks[0].id,
      ));
    setActiveLink({});
    onChangeExternalLinksVisible(false);
    return setShareLinks([]);
  };

  const toggleLinks = async (e) => {
    if (isLinksToggling) return;

    setIsLinksToggling(true);

    try {
      if (roomId === -1) {
        if (e?.target?.checked) {
          await setInviteContactsLink();
        } else {
          setInvitePanelOptions({
            visible: true,
            hideSelector,
            defaultAccess: activeLink.access,
            roomId: -1,
          });
          await deleteInviteLink(activeLink.id);
          setActiveLink({});
          onChangeExternalLinksVisible(false);
        }
      } else {
        !externalLinksVisible ? await editLink() : await disableLink();
      }
    } catch (error) {
      toastr.error(error.message);
    } finally {
      setIsLinksToggling(false);
    }
  };

  const onCopyLink = () => copyLink(activeLink);

  const availableAccess =
    roomId === -1 ? getFreeUsersTypeArray() : getFreeUsersRoleArray();

  const accesses = getAccessOptions(
    t,
    roomType,
    false,
    true,
    isOwner,
    isAdmin,
    standalone,
  );

  const getAgentAccesses = () => {
    return filterNotReadOnlyOptions(accesses).filter(
      (o) => !o.isSeparator && !o.disabled,
    );
  };

  const filteredAccesses =
    roomType === -1
      ? accesses
      : roomType === RoomsType.AIRoom
        ? getAgentAccesses()
        : filterPaidRoleOptions(accesses);

  const description =
    roomId === -1
      ? t("InviteViaLinkDescriptionAccounts", {
          productName: t("Common:ProductName"),
        })
      : roomType === RoomsType.AIRoom
        ? allowInvitingGuests
          ? t("InviteViaLinkDescriptionAgentGuest")
          : t("InviteViaLinkDescriptionAgentMembers", {
              productName: t("Common:ProductName"),
            })
        : allowInvitingGuests
          ? t("InviteViaLinkDescriptionRoomGuest")
          : t("InviteViaLinkDescriptionRoomMembers", {
              productName: t("Common:ProductName"),
            });

  return (
    <div className={styles.externalLink} ref={inputsRef}>
      <Heading
        className={classNames(styles.subHeader, {
          [styles.inline]: true,
        })}
      >
        {t("InviteViaLink")}

        <IconButton
          iconName={SettingsReactSvgUrl}
          size={16}
          dataTestId="link-settings_icon"
          onClick={() => setLinkSettingsPanelVisible(true)}
        />

        <ToggleButton
          className={classNames("invite-via-link", styles.toggleButton)}
          isChecked={externalLinksVisible}
          onChange={toggleLinks}
          isDisabled={isLinksToggling}
          dataTestId="invite_panel_external_links_toggle"
        />
      </Heading>
      <Text className={styles.description}>{description}</Text>
      {externalLinksVisible ? (
        <>
          <div className={styles.inviteInputContainer} key={activeLink.id}>
            <div
              className={classNames(styles.inviteInput, {
                [styles.isShowCross]: true,
              })}
            >
              <InputBlock
                className={classNames(styles.copyLinkIcon, styles.inputLink)}
                iconSize={16}
                iconButtonClassName="copy-link-icon"
                scale
                value={activeLink.shareLink}
                isReadOnly
                iconName={CopyReactSvgUrl}
                onIconClick={onCopyLink}
                dataTestId="invite_panel_external_link_input"
              />
            </div>
            {roomId !== -1 ? (
              <AccessSelector
                className="invite-via-link-access"
                t={t}
                roomType={roomType}
                defaultAccess={activeLink.access}
                onSelectAccess={onSelectAccess}
                containerRef={inputsRef}
                isOwner={isOwner}
                isAdmin={isAdmin}
                isMobileView={isMobileView}
                isSelectionDisabled={isUserTariffLimit}
                selectionErrorText={<PaidQuotaLimitError />}
                filteredAccesses={filteredAccesses}
                availableAccess={availableAccess}
                dataTestId="invite_panel_external_link_access"
              />
            ) : null}
          </div>

          {showLifetimeBlock || showUsersJoinedBlock ? (
            <div className={styles.inviteViaLinkSettingsContainer}>
              {showLifetimeBlock ? (
                <div className={styles.inviteViaLinkSettings}>
                  <IconButton
                    className={styles.inviteViaLinkSettingsIcon}
                    iconName={ClockIconUrl}
                    size={12}
                    isDisabled
                  />
                  <Text
                    className={styles.inviteViaLinkSettingsText}
                    fontSize="12px"
                    fontWeight={400}
                  >
                    {t("Files:ValidUntil")}
                  </Text>
                  <Text
                    fontSize="12px"
                    fontWeight={600}
                    className={classNames(styles.inviteViaLinkText, {
                      [styles.isError]: linkIsExpired,
                    })}
                  >
                    {getCorrectDate(locale, activeLink.expirationDate)}
                  </Text>
                  {linkIsExpired ? (
                    <HelpButton
                      place="right"
                      iconNode={<ButtonAlertIcon />}
                      tooltipMaxWidth="344px"
                      tooltipContent={
                        <>
                          <Text>{t("Common:LinkSettingsExpired")}</Text>
                          <Text>
                            {t("Files:LinkSettingsExpiredToastDescription")}
                          </Text>
                        </>
                      }
                      className={styles.inviteViaLinkSettingsWarning}
                    />
                  ) : null}
                </div>
              ) : null}

              {showUsersJoinedBlock ? (
                <div className={styles.inviteViaLinkSettings}>
                  <IconButton
                    iconName={PersonPlusReactSvgUrl}
                    size={12}
                    isDisabled
                  />
                  <Text
                    className={styles.inviteViaLinkSettingsText}
                    fontSize="12px"
                    fontWeight={400}
                  >
                    {t("Files:UsersJoined")}
                  </Text>
                  <Text
                    fontSize="12px"
                    fontWeight={600}
                    className={classNames(styles.inviteViaLinkText, {
                      [styles.isError]: showUsersLimitWarning,
                    })}
                  >
                    {activeLink.currentUseCount}/{activeLink.maxUseCount}
                  </Text>
                  {showUsersLimitWarning ? (
                    <HelpButton
                      place="right"
                      iconNode={<ButtonAlertIcon />}
                      tooltipContent={
                        <>
                          <Text>{t("Files:LinkSettingsUsersLimitToast")}</Text>
                          <Text>
                            {t("Files:LinkSettingsUsersLimitToastDescription")}
                          </Text>
                        </>
                      }
                      className={styles.inviteViaLinkSettingsWarning}
                      tooltipMaxWidth="344px"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default inject(
  ({ userStore, dialogsStore, currentQuotaStore, settingsStore }) => {
    const { isOwner, isAdmin } = userStore.user;
    const { invitePanelOptions, setInvitePanelOptions } = dialogsStore;
    const { roomId, hideSelector, defaultAccess } = invitePanelOptions;
    const { isUserTariffLimit } = currentQuotaStore;
    const { standalone, allowInvitingGuests, culture } = settingsStore;

    return {
      culture,
      roomId,
      hideSelector,
      defaultAccess,
      isOwner,
      isAdmin,
      isUserTariffLimit,
      standalone,
      allowInvitingGuests,
      setInvitePanelOptions,
    };
  },
)(observer(ExternalLinks));
