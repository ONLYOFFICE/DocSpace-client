import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
import PeopleIcon from "PUBLIC_DIR/images/people.react.svg?url";
import CopyIcon from "PUBLIC_DIR/images/copy.react.svg?url";

import { useTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";
import copy from "copy-to-clipboard";

import Avatar from "@docspace/components/avatar";
import Link from "@docspace/components/link";
import ComboBox from "@docspace/components/combobox";
import IconButton from "@docspace/components/icon-button";
import toastr from "@docspace/components/toast/toastr";

import { StyledLinkRow } from "./StyledShare";
import { getShareOptions, getAccessOptions } from "./optionsHelper";
import ExpiredComboBox from "./ExpiredComboBox";

const LinkRow = ({
  onAddClick,
  links,
  changeShareOption,
  changeAccessOption,
  changeExpirationOption,
  availableExternalRights,
}) => {
  const { t } = useTranslation([
    "SharingPanel",
    "Files",
    "Translations",
    "Common",
  ]);

  const shareOptions = getShareOptions(t);
  const accessOptions = getAccessOptions(t, availableExternalRights);

  const onCopyLink = (link) => {
    copy(link.sharedTo.shareLink);
    toastr.success(t("Files:LinkSuccessfullyCopied"));
  };

  return (
    <>
      {!links?.length ? (
        <StyledLinkRow>
          <Avatar size="min" source={PlusIcon} />
          <Link
            type="action"
            isHovered={true}
            fontWeight={600}
            onClick={onAddClick}
          >
            {t("CreateAndCopy")}
          </Link>
        </StyledLinkRow>
      ) : (
        links.map((link, index) => {
          const shareOption = shareOptions.find(
            (option) => option.internal === link.sharedTo.internal
          );
          const accessOption = accessOptions.find(
            (option) => option.access === link.access
          );
          const avatar =
            shareOption.key === "anyone" ? UniverseIcon : PeopleIcon;

          const isExpiredLink = link.sharedTo.isExpired;

          return (
            <StyledLinkRow key={`share-link-row-${index}`}>
              <Avatar size="min" source={avatar} />
              <div className="link-options">
                <ComboBox
                  className="internal-combobox"
                  directionY={"both"}
                  options={shareOptions}
                  selectedOption={shareOption}
                  onSelect={(item) => changeShareOption(item, link)}
                  scaled={false}
                  scaledOptions={false}
                  showDisabledItems={true}
                  size="content"
                  fillIcon={false}
                  withBlur={isMobileOnly}
                  modernView={true}
                  isDisabled={isExpiredLink}
                />
                <ExpiredComboBox
                  link={link}
                  changeExpirationOption={changeExpirationOption}
                />
              </div>
              <div className="link-actions">
                <IconButton
                  size={16}
                  iconName={CopyIcon}
                  onClick={() => onCopyLink(link)}
                  title={t("CreateAndCopy")}
                  isDisabled={isExpiredLink}
                />
                <ComboBox
                  directionY={"both"}
                  options={accessOptions}
                  selectedOption={accessOption}
                  onSelect={(item) => changeAccessOption(item, link)}
                  scaled={false}
                  scaledOptions={false}
                  showDisabledItems={true}
                  size="content"
                  fillIcon={true}
                  withBlur={isMobileOnly}
                  modernView={true}
                  type="onlyIcon"
                  isDisabled={isExpiredLink}
                />
              </div>
            </StyledLinkRow>
          );
        })
      )}
    </>
  );
};

export default LinkRow;
