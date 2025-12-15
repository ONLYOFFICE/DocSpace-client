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
import moment from "moment";
import { match, P } from "ts-pattern";
import { Trans } from "react-i18next";
import type { TFunction } from "i18next";

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import FillFormsReactSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";

import PeopleIcon from "PUBLIC_DIR/images/icons/16/catalog.accounts.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
// import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
// import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

import { globalColors } from "../../themes";
import {
  EmployeeActivationStatus,
  FileType,
  MembersSubjectType,
  ShareAccessRights,
  ShareRights,
} from "../../enums";
import { copyShareLink as copy } from "../../utils/copy";
import {
  isFile,
  isFolder,
  isFolderOrRoom,
  isRoom,
} from "../../utils/typeGuards";

import type { RoomMember, TRoom } from "../../api/rooms/types";
import type {
  TAvailableShareRights,
  TShareLinkAccessRightOption,
  TShareToUserAccessRightOption,
  TTranslation,
} from "../../types";
import type { TFile, TFileLink, TFolder } from "../../api/files/types";

import { Link } from "../link";
import { toastr } from "../toast";
import {
  TCopyShareLinkOptions,
  TShare,
  TShareMember,
  TShareMembers,
  TTitleShare,
} from "./Share.types";

export const getAccessTypeOptions = (t: TTranslation, withIcon = true) => {
  return [
    {
      internal: false,
      key: "anyone",
      label: t("Common:AnyoneWithLink"),
      icon: withIcon ? UniverseIcon : undefined,
    },
    {
      internal: true,
      key: "users",
      label: t("Common:SpaceUsersOnly", {
        productName: t("Common:ProductName"),
      }),
      icon: withIcon ? PeopleIcon : undefined,
    },
  ];
};

export const getLinkAccessRightOptions = (
  t: TTranslation,
  available?: TAvailableShareRights,
  isPrimary = false,
) => {
  const linkAccess =
    (isPrimary ? available?.PrimaryExternalLink : available?.ExternalLink) ||
    [];

  const accessOptions: Partial<
    Record<ShareRights, TShareLinkAccessRightOption>
  > = {
    [ShareRights.Editing]: {
      access: ShareAccessRights.Editing,
      key: "editing",
      label: t("Common:Editing"),
      icon: AccessEditReactSvgUrl,
    },
    [ShareRights.CustomFilter]: {
      access: ShareAccessRights.CustomFilter,
      key: "custom-filter",
      label: t("Common:CustomFilter"),
      icon: CustomFilterReactSvgUrl,
    },
    [ShareRights.Review]: {
      access: ShareAccessRights.Review,
      key: "review",
      label: t("Common:Review"),
      icon: AccessReviewReactSvgUrl,
    },
    [ShareRights.Comment]: {
      access: ShareAccessRights.Comment,
      key: "commenting",
      label: t("Common:Comment"),
      icon: AccessCommentReactSvgUrl,
    },
    [ShareRights.Read]: {
      access: ShareAccessRights.ReadOnly,
      key: "viewing",
      label: t("Common:ReadOnly"),
      icon: EyeReactSvgUrl,
      title: t("Common:ReadOnly"),
    },
    [ShareRights.FillForms]: {
      access: ShareAccessRights.FormFilling,
      key: "filling",
      label: t("Common:Filling"),
      icon: FillFormsReactSvgUrl,
    },
  };

  return linkAccess
    .map((access) => accessOptions[access])
    .filter((item): item is TShareLinkAccessRightOption => Boolean(item));
};

