// (c) Copyright Ascensio System SIA 2009-2026
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

import { Text } from "@docspace/ui-kit/components/text";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import {
  TagManagement,
  type AccessTagManagement,
} from "@docspace/shared/components/tag-management";
import type { TCreatedBy, TTranslation } from "@docspace/shared/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

const tagList = (
  tags: string[],
  id: number | string,
  access: AccessTagManagement,
  title: string,
  tagListClassName: string,
  onTagsChanged?: () => void,
) => (
  <div
    className={`property-tag_list ${tagListClassName}`}
    data-testid="info_panel_details_tag_list"
  >
    <TagManagement
      id={id}
      isActive
      tags={tags}
      className="tags"
      columnCount={-1}
      access={access}
      roomName={title}
      onSelectTag={() => {}}
      onTagsChanged={onTagsChanged}
    />
  </div>
);

type DetailsItem = TFile | TFolder;

const text = (value: React.ReactNode) => (
  <Text truncate className="property-content">
    {value}
  </Text>
);

const decodeString = (str?: string) => {
  if (!str) return "";
  const regex = /&#([0-9]{1,4});/gi;
  return str.replace(regex, (_, numStr) => String.fromCharCode(+numStr));
};

const author = (createdBy: TCreatedBy | undefined, t: TTranslation) => {
  if (!createdBy) return text("");
  if (createdBy.isAnonim) return text(t("Common:Anonymous"));
  return text(decode(decodeString(createdBy.displayName)));
};

type DetailsHelperProps = {
  t: TTranslation;
  item: DetailsItem;
  culture: string;
  tagListClassName: string;
  onTagsChanged?: () => void;
  canManageTags: boolean;
};

export type DetailsProperty = {
  id: string;
  title: string | null | undefined;
  content: React.ReactNode;
};

class DetailsHelper {
  t: TTranslation;
  item: DetailsItem;
  culture: string;
  tagListClassName: string;
  onTagsChanged?: () => void;
  canManageTags: boolean;

  constructor(props: DetailsHelperProps) {
    this.t = props.t;
    this.item = props.item;
    this.culture = props.culture;
    this.tagListClassName = props.tagListClassName;
    this.onTagsChanged = props.onTagsChanged;
    this.canManageTags = props.canManageTags;
  }

  getPropertyList = (): DetailsProperty[] => {
    return this.getNeededProperties()
      .filter((p): p is string => Boolean(p))
      .map((propertyId) => ({
        id: propertyId,
        title: this.getPropertyTitle(propertyId),
        content: this.getPropertyContent(propertyId),
      }));
  };

  private getNeededProperties = (): (string | false | undefined)[] => {
    const isRoom = "isRoom" in this.item && Boolean(this.item.isRoom);
    const isFolder = "isFolder" in this.item && this.item.isFolder;

    if (isRoom) {
      return [
        "Owner",
        "Content",
        "Date modified",
        "Last modified by",
        "Creation date",
        "Tags",
      ];
    }

    if (isFolder) {
      return [
        "Owner",
        "Type",
        "Content",
        "Date modified",
        "Last modified by",
        "Creation date",
      ];
    }

    return [
      "Owner",
      "Type",
      "File extension",
      "Size",
      "Date modified",
      "Last modified by",
      "Creation date",
      "Versions",
    ];
  };

  private getPropertyTitle = (propertyId: string) => {
    switch (propertyId) {
      case "Owner":
        return this.t("Common:Owner");
      case "Type":
        return this.t("Common:Type");
      case "File extension":
        return this.t("Common:FileExtension");
      case "Tags":
        return this.t("Common:Tags");
      case "Content":
        return this.t("Common:Content");
      case "Size":
        return this.t("Common:Size");
      case "Date modified":
        return this.t("Common:DateModified");
      case "Last modified by":
        return this.t("Common:LastModifiedBy");
      case "Creation date":
        return this.t("Common:CreationDate");
      case "Versions":
        return this.t("Common:Versions");
      default:
        return propertyId;
    }
  };

  private getPropertyContent = (propertyId: string): React.ReactNode => {
    switch (propertyId) {
      case "Owner":
        return author(
          (this.item as TFile).createdBy as TCreatedBy | undefined,
          this.t,
        );
      case "Last modified by":
        return author(
          (this.item as TFile).updatedBy as TCreatedBy | undefined,
          this.t,
        );
      case "Type":
        return this.getItemType();
      case "File extension":
        return this.getItemFileExtention();
      case "Tags":
        return this.getItemTags();
      case "Content":
        return this.getItemContent();
      case "Size":
        return this.getItemSize();
      case "Date modified":
        return text(getCorrectDate(this.culture, this.item.updated));
      case "Creation date":
        return text(getCorrectDate(this.culture, this.item.created));
      case "Versions":
        return this.getItemVersions();
      default:
        return null;
    }
  };

  private getItemType = () => {
    if ("fileType" in this.item) return text(getFileTypeName(this.item.fileType, this.t));
    return text(getFileTypeName("", this.t));
  };

  private getItemTags = () => {
    const room = this.item as TFolder & {
      tags?: string[];
      security?: { EditRoom?: boolean };
    };
    const tags = Array.isArray(room.tags) ? room.tags : [];
    const hasEditAccess = !!room.security?.EditRoom;
    const access: AccessTagManagement = {
      canCreate: hasEditAccess,
      canBindTag: hasEditAccess,
      canSearch: hasEditAccess,
      canEdit: this.canManageTags,
      canRemove: this.canManageTags,
    };
    return tagList(
      tags,
      room.id,
      access,
      room.title,
      this.tagListClassName,
      this.onTagsChanged,
    );
  };

  private getItemFileExtention = () => {
    if (!("fileExst" in this.item)) return null;
    const ext = this.item.fileExst;
    return text(ext ? ext.split(".")[1]?.toUpperCase() : "-");
  };

  private getItemContent = () => {
    if (!("foldersCount" in this.item) || !("filesCount" in this.item))
      return null;
    return text(
      `${this.t("Common:Folders")}: ${this.item.foldersCount} | ${this.t(
        "Common:Files",
      )}: ${this.item.filesCount}`,
    );
  };

  private getItemSize = () => {
    if (!("contentLength" in this.item)) return null;
    return text(this.item.contentLength);
  };

  private getItemVersions = () => {
    if (!("version" in this.item)) return null;
    return text(String(this.item.version));
  };
}

export default DetailsHelper;
