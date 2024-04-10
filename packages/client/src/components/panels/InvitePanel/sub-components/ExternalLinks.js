// (c) Copyright Ascensio System SIA 2009-2024
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

import MediaDownloadReactSvgUrl from "PUBLIC_DIR/images/media.download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import React, { useState, useRef, useCallback } from "react";
import { inject, observer } from "mobx-react";
import copy from "copy-to-clipboard";

import { toastr } from "@docspace/shared/components/toast";
import { objectToGetParams } from "@docspace/shared/utils/common";

import { InputBlock } from "@docspace/shared/components/input-block";
import { IconButton } from "@docspace/shared/components/icon-button";
import { DropDown } from "@docspace/shared/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import AccessSelector from "./AccessSelector";

import {
  StyledBlock,
  StyledSubHeader,
  StyledInviteInput,
  StyledInviteInputContainer,
  StyledToggleButton,
  StyledDescription,
} from "../StyledInvitePanel";
import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";

const ExternalLinks = ({
  t,
  roomId,
  roomType,
  defaultAccess,
  shareLinks,
  setShareLinks,
  setInvitationLinks,
  isOwner,
  onChangeExternalLinksVisible,
  externalLinksVisible,
  setActiveLink,
  activeLink,
  isMobileView,
}) => {
  const [actionLinksVisible, setActionLinksVisible] = useState(false);

  const inputsRef = useRef();

  const toggleLinks = () => {
    if (roomId === -1) {
      const link = shareLinks.find((l) => l.access === +defaultAccess);

      setActiveLink(link);
      copyLink(link.shareLink);
    } else {
      !externalLinksVisible ? editLink() : disableLink();
    }
    onChangeExternalLinksVisible(!externalLinksVisible);
  };

  const disableLink = () => {
    setInvitationLinks(roomId, "Invite", 0, shareLinks[0].id);
    setShareLinks([]);
  };

  const editLink = async () => {
    const type =
      roomType === RoomsType.PublicRoom
        ? ShareAccessRights.Collaborator
        : ShareAccessRights.ReadOnly;

    const link = await setInvitationLinks(roomId, "Invite", type);

    const { shareLink, id, title, expirationDate } = link.sharedTo;

    const activeLink = {
      id,
      title,
      shareLink,
      expirationDate,
      access: link.access || defaultAccess,
    };

    copyLink(shareLink);
    setShareLinks([activeLink]);
    setActiveLink(activeLink);
  };

  const onSelectAccess = (access) => {
    let link = null;
    if (roomId === -1) {
      link = shareLinks.find((l) => l.access === access.access);

      setActiveLink(link);
    } else {
      setInvitationLinks(roomId, "Invite", +access.access, shareLinks[0].id);

      link = shareLinks[0];
      setActiveLink(shareLinks[0]);
    }

    copyLink(link.shareLink);
  };

  const copyLink = (link) => {
    if (link) {
      toastr.success(
        `${t("Translations:LinkCopySuccess")}. ${t(
          "Translations:LinkValidTime",
          { days_count: 7 },
        )}`,
      );
      copy(link);
    }
  };

  const onCopyLink = () => copyLink(activeLink.shareLink);

  const toggleActionLinks = () => {
    setActionLinksVisible(!actionLinksVisible);
  };

  const closeActionLinks = () => {
    setActionLinksVisible(false);
  };

  const shareEmail = useCallback(
    (link) => {
      const { title, shareLink } = link;
      const subject = t("SharingPanel:ShareEmailSubject", { title });
      const body = t("SharingPanel:ShareEmailBody", { title, shareLink });

      const mailtoLink =
        "mailto:" +
        objectToGetParams({
          subject,
          body,
        });

      window.open(mailtoLink, "_self");

      closeActionLinks();
    },
    [closeActionLinks, t],
  );

  const shareTwitter = useCallback(
    (link) => {
      const { shareLink } = link;

      const twitterLink =
        "https://twitter.com/intent/tweet" +
        objectToGetParams({
          text: shareLink,
        });

      window.open(twitterLink, "", "width=1000,height=670");

      closeActionLinks();
    },
    [closeActionLinks],
  );

  return (
    <StyledBlock noPadding ref={inputsRef}>
      <StyledSubHeader inline>
        {t("InviteViaLink")}
        {false && ( //TODO: Change to linksVisible after added link information from backend
          <div style={{ position: "relative" }}>
            <IconButton
              size={16}
              iconName={MediaDownloadReactSvgUrl}
              hoverColor="#333333"
              iconColor="#A3A9AE"
              onClick={toggleActionLinks}
            />
            <DropDown
              open={actionLinksVisible}
              clickOutsideAction={closeActionLinks}
              withBackdrop={false}
              isDefaultMode={false}
              fixedDirection={true}
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
        )}
        <StyledToggleButton
          className="invite-via-link"
          isChecked={externalLinksVisible}
          onChange={toggleLinks}
        />
      </StyledSubHeader>
      <StyledDescription>
        {roomId === -1
          ? t("InviteViaLinkDescriptionAccounts")
          : t("InviteViaLinkDescriptionRoom")}
      </StyledDescription>
      {externalLinksVisible && (
        <StyledInviteInputContainer key={activeLink.id}>
          <StyledInviteInput>
            <InputBlock
              className="input-link"
              scale
              value={activeLink.shareLink}
              isReadOnly
              iconName={CopyReactSvgUrl}
              onIconClick={onCopyLink}
              hoverColor="#333333"
              iconColor="#A3A9AE"
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
          />
        </StyledInviteInputContainer>
      )}
    </StyledBlock>
  );
};

export default inject(({ userStore, dialogsStore, filesStore }) => {
  const { isOwner } = userStore.user;
  const { invitePanelOptions } = dialogsStore;
  const { setInvitationLinks } = filesStore;
  const { roomId, hideSelector, defaultAccess } = invitePanelOptions;

  return {
    setInvitationLinks,
    roomId,
    hideSelector,
    defaultAccess,
    isOwner,
  };
})(observer(ExternalLinks));