export const getRoomLinkAccessOptions = (
  t: TTranslation,
  available?: TAvailableShareRights,
  isPrimary = false,
) => {
  const roomAccess =
    (isPrimary ? available?.PrimaryExternalLink : available?.ExternalLink) ||
    [];

  const accessOptions: Partial<
    Record<ShareRights, TShareLinkAccessRightOption>
  > = {
    [ShareRights.Editing]: {
      access: ShareAccessRights.Editing,
      description: t("Common:RoleEditorDescription"),
      key: "editing",
      label: t("Common:Editor"),
      icon: AccessEditReactSvgUrl,
    },
    [ShareRights.Review]: {
      access: ShareAccessRights.Review,
      description: t("Common:RoleReviewerDescription"),
      key: "review",
      label: t("Common:RoleReviewer"),
      icon: AccessReviewReactSvgUrl,
    },
    [ShareRights.Comment]: {
      access: ShareAccessRights.Comment,
      description: t("Common:RoleCommentatorDescription"),
      key: "commenting",
      label: t("Commentator"),
      icon: AccessCommentReactSvgUrl,
    },
    [ShareRights.Read]: {
      access: ShareAccessRights.ReadOnly,
      description: t("Common:RoleViewerDescription"),
      key: "viewing",
      label: t("Common:Viewer"),
      icon: EyeReactSvgUrl,
    },
    [ShareRights.FillForms]: {
      access: ShareAccessRights.FormFilling,
      description: "",
      key: "filling",
      label: t("Common:Filling"),
      icon: FillFormsReactSvgUrl,
      title: t("Common:FillingOnly"),
    },
  };

  return roomAccess
    .map((access) => accessOptions[access])
    .filter((item): item is TShareLinkAccessRightOption => Boolean(item));
};

export const getExpiredOptions = (
  t: TTranslation,
  setTwelveHours: VoidFunction,
  setOneDay: VoidFunction,
  setSevenDays: VoidFunction,
  setUnlimited: VoidFunction,
  onCalendarOpen: VoidFunction,
  locale: string,
) => {
  const relativeTime = new Intl.RelativeTimeFormat(locale, {
    numeric: "always",
    style: "long",
  });

  const oneDay = relativeTime.format(1, "day");
  const severalDays = relativeTime.format(7, "day");
  const severalHours = relativeTime.format(12, "hours");

  return [
    {
      key: "twelvehours",
      label: severalHours,
      onClick: () => setTwelveHours(),
    },
    {
      key: "oneday",
      label: oneDay,
      onClick: () => setOneDay(),
    },
    {
      key: "sevendays",
      label: severalDays,
      onClick: () => setSevenDays(),
    },
    {
      key: "unlimited",
      label: t("Common:Unlimited"),
      onClick: () => setUnlimited(),
    },
    {
      key: "custom",
      label: t("Common:Custom"),
      onClick: () => onCalendarOpen(),
    },
  ];
};

export const getDate = (expirationDate: string) => {
  if (!expirationDate) return "";

  const currentDare = moment(new Date());
  const expDate = moment(new Date(expirationDate));
  const calculatedDate = expDate.diff(currentDare, "days");

  if (calculatedDate < 1) {
    return moment
      .duration(expDate.diff(currentDare, "hours") + 1, "hours")
      .humanize();
  }

  return moment.duration(calculatedDate + 1, "days").humanize();
};

export const isExpired = (expirationDate: string | Date) => {
  const currentDare = moment(new Date());
  const expDate = moment(new Date(expirationDate));

  return currentDare.unix() - expDate.unix() > 0;
};

export const getPasswordDescription = (t: TFunction, link: TFileLink) => {
  return link.sharedTo.password ? (
    <>&nbsp;{t("Common:RoomShareLinkPassword")}</>
  ) : (
    ""
  );
};

export const getLinkRestrictionDescription = (
  t: TFunction,
  link: TFileLink,
) => {
  return link.sharedTo.denyDownload ? (
    <>&nbsp;{t("Common:RoomShareLinkRestrictionActivated")}</>
  ) : (
    ""
  );
};

export const getNameAccess = (access: ShareAccessRights, t: TTranslation) => {
  switch (access) {
    case ShareAccessRights.Editing:
      return t("Common:EditButton");
    case ShareAccessRights.CustomFilter:
      return t("Common:UseCustomFilter");
    case ShareAccessRights.Review:
      return t("Common:Review");
    case ShareAccessRights.Comment:
      return t("Common:Comment");
    case ShareAccessRights.ReadOnly:
      return t("Common:ReadOnly");
    case ShareAccessRights.FormFilling:
      return t("Common:FillOut");
    default:
      return "";
  }
};

