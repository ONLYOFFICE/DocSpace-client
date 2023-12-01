import React from "react";

import withContent from "SRC_DIR/HOCs/withPeopleContent";

import UserContent from "./userContent";

import * as Styled from "./index.styled";

const GroupsRow = (props) => {
  const {
    item,
    sectionWidth,
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

  const contextOptionsProps = {
    contextOptions: [
      {
        id: "option_profile",
        key: "profile",
        icon: "http://192.168.0.105/static/images/check-box.react.svg?hash=079b6e8fa11a027ed622",
        label: "Select",
      },
      {
        key: "separator-1",
        isSeparator: true,
      },
      {
        id: "option_change-name",
        key: "change-name",
        icon: "http://192.168.0.105/static/images/pencil.react.svg?hash=7b1050767036ee383c82",
        label: "Edit department",
      },
      {
        icon: "http://192.168.0.105/static/images/info.outline.react.svg?hash=1341c2413ad79879439d",
        id: "option_details",
        key: "details",
        label: "Info",
      },
      {
        key: "separator-2",
        isSeparator: true,
      },
      {
        id: "option_change-owner",
        key: "change-owner",
        icon: "http://192.168.0.105/static/images/catalog.trash.react.svg?hash=eba7f2edad4e3c4f6f77",
        label: "Delete",
      },
    ],
  };

  return (
    <Styled.GroupsRowWrapper
      className={`user-item row-wrapper ${
        isChecked || isActive ? "row-selected" : ""
      }`}
      value={value}
    >
      <Styled.GroupsRow
        key={item.id}
        data={item}
        element={
          <div
            style={{
              display: "flex",
              width: "32px",
              height: "32px",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              lineHeight: "16px",
              background: "#ECEEF1",
              color: "#333",
              borderRadius: "50%",
            }}
          >
            {item.shortTitle}
          </div>
        }
        onSelect={onContentRowSelect}
        checked={isChecked}
        isActive={isActive}
        {...contextOptionsProps}
        sectionWidth={sectionWidth}
        mode={"modern"}
        className={"user-row"}
        onRowClick={onRowClick}
        onContextClick={onRowContextClick}
      >
        <UserContent {...props} />
      </Styled.GroupsRow>
    </Styled.GroupsRowWrapper>
  );
};

export default withContent(GroupsRow);
