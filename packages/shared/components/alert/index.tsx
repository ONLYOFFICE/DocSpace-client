import React from "react";
import { useTheme } from "styled-components";

import { IconSizeType } from "../../utils/common-icons-style";

import { Text } from "../text";
import { Link, LinkType } from "../link";

import {
  StyledAlertComponent,
  StyledArrowRightIcon,
  StyledCrossIcon,
} from "./Alert.styled";
import { AlertComponentProps } from "./Alert.types";

const AlertComponent = (props: AlertComponentProps) => {
  const {
    id,
    description,
    title,
    titleFontSize,
    additionalDescription,
    needArrowIcon = false,
    needCloseIcon = false,
    link,
    onLinkClick,
    linkColor,
    linkTitle,
    onAlertClick,
    onCloseClick,
    titleColor,
    borderColor,
  } = props;

  const theme = useTheme();

  return (
    <StyledAlertComponent
      theme={theme}
      titleColor={titleColor}
      borderColor={borderColor}
      onClick={onAlertClick}
      needArrowIcon={needArrowIcon}
      id={id}
    >
      <div className="main-content">
        <Text
          className="alert-component_title"
          fontSize={titleFontSize ?? "12px"}
          fontWeight={600}
        >
          {title}
        </Text>
        {additionalDescription && (
          <Text fontWeight={600}>{additionalDescription}</Text>
        )}
        <Text
          noSelect
          fontSize="12px"
          color={theme.alertComponent.descriptionColor}
        >
          {description}
        </Text>
        {(link || !!onLinkClick) && (
          <Link
            type={LinkType.page}
            href={link}
            onClick={onLinkClick}
            noHover
            color={linkColor}
          >
            {linkTitle}
          </Link>
        )}
      </div>
      {needCloseIcon && (
        <StyledCrossIcon
          size={IconSizeType.extraSmall}
          onClick={onCloseClick}
        />
      )}
      {needArrowIcon && (
        <StyledArrowRightIcon className="alert-component_arrow" />
      )}
    </StyledAlertComponent>
  );
};

export default AlertComponent;
