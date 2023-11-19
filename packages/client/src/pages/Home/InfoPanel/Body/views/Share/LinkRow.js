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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";
import copy from "copy-to-clipboard";

import Avatar from "@docspace/components/avatar";
import Link from "@docspace/components/link";
import ComboBox from "@docspace/components/combobox";
import IconButton from "@docspace/components/icon-button";
import toastr from "@docspace/components/toast/toastr";

import { StyledLinkRow } from "./StyledShare";

const LinkRow = ({ onAddClick, links, fileId, editFileLink }) => {
  const { t } = useTranslation(["SharingPanel", "Files"]);

  const shareOptions = [
    {
      internal: false,
      key: "anyone",
      label: t("AnyoneWithLink"),
    },
    {
      internal: true,
      key: "users",
      label: t("DoсSpaceUsersOnly"),
    },
  ];

  const accessOptions = [
    {
      access: 10,
      key: "editing",
      label: "Editing",
      icon: AccessEditReactSvgUrl,
    },
    {
      access: 8,
      key: "custom-filter",
      label: "Custom filter",
      icon: CustomFilterReactSvgUrl,
    },
    {
      access: 6,
      key: "commenting",
      label: "Commenting",
      icon: AccessCommentReactSvgUrl,
    },
    {
      access: 2,
      key: "viewing",
      label: "Viewing",
      icon: EyeReactSvgUrl,
    },
    {
      access: 3,
      key: "deny-access",
      label: "Deny access",
      icon: EyeOffReactSvgUrl,
    },
    {
      key: "separator",
      isSeparator: true,
    },
    {
      access: 0,
      key: "remove",
      label: "Remove",
      icon: RemoveReactSvgUrl,
    },
  ];

  const onCopyLink = (link) => {
    copy(link.sharedTo.shareLink);
    toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
  };

  const changeShareOption = async (item, link) => {
    await editFileLink(
      fileId,
      link.sharedTo.id,
      link.access,
      link.sharedTo.primary,
      item.internal
    );
  };

  const changeAccessOption = async (item, link) => {
    await editFileLink(
      fileId,
      link.sharedTo.id,
      item.access,
      link.sharedTo.primary,
      link.internal
    );
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
          const selected = shareOptions.find(
            (option) => option.internal === link.sharedTo.internal
          );

          const access = accessOptions.find(
            (option) => option.access === link.access
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
                onSelect={(item) => changeShareOption(item, link)}
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
                  onClick={() => onCopyLink(link)}
                  title={t("CreateAndCopy")}
                />
                <ComboBox
                  directionY={"both"}
                  options={accessOptions}
                  selectedOption={access}
                  onSelect={(item) => changeAccessOption(item, link)}
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

export default inject(({ auth }) => {
  const { editFileLink } = auth.infoPanelStore;

  return {
    editFileLink,
  };
})(observer(LinkRow));
