import React, { FC } from "react";

import { Tag } from "../tag";

import StyledTags from "./Tags.styled";
import { isTagType } from "./Tags.utils";
import type { TagType, TagsProps } from "./Tags.types";

export const Tags: FC<TagsProps> = ({
  id,
  tags,
  style,
  className,
  columnCount,
  onSelectTag,
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
          const tag = { ...firstTag, maxWidth: `36px` };
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
            const tagNew = { ...tag, maxWidth: `36px` };
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
          (containerWidth - columnCount * 4 - 35) / columnCount;

        const maxWidthPercent = Math.floor(
          (currentTagMaxWidth / containerWidth) * 100,
        );

        if (columnCount !== 0) {
          for (let i = 0; i < columnCount; i += 1) {
            const tag = tags[i];
            const isTag = isTagType(tag);

            if (isTag && tag?.isThirdParty) {
              const tagNew = { ...tag, maxWidth: `36px` };
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

  React.useEffect(() => {
    updateRenderedTags();
  }, [updateRenderedTags]);

  return (
    <StyledTags
      data-testid="tags"
      id={id}
      className={className}
      style={style}
      ref={tagsRef}
    >
      {renderedTags?.length > 0 &&
        renderedTags.map((tag, idx) => {
          return (
            <Tag
              {...tags}
              key={tag.label}
              tag={tag.label}
              advancedOptions={tag.advancedOptions}
              tagMaxWidth={tag.maxWidth}
              isNewTag={false}
              label={tag.label}
              onClick={onSelectTag}
              isLast={idx === renderedTags.length - 1}
            />
          );
        })}
    </StyledTags>
  );
};
