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

import React from "react";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";

import { IconButton } from "../icon-button";
import { Text } from "../text";
import { AsideHeaderProps } from "./Aside.types";
import { StyledHeaderContainer } from "./Aside.styled";
import { RectangleSkeleton } from "../../skeletons/rectangle";
import { Heading, HeadingSize } from "../heading";

const AsideHeader = (props: AsideHeaderProps) => {
  const {
    isBackButton = false,
    onBackClick,
    onCloseClick,
    header,
    headerIcons = [],
    isCloseable = true,
    className,
    id,
    style,
    isLoading,
    withoutBorder = false,
    headerHeight,
  } = props;

  const backButtonRender = (
    <IconButton
      className="arrow-button"
      iconName={ArrowPathReactSvgUrl}
      size={17}
      onClick={onBackClick}
      isFill
      isClickable
    />
  );

  const closeIconRender = (
    <IconButton
      size={17}
      className="close-button"
      iconName={CrossReactSvgUrl}
      onClick={onCloseClick}
      isClickable
      isStroke
    />
  );

  // TODO: Heading is temporary until all dialogues are checked

  const headerComponent =
    typeof header === "string" ? (
      <Text fontSize="21px" fontWeight={700} className="header-component">
        {header}
      </Text>
    ) : (
      <Heading className="heading" size={HeadingSize.medium} truncate>
        {header}
      </Heading>
    );

  const mainComponent = (
    <>
      {isBackButton && backButtonRender}
      {header && headerComponent}
      {headerIcons.length > 0 && (
        <div className="additional-icons-container">
          {headerIcons.map((item) => (
            <IconButton
              key={item.key}
              size={17}
              className="close-button"
              iconName={item.url}
              onClick={item.onClick}
              isClickable
              isFill
            />
          ))}
        </div>
      )}
      {isCloseable && closeIconRender}
    </>
  );

  const loaderComponent = <RectangleSkeleton height="28" width="100%" />;

  return (
    <StyledHeaderContainer
      id={id}
      className={className}
      style={style}
      withoutBorder={withoutBorder}
      headerHeight={headerHeight}
    >
      {isLoading ? loaderComponent : mainComponent}
    </StyledHeaderContainer>
  );
};

export { AsideHeader };
