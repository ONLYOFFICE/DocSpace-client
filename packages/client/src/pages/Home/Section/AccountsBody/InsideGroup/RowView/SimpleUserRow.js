import React from "react";
import styled, { css } from "styled-components";
import { isMobile } from "react-device-detect";

import { Row } from "@docspace/shared/components/row";
import { Base } from "@docspace/shared/themes";

import withContent from "SRC_DIR/HOCs/withPeopleContent";

import UserContent from "./userContent";
import { mobile, tablet } from "@docspace/shared/utils";

const marginStyles = css`
  margin-inline-start: -24px;
  padding-inline: 24px;

  @media ${tablet} {
    margin-inline-start: -16px;
    padding-inline: 16px;
  }
`;

const marginStylesUserRowContainer = css`
  margin-inline-end: -48px !important;

  @media ${tablet} {
    margin-inline-end: -32px !important;
  }
`;

const checkedStyle = css`
  background: ${(props) => props.theme.filesSection.rowView.checkedBackground};
  ${marginStyles}
`;

const StyledWrapper = styled.div`
  .user-item {
    border: 1px solid transparent;
    border-inline: none;
    margin-inline-start: 0;
    height: 100%;
    user-select: none;

    position: relative;
    outline: none;
    background: none !important;
  }

  .user-row-container {
    ${(props) =>
      (props.checked || props.isActive) && marginStylesUserRowContainer};

    :hover {
      ${marginStylesUserRowContainer}
    }
  }
`;

StyledWrapper.defaultProps = { theme: Base };

const StyledSimpleUserRow = styled(Row)`
  ${(props) => (props.checked || props.isActive) && checkedStyle};

  .row_content {
    height: 58px;
  }

  height: 59px;

  border-top: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
  border-bottom: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

  box-sizing: border-box;
  margin-top: -1px;

  ${!isMobile &&
  css`
    :hover {
      cursor: pointer;
      ${checkedStyle}
    }
  `}

  position: unset;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .styled-element {
    height: 32px;
    margin-inline-end: 12px;
  }
`;

const SimpleUserRow = (props) => {
  const {
    item,
    sectionWidth,
    contextOptionsProps,
    checkedProps,
    onContentRowSelect,
    onContentRowClick,
    element,
    //setBufferSelection,
    isActive,
    //isSeveralSelection,
    value,
  } = props;

  const isChecked = checkedProps.checked;

  const onRowClick = React.useCallback(() => {
    onContentRowClick && onContentRowClick(!isChecked, item);
  }, [isChecked, item, onContentRowClick]);

  const onRowContextClick = React.useCallback(() => {
    onContentRowClick && onContentRowClick(!isChecked, item, false);
  }, [isChecked, item, onContentRowClick]);

  return (
    <StyledWrapper
      className={`user-item row-wrapper ${
        isChecked || isActive ? "row-selected" : ""
      }`}
      value={value}
      checked={isChecked}
      isActive={isActive}
    >
      <div className="user-item user-row-container">
        <StyledSimpleUserRow
          key={item.id}
          data={item}
          element={element}
          onSelect={onContentRowSelect}
          checked={isChecked}
          isActive={isActive}
          {...contextOptionsProps}
          sectionWidth={sectionWidth}
          mode={"modern"}
          className={"user-row"}
          onRowClick={onRowClick}
          onContextClick={onRowContextClick}
          withoutBorder={true}
        >
          <UserContent {...props} />
        </StyledSimpleUserRow>
      </div>
    </StyledWrapper>
  );
};

export default withContent(SimpleUserRow);
