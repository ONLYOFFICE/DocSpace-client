import { Text } from "../text";
import { Link } from "../link";

import {
  BannerWrapper,
  BannerContent,
  BannerButton,
} from "./CampaignsBanner.styled";
import { CampaignsBannerProps } from "./CampaignsBanner.types";

const onAction = (url: string) => {
  window.open(url, "_blank");
};

const CampaignsBanner = (props: CampaignsBannerProps) => {
  const { campaignImage, campaignTranslate, campaignConfig } = props;
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
            onClick={() => onAction(action.url)}
          >
            {ActionText}
          </BannerButton>
        ) : (
          <Link
            color={action?.color}
            fontSize={action?.fontSize}
            fontWeight={action?.fontWeight}
            onClick={() => onAction(action.url)}
          >
            {ActionText}
          </Link>
        )}
      </BannerContent>
    </BannerWrapper>
  );
};

export { CampaignsBanner };
