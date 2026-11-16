/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { decode } from "he";
import type { TFunction } from "i18next";

import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { Link } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import { isRoom } from "@docspace/shared/utils/typeGuards";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import { getAccessLabel } from "@docspace/shared/components/share/Share.helpers";

import type { ShareAccessRights } from "@docspace/shared/enums";
import type { TCreatedBy, TTranslation } from "@docspace/shared/types";
import type { TRoom, TRoomLifetime } from "@docspace/shared/api/rooms/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { TAiProjectSettings } from "@docspace/shared/api/ai/projects";
import { RoomsType, VectorizationStatus } from "@docspace/shared/enums";
import {
  getSkillNameByTitle,
  isSkillFile,
  toSkillCommand,
} from "@docspace/shared/utils/skillFile";

import {
  connectedCloudsTypeTitleTranslation as getProviderTranslation,
  getRoomTypeName,
} from "SRC_DIR/helpers/filesUtils";
import {
  TagManagement,
  getTagManagementAccess,
} from "SRC_DIR/components/TagManagement";
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
    dataTestId="info_panel_details_author_link"
  >
    {txt}
  </Link>
);

const tagList = (
  tags: string[],
  id: number,
  access: ShareAccessRights,
  title: string,
) => (
  <div className="property-tag_list" data-testid="info_panel_details_tag_list">
    <TagManagement
      id={id}
      isActive
      tags={tags}
      className="tags"
      columnCount={-1}
      access={access}
      roomName={title}
    />
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
  isDefaultRoomsQuotaSet: boolean;
  isAdmin: boolean;
  isArchiveFolder: boolean;
  roomLifetime: TRoomLifetime;
  /** The title of the skill set a selected skill is in, when it is the open one. */
  skillSetTitle?: string;
  /** The skill's name as its file states it; the title gives it otherwise. */
  skillName?: string;
  /** How far a selected knowledge base is indexed; `null` until it is read. */
  knowledgeStatus?: VectorizationStatus | null;
};

class DetailsHelper {
  t: TTranslation;

  item: TRoom | TFile | TFolder;

  openUser: InfoPanelStore["openUser"];

  culture: string;

  isVisitor: boolean;

  isCollaborator: boolean;

  isDefaultRoomsQuotaSet: boolean;

  isAdmin: boolean;

  isArchiveFolder: boolean;

  roomLifetime: TRoomLifetime;

  skillSetTitle?: string;

  skillName?: string;

  knowledgeStatus?: VectorizationStatus | null;

