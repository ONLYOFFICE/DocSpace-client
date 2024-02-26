import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
import PeopleIcon from "PUBLIC_DIR/images/people.react.svg?url";
import CopyIcon from "PUBLIC_DIR/images/copy.react.svg?url";

import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import { Avatar } from "@docspace/shared/components/avatar";
import { Link } from "@docspace/shared/components/link";
import { ComboBox } from "@docspace/shared/components/combobox";
import { IconButton } from "@docspace/shared/components/icon-button";
import { toastr } from "@docspace/shared/components/toast";
import { Loader } from "@docspace/shared/components/loader";

import { StyledLinkRow, StyledSquare } from "./StyledShare";
import { getShareOptions, getAccessOptions } from "./optionsHelper";
import ExpiredComboBox from "./ExpiredComboBox";
import { RowLoader } from "./ShareLoader";

const LinkRow = ({
  onAddClick,
  links,
  changeShareOption,
  changeAccessOption,
  changeExpirationOption,
  availableExternalRights,
  loadingLinks,
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
    toastr.success(t("Common:LinkSuccessfullyCopied"));
  };

  return (
    <>
      {!links?.length ? (
        <StyledLinkRow>
          <StyledSquare>
            <IconButton size={12} iconName={PlusIcon} isDisabled />
          </StyledSquare>
          <Link
            type="action"
            isHovered={true}
            fontWeight={600}
            onClick={onAddClick}
          >
            {t("Common:CreateAndCopy")}
          </Link>
        </StyledLinkRow>
      ) : (
        links.map((link, index) => {
          if (link.isLoaded) return <RowLoader />;

          const shareOption = shareOptions.find(
            (option) => option.internal === link.sharedTo?.internal,
          );
          const accessOption = accessOptions.find(
            (option) => option.access === link.access,
          );
          const avatar =
            shareOption?.key === "anyone" ? UniverseIcon : PeopleIcon;

          const isExpiredLink = link.sharedTo.isExpired;

          const isLoaded = loadingLinks.includes(link.sharedTo.id);

          return (
            <StyledLinkRow key={`share-link-row-${index}`}>
              {isLoaded ? (
                <Loader className="loader" size="20px" type="track" />
              ) : (
                <Avatar size="min" source={avatar} />
              )}
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
                  modernView={true}
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
                  directionY={"both"}
                  options={accessOptions}
                  selectedOption={accessOption}
                  onSelect={(item) => changeAccessOption(item, link)}
                  scaled={false}
                  scaledOptions={false}
                  showDisabledItems={true}
                  size="content"
                  fillIcon={true}
                  modernView={true}
                  type="onlyIcon"
                  isDisabled={isExpiredLink || isLoaded}
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
