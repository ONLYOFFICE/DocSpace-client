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

import { useMemo } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import LinkIcon from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import ExternalLinkWarningIconUrl from "PUBLIC_DIR/images/external-link-warning.react.svg?url";

import { RowSkeleton } from "../../../skeletons/share";
import { useIsMobile } from "@docspace/ui-kit/hooks/use-is-mobile";
import type { TFileLink } from "../../../api/files/types";

import type { TOption } from "@docspace/ui-kit/components/combobox";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/ui-kit/components/context-menu-button";
import { toastr } from "@docspace/ui-kit/components/toast";

import {
  getAccessTypeOptions,
  getLinkAccessRightOptions,
  getRoomLinkAccessOptions,
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
  availableShareRights,
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
  blockExistingLinksOnRestrict,
  hideLinkTypeSelector,
  isExternalShareRestricted,
}: LinkRowProps) => {
  const { t } = useTranslation("Common");

  const isMobileViewLink = useIsMobile();

  const baseShareOptions = useMemo(() => getAccessTypeOptions(t), [t]);

  const shareOptions = useMemo(() => {
    if (!isExternalShareRestricted) return baseShareOptions;
    return baseShareOptions.map((opt) =>
      "internal" in opt && !opt.internal
        ? {
            ...opt,
            icon: ExternalLinkWarningIconUrl,
            fillIcon: false,
            disabled: true,
            className: "share-external-disabled",
            tooltip: t("Common:ExternalLinksDisabledByAdmin"),
          }
        : opt,
    );
  }, [t, baseShareOptions, isExternalShareRestricted]);

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

    const accessOptions = getLinkAccessRightOptions(
      t,
      availableShareRights,
      link.sharedTo.primary,
    );

    const roomAccessOptions = getRoomLinkAccessOptions(
      t,
      availableShareRights,
      link.sharedTo.primary,
    );

    const getShareOption = () => {
      if (!blockExistingLinksOnRestrict) {
        return baseShareOptions.find(
          (option) => option.internal === link.sharedTo.internal,
        )!;
      }

      const shareOption = shareOptions.find(
        (option) => option.internal === link.sharedTo.internal,
      )!;

      return shareOption;
    };

    const shareOption = getShareOption();

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
    const isBlockedByAdmin =
      isExternalShareRestricted &&
      !link.sharedTo.internal &&
      blockExistingLinksOnRestrict;

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
            isBlockedByAdmin={isBlockedByAdmin}
            onCopyLink={() =>
              isExpiredLink
                ? toastr.error(t("Common:LinkExpired"))
                : onCopyLink(link)
            }
          />
          {isBlockedByAdmin ? null : (
            <LinkExpiration
              t={t}
              link={link}
              isLoaded={isLoaded}
              isArchiveFolder={isArchiveFolder}
              removedExpiredLink={removedExpiredLink}
              changeExpirationOption={changeExpirationOption}
            />
          )}
        </div>
        <div className={styles.linkActions}>
          {!hideLinkTypeSelector && (
            <LinkTypeSelector
              isLoaded={isLoaded}
              canEditInternal={canEditInternal}
              onSelect={(item) => changeShareOption(item, link)}
              selectedOption={shareOption}
              options={shareOptions}
            />
          )}
          <AccessRightSelector
            link={link}
            isFolder={isFolder}
            isLoaded={isLoaded}
            isRoomsLink={isRoomsLink}
            accessOptions={accessOptions}
            selectedAccessOption={selectedAccessOption}
            isArchiveFolder={isArchiveFolder}
            isMobileViewLink={isMobileViewLink}
            roomAccessOptions={roomAccessOptions}
            roomSelectedOptions={roomSelectedOptions}
            changeAccessOption={changeAccessOptionHandler}
            isBlockedByAdmin={isBlockedByAdmin}
          />
          {!isArchiveFolder ? (
            <ContextMenuButton
              directionY="both"
              getData={() => getData(link)}
              onClick={onOpenContextMenu}
              onClose={onCloseContextMenu}
              title={t("Files:ShowLinkActions")}
              isDisabled={isLoaded}
            />
          ) : null}
        </div>
      </div>
    );
  });
};

export default LinkRow;
