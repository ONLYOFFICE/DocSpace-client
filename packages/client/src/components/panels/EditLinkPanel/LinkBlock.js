import React from "react";
import { Text } from "@docspace/shared/components";
import { Link } from "@docspace/shared/components";
import { TextInput } from "@docspace/shared/components";
import { FieldContainer } from "@docspace/shared/components";

const LinkBlock = (props) => {
  const {
    t,
    isEdit,
    isLoading,
    shareLink,
    linkNameValue,
    setLinkNameValue,
    linkValue,
    setLinkValue,
  } = props;

  const onChangeLinkName = (e) => {
    setLinkNameValue(e.target.value);
  };

  return (
    <div className="edit-link_link-block">
      <Text className="edit-link-text" fontSize="16px" fontWeight={600}>
        {t("LinkName")}
      </Text>
      <Text className="edit-link_required-icon" color="#F24724">
        *
      </Text>

      <TextInput
        scale
        size="base"
        withBorder
        isAutoFocussed
        className="edit-link_name-input"
        value={linkNameValue}
        onChange={onChangeLinkName}
        placeholder={t("LinkName")}
        isDisabled={isLoading}
      />

      {isEdit && (
        <TextInput
          scale
          size="base"
          withBorder
          isDisabled
          isReadOnly
          className="edit-link_link-input"
          value={linkValue}
          placeholder={t("LinkName")}
        />
      )}
    </div>
  );
};

export default LinkBlock;
