﻿import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import React from "react";
import styled, { css } from "styled-components";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";
import { InputBlock } from "@docspace/shared/components/input-block";
import { toastr } from "@docspace/shared/components/toast";

import { mobile } from "@docspace/shared/utils";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  max-width: 520px;

  .input {
    width: 100%;
  }

  @media ${mobile} {
    max-width: 100%;
  }

  .label > div {
    display: inline-flex;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 4px;
          `
        : css`
            margin-left: 4px;
          `}
  }
`;

const MetadataUrlField = ({
  labelText,
  name,
  placeholder,
  tooltipContent,
  tooltipClass,
}) => {
  const { t } = useTranslation("Translations");

  const onCopyClick = () => {
    copy(placeholder);
    toastr.success(t("Translations:LinkCopySuccess"));
  };

  return (
    <StyledWrapper>
      <Text className="label" fontSize="13px" as="div" fontWeight={600}>
        {labelText}
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={tooltipContent}
          className={tooltipClass}
        />
      </Text>
      <InputBlock
        className="input"
        iconButtonClassName={name}
        isDisabled
        name={name}
        placeholder={placeholder}
        iconName={CopyReactSvgUrl}
        iconSize={16}
        onIconClick={onCopyClick}
      />
    </StyledWrapper>
  );
};

export default observer(MetadataUrlField);