export const getNameAccessRoom = (
  access: ShareAccessRights,
  t: TTranslation,
) => {
  switch (access) {
    case ShareAccessRights.Editing:
      return t("Common:EditButton");
    case ShareAccessRights.Review:
      return t("Common:Review");
    case ShareAccessRights.Comment:
      return t("Common:Comment");
    case ShareAccessRights.ReadOnly:
      return t("Common:View");
    case ShareAccessRights.FormFilling:
      return t("Common:FillOut");
    default:
      return "";
  }
};

export const getTranslationDate = (
  expirationDate: TFileLink["sharedTo"]["expirationDate"],
  t: TFunction,
) => {
  if (expirationDate) {
    const date = getDate(expirationDate);

    return (
      <Trans
        t={t}
        ns="Common"
        values={{ date }}
        i18nKey="LinkExpireAfter"
        components={{ 1: <strong key="strong-expire-after" /> }}
      />
    );
  }

  return (
    <Trans
      t={t}
      ns="Common"
      i18nKey="LinkNoExpiration"
      components={{ 1: <strong key="strong-link-valid" /> }}
    />
  );
};

export const canShowManageLink = (
  item: TFile | TFolder,
  buffer: TFile | TFolder | null,
  infoPanelVisible: boolean,
  infoPanelView: string,
): boolean => {
  if (isFolderOrRoom(item) && !item.security?.EditAccess) return false;

  if (!buffer) return true;

  const isEqual =
    item.id === buffer.id &&
    item.title === buffer.title &&
    isFolderOrRoom(item) === isFolderOrRoom(buffer);

  const view =
    (isRoom(item) && infoPanelView !== "info_members") ||
    (!isRoom(item) && infoPanelView !== "info_share");

  return !isEqual || view || !infoPanelVisible;
};

export const getAccessTypeText = (
  t: TFunction,
  item: TFile | TFolder | TRoom,
  link: TFileLink,
) => {
  const accessType = link.sharedTo.internal
    ? t("Common:SpaceUsersOnly", {
        productName: t("Common:ProductName"),
      })
    : t("Common:AnyoneWithLink");

  if (isFile(item)) {
    const accessRights = getNameAccess(link.access, t).toLocaleLowerCase();

    return (
      <Trans
        t={t}
        ns="Common"
        i18nKey="LinkAccessFile"
        values={{ accessType, accessRights }}
        components={{
          1: <strong key="strong-access-type" />,
          3: <strong key="strong-access-rights" />,
        }}
      />
    );
  }

  const accessRights = getNameAccessRoom(link.access, t).toLocaleLowerCase();

  const shareContents =
    link.access === ShareAccessRights.FormFilling
      ? t("Common:ShareForm")
      : t("Common:ShareContents");

  const shareParent = isRoom(item)
    ? t("Common:ShareTheRoom")
    : t("Common:ShareTheFolder");

  return (
    <Trans
      t={t}
      ns="Common"
      i18nKey="SharePermissionsEntityAccessScope"
      values={{ accessType, accessRights, shareContents, shareParent }}
      components={{
        1: <strong key="strong-access-type" />,
        3: <strong key="strong-access-rights" />,
      }}
    />
  );
};

export const copyShareLink = async (
  item: TFile | TFolder | TRoom,
  link: TFileLink,
  t: TFunction,
  linkOptions?: TCopyShareLinkOptions,
) => {
  await copy(link.sharedTo.shareLink);

  const { expirationDate } = link.sharedTo;

  const date = getTranslationDate(expirationDate, t);

  const access = getAccessTypeText(t, item, link);

  const password = getPasswordDescription(t, link);
  const restriction = getLinkRestrictionDescription(t, link);

  toastr.success(
    <span>
      {access}
      {password}
      {restriction}
      &nbsp;
      {date}
      {linkOptions?.canShowLink && linkOptions?.onClickLink ? (
        <>
          <strong>.</strong>
          &nbsp;
          <Link
            color={globalColors.lightBlueMain}
            isHovered
            onClick={linkOptions.onClickLink}
          >
            {t("Common:ManageNotifications")}
          </Link>
        </>
      ) : null}
    </span>,
    t("Common:LinkCopiedToClipboard"),
  );
};

export const evenPrimaryLink = (fileLinks: TFileLink[]) => {
  return fileLinks.some((link) => link?.sharedTo?.primary);
};

