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

import React, { FC } from "react";

import { Tag } from "../tag";

import styles from "./Tags.module.scss";
import { isTagType } from "./Tags.utils";
import type { TagType, TagsProps } from "./Tags.types";

const Tags: FC<TagsProps> = ({
  id,
  tags,
  style,
  className,
  columnCount,
  onSelectTag,
  removeTagIcon,
  onMouseEnter,
  onMouseLeave,
  isDefaultMode = false,
  directionY,
  fixedDirection,
  manualY,
  manualX,
}) => {
  const [renderedTags, setRenderedTags] = React.useState<TagType[]>([]);

  const tagsRef = React.useRef<HTMLDivElement>(null);

  const updateRenderedTags = React.useCallback(() => {
    if (tags && tagsRef) {
      if (!columnCount) return;

      const newTags: TagType[] = [];
      const containerWidth = tagsRef.current?.offsetWidth ?? 0;

      if (tags.length === 1) {
        const firstTag = tags[0];

        if (isTagType(firstTag) && firstTag?.isDefault) {
          const tag = { ...firstTag, maxWidth: `100%` };
          newTags.push(tag);
        } else if (isTagType(firstTag) && firstTag?.isThirdParty) {
          const tag = { ...firstTag, maxWidth: `44px` };
          newTags.push(tag);
        } else {
          const label = isTagType(firstTag) ? firstTag.label : firstTag;

          const tag = { label, maxWidth: `100%` };
          newTags.push(tag);
        }

        return setRenderedTags(newTags);
      }

      if (
        columnCount >= tags.length ||
        (tags.length === 2 &&
          isTagType(tags[0]) &&
          tags[0]?.isThirdParty &&
          isTagType(tags[1]) &&
          tags[1]?.isDefault)
      ) {
        const thirdPartyTagCount =
          isTagType(tags[0]) && tags[0]?.isThirdParty ? 1 : 0;

        const currentTagMaxWidth =
          (containerWidth -
            thirdPartyTagCount * 40 -
            (tags.length - thirdPartyTagCount) * 4) /
          (tags.length - thirdPartyTagCount);

        const maxWidthPercent = Math.floor(
          (currentTagMaxWidth / containerWidth) * 100,
        );

        for (let i = 0; i < tags.length; i += 1) {
          const tag = tags[i];
          const isTag = isTagType(tag);

          if (isTag && tag?.isThirdParty) {
            const tagNew = { ...tag, maxWidth: `44px` };
            newTags.push(tagNew);
          } else if (isTag && tag?.isDefault) {
            const tagNew = { ...tag, maxWidth: `${maxWidthPercent}%` };
            newTags.push(tagNew);
          } else {
            const tagNew = {
              label: isTag ? tag.label : tag,
              maxWidth: `${maxWidthPercent}%`,
            };
            newTags.push(tagNew);
          }
        }
      } else {
        const tagWithDropdown = {
          label: "",
          key: "selector",
          advancedOptions: tags.slice(
            columnCount,
            tags.length,
          ) as React.ReactNode[],
        };

        const currentTagMaxWidth =
          (containerWidth - columnCount * 4 - 40) / columnCount;

        const maxWidthPercent = Math.floor(
          (currentTagMaxWidth / containerWidth) * 100,
        );

        if (columnCount !== 0) {
          for (let i = 0; i < columnCount; i += 1) {
            const tag = tags[i];
            const isTag = isTagType(tag);

            if (isTag && tag?.isThirdParty) {
              const tagNew = { ...tag, maxWidth: `44px` };
              newTags.push(tagNew);
            } else if (isTag && tag?.isDefault) {
              const tagNew = { ...tag, maxWidth: `${maxWidthPercent}%` };
              newTags.push(tagNew);
            } else {
              const tagNew = {
                label: isTag ? tag.label : tag,
                maxWidth: `${maxWidthPercent}%`,
              };
              newTags.push(tagNew);
            }
          }
        }

        newTags.push(tagWithDropdown);

        newTags[newTags.length - 1].maxWidth = `35px`;
      }

      setRenderedTags(newTags);
    }
  }, [tags, tagsRef, columnCount]);

  React.useLayoutEffect(() => {
    updateRenderedTags();
  }, [updateRenderedTags]);

  return (
    <div
      data-testid="tags"
      aria-label="Tags container"
      id={id}
      className={`${styles.tags} ${className}`}
      style={style}
      ref={tagsRef}
    >
      {renderedTags?.length > 0
        ? renderedTags.map((tag, idx) => {
            return (
              <Tag
                key={tag.label}
                {...tags}
                tag={tag.label}
                providerType={tag.providerType}
                icon={tag.icon}
                advancedOptions={tag.advancedOptions}
                tagMaxWidth={tag.maxWidth}
                isNewTag={false}
                label={tag.label}
                onClick={onSelectTag}
                isLast={idx === renderedTags.length - 1}
                removeTagIcon={removeTagIcon}
                roomType={tag.roomType}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                isDefaultMode={isDefaultMode}
                directionY={directionY}
                fixedDirection={fixedDirection}
                manualY={manualY}
                manualX={manualX}
              />
            );
          })
        : null}
    </div>
  );
};

export { Tags };
