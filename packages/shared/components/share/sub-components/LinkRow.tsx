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

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
import PeopleIcon from "PUBLIC_DIR/images/people.react.svg?url";
import CopyIcon from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import LockedReactSvg from "PUBLIC_DIR/images/icons/12/locked.react.svg";

import { isMobile } from "../../../utils";
import { RowSkeleton } from "../../../skeletons/share";
import { TFileLink } from "../../../api/files/types";
import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Link } from "../../link";
import { ComboBox, ComboBoxSize, TOption } from "../../combobox";
import { IconButton } from "../../icon-button";
import { Loader, LoaderTypes } from "../../loader";
import { Text } from "../../text";

import { StyledLinkRow, StyledSquare } from "../Share.styled";
import {
  getShareOptions,
  getAccessOptions,
  getRoomAccessOptions,
  copyDocumentShareLink,
  copyRoomShareLink,
} from "../Share.helpers";
import { LinkRowProps } from "../Share.types";

import ExpiredComboBox from "./ExpiredComboBox";

import { AccessRightSelect } from "../../access-right-select";
import { ContextMenuButton } from "../../context-menu-button";

const LinkRow = ({
  onAddClick,
  links,
  changeShareOption,
  changeAccessOption,
  changeExpirationOption,
  availableExternalRights,
  loadingLinks,
  isRoomsLink,
  isPrimaryLink,
  isArchiveFolder,
  getData,
  onOpenContextMenu,
  onCloseContextMenu,
  onAccessRightsSelect,
  removedExpiredLink,
  isFormRoom,
}: LinkRowProps) => {
  const { t } = useTranslation(["Common", "Translations"]);
  const [isMobileViewLink, setIsMobileViewLink] = useState(isMobile());

  const shareOptions = getShareOptions(t, availableExternalRights) as TOption[];
  const accessOptions = availableExternalRights
    ? getAccessOptions(t, availableExternalRights)
    : [];

  const roomAccessOptions = isRoomsLink ? getRoomAccessOptions(t) : [];

  const onCheckHeight = () => {
    setIsMobileViewLink(isMobile());
  };

  useEffect(() => {
    onCheckHeight();
    window.addEventListener("resize", onCheckHeight);
    return () => {
      window.removeEventListener("resize", onCheckHeight);
    };
  }, []);

  const onCopyLink = (link: TFileLink) => {
    if (isRoomsLink) {
      return copyRoomShareLink(link, t);
    }

    copyDocumentShareLink(link, t);
  };

  return !links?.length ? (
    <StyledLinkRow onClick={onAddClick}>
      <StyledSquare>
        <IconButton size={12} iconName={PlusIcon} isDisabled />
      </StyledSquare>
      <Link className="create-and-copy_link" noHover fontWeight={600}>
        {t("Common:CreateAndCopy")}
      </Link>
    </StyledLinkRow>
  ) : (
    links.map((link, index) => {
      if (("isLoaded" in link && link.isLoaded) || "isLoaded" in link)
        return <RowSkeleton key="loading-link" />;

      const shareOption = shareOptions.find(
        (option) => option.internal === link.sharedTo.internal,
      );
      const accessOption = accessOptions.find(
        (option) =>
          option && "access" in option && option.access === link.access,
      );

      const roomSelectedOptions = roomAccessOptions.find(
        (option) =>
          option && "access" in option && option.access === link.access,
      );

      const avatar = shareOption?.key === "anyone" ? UniverseIcon : PeopleIcon;

      const isExpiredLink = link.sharedTo.isExpired;
      const isLocked = !!link.sharedTo.password;
      const linkTitle = link.sharedTo.title;

      const isLoaded = loadingLinks.includes(link.sharedTo.id);

      return (
        <StyledLinkRow
          isExpired={isExpiredLink}
          key={`share-link-row-${index * 5}`}
          isDisabled={isArchiveFolder}
        >
          {isLoaded ? (
            <Loader className="loader" size="20px" type={LoaderTypes.track} />
          ) : (
            <Avatar
              size={AvatarSize.min}
              role={AvatarRole.user}
              source={avatar}
              roleIcon={isLocked ? <LockedReactSvg /> : undefined}
              noClick
            />
          )}
          <div className="link-options">
            {isRoomsLink ? (
              <Text
                className="link-options_title link-options-title-room"
                truncate
              >
                {linkTitle}
              </Text>
            ) : !isExpiredLink ? (
              <ComboBox
                className="internal-combobox"
                directionY="both"
                options={shareOptions}
                selectedOption={shareOption ?? ({} as TOption)}
                onSelect={(item) => changeShareOption(item, link)}
                scaled={false}
                scaledOptions={false}
                showDisabledItems
                size={ComboBoxSize.content}
                manualWidth="auto"
                fillIcon={false}
                modernView
                isDisabled={isLoaded}
              />
            ) : (
              <Text className="link-options_title">{shareOption?.label}</Text>
            )}
            {isPrimaryLink ? (
              <Text
                fontSize="12px"
                fontWeight="400"
                lineHeight="16px"
                className="link-time-info"
              >
                {t("Common:NoTimeLimit")}
              </Text>
            ) : (
              <ExpiredComboBox
                link={link}
                availableExternalRights={availableExternalRights}
                changeExpirationOption={changeExpirationOption}
                isDisabled={isLoaded || isArchiveFolder}
                isRoomsLink={isRoomsLink}
                changeAccessOption={changeAccessOption}
                removedExpiredLink={removedExpiredLink}
              />
            )}
          </div>
          <div className="link-actions">
            {!isArchiveFolder ? (
              <IconButton
                className="link-actions_copy-icon"
                size={16}
                iconName={CopyIcon}
                onClick={() => onCopyLink(link)}
                title={t("Common:CreateAndCopy")}
                isDisabled={isExpiredLink || isLoaded}
              />
            ) : null}
            {isRoomsLink ? (
              <>
                {!isFormRoom ? (
                  <AccessRightSelect
                    selectedOption={roomSelectedOptions ?? ({} as TOption)}
                    onSelect={onAccessRightsSelect}
                    accessOptions={roomAccessOptions}
                    modernView
                    directionY="both"
                    type="onlyIcon"
                    manualWidth="300px"
                    isDisabled={isExpiredLink || isLoaded || isArchiveFolder}
                    withBlur={isMobileViewLink}
                    isMobileView={isMobileViewLink}
                    fixedDirection={isMobileViewLink}
                    isAside={isMobileViewLink}
                    topSpace={16}
                    usePortalBackdrop={isMobileViewLink}
                  />
                ) : null}
                {!isArchiveFolder ? (
                  <ContextMenuButton
                    getData={getData}
                    title={t("Files:ShowLinkActions")}
                    directionY="both"
                    onClick={onOpenContextMenu}
                    onClose={onCloseContextMenu}
                    isDisabled={isExpiredLink || isLoaded}
                  />
                ) : null}
              </>
            ) : (
              <ComboBox
                directionY="both"
                options={accessOptions}
                selectedOption={accessOption ?? ({} as TOption)}
                onSelect={(item) => changeAccessOption(item, link)}
                scaled={false}
                scaledOptions={false}
                showDisabledItems
                size={ComboBoxSize.content}
                fillIcon
                modernView
                type="onlyIcon"
                isDisabled={isExpiredLink || isLoaded}
                manualWidth="auto"
                withBackdrop={false}
              />
            )}
          </div>
        </StyledLinkRow>
      );
    })
  );
};

export default LinkRow;
