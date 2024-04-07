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

import { useTranslation } from "react-i18next";

import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
import PeopleIcon from "PUBLIC_DIR/images/people.react.svg?url";
import CopyIcon from "PUBLIC_DIR/images/copy.react.svg?url";

import { RowSkeleton } from "../../../skeletons/share";
import { TFileLink } from "../../../api/files/types";
import { copyShareLink } from "../../../utils/copy";
import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Link, LinkType } from "../../link";
import { ComboBox, ComboBoxSize, TOption } from "../../combobox";
import { IconButton } from "../../icon-button";
import { toastr } from "../../toast";
import { Loader, LoaderTypes } from "../../loader";

import { StyledLinkRow, StyledSquare } from "../Share.styled";
import { getShareOptions, getAccessOptions } from "../Share.helpers";
import { LinkRowProps } from "../Share.types";

import ExpiredComboBox from "./ExpiredComboBox";

const LinkRow = ({
  onAddClick,
  links,
  changeShareOption,
  changeAccessOption,
  changeExpirationOption,
  availableExternalRights,
  loadingLinks,
}: LinkRowProps) => {
  const { t } = useTranslation(["Common"]);

  const shareOptions = getShareOptions(t) as TOption[];
  const accessOptions = getAccessOptions(t, availableExternalRights);

  const onCopyLink = (link: TFileLink) => {
    copyShareLink(link.sharedTo.shareLink);
    toastr.success(t("Common:LinkSuccessfullyCopied"));
  };

  return !links?.length ? (
    <StyledLinkRow>
      <StyledSquare>
        <IconButton size={12} iconName={PlusIcon} isDisabled />
      </StyledSquare>
      <Link
        type={LinkType.action}
        isHovered
        fontWeight={600}
        onClick={onAddClick}
      >
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
      const avatar = shareOption?.key === "anyone" ? UniverseIcon : PeopleIcon;

      const isExpiredLink = link.sharedTo.isExpired;

      const isLoaded = loadingLinks.includes(link.sharedTo.id);

      return (
        <StyledLinkRow key={`share-link-row-${index * 5}`}>
          {isLoaded ? (
            <Loader className="loader" size="20px" type={LoaderTypes.track} />
          ) : (
            <Avatar
              size={AvatarSize.min}
              role={AvatarRole.user}
              source={avatar}
            />
          )}
          <div className="link-options">
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
              fillIcon={false}
              modernView
              isDisabled={isExpiredLink || isLoaded}
            />
            <ExpiredComboBox
              link={link}
              changeExpirationOption={changeExpirationOption}
              isDisabled={isLoaded}
            />
          </div>
          <div className="link-actions">
            <IconButton
              size={16}
              iconName={CopyIcon}
              onClick={() => onCopyLink(link)}
              title={t("Common:CreateAndCopy")}
              isDisabled={isExpiredLink || isLoaded}
            />
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
            />
          </div>
        </StyledLinkRow>
      );
    })
  );
};

export default LinkRow;
