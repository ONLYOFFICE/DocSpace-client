import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import Text from "@docspace/components/text";
import Link from "@docspace/components/link";
import IconButton from "@docspace/components/icon-button";
import Tooltip from "@docspace/components/tooltip";
import toastr from "@docspace/components/toast/toastr";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";
import PlusReactSvgUrl from "PUBLIC_DIR/images/actions.button.plus.react.svg?url";
import PublicRoomBar from "./PublicRoomBar";
import {
  LinksBlock,
  StyledLinkRow,
  StyledPublicRoomBlock,
} from "./StyledPublicRoom";
import LinkRow from "./LinkRow";
import { RoomsType } from "@docspace/common/constants";
import Avatar from "@docspace/components/avatar";
import copy from "copy-to-clipboard";

const LINKS_LIMIT_COUNT = 10;

const PublicRoomBlock = (props) => {
  const {
    t,
    externalLinks,
    isArchiveFolder,
    setLinkParams,
    setEditLinkPanelIsVisible,
    roomType,
    primaryLink,
    getPrimaryLink,
    roomId,
    setExternalLink,
  } = props;

  const isPublicRoom = roomType === RoomsType.PublicRoom;

  const onAddNewLink = async () => {
    if (isPublicRoom || primaryLink) {
      setLinkParams({ isEdit: false });
      setEditLinkPanelIsVisible(true);
    } else {
      getPrimaryLink(roomId).then((link) => {
        setExternalLink(link);
        copy(link.sharedTo.shareLink);
        toastr.success(t("Files:LinkSuccessfullyCopied"));
      });
    }
  };

  return (
    <StyledPublicRoomBlock>
      {((primaryLink && !isArchiveFolder) || isPublicRoom) && (
        <PublicRoomBar
          headerText={t("Files:RoomAvailableViaExternalLink")}
          bodyText={t("CreateEditRoomDialog:PublicRoomBarDescription")}
        />
      )}
      <>
        {isArchiveFolder ? (
          <LinksBlock>
            <Text fontSize="14px" fontWeight={600}>
              {t("Files:Links")}: {externalLinks.length}
            </Text>
          </LinksBlock>
        ) : (
          <>
            <div className="primary-link-block">
              <LinksBlock>
                <Text fontSize="14px" fontWeight={600}>
                  {t("Files:PrimaryLink")}
                </Text>
              </LinksBlock>
              {primaryLink ? (
                <LinkRow link={primaryLink} />
              ) : (
                <StyledLinkRow onClick={onAddNewLink}>
                  <Avatar size="min" source={PlusReactSvgUrl} />
                  <Link
                    isHovered
                    type="action"
                    fontSize="14px"
                    fontWeight={600}
                    className="external-row-link"
                  >
                    {t("Files:CreateAndCopy")}
                  </Link>
                </StyledLinkRow>
              )}
            </div>

            {primaryLink || externalLinks.length ? (
              <LinksBlock>
                <Text fontSize="14px" fontWeight={600}>
                  {externalLinks.length
                    ? t("LinksToViewingIcon")
                    : t("Files:AdditionalLinks")}
                </Text>

                <div
                  data-tooltip-id="emailTooltip"
                  data-tooltip-content={t(
                    "Files:MaximumNumberOfExternalLinksCreated"
                  )}
                >
                  <IconButton
                    className="link-to-viewing-icon"
                    iconName={LinksToViewingIconUrl}
                    onClick={onAddNewLink}
                    size={16}
                    isDisabled={externalLinks.length >= LINKS_LIMIT_COUNT}
                    title={t("Files:AddNewExternalLink")}
                  />

                  {externalLinks.length >= LINKS_LIMIT_COUNT && (
                    <Tooltip
                      float
                      id="emailTooltip"
                      getContent={({ content }) => (
                        <Text fontSize="12px">{content}</Text>
                      )}
                      place="bottom"
                    />
                  )}
                </div>
              </LinksBlock>
            ) : (
              <></>
            )}
          </>
        )}
      </>

      {externalLinks.length
        ? externalLinks.map((link) => (
            <LinkRow link={link} key={link?.sharedTo?.id} />
          ))
        : primaryLink && (
            <StyledLinkRow className="additional-link" onClick={onAddNewLink}>
              <Avatar size="min" source={PlusReactSvgUrl} />

              <Link
                isHovered
                type="action"
                fontSize="14px"
                fontWeight={600}
                className="external-row-link"
              >
                {t("Files:CreateNewLink")}
              </Link>
            </StyledLinkRow>
          )}
    </StyledPublicRoomBlock>
  );
};

export default inject(({ publicRoomStore, treeFoldersStore, dialogsStore }) => {
  const { primaryLink, additionalLinks, getPrimaryLink, setExternalLink } =
    publicRoomStore;
  const { isArchiveFolder } = treeFoldersStore;
  const { setLinkParams, setEditLinkPanelIsVisible } = dialogsStore;

  return {
    externalLinks: additionalLinks,
    isArchiveFolder,
    setLinkParams,
    setEditLinkPanelIsVisible,
    primaryLink,
    getPrimaryLink,
    setExternalLink,
  };
})(observer(PublicRoomBlock));
