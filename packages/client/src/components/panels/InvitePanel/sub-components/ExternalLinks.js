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

// import MediaDownloadReactSvgUrl from "PUBLIC_DIR/images/media.download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import ButtonAlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";
import ClockIconUrl from "PUBLIC_DIR/images/clock.react.svg?url";
import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/icons/12/person-plus.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-common.svg?url";
import { useRef } from "react";
import { inject, observer } from "mobx-react";

import { getCorrectDate } from "@docspace/shared/utils";
import { toastr } from "@docspace/shared/components/toast";
// import { objectToGetParams } from "@docspace/shared/utils/common";

import { InputBlock } from "@docspace/shared/components/input-block";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";
// import { DropDown } from "@docspace/shared/components/drop-down";
// import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";

import { globalColors } from "@docspace/shared/themes";
import { filterPaidRoleOptions } from "@docspace/shared/utils/filterPaidRoleOptions";
import api from "@docspace/shared/api";
import AccessSelector from "../../../AccessSelector";
import PaidQuotaLimitError from "../../../PaidQuotaLimitError";
import {
  StyledSubHeader,
  StyledInviteInput,
  StyledInviteInputContainer,
  StyledToggleButton,
  StyledDescription,
  StyledExternalLink,
} from "../StyledInvitePanel";

import { getFreeUsersRoleArray, getFreeUsersTypeArray } from "../utils";
import { deleteInviteLink } from "@docspace/shared/api/portal";

