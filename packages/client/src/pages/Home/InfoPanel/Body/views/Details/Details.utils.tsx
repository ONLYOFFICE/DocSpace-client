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

import React from "react";
import { decode } from "he";

import { getCorrectDate } from "@docspace/shared/utils";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Tag } from "@docspace/shared/components/tag";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import { TCreatedBy, TTranslation } from "@docspace/shared/types";
import { TRoom, TRoomLifetime } from "@docspace/shared/api/rooms/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";

import {
  connectedCloudsTypeTitleTranslation as getProviderTranslation,
  getRoomTypeName,
} from "SRC_DIR/helpers/filesUtils";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import { getPropertyClassName } from "SRC_DIR/helpers/infopanel";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

import CommentEditor from "../../sub-components/CommentEditor";

const text = (value: React.ReactNode) => (
  <Text truncate className="property-content">
    {value}
  </Text>
);

const link = (txt: React.ReactNode, onClick: () => void) => (
  <Link
    isTextOverflow
    className="property-content"
    isHovered
    onClick={onClick}
    enableUserSelect
    dataTestId="info_panel_details_author_link"
  >
    {txt}
  </Link>
);

const tagList = (
  tags: string[],
  selectTag: (tag: { label: string }) => void,
) => (
  <div className="property-tag_list" data-testid="info_panel_details_tag_list">
    {tags.map((tag, index) => (
      <Tag
        key={tag}
        className="property-tag"
        label={tag}
        tag={tag}
        onClick={() => selectTag({ label: tag })}
        dataTestId={`info_panel_details_tag_${index}`}
      />
    ))}
  </div>
);

// Functional Helpers

export const decodeString = (str: string) => {
  const regex = /&#([0-9]{1,4});/gi;
  return str
    ? str.replace(regex, (_, numStr) => String.fromCharCode(+numStr))
    : "...";
};

// InfoHelper Class

type DetailsHelperProps = {
  t: TTranslation;
  item: TRoom | TFile | TFolder;
  openUser: InfoPanelStore["openUser"];
  culture: string;
  isVisitor: boolean;
  isCollaborator: boolean;
  selectTag: (tag: { label: string }) => void;
  isDefaultRoomsQuotaSet: boolean;
  roomLifetime: TRoomLifetime;
};

class DetailsHelper {
  t: TTranslation;

  item: TRoom | TFile | TFolder;

  openUser: InfoPanelStore["openUser"];

  culture: string;

  isVisitor: boolean;

  isCollaborator: boolean;

  selectTag: (tag: { label: string }) => void;

  isDefaultRoomsQuotaSet: boolean;

  roomLifetime: TRoomLifetime;

  constructor(props: DetailsHelperProps) {
    this.t = props.t;
    this.item = props.item;
    this.openUser = props.openUser;
    this.culture = props.culture;
    this.isVisitor = props.isVisitor;
    this.isCollaborator = props.isCollaborator;
    this.selectTag = props.selectTag;
    this.isDefaultRoomsQuotaSet = props.isDefaultRoomsQuotaSet;
    this.roomLifetime = props.roomLifetime;
  }

  getPropertyList = () => {
    return this.getNeededProperties().map((propertyId) => ({
      id: propertyId,
      className: getPropertyClassName(propertyId),
      title: this.getPropertyTitle(propertyId),
      content: this.getPropertyContent(propertyId),
    }));
  };

  getNeededProperties = () => {
    return (
      "isRoom" in this.item && this.item.isRoom
        ? [
            "Owner",
            this.item.providerKey && "Storage Type",
            "Type",
            "Content",
            "Date modified",
            "Last modified by",
            "Creation date",
            this.item.tags?.length && "Tags",
            "Storage",
          ]
        : "isFolder" in this.item && this.item.isFolder
          ? [
              "Owner",
              // "Location",
              "Type",
              "Content",
              "Date modified",
              "Last modified by",
              "Creation date",
              this.item.order && "Index",
            ]
          : [
              "Owner",
              // "Location",
              "Type",
              "File extension",
              "Size",
              "Date modified",
              "Last modified by",
              "Creation date",
              "expired" in this.item && this.item.expired && "Lifetime ends",
              "Versions",
              "order" in this.item && this.item.order && "Index",
              "Comments",
            ]
    ).filter((nP) => nP) as string[];
  };

