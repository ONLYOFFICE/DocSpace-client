import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
import PeopleIcon from "PUBLIC_DIR/images/people.react.svg?url";
import CopyIcon from "PUBLIC_DIR/images/copy.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

import { useTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";

import Avatar from "@docspace/components/avatar";
import Link from "@docspace/components/link";
import ComboBox from "@docspace/components/combobox";
import IconButton from "@docspace/components/icon-button";

import { StyledLinkRow } from "./StyledShare";

const LinkRow = ({ onAddClick, links }) => {
  const { t } = useTranslation(["SharingPanel"]);

  const shareOptions = [
    {
      key: "anyone",
      label: t("AnyoneWithLink"),
    },
    {
      key: "users",
      label: t("DoсSpaceUsersOnly"),
    },
  ];

  const accessOptions = [
    {
      key: "editing",
      label: "Editing",
      icon: AccessEditReactSvgUrl,
    },
    {
      key: "custom-filter",
      label: "Custom filter",
      icon: CustomFilterReactSvgUrl,
    },
    {
      key: "commenting",
      label: "Commenting",
      icon: AccessCommentReactSvgUrl,
    },
    {
      key: "viewing",
      label: "Viewing",
      icon: EyeReactSvgUrl,
    },
    {
      key: "deny-access",
      label: "Deny access",
      icon: EyeOffReactSvgUrl,
    },
    {
      key: "separator",
      isSeparator: true,
    },
    {
      key: "remove",
      label: "Remove",
      icon: RemoveReactSvgUrl,
    },
  ];

  const onCopyLink = () => {};

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
          const selected = shareOptions.find(
            (option) => option.key === link.type
          );

          return (
            <StyledLinkRow key={`share-link-row-${index}`}>
              <Avatar
                size="min"
                source={selected.key === "anyone" ? UniverseIcon : PeopleIcon}
              />
              <ComboBox
                directionY={"both"}
                options={shareOptions}
                selectedOption={selected}
                //onSelect={onSelect}
                scaled={false}
                scaledOptions={false}
                showDisabledItems={true}
                size="content"
                dropDownMaxHeight={200}
                fillIcon={false}
                withBlur={isMobileOnly}
                modernView={true}
              />
              <div className="link-actions">
                <IconButton
                  size={16}
                  iconName={CopyIcon}
                  onClick={onCopyLink}
                  title={t("CreateAndCopy")}
                />
                <ComboBox
                  directionY={"both"}
                  options={accessOptions}
                  selectedOption={accessOptions[0]}
                  //onSelect={onSelect}
                  scaled={false}
                  scaledOptions={false}
                  showDisabledItems={true}
                  size="content"
                  dropDownMaxHeight={350}
                  fillIcon={false}
                  withBlur={isMobileOnly}
                  modernView={true}
                  type="onlyIcon"
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
