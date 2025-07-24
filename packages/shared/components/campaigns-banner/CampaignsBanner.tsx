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

import CrossReactSvg from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import React from "react";
import { ReactSVG } from "react-svg";

import { Text as TextComponent } from "../text";
import { Link as LinkComponent, LinkType } from "../link";
import { IconButton } from "../icon-button";

import styles from "./CampaignsBanner.module.scss";
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
    disableFitText,
    actionIcon,
  } = props;
  const { Header, SubHeader, Text, ButtonLabel, Link } = campaignTranslate;
  const { borderColor, title, body, text, action } = campaignConfig;

  const hasTitle = !!Header;
  const hasBodyText = !!SubHeader;
  const hasText = !!Text;
  const isButton = action?.isButton;

  const fitTextResult = useFitText(campaignBackground, body?.fontSize);

  const staticRef = React.useRef<HTMLDivElement>(null);
  const staticWrapperRef = React.useRef<HTMLDivElement>(null);

  const fontSize = disableFitText ? body?.fontSize : fitTextResult.fontSize;
  const ref = disableFitText ? staticRef : fitTextResult.ref;
  const wrapperRef = disableFitText
    ? staticWrapperRef
    : fitTextResult.wrapperRef;

  const wrapperStyle = {
    "--campaign-background": `url(${campaignBackground})`,
    "--campaign-border-color": borderColor,
  } as React.CSSProperties;

  const buttonStyle = {
    "--campaign-button-background-color": action?.backgroundColor,
    "--campaign-button-color": action?.color,
  } as React.CSSProperties;

  return (
    <div
      ref={wrapperRef}
      data-testid="campaigns-banner"
      className={styles.wrapper}
      style={wrapperStyle}
    >
      <div ref={ref} className={styles.content}>
        {hasTitle ? (
          <TextComponent
            className={styles.header}
            color={title?.color ?? globalColors.black}
            fontSize={title?.fontSize ?? "13px"}
            fontWeight={title?.fontWeight ?? "normal"}
            lineHeight="12px"
          >
            {Header}
          </TextComponent>
        ) : null}
        <div>
          {hasBodyText ? (
            <TextComponent
              color={body?.color ?? globalColors.black}
              fontSize={fontSize ?? "13px"}
              fontWeight={body?.fontWeight ?? "normal"}
            >
              {SubHeader}
            </TextComponent>
          ) : null}
          {hasText ? (
            <TextComponent
              color={text?.color ?? globalColors.black}
              fontSize={text?.fontSize ?? "13px"}
              fontWeight={text?.fontWeight ?? "normal"}
            >
              {Text}
            </TextComponent>
          ) : null}
        </div>
        {isButton ? (
          <button
            style={buttonStyle}
            className={styles.button}
            onClick={() => onAction()}
            type="button"
          >
            <TextComponent
              color={action?.color ?? globalColors.black}
              fontSize={action?.fontSize ?? "13px"}
              fontWeight={action?.fontWeight ?? "normal"}
            >
              {ButtonLabel}
            </TextComponent>
          </button>
        ) : (
          <LinkComponent
            color={action?.color ?? globalColors.black}
            type={LinkType.action}
            isHovered
            onClick={() => onAction(action?.type, Link)}
          >
            <TextComponent
              color={action?.color ?? globalColors.black}
              fontSize={action?.fontSize ?? "13px"}
              fontWeight={action?.fontWeight ?? "normal"}
            >
              {ButtonLabel}
            </TextComponent>
          </LinkComponent>
        )}

        {campaignIcon ? (
          <ReactSVG src={campaignIcon} className={styles.icon} />
        ) : null}
      </div>
      <IconButton
        size={12}
        className={styles.closeIcon}
        onClick={onClose}
        iconName={actionIcon || CrossReactSvg}
      />
    </div>
  );
};

export { CampaignsBanner };
