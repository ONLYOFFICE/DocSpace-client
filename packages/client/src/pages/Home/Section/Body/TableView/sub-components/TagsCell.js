import React from "react";

import { Tags } from "@docspace/shared/components/tags";

//import { ROOMS_TYPE_TRANSLATIONS } from "@docspace/shared/constants";
import { Text } from "@docspace/shared/components/text";

const TagsCell = ({
  t,
  item,
  tagCount,
  onSelectTag,
  onSelectOption,
  sideColor,
}) => {
  const styleTagsCell = {
    width: "100%",
    overflow: "hidden",
    display: item.thirdPartyIcon ? "flex" : "",
  };

  const tags = [];

  if (item.providerType) {
    tags.push({
      isThirdParty: true,
      icon: item.thirdPartyIcon,
      label: item.providerKey,
      onClick: () =>
        onSelectOption({
          option: "typeProvider",
          value: item.providerType,
        }),
    });
  }

  if (item?.tags?.length > 0) {
    tags.push(...item.tags);
  }

  return (
    <div style={styleTagsCell}>
      {tags.length === 0 ? (
        <Text color={sideColor}>{""}</Text>
      ) : (
        <Tags tags={tags} columnCount={tagCount} onSelectTag={onSelectTag} />
      )}

      {/* {item.providerType && (
        <Tag
          icon={item.thirdPartyIcon}
          label={item.providerKey}
          onClick={() =>
            onSelectOption({
              option: "typeProvider",
              value: item.providerType,
            })
          }
        />
      )}

      {item.tags.length > 0 ? (
        <Tags
          tags={item.tags}
          columnCount={tagCount}
          onSelectTag={onSelectTag}
        />
      ) : (
        <Tag
          isDefault
          label={t(ROOMS_TYPE_TRANSLATIONS[item.roomType])}
          onClick={() =>
            onSelectOption({
              option: "defaultTypeRoom",
              value: item.roomType,
            })
          }
        />
      )} */}
    </div>
  );
};
export default React.memo(TagsCell);
