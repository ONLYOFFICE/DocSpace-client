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
import React, { useState, useRef } from "react";
import { inject, observer } from "mobx-react";

import { copyShareLink } from "@docspace/shared/utils/copy";
import { toastr } from "@docspace/shared/components/toast";
// import { objectToGetParams } from "@docspace/shared/utils/common";

import { InputBlock } from "@docspace/shared/components/input-block";
// import { IconButton } from "@docspace/shared/components/icon-button";
// import { DropDown } from "@docspace/shared/components/drop-down";
// import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { getDefaultAccessUser } from "@docspace/shared/utils/getDefaultAccessUser";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";

// import { globalColors } from "@docspace/shared/themes";
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
  getPortalInviteLink,
  isUserTariffLimit,
  standalone,
  allowInvitingGuests,
}) => {
  const [isLinksToggling, setIsLinksToggling] = useState(false);

  // const [actionLinksVisible, setActionLinksVisible] = useState(false);

  const inputsRef = useRef();

  const copyLink = (link) => {
    if (link) {
      toastr.success(
        `${t("Common:LinkCopySuccess")}. ${t("Translations:LinkValidTime", {
          days_count: 7,
        })}`,
      );

      copyShareLink(link);
    }
  };

  const disableLink = async () => {
    shareLinks?.length &&
      (await api.rooms.setInvitationLinks(
        roomId,
        "Invite",
        0,
        shareLinks[0].id,
      ));
    return setShareLinks([]);
  };

  const editLink = async () => {
    const type = getDefaultAccessUser(roomType);

    const link = await api.rooms.setInvitationLinks(roomId, "Invite", type);

    const { shareLink, id, title, expirationDate } = link.sharedTo;

    const newShareLink = {
      id,
      title,
      shareLink,
      expirationDate,
      access: link.access || defaultAccess,
    };

    copyLink(shareLink);
    setShareLinks([newShareLink]);
    return setActiveLink(newShareLink);
  };

  const onSelectAccess = async (access) => {
    let link = null;
    const selectedAccess = access.access;

    if (roomId === -1) {
      link = shareLinks.find((l) => l.access === selectedAccess);

      link.shareLink = await getPortalInviteLink(selectedAccess);

      setActiveLink(link);
      copyLink(link.shareLink);
    } else {
      api.rooms
        .setInvitationLinks(roomId, "Invite", +selectedAccess, shareLinks[0].id)
        .then(() => {
          link = shareLinks[0];
          setActiveLink(shareLinks[0]);
          copyLink(link.shareLink);
        })
        .catch((err) => toastr.error(err.message));
    }
  };

  const toggleLinks = async (e) => {
    if (isLinksToggling) return;

    setIsLinksToggling(true);

    try {
      if (roomId === -1) {
        if (e?.target?.checked) {
          const link = shareLinks.find((l) => l.access === defaultAccess);

          link.shareLink = await getPortalInviteLink(defaultAccess);

          setActiveLink(link);
          copyLink(link.shareLink);
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
    standalone,
  );

  const filteredAccesses =
    roomType === -1 ? accesses : filterPaidRoleOptions(accesses);

  return (
    <StyledExternalLink noPadding ref={inputsRef}>
      <StyledSubHeader $inline>
        {t("InviteViaLink")}
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
      <StyledDescription>
        {roomId === -1
          ? t("InviteViaLinkDescriptionAccounts", {
              productName: t("Common:ProductName"),
            })
          : !allowInvitingGuests
            ? t("InviteViaLinkDescriptionRoomMembers", {
                productName: t("Common:ProductName"),
              })
            : t("InviteViaLinkDescriptionRoomGuest")}
      </StyledDescription>
      {externalLinksVisible ? (
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
  }) => {
    const { isOwner, isAdmin } = userStore.user;
    const { invitePanelOptions } = dialogsStore;
    const { roomId, hideSelector, defaultAccess } = invitePanelOptions;
    const { getPortalInviteLink } = peopleStore.inviteLinksStore;
    const { isUserTariffLimit } = currentQuotaStore;
    const { standalone, allowInvitingGuests } = settingsStore;

    return {
      roomId,
      hideSelector,
      defaultAccess,
      isOwner,
      isAdmin,
      getPortalInviteLink,
      isUserTariffLimit,
      standalone,
      allowInvitingGuests,
    };
  },
)(observer(ExternalLinks));
