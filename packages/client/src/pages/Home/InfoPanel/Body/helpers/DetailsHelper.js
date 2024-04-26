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

import React from "react";

import { LANGUAGE } from "@docspace/shared/constants";

import { getCorrectDate, getCookie } from "@docspace/shared/utils";

import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Tag } from "@docspace/shared/components/tag";
import { decode } from "he";

import {
  connectedCloudsTypeTitleTranslation as getProviderTranslation,
  getDefaultRoomName,
  getFileTypeName,
} from "@docspace/client/src/helpers/filesUtils";
import CommentEditor from "../sub-components/CommentEditor";

import SpaceQuota from "SRC_DIR/components/SpaceQuota";

// Property Content Components

const text = (text) => (
  <Text truncate className="property-content">
    {text}
  </Text>
);

const link = (text, onClick) => (
  <Link
    isTextOverflow
    className="property-content"
    isHovered={true}
    onClick={onClick}
  >
    {text}
  </Link>
);

const tagList = (tags, selectTag) => (
  <div className="property-tag_list">
    {tags.map((tag, i) => (
      <Tag
        key={i}
        className="property-tag"
        label={tag}
        onClick={() => selectTag(tag)}
      />
    ))}
  </div>
);

// Functional Helpers

export const decodeString = (str) => {
  const regex = /&#([0-9]{1,4});/gi;
  return str
    ? str.replace(regex, (match, numStr) => String.fromCharCode(+numStr))
    : "...";
};

export const parseAndFormatDate = (date, personal, culture) => {
  const locale = getCookie(LANGUAGE) || culture;
  const correctDate = getCorrectDate(locale, date);
  return correctDate;
};

// InfoHelper Class

class DetailsHelper {
  constructor(props) {
    this.t = props.t;
    this.item = props.item;
    this.navigate = props.navigate;
    this.openUser = props.openUser;
    this.personal = props.personal;
    this.culture = props.culture;
    this.isVisitor = props.isVisitor;
    this.isCollaborator = props.isCollaborator;
    this.selectTag = props.selectTag;
    this.isDefaultRoomsQuotaSet = props.isDefaultRoomsQuotaSet;
    this.setNewInfoPanelSelection = props.setNewInfoPanelSelection;
  }

  getPropertyList = () => {
    return this.getNeededProperties().map((propertyId) => ({
      id: propertyId,
      className: this.getPropertyClassName(propertyId),
      title: this.getPropertyTitle(propertyId),
      content: this.getPropertyContent(propertyId),
    }));
  };

  getPropertyClassName = (propertyId) => {
    switch (propertyId) {
      case "Owner":
        return "info_details_owner";
      case "Location":
        return "info_details_location";
      case "Type":
        return "info_details_type";
      case "Storage Type":
        return "info_details_storage-type";
      case "File extension":
        return "info_details_file-extension";
      case "Content":
        return "info_details_content";
      case "Size":
        return "info_details_size";
      case "Date modified":
        return "info_details_date_modified";
      case "Last modified by":
        return "info_details_last-modified-by";
      case "Creation date":
        return "info_details_creation-date";
      case "Versions":
        return "info_details_versions";
      case "Comments":
        return "info_details_comments";
      case "Tags":
        return "info_details_tags";
      case "Storage":
        return "info_details_storage";
    }
  };

  getNeededProperties = () => {
    return (
      this.item.isRoom
        ? [
            "Owner",
            this.item.providerKey && "Storage Type",
            "Type",
            "Content",
            "Date modified",
            "Last modified by",
            "Creation date",
            this.item.tags.length && "Tags",
            "Storage",
          ]
        : this.item.isFolder
          ? [
              "Owner",
              //"Location",
              "Type",
              "Content",
              "Date modified",
              "Last modified by",
              "Creation date",
            ]
          : [
              "Owner",
              //"Location",
              "Type",
              "File extension",
              "Size",
              "Date modified",
              "Last modified by",
              "Creation date",
              "Versions",
              "Comments",
            ]
    ).filter((nP) => !!nP);
  };

  getPropertyTitle = (propertyId) => {
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

      case "Versions":
        return this.t("InfoPanel:Versions");
      case "Comments":
        return this.t("Common:Comments");
      case "Tags":
        return this.t("Common:Tags");
      case "Storage":
        if (this.item.usedSpace !== undefined) {
          return this.isDefaultRoomsQuotaSet &&
            this.item.quotaLimit !== undefined
            ? this.t("Common:StorageAndQuota")
            : this.t("Common:Storage");
        }

        return <></>;
    }
  };

  getPropertyContent = (propertyId) => {
    switch (propertyId) {
      case "Owner":
        return this.getAuthorDecoration("createdBy");
      case "Location":
        return this.getItemLocation();

      case "Type":
        return this.getItemType();
      case "Storage Type":
        return this.getItemStorageType();
      case "Storage account":
        return this.getItemStorageAccount();

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

      case "Versions":
        return this.getItemVersions();
      case "Comments":
        return this.getItemComments();
      case "Tags":
        return this.getItemTags();
      case "Storage":
        return this.getQuotaItem();
    }
  };

  /// Property  //

  getAuthorDecoration = (byField = "createdBy") => {
    const onClick = () => this.openUser(this.item[byField], this.navigate);

    const displayName = this.item[byField]?.displayName;
    const name = displayName ? decode(displayName) : "";

    //console.log("getAuthorDecoration", { name, displayName });

    return this.personal || this.isVisitor || this.isCollaborator
      ? text(name)
      : link(name, onClick);
  };

  getItemLocation = () => {
    return text("...");
  };

  getItemType = () => {
    return text(
      this.item.isRoom
        ? getDefaultRoomName(this.item.roomType, this.t)
        : getFileTypeName(this.item.fileType),
    );
  };

  getItemFileExtention = () => {
    return text(
      this.item.fileExst ? this.item.fileExst.split(".")[1].toUpperCase() : "-",
    );
  };

  getItemStorageType = () => {
    return text(getProviderTranslation(this.item.providerKey, this.t));
  };

  getItemStorageAccount = () => {
    return text("...");
  };

  getItemContent = () => {
    return text(
      `${this.t("Translations:Folders")}: ${this.item.foldersCount} | ${this.t(
        "Translations:Files",
      )}: ${this.item.filesCount}`,
    );
  };

  getItemSize = () => {
    return text(this.item.contentLength);
  };

  getItemDateModified = () => {
    return text(
      parseAndFormatDate(this.item.updated, this.personal, this.culture),
    );
  };

  getItemCreationDate = () => {
    return text(
      parseAndFormatDate(this.item.created, this.personal, this.culture),
    );
  };

  getItemVersions = () => {
    return text(this.item.version);
  };

  getItemComments = () => {
    return <CommentEditor t={this.t} item={this.item} />;
  };

  getItemTags = () => {
    return tagList(this.item.tags, this.selectTag);
  };

  getQuotaItem = () => {
    const onSuccess = () => {
      this.setNewInfoPanelSelection();
    };

    if (this.item.usedSpace !== undefined) {
      return (
        <SpaceQuota
          item={this.item}
          isReadOnly={!this.item?.security?.EditRoom}
          onSuccess={onSuccess}
        />
      );
    }

    return <></>;
  };
}

export default DetailsHelper;
