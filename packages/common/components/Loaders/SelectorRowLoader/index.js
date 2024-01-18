import React from "react";
import styled, { css } from "styled-components";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;

  overflow: hidden;

  display: flex;
  flex-direction: column;
`;

const StyledItem = styled.div`
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

const SelectorRowLoader = ({
  id,
  className,
  style,
  isMultiSelect,
  isContainer,
  isUser,
  withAllSelect,
  count = 5,
  ...rest
}) => {
  const getRowItem = (key) => {
    return (
      <StyledItem
        id={id}
        className={className}
        style={style}
        isMultiSelect={isMultiSelect}
        isUser={isUser}
        key={key}
        {...rest}
      >
        <RectangleSkeleton
          className={"avatar"}
          width={"32px"}
          height={"32px"}
        />
        <RectangleSkeleton width={"212px"} height={"16px"} />
        {isMultiSelect && (
          <RectangleSkeleton
            className={"checkbox"}
            width={"16px"}
            height={"16px"}
          />
        )}
      </StyledItem>
    );
  };

  const getRowItems = () => {
    const rows = [];
    for (let i = 0; i < count; i++) {
      rows.push(getRowItem(i));
    }

    return rows;
  };

  return isContainer ? (
    <StyledContainer id={id} className={className} style={style} {...rest}>
      {withAllSelect && (
        <>
          {getRowItem(-1)}
          <Divider />
        </>
      )}
      {getRowItems()}
    </StyledContainer>
  ) : (
    getRowItem()
  );
};

export default SelectorRowLoader;