export const convertMembers = (
  membersList: RoomMember[],
  t: TFunction,
): TShareMembers => {
  const owner: TShare[] = [];
  const users: TShare[] = [];
  const administrators: TShare[] = [];
  const expected: TShare[] = [];
  const groups: TShare[] = [];
  const guests: TShare[] = [];

  membersList?.forEach(
    ({ access, canEditAccess, sharedTo, subjectType, isOwner }) => {
      const member: TShareMember = {
        access,
        canEditAccess,
        ...sharedTo,
      };

      if (
        "activationStatus" in member &&
        member.activationStatus === EmployeeActivationStatus.Pending
      ) {
        if (expected.length === 0) {
          expected.push({
            id: "expected",
            displayName: t("InfoPanel:ExpectUsers"),
            isTitle: true,
            isExpect: true,
          } satisfies TTitleShare);
        }

        member.isExpect = true;
        expected.push(member);
      } else if (isOwner && location.pathname.includes("rooms/personal")) {
        if (owner.length === 0) {
          owner.push({
            id: "owner",
            displayName: t("Common:Owner"),
            isTitle: true,
          } satisfies TTitleShare);
        }

        owner.push(member);
      } else if (access === ShareAccessRights.RoomManager || isOwner) {
        if (administrators.length === 0) {
          administrators.push({
            id: "administrators",
            displayName: t("InfoPanel:Administration"),
            isTitle: true,
          } satisfies TTitleShare);
        }

        administrators.push(member);
      } else if (
        ("isGroup" in member && member.isGroup) ||
        subjectType === MembersSubjectType.Group
      ) {
        if (groups.length === 0) {
          groups.push({
            id: "groups",
            displayName: t("Common:Groups"),
            isTitle: true,
          } satisfies TTitleShare);
        }

        groups.push({ ...member, isGroup: true });
      } else if ("isVisitor" in member && member.isVisitor) {
        if (guests.length === 0) {
          guests.push({
            id: "guests",
            displayName: t("Common:Guests"),
            isTitle: true,
          } satisfies TTitleShare);
        }

        guests.push(member);
      } else {
        if (users.length === 0) {
          users.push({
            id: "users",
            displayName: t("InfoPanel:Users"),
            isTitle: true,
          } satisfies TTitleShare);
        }

        users.push(member);
      }
    },
  );

  return {
    owner,
    administrators,
    users,
    expected,
    groups,
    guests,
  };
};

