import React from "react";
import { useTheme } from "styled-components";

import {
  TabletSideInfo,
  SideContainerWrapper,
  MainContainer,
  MainIcons,
  MainContainerWrapper,
  StyledRowContent,
} from "./RowContent.styled";
import { RowContentProps } from "./RowContent.types";
import { getSideInfo } from "./RowContent.utils";

const RowContent = (props: RowContentProps) => {
  const {
    children,
    disableSideInfo = false,
    id,
    className,
    style,
    sideColor,
    onClick,
    sectionWidth,
    convertSideInfo = true,
  } = props;

  const theme = useTheme();
  const interfaceDirection = theme?.interfaceDirection;

  const sideInfo = getSideInfo(children, convertSideInfo, interfaceDirection);

  let mainContainerWidth;

  if (React.isValidElement(children[0]))
    mainContainerWidth = children[0].props && children[0].props.containerWidth;

  return (
    <StyledRowContent
      className={className}
      disableSideInfo={disableSideInfo}
      id={id}
      onClick={onClick}
      style={style}
      widthProp={sectionWidth}
      isMobile
      data-testid="row-content"
    >
      <MainContainerWrapper
        disableSideInfo={disableSideInfo}
        mainContainerWidth={mainContainerWidth}
        widthProp={sectionWidth}
        isMobile
        className="row-main-container-wrapper"
      >
        <MainContainer
          className="rowMainContainer"
          widthProp={sectionWidth}
          isMobile
        >
          {children[0]}
        </MainContainer>
        <MainIcons className="mainIcons">{children[1]}</MainIcons>
      </MainContainerWrapper>
      {children.map((element: React.ReactNode, index: number) => {
        if (index > 1 && React.isValidElement(element)) {
          const p = element.props as {
            containerWidth?: string;
            containerMinWidth?: string;
          };
          return (
            <SideContainerWrapper
              disableSideInfo={disableSideInfo}
              key={`side- + ${index * 10}`}
              containerWidth={p.containerWidth}
              containerMinWidth={p.containerMinWidth}
              widthProp={sectionWidth}
              isMobile
            >
              {element}
            </SideContainerWrapper>
          );
        }
        return null;
      })}
      {!disableSideInfo && (
        <TabletSideInfo
          className="row-content_tablet-side-info"
          color={sideColor}
          widthProp={sectionWidth}
          isMobile
        >
          {sideInfo}
        </TabletSideInfo>
      )}
    </StyledRowContent>
  );
};

export { RowContent };
