import React from "react";
import styled, { css } from "styled-components";

import { RectangleSkeleton, RectangleSkeletonProps } from "../rectangle";

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;

  overflow: hidden;

  display: flex;
  flex-direction: column;
`;

const StyledItem = styled.div<{ isUser?: boolean }>`
  width: 100%;
  height: 48px;
  min-height: 48px;

  padding: 0 16px;

  box-sizing: border-box;

  display: flex;
  align-items: center;

  .avatar {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 8px;`
        : `margin-right: 8px;`}

    ${(props) =>
      props.isUser &&
      css`
        border-radius: 50px;
      `}
  }

  .checkbox {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: auto;`
        : `margin-left: auto;`}
  }
`;

const Divider = styled.div`
  height: 1px;
  margin: 12px 16px;
  border-bottom: ${(props) => props.theme.selector.border};
`;

interface RowLoaderProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  isMultiSelect?: boolean;
  isContainer?: boolean;
  isUser?: boolean;
  withAllSelect?: boolean;
  count?: number;
}

const RowLoader = ({
  id,
  className,
  style,
  isMultiSelect,
  isContainer,
  isUser,
  withAllSelect,
  count = 5,
  ...rest
}: RowLoaderProps) => {
  const getRowItem = (key: number) => {
    return (
      <StyledItem
        id={id}
        className={className}
        style={style}
        isUser={isUser}
        key={`selector-row-${key}`}
        {...rest}
      >
        <RectangleSkeleton className="avatar" width="32px" height="32px" />
        <RectangleSkeleton width="212px" height="16px" />
        {isMultiSelect && (
          <RectangleSkeleton className="checkbox" width="16px" height="16px" />
        )}
      </StyledItem>
    );
  };

  const getRowItems = () => {
    const rows = [];
    for (let i = 0; i < count; i += 1) {
      rows.push(getRowItem(i));
    }

    return rows;
  };

  return isContainer ? (
    <StyledContainer
      id={id}
      className={className}
      key="test"
      style={style}
      {...rest}
    >
      {withAllSelect && (
        <>
          {getRowItem(-1)}
          <Divider />
        </>
      )}
      {getRowItems()}
    </StyledContainer>
  ) : (
    getRowItem(0)
  );
};

export default RowLoader;