export const getAccessDescription = (
  file: TFile,
  access: ShareAccessRights,
  t: TFunction,
) => {
  return (
    match({ fileType: file.fileType, access, isForm: file.isForm })
      // Document
      .with(
        { fileType: FileType.Document, access: ShareAccessRights.FullAccess },
        () => t("Common:FullAccessDescriptionDocument"),
      )
      .with(
        { fileType: FileType.Document, access: ShareAccessRights.Editing },
        () => t("Common:EditingDescriptionDocument"),
      )
      .with(
        { fileType: FileType.Document, access: ShareAccessRights.Review },
        () => t("Common:ReviewDescriptionDocument"),
      )
      .with(
        { fileType: FileType.Document, access: ShareAccessRights.Comment },
        () => t("Common:CommentDescriptionDocument"),
      )
      .with(
        { fileType: FileType.Document, access: ShareAccessRights.ReadOnly },
        () => t("Common:RoleViewerDescription"),
      )
      .with(
        { fileType: FileType.Document, access: ShareAccessRights.DenyAccess },
        () => t("Common:DenyAccessDescriptionDocument"),
      )
      // Spreadsheet | Presentation | PDF Document
      .with(
        {
          fileType: P.union(
            FileType.Spreadsheet,
            FileType.Presentation,
            FileType.PDF,
          ),
          access: ShareAccessRights.FullAccess,
          isForm: P.not(true),
        },
        () => t("Common:FullAccessDescriptionSpreadsheet"),
      )
      .with(
        {
          fileType: P.union(
            FileType.Spreadsheet,
            FileType.Presentation,
            FileType.PDF,
          ),
          access: ShareAccessRights.Editing,
          isForm: P.not(true),
        },
        () => {
          const x = t("Common:EditingDescriptionSpreadsheet");
          console.log(x);
          return x;
        },
      )
      .with(
        {
          fileType: FileType.Spreadsheet,
          access: ShareAccessRights.CustomFilter,
        },
        () => t("Common:CustomFilterDescriptionSpreadsheet"),
      )
      .with(
        {
          fileType: P.union(
            FileType.Spreadsheet,
            FileType.Presentation,
            FileType.PDF,
          ),
          access: ShareAccessRights.Comment,
          isForm: P.not(true),
        },
        () => t("Common:CommentDescriptionSpreadsheet"),
      )
      .with(
        {
          fileType: P.union(
            FileType.Spreadsheet,
            FileType.Presentation,
            FileType.PDF,
          ),
          access: ShareAccessRights.ReadOnly,
          isForm: P.not(true),
        },
        () => t("Common:RoleViewerDescription"),
      )
      .with(
        {
          fileType: P.union(
            FileType.Spreadsheet,
            FileType.Presentation,
            FileType.PDF,
          ),
          access: ShareAccessRights.DenyAccess,
          isForm: P.not(true),
        },
        () => t("Common:DenyAccessDescriptionDocument"),
      )
      // PDF Form
      .with(
        {
          fileType: FileType.PDF,
          access: ShareAccessRights.FullAccess,
          isForm: true,
        },
        () => t("Common:FullAccessDescriptionPDFForm"),
      )
      .with(
        {
          fileType: FileType.PDF,
          access: ShareAccessRights.Editing,
          isForm: true,
        },
        () => t("Common:EditingDescriptionPDFForm"),
      )
      .with(
        {
          fileType: FileType.PDF,
          access: ShareAccessRights.FormFilling,
          isForm: true,
        },
        () => t("Common:FillingDescriptionPDFForm"),
      )
      .with(
        {
          fileType: FileType.PDF,
          access: ShareAccessRights.DenyAccess,
          isForm: true,
        },
        () => t("Common:DenyAccessDescriptionDocument"),
      )

      // Other
      .with(
        {
          fileType: P.any,
          access: ShareAccessRights.FullAccess,
        },
        () => t("Common:FullAccessDescriptionOther"),
      )
      .with(
        {
          fileType: P.any,
          access: ShareAccessRights.ReadOnly,
        },
        () => t("Common:RoleViewerDescription"),
      )
      .with(
        {
          fileType: P.any,
          access: ShareAccessRights.DenyAccess,
        },
        () => t("Common:DenyAccessDescriptionDocument"),
      )
      .otherwise(() => "")
  );
};

