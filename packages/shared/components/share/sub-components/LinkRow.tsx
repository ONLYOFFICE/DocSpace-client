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

import { useMemo } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import LinkIcon from "PUBLIC_DIR/images/tablet-link.react.svg?url";

import { RowSkeleton } from "../../../skeletons/share";
import { useIsMobile } from "../../../hooks/useIsMobile";
import type { TFileLink } from "../../../api/files/types";

import type { TOption } from "../../combobox";
import { ContextMenuButton } from "../../context-menu-button";

import {
  getAccessTypeOptions,
  getAccessRightOptions,
  getRoomAccessOptions,
} from "../Share.helpers";
import type { LinkRowProps } from "../Share.types";

import styles from "../Share.module.scss";

import LinkTitle from "./LinkTitle";
import { AccessTypeIcon } from "./AccessTypeIcon";
import { LinkExpiration } from "./LinkExpiration";
import { LinkTypeSelector } from "./LinkTypeSelector";
import { AccessRightSelector } from "./AccessRightSelector";

const LinkRow = ({
  links,
  changeShareOption,
  changeAccessOption,
  changeExpirationOption,
  availableExternalRights,
  loadingLinks,
  isFolder = false,
  isRoomsLink = false,
  isArchiveFolder = false,
  getData,
  onOpenContextMenu,
  onCloseContextMenu,
  onAccessRightsSelect,
  removedExpiredLink,
  onCopyLink,
}: LinkRowProps) => {
  const { t } = useTranslation("Common");

  const isMobileViewLink = useIsMobile();

  const shareOptions = useMemo(() => getAccessTypeOptions(t), [t]);
  const accessOptions = useMemo(() => {
    return availableExternalRights
      ? getAccessRightOptions(t, availableExternalRights)
      : [];
  }, [availableExternalRights, t]);

  const roomAccessOptions = useMemo(
    () =>
      (isRoomsLink || isFolder) && availableExternalRights
        ? getRoomAccessOptions(t, availableExternalRights)
        : [],
    [t, isFolder, isRoomsLink, availableExternalRights],
  );

  const changeAccessOptionHandler = (item: TOption, link: TFileLink) => {
    if (isRoomsLink) {
      return onAccessRightsSelect?.(item);
    }

    changeAccessOption?.(item, link);
  };

  const className = classNames(styles.linkRow, {
    [styles.isDisabled]: isArchiveFolder,
  });

  return links?.map((link) => {
    if (("isLoaded" in link && link.isLoaded) || "isLoaded" in link)
      return <RowSkeleton key="loading-link" />;

    const shareOption = shareOptions.find(
      (option) => option.internal === link.sharedTo.internal,
    )!;

    const selectedAccessOption = accessOptions.find(
      (option) => option && "access" in option && option.access === link.access,
    );

    const roomSelectedOptions = roomAccessOptions.find(
      (option) => option && "access" in option && option.access === link.access,
    );

    const isExpiredLink = link.sharedTo.isExpired;
    const isLocked = !!link.sharedTo.password;
    const linkTitle = link.sharedTo.title;
    const shareLink = link.sharedTo.shareLink;

    const isLoaded = loadingLinks.includes(link.sharedTo.id);
    const canEditInternal = link.canEditInternal;

    return (
      <div className={className} key={link.sharedTo.id}>
        <AccessTypeIcon
          avatar={LinkIcon}
          isLoaded={isLoaded}
          isLocked={isLocked}
        />
        <div className={styles.linkOptions}>
          <LinkTitle
            t={t}
            isLoaded={isLoaded}
            linkTitle={linkTitle}
            shareLink={shareLink}
            isExpiredLink={isExpiredLink}
            disabledCopy={isArchiveFolder}
            onCopyLink={() => onCopyLink(link)}
          />
          <LinkExpiration
            t={t}
            link={link}
            isLoaded={isLoaded}
            isRoomsLink={isRoomsLink}
            isArchiveFolder={isArchiveFolder}
            removedExpiredLink={removedExpiredLink}
            changeExpirationOption={changeExpirationOption}
          />
        </div>
        <div className={styles.linkActions}>
          <LinkTypeSelector
            isLoaded={isLoaded}
            canEditInternal={canEditInternal}
            isExpiredLink={isExpiredLink}
            onSelect={(item) => changeShareOption(item, link)}
            selectedOption={shareOption}
            options={shareOptions}
          />
          <AccessRightSelector
            link={link}
            isFolder={isFolder}
            isLoaded={isLoaded}
            isRoomsLink={isRoomsLink}
            isExpiredLink={isExpiredLink}
            accessOptions={accessOptions}
            selectedAccessOption={selectedAccessOption}
            isArchiveFolder={isArchiveFolder}
            isMobileViewLink={isMobileViewLink}
            roomAccessOptions={roomAccessOptions}
            roomSelectedOptions={roomSelectedOptions}
            changeAccessOption={changeAccessOptionHandler}
          />
          {!isArchiveFolder ? (
            <ContextMenuButton
              directionY="both"
              getData={() => getData(link)}
              onClick={onOpenContextMenu}
              onClose={onCloseContextMenu}
              title={t("Files:ShowLinkActions")}
              isDisabled={isExpiredLink || isLoaded}
            />
          ) : null}
        </div>
      </div>
    );
  });
};

export default LinkRow;
