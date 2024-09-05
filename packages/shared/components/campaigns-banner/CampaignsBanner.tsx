// (c) Copyright Ascensio System SIA 2009-2024
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

import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg?url";

import React from "react";
import { ReactSVG } from "react-svg";

import { Text as TextComponent } from "../text";
import { Link as LinkComponent } from "../link";
import { IconButton } from "../icon-button";

import {
  BannerWrapper,
  BannerContent,
  BannerButton,
  BannerIcon,
} from "./CampaignsBanner.styled";
import { CampaignsBannerProps } from "./CampaignsBanner.types";

import useFitText from "./useFitText";
import { globalColors } from "../../themes";

const CampaignsBanner = (props: CampaignsBannerProps) => {
  const {
    campaignBackground,
    campaignIcon,
    campaignTranslate,
    campaignConfig,
    onAction,
    onClose,
  } = props;
  const { Header, SubHeader, Text, ButtonLabel, Link } = campaignTranslate;
  const { borderColor, title, body, text, action } = campaignConfig;

  const hasTitle = !!Header;
  const hasBodyText = !!SubHeader;
  const hasText = !!Text;
  const isButton = action?.isButton;

  const { fontSize, ref, wrapperRef } = useFitText(
    campaignBackground,
    body?.fontSize,
  );

  return (
    <BannerWrapper
      ref={wrapperRef}
      data-testid="campaigns-banner"
      background={campaignBackground}
      borderColor={borderColor}
    >
      <BannerContent ref={ref}>
        {hasTitle && (
          <TextComponent
            className="header"
            color={title?.color || globalColors.black}
            fontSize={title?.fontSize}
            fontWeight={title?.fontWeight}
            lineHeight="12px"
          >
            {Header}
          </TextComponent>
        )}
        <div>
          {hasBodyText && (
            <TextComponent
              color={body?.color || globalColors.black}
              fontSize={fontSize}
              fontWeight={body?.fontWeight}
            >
              {SubHeader}
            </TextComponent>
          )}
          {hasText && (
            <TextComponent
              color={text?.color || globalColors.black}
              fontSize={text?.fontSize}
              fontWeight={text?.fontWeight}
            >
              {Text}
            </TextComponent>
          )}
        </div>
        {isButton ? (
          <BannerButton
            buttonTextColor={action?.color}
            buttonColor={action?.backgroundColor}
            onClick={() => onAction(action?.type, Link)}
          >
            {ButtonLabel}
          </BannerButton>
        ) : (
          <LinkComponent
            color={action?.color}
            fontSize={action?.fontSize}
            fontWeight={action?.fontWeight}
            onClick={() => onAction(action?.type, Link)}
            isHovered
          >
            {ButtonLabel}
          </LinkComponent>
        )}
      </BannerContent>
      <IconButton
        className="close-icon"
        size={12}
        iconName={CrossReactSvg}
        onClick={onClose}
      />
      <BannerIcon>
        <ReactSVG src={campaignIcon} />
      </BannerIcon>
    </BannerWrapper>
  );
};

export { CampaignsBanner };