export const getShareAccessRightOptions = (
  t: TFunction,
  infoPanelSelection: TFile | TFolder,
  withRemove = true,
  isGroup = false,
  isOwner = false,
) => {
  const availableShareRights = infoPanelSelection.availableShareRights;

  const rights =
    (isGroup ? availableShareRights?.Group : availableShareRights?.User) || [];

  if (isOwner) {
    return [
      {
        access: ShareAccessRights.FullAccess,
        key: "owner",
        label: t("Common:Owner"),
      },
    ];
  }

  if (isFolder(infoPanelSelection)) {
    const options: Partial<
      Record<
        ShareRights,
        TShareToUserAccessRightOption | TShareToUserAccessRightOption[]
      >
    > = {
      [ShareRights.ReadWrite]: {
        access: ShareAccessRights.FullAccess,
        key: "full-access",
        label: t("Common:FullAccess"),
        description: t("Common:FullAccessDescription"),
      },
      [ShareRights.Editing]: {
        access: ShareAccessRights.Editing,
        key: "editor",
        label: t("Common:Editing"),
        description: t("Common:EditorDescription"),
      },
      [ShareRights.Review]: {
        access: ShareAccessRights.Review,
        key: "review",
        label: t("Common:Review"),
        description: t("Common:RoleReviewerDescription"),
      },
      [ShareRights.Comment]: {
        access: ShareAccessRights.Comment,
        key: "commenting",
        label: t("Common:Comment"),
        description: t("Common:RoleCommentatorDescription"),
      },
      [ShareRights.Read]: {
        access: ShareAccessRights.ReadOnly,
        key: "viewing",
        label: t("Common:ReadOnly"),
        description: t("Common:RoleViewerDescription"),
      },
      [ShareRights.Restrict]: {
        access: ShareAccessRights.DenyAccess,
        key: "deny-access",
        label: t("Common:DenyAccess"),
        description: t("Common:DenyAccessDescription"),
      },
      [ShareRights.None]: withRemove
        ? [
            {
              key: "separator",
              isSeparator: true,
              label: "",
              access: ShareAccessRights.None,
            },
            {
              access: ShareAccessRights.None,
              key: "remove",
              label: t("Common:Remove"),
            },
          ]
        : [],
    };

    return rights
      .map((right) => options[right])
      .flat()
      .filter((item): item is TShareToUserAccessRightOption => Boolean(item));
  }

  const accessOptions: Partial<
    Record<
      ShareRights,
      TShareToUserAccessRightOption | TShareToUserAccessRightOption[]
    >
  > = {
    [ShareRights.ReadWrite]: {
      access: ShareAccessRights.FullAccess,
      key: "full-access",
      label: t("Common:FullAccess"),
      description: getAccessDescription(
        infoPanelSelection,
        ShareAccessRights.FullAccess,
        t,
      ),
    },
    [ShareRights.Editing]: {
      access: ShareAccessRights.Editing,
      key: "editing",
      label: t("Common:Editing"),
      description: getAccessDescription(
        infoPanelSelection,
        ShareAccessRights.Editing,
        t,
      ),
    },
    [ShareRights.CustomFilter]: {
      access: ShareAccessRights.CustomFilter,
      key: "custom-filter",
      label: t("Common:CustomFilter"),
      description: getAccessDescription(
        infoPanelSelection,
        ShareAccessRights.CustomFilter,
        t,
      ),
    },
    [ShareRights.Review]: {
      access: ShareAccessRights.Review,
      key: "review",
      label: t("Common:Review"),
      description: getAccessDescription(
        infoPanelSelection,
        ShareAccessRights.Review,
        t,
      ),
    },
    [ShareRights.Comment]: {
      access: ShareAccessRights.Comment,
      key: "commenting",
      label: t("Common:Comment"),
      description: getAccessDescription(
        infoPanelSelection,
        ShareAccessRights.Comment,
        t,
      ),
    },
    [ShareRights.Read]: {
      access: ShareAccessRights.ReadOnly,
      key: "viewing",
      label: t("Common:ReadOnly"),
      description: getAccessDescription(
        infoPanelSelection,
        ShareAccessRights.ReadOnly,
        t,
      ),
    },
    [ShareRights.FillForms]: {
      access: ShareAccessRights.FormFilling,
      key: "filling",
      label: t("Common:Filling"),
      description: getAccessDescription(
        infoPanelSelection,
        ShareAccessRights.FormFilling,
        t,
      ),
    },
    [ShareRights.Restrict]: {
      access: ShareAccessRights.DenyAccess,
      key: "deny-access",
      label: t("Common:DenyAccess"),
      description: getAccessDescription(
        infoPanelSelection,
        ShareAccessRights.DenyAccess,
        t,
      ),
    },
    [ShareRights.None]: withRemove
      ? [
          {
            key: "separator",
            isSeparator: true,
            label: "",
            access: ShareAccessRights.None,
          },
          {
            access: ShareAccessRights.None,
            key: "remove",
            label: t("Common:Remove"),
          },
        ]
      : [],
  };

  return rights
    .map((right) => accessOptions[right])
    .flat()
    .filter((item): item is TShareToUserAccessRightOption => Boolean(item));
};

export const getAccessLabel = (t: TFunction, item: TFolder | TFile) => {
  switch (item.access) {
    case ShareAccessRights.FullAccess:
      return t("Common:FullAccess");
    case ShareAccessRights.Editing:
      return t("Common:Editing");
    case ShareAccessRights.CustomFilter:
      return t("Common:CustomFilter");
    case ShareAccessRights.Review:
      return t("Common:Review");
    case ShareAccessRights.Comment:
      return t("Common:Comment");
    case ShareAccessRights.FormFilling:
      return t("Common:Filling");
    case ShareAccessRights.ReadOnly:
      return t("Common:ReadOnly");
    case ShareAccessRights.DenyAccess:
      return t("Common:DenyAccess");
    default:
      return "";
  }
};
