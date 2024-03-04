import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
import PeopleIcon from "PUBLIC_DIR/images/people.react.svg?url";
import CopyIcon from "PUBLIC_DIR/images/copy.react.svg?url";

import { RowSkeleton } from "../../../skeletons/share";
import { TFileLink } from "../../../api/files/types";
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

  const shareOptions = getShareOptions(t);
  const accessOptions = getAccessOptions(t, availableExternalRights);

  const onCopyLink = (link: TFileLink) => {
    copy(link.sharedTo.shareLink);
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