const ExternalLinks = ({
  t,
  roomId,
  roomType,
  defaultAccess,
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
  theme,
  culture,
  isAIAgentsFolder,
  setInviteContactsLink,
}) => {
  // const [actionLinksVisible, setActionLinksVisible] = useState(false);

  const showUsersJoinedBlock = !!activeLink?.maxUseCount;
  const showUsersLimitWarning =
    activeLink?.currentUseCount >= activeLink?.maxUseCount;

  const inputsRef = useRef();

  const disableLink = async () => {
    shareLinks?.length &&
      (await api.rooms.setInvitationLinks(
        roomId,
        "Invite",
        0,
        shareLinks[0].id
      ));
    setActiveLink({});
    return setShareLinks([]);
  };

  const toggleLinks = async (e) => {
    if (isLinksToggling) return;

    setIsLinksToggling(true);

    try {
      if (roomId === -1) {
        if (e?.target?.checked) {
          setInviteContactsLink();
        } else {
          deleteInviteLink(activeLink.id);
        }
      } else {
        !externalLinksVisible ? await editLink() : await disableLink();
      }
      onChangeExternalLinksVisible(!externalLinksVisible);
    } catch (error) {
      toastr.error(error.message);
    } finally {
      setIsLinksToggling(false);
    }
  };

  const onCopyLink = () => copyLink(activeLink.shareLink);

  // const toggleActionLinks = () => {
  //   setActionLinksVisible(!actionLinksVisible);
  // };

  // const closeActionLinks = () => {
  //   setActionLinksVisible(false);
  // };

  // const shareEmail = useCallback(
  //   (link) => {
  //     const { title, shareLink } = link;
  //     const subject = t("SharingPanel:ShareEmailSubject", { title });
  //     const body = t("SharingPanel:ShareEmailBody", { title, shareLink });

  //     const mailtoLink = `mailto:${objectToGetParams({
  //       subject,
  //       body,
  //     })}`;

  //     window.open(mailtoLink, "_self");

  //     closeActionLinks();
  //   },
  //   [closeActionLinks, t],
  // );

  // const shareTwitter = useCallback(
  //   (link) => {
  //     const { shareLink } = link;

  //     const twitterLink = `https://twitter.com/intent/tweet${objectToGetParams({
  //       text: shareLink,
  //     })}`;

  //     window.open(twitterLink, "", "width=1000,height=670");

  //     closeActionLinks();
  //   },
  //   [closeActionLinks],
  // );

  const availableAccess =
    roomId === -1 ? getFreeUsersTypeArray() : getFreeUsersRoleArray();

  const accesses = getAccessOptions(
    t,
    roomType,
    false,
    true,
    isOwner,
    isAdmin,
    standalone
  );

  const filteredAccesses =
    roomType === -1 ? accesses : filterPaidRoleOptions(accesses);

  const description =
    roomId === -1
      ? t("InviteViaLinkDescriptionAccounts", {
          productName: t("Common:ProductName"),
        })
      : isAIAgentsFolder
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
    <StyledExternalLink noPadding ref={inputsRef}>
      <StyledSubHeader $inline>
        {t("InviteViaLink")}

        <IconButton
          iconName={SettingsReactSvgUrl}
          size={16}
          onClick={() => setLinkSettingsPanelVisible(true)}
        />

        {/* {false ? (
          <div style={{ position: "relative" }}>
            <IconButton
              size={16}
              iconName={MediaDownloadReactSvgUrl}
              hoverColor={globalColors.black}
              iconColor={globalColors.gray}
              onClick={toggleActionLinks}
            />
            <DropDown
              open={actionLinksVisible}
              clickOutsideAction={closeActionLinks}
              withBackdrop={false}
              isDefaultMode={false}
              fixedDirection
            >
              <DropDownItem
                label={`${t("Common:ShareVia")} e-mail`}
                onClick={() => shareEmail(activeLink[0])}
              />
              <DropDownItem
                label={`${t("Common:ShareVia")} Twitter`}
                onClick={() => shareTwitter(activeLink[0])}
              />
            </DropDown>
          </div>
        ) : null} */}
        <StyledToggleButton
          className="invite-via-link"
          isChecked={externalLinksVisible}
          onChange={toggleLinks}
          isDisabled={isLinksToggling}
          dataTestId="invite_panel_external_links_toggle"
        />
      </StyledSubHeader>
      <StyledDescription>{description}</StyledDescription>
      {externalLinksVisible ? (
        <>
          <StyledInviteInputContainer key={activeLink.id}>
            <StyledInviteInput isShowCross>
              <InputBlock
                className="input-link"
                iconSize={16}
                iconButtonClassName="copy-link-icon"
                scale
                value={activeLink.shareLink}
                isReadOnly
                iconName={CopyReactSvgUrl}
                onIconClick={onCopyLink}
                dataTestId="invite_panel_external_link_input"
              />
            </StyledInviteInput>
            <AccessSelector
              className="invite-via-link-access"
              t={t}
              roomType={roomType}
              defaultAccess={activeLink.access}
              onSelectAccess={onSelectAccess}
              containerRef={inputsRef}
              isOwner={isOwner}
              isMobileView={isMobileView}
              isSelectionDisabled={isUserTariffLimit}
              selectionErrorText={<PaidQuotaLimitError />}
              filteredAccesses={filteredAccesses}
              availableAccess={availableAccess}
              dataTestId="invite_panel_external_link_access"
            />
          </StyledInviteInputContainer>

          <div className="invite-via-link-settings-container">
            <div className="invite-via-link-settings">
              <IconButton
                className="invite-via-link-settings-icon"
                iconName={ClockIconUrl}
                size={12}
                isDisabled
              />
              <Text
                className="invite-via-link-settings-text"
                fontSize="12px"
                fontWeight={400}
              >
                {t("Files:ValidUntil")}
              </Text>
              <Text fontSize="12px" fontWeight={600}>
                {getCorrectDate(culture ?? "en", activeLink.expirationDate)}
              </Text>
            </div>
            {showUsersJoinedBlock ? (
              <div className="invite-via-link-settings">
                <IconButton
                  iconName={PersonPlusReactSvgUrl}
                  size={12}
                  isDisabled
                />
                <Text
                  className="invite-via-link-settings-text"
                  fontSize="12px"
                  fontWeight={400}
                >
                  {t("Files:UsersJoined")}
                </Text>
                <Text fontSize="12px" fontWeight={600}>
                  {activeLink.currentUseCount}/{activeLink.maxUseCount}
                </Text>
                {showUsersLimitWarning ? (
                  <HelpButton
                    place="right"
                    iconNode={<ButtonAlertIcon />}
                    tooltipContent={<Text>{t("Files:WarningUsersLimit")}</Text>}
                    className="invite-via-link-settings-warning"
                    color={
                      theme?.isBase
                        ? globalColors.lightErrorStatus
                        : globalColors.darkErrorStatus
                    }
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </StyledExternalLink>
  );
};

export default inject(
  ({
    userStore,
    dialogsStore,
    peopleStore,
    currentQuotaStore,
    settingsStore,
    treeFoldersStore,
  }) => {
    const { isOwner, isAdmin } = userStore.user;
    const { invitePanelOptions } = dialogsStore;
    const { roomId, hideSelector, defaultAccess } = invitePanelOptions;
    const { isUserTariffLimit } = currentQuotaStore;
    const { theme, standalone, allowInvitingGuests, culture } = settingsStore;
    const { isAIAgentsFolder } = treeFoldersStore;

    return {
      theme,
      culture,
      roomId,
      hideSelector,
      defaultAccess,
      isOwner,
      isAdmin,
      isUserTariffLimit,
      standalone,
      allowInvitingGuests,
      isAIAgentsFolder,
    };
  },
)(observer(ExternalLinks));