  constructor(props: DetailsHelperProps) {
    this.t = props.t;
    this.item = props.item;
    this.openUser = props.openUser;
    this.culture = props.culture;
    this.isVisitor = props.isVisitor;
    this.isCollaborator = props.isCollaborator;
    this.isDefaultRoomsQuotaSet = props.isDefaultRoomsQuotaSet;
    this.isAdmin = props.isAdmin;
    this.isArchiveFolder = props.isArchiveFolder;
    this.roomLifetime = props.roomLifetime;
    this.skillSetTitle = props.skillSetTitle;
    this.skillName = props.skillName;
    this.knowledgeStatus = props.knowledgeStatus;
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
    // An AI project shows as a room does; it holds no files of its own and
    // takes no storage, and its model comes from its settings block.
    const isAIProject = "isAIProject" in this.item && !!this.item.isAIProject;

    // A skill is shown as a skill, not as the Markdown file that holds it:
    // the set it is in and the command that calls it, no type or size.
    if (isSkillFile(this.item as TFile))
      return [
        this.skillSetTitle && "Skill set",
        "ownedBy" in this.item && this.item.ownedBy ? "OwnedBy" : "Owner",
        "Command",
        "Date modified",
        "Last modified by",
        "Creation date",
      ].filter((nP) => nP) as string[];

    // A skill set holds skills only: its content is their number.
    const isSkillSet =
      "isRoom" in this.item &&
      this.item.isRoom &&
      this.item.roomType === RoomsType.InstructionsRoom;

    // A knowledge base holds files only, and is told by how far they are
    // indexed, not by its room type.
    const isKnowledgeBase =
      "isRoom" in this.item &&
      this.item.isRoom &&
      this.item.roomType === RoomsType.KnowledgeRoom;

    return (
      "isRoom" in this.item && this.item.isRoom
        ? [
            "Owner",
            (this.item as TRoom).providerKey && "Storage Type",
            !isSkillSet && !isKnowledgeBase && "Type",
            !isAIProject && "Content",
            isKnowledgeBase && this.getIndexingStatus() !== null && "Status",
            "Date modified",
            "Last modified by",
            "Creation date",
            // Also for a room with no tags yet, as long as the user could
            // add one - otherwise the info panel has no way to attach the
            // first tag at all.
            ((this.item as TRoom).tags?.length ||
              getTagManagementAccess(
                this.item.access,
                this.isAdmin,
                this.isArchiveFolder,
              ).canCreate) &&
              "Tags",
            !isAIProject && !isSkillSet && "Storage",
            isAIProject && this.getAiProjectSettings()?.profile?.name && "Model",
          ]
        : "isFolder" in this.item && this.item.isFolder
          ? [
              "ownedBy" in this.item && this.item.ownedBy ? "OwnedBy" : "Owner",
              // "Location",
              "Type",
              "Content",
              "Date modified",
              "Last modified by",
              "Creation date",
              this.item.order && "Index",
              "ownedBy" in this.item &&
                this.item.ownedBy &&
                this.item.createdBy &&
                "Author",
              this.item.sharedBy && "Shared by",
              this.item.access && "Access level",
            ]
          : [
              "ownedBy" in this.item && this.item.ownedBy ? "OwnedBy" : "Owner",
              // "Location",
              "Type",
              "File extension",
              "Size",
              this.getIndexingStatus() !== null && "Status",
              "dimensions" in this.item &&
                this.item?.dimensions &&
                "Resolution",
              "Date modified",
              "Last modified by",
              "Creation date",
              "expired" in this.item && this.item.expired && "Lifetime ends",
              "Versions",
              "order" in this.item && this.item.order && "Index",
              "ownedBy" in this.item &&
                this.item.ownedBy &&
                this.item.createdBy &&
                "Author",
              "sharedBy" in this.item && this.item.sharedBy && "Shared by",
              this.item.access && "Access level",
              "externalDbTableName" in this.item &&
                this.item.externalDbTableName &&
                "externalDbTableName",
              "Comments",
            ]
    ).filter((nP) => nP) as string[];
  };

  getPropertyTitle = (propertyId: string) => {
    switch (propertyId) {
      case "Owner":
      case "OwnedBy":
        return this.t("Common:Owner");
      case "Location":
        return this.t("Common:Location");

      case "Type":
        return this.t("Common:Type");
      case "Storage Type":
        return this.t("InfoPanel:StorageType");

      case "File extension":
        return this.t("Common:FileExtension");

      case "Content":
        return this.t("Common:Content");
      case "Size":
        return this.t("Common:Size");
      case "Resolution":
        return this.t("InfoPanel:Resolution");
      case "Date modified":
        return this.t("Common:DateModified");
      case "Last modified by":
        return this.t("Common:LastModifiedBy");
      case "Creation date":
        return this.t("Common:CreationDate");
      case "Lifetime ends":
        return this.t("LifetimeEnds");

      case "Index":
        return this.t("Files:Index");

      case "Versions":
        return this.t("Common:Versions");
      case "Comments":
        return this.t("Common:Comments");
      case "Tags":
        return this.t("Common:Tags");

      case "Author":
        return this.t("Common:ByAuthor");
      case "Shared by":
        return this.t("Common:SharedBy");
      case "Access level":
        return this.t("Common:AccessLevel");
      case "externalDbTableName":
        return this.t("Files:TableName");

      case "Model":
        return this.t("Common:AIAgentModel");

      case "Status":
        return this.t("Common:Status");
      case "Skill set":
        return this.t("Common:SkillSet");
      case "Command":
        return this.t("Common:SkillCommand");

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
      case "OwnedBy":
        return this.getAuthorDecoration("ownedBy");
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
      case "Resolution":
        return this.getItemDimensions();
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
      case "Author":
        return this.getAuthorDecoration();
      case "Shared by":
        return this.getAuthorDecoration("sharedBy");
      case "Access level":
        return this.getItemAccessLevel();
      case "externalDbTableName":
        return this.getExternalDbTableName();
      case "Model":
        return text(this.getAiProjectSettings()?.profile?.name);
      case "Status":
        return this.getItemIndexingStatus();
      case "Skill set":
        return text(this.skillSetTitle);
      case "Command":
        return (
          <Text truncate className="property-content skill-command">
            {toSkillCommand(
              this.skillName || getSkillNameByTitle(this.item.title),
            )}
          </Text>
        );
      default:
        break;
    }
  };

