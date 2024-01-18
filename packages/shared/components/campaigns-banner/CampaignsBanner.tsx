import React, { useState } from "react";

import { RectangleSkeleton } from "../../skeletons";

import { Button, ButtonSize } from "../button";
import { Text } from "../text";

import BannerWrapper from "./CampaignsBanner.styled";
import { CampaignsBannerProps } from "./CampaignsBanner.types";

const onButtonClick = (url: string) => {
  window.open(url, "_blank");
};

const CampaignsBanner = (props: CampaignsBannerProps) => {
  const { headerLabel, subHeaderLabel, img, buttonLabel, link } = props;
  const [imageLoad, setImageLoad] = useState(false);

  const handleImageLoaded = () => {
    setImageLoad(true);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
  };

  return (
    <BannerWrapper data-testid="campaigns-banner">
      <a href={link} target="_blank" rel="noreferrer">
        <Text noSelect fontWeight="700" fontSize="13px">
          {headerLabel}
        </Text>
        <Text
          noSelect
          className="banner-sub-header"
          fontWeight="500"
          fontSize="12px"
        >
          {subHeaderLabel}
        </Text>
        <img
          className="banner-img"
          src={img}
          alt="banner-logo"
          onMouseDown={onMouseDown}
          onLoad={handleImageLoaded}
        />
        {!imageLoad && <RectangleSkeleton height="140px" borderRadius="5px" />}
      </a>

      <Button
        className="banner-btn"
        primary
        size={ButtonSize.small}
        isDisabled={false}
        disableHover
        label={buttonLabel}
        onClick={() => onButtonClick(link)}
      />
    </BannerWrapper>
  );
};

export { CampaignsBanner };
