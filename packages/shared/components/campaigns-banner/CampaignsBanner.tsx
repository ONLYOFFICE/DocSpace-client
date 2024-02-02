import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg?url";

import React from "react";
import { Text } from "../text";
import { Link } from "../link";
import { IconButton } from "../icon-button";

import {
  BannerWrapper,
  BannerContent,
  BannerButton,
} from "./CampaignsBanner.styled";
import { CampaignsBannerProps } from "./CampaignsBanner.types";

const CampaignsBanner = (props: CampaignsBannerProps) => {
  const {
    campaignImage,
    campaignTranslate,
    campaignConfig,
    onAction,
    onClose,
  } = props;
  const { Title, BodyText, ActionText } = campaignTranslate;
  const { borderColor, title, body, action } = campaignConfig;

  const hasTitle = !!Title;
  const hasBodyText = !!BodyText;
  const isButton = action?.isButton;

  return (
    <BannerWrapper
      data-testid="campaigns-banner"
      background={campaignImage}
      borderColor={borderColor}
    >
      <BannerContent>
        {hasTitle && (
          <Text
            color={title?.color}
            fontSize={title?.fontSize}
            fontWeight={title?.fontWeight}
          >
            {Title}
          </Text>
        )}
        {hasBodyText && (
          <Text
            color={body?.color}
            fontSize={body?.fontSize}
            fontWeight={body?.fontWeight}
          >
            {BodyText}
          </Text>
        )}
        {isButton ? (
          <BannerButton
            buttonTextColor={action?.color}
            buttonColor={action?.backgroundColor}
            onClick={() => onAction(action?.type, action?.url)}
          >
            {ActionText}
          </BannerButton>
        ) : (
          <Link
            color={action?.color}
            fontSize={action?.fontSize}
            fontWeight={action?.fontWeight}
            onClick={() => onAction(action?.type, action?.url)}
          >
            {ActionText}
          </Link>
        )}
      </BannerContent>
      <IconButton
        className="close-icon"
        size={12}
        iconName={CrossReactSvg}
        onClick={onClose}
      />
    </BannerWrapper>
  );
};

export { CampaignsBanner };