  /** The settings block of an AI project (`aiProject`), if the item is one. */
  getAiProjectSettings = () =>
    "aiProject" in this.item
      ? (this.item.aiProject as TAiProjectSettings | undefined)
      : undefined;

  getExternalDbTableName = () => {
    if (!("externalDbTableName" in this.item)) return null;
    return text(this.item.externalDbTableName);
  };

  getItemAccessLevel = () => {
    if (!("access" in this.item) || isRoom(this.item)) return null;
    return text(getAccessLabel(this.t as TFunction, this.item));
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
    if (
      "roomType" in this.item &&
      this.item.roomType === RoomsType.InstructionsRoom
    )
      return text(`${this.t("Common:Skills")}: ${this.item.filesCount}`);
    if (
      "roomType" in this.item &&
      this.item.roomType === RoomsType.KnowledgeRoom
    )
      return text(`${this.t("Common:Files")}: ${this.item.filesCount}`);
    return text(
      `${this.t("Common:Folders")}: ${this.item.foldersCount} | ${this.t(
        "Common:Files",
      )}: ${this.item.filesCount}`,
    );
  };

  /**
   * How far the item is indexed: a knowledge base by its files, a file by
   * its own state. `null` for anything that is not indexed at all.
   */
  getIndexingStatus = (): VectorizationStatus | null => {
    if ("isRoom" in this.item && this.item.isRoom)
      return this.knowledgeStatus ?? null;
    const { vectorizationStatus } = this.item as {
      vectorizationStatus?: VectorizationStatus | null;
    };
    return vectorizationStatus ?? null;
  };

  getItemIndexingStatus = () => {
    switch (this.getIndexingStatus()) {
      case VectorizationStatus.InProgress:
        return text(this.t("Common:Indexing"));
      case VectorizationStatus.Failed:
        return text(this.t("Common:Error"));
      case VectorizationStatus.Completed:
        return text(this.t("Common:Indexed"));
      default:
        return null;
    }
  };

  getItemSize = () => {
    if (!("contentLength" in this.item)) return null;

    return text(this.item.contentLength);
  };

  getItemDimensions = () => {
    if (!("dimensions" in this.item)) return null;
    return text(
      `${this.item?.dimensions?.width} x ${this.item?.dimensions?.height} px`,
    );
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
    if ("tags" in this.item)
      return tagList(
        this.item.tags,
        this.item.id,
        this.item.access,
        this.item.title,
      );
  };

  getQuotaItem = () => {
    if ("usedSpace" in this.item && this.item.usedSpace !== undefined) {
      return (
        <SpaceQuota
          item={this.item}
          isReadOnly={!this.item?.security?.EditRoom}
          type="room"
        />
      );
    }

    return null;
  };
}

export default DetailsHelper;