  getPropertyTitle = (propertyId: string) => {
    switch (propertyId) {
      case "Owner":
        return this.t("Common:Owner");
      case "Location":
        return this.t("Common:Location");

      case "Type":
        return this.t("Common:Type");
      case "Storage Type":
        return this.t("InfoPanel:StorageType");

      case "File extension":
        return this.t("FileExtension");

      case "Content":
        return this.t("Common:Content");
      case "Size":
        return this.t("Common:Size");

      case "Date modified":
        return this.t("DateModified");
      case "Last modified by":
        return this.t("LastModifiedBy");
      case "Creation date":
        return this.t("CreationDate");
      case "Lifetime ends":
        return this.t("LifetimeEnds");

      case "Index":
        return this.t("Files:Index");

      case "Versions":
        return this.t("InfoPanel:Versions");
      case "Comments":
        return this.t("Common:Comments");
      case "Tags":
        return this.t("Common:Tags");
      case "Storage":
        if ("usedSpace" in this.item && this.item.usedSpace !== undefined) {
          return this.isDefaultRoomsQuotaSet &&
            this.item.quotaLimit !== undefined
            ? this.t("Common:StorageAndQuota")
            : this.t("Common:Storage");
        }

        return null;
      default:
        break;
    }
  };

  getPropertyContent = (propertyId: string) => {
    switch (propertyId) {
      case "Owner":
        return this.getAuthorDecoration("createdBy");
      case "Location":
        return text("...");

      case "Index":
        return this.getItemIndex();

      case "Type":
        return this.getItemType(this.t);
      case "Storage Type":
        return this.getItemStorageType();
      case "Storage account":
        return text("...");

      case "File extension":
        return this.getItemFileExtention();

      case "Content":
        return this.getItemContent();
      case "Size":
        return this.getItemSize();

      case "Date modified":
        return this.getItemDateModified();
      case "Last modified by":
        return this.getAuthorDecoration("updatedBy");
      case "Creation date":
        return this.getItemCreationDate();
      case "Lifetime ends":
        return this.getItemExpiredDate();

      case "Versions":
        return this.getItemVersions();
      case "Comments":
        return this.getItemComments();
      case "Tags":
        return this.getItemTags();
      case "Storage":
        return this.getQuotaItem();
      default:
        break;
    }
  };

  getAuthorDecoration = (byField = "createdBy") => {
    const onClick = () =>
      this.openUser(this.item[byField as keyof typeof this.item] as TCreatedBy);

    const createdBy = this.item[
      byField as keyof typeof this.item
    ] as TCreatedBy;
    const isAnonim = createdBy?.isAnonim;
    const displayName = createdBy?.displayName;

    let name = displayName ? decode(displayName) : "";

    if (isAnonim) name = this.t("Common:Anonymous");

    // console.log("getAuthorDecoration", { name, displayName });

    return this.isVisitor || this.isCollaborator || isAnonim
      ? text(name)
      : link(name, onClick);
  };

  getItemType = (t: TTranslation) => {
    if ("isRoom" in this.item && this.item.isRoom)
      return text(getRoomTypeName(this.item.roomType, t));

    if ("fileType" in this.item)
      return text(getFileTypeName(this.item.fileType, t));

    return text(getFileTypeName("", t));
  };

  getItemFileExtention = () => {
    if (!("fileExst" in this.item)) return null;
    return text(
      this.item.fileExst ? this.item.fileExst.split(".")[1].toUpperCase() : "-",
    );
  };

  getItemStorageType = () => {
    if (!("providerKey" in this.item)) return null;
    return text(getProviderTranslation(this.item.providerKey, this.t));
  };

  getItemContent = () => {
    if (!("foldersCount" in this.item) || !("filesCount" in this.item))
      return null;
    return text(
      `${this.t("Common:Folders")}: ${this.item.foldersCount} | ${this.t(
        "Common:Files",
      )}: ${this.item.filesCount}`,
    );
  };

  getItemSize = () => {
    if (!("contentLength" in this.item)) return null;

    return text(this.item.contentLength);
  };

  getItemIndex = () => {
    if (!("order" in this.item)) return null;
    return text(this.item.order);
  };

  getItemDateModified = () => {
    return text(getCorrectDate(this.culture, this.item.updated));
  };

  getItemCreationDate = () => {
    return text(getCorrectDate(this.culture, this.item.created));
  };

  getItemExpiredDate = () => {
    if (!("expired" in this.item)) return null;
    return this.roomLifetime?.deletePermanently
      ? text(
          this.t("Files:WillBeDeletedPermanently", {
            date: getCorrectDate(this.culture, this.item.expired as string),
          }),
        )
      : text(
          this.t("Files:ScheduledTrashMove", {
            date: getCorrectDate(this.culture, this.item.expired as string),
            sectionName: this.t("Common:TrashSection"),
          }),
        );
  };

  getItemVersions = () => {
    if ("version" in this.item) return text(this.item.version);
  };

  getItemComments = () => {
    if (!("fileExst" in this.item)) return null;

    return <CommentEditor item={this.item} />;
  };

  getItemTags = () => {
    if ("tags" in this.item) return tagList(this.item.tags, this.selectTag);
  };

  getQuotaItem = () => {
    if ("usedSpace" in this.item && this.item.usedSpace !== undefined) {
      return (
        <SpaceQuota
          item={this.item}
          isReadOnly={!this.item?.security?.EditRoom}
        />
      );
    }

    return null;
  };
}

export default DetailsHelper;
