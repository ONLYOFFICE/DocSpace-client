import React from "react";
import { inject, observer } from "mobx-react";
import TableCell from "@docspace/components/table-container/TableCell";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import TagsCell from "./TagsCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import { classNames } from "@docspace/components/utils/classNames";
import { StyledBadgesContainer } from "../StyledTable";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";

const RoomsRowDataComponent = (props) => {
  const {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,
    roomQuotaColumnIsEnable,

    dragStyles,
    selectionProp,
    value,
    theme,
    onContentFileSelect,
    checkedProps,
    element,
    inProgress,
    showHotkeyBorder,
    badgesComponent,

    item,

    isDefaultRoomsQuotaSet,
  } = props;

  return (
    <>
      <TableCell
        {...dragStyles}
        className={classNames(
          selectionProp?.className,
          "table-container_file-name-cell"
        )}
        value={value}
      >
        <FileNameCell
          theme={theme}
          onContentSelect={onContentFileSelect}
          checked={checkedProps}
          element={element}
          inProgress={inProgress}
          {...props}
        />
        <StyledBadgesContainer showHotkeyBorder={showHotkeyBorder}>
          {badgesComponent}
        </StyledBadgesContainer>
      </TableCell>

      {roomColumnTypeIsEnabled ? (
        <TableCell
          style={
            !roomColumnTypeIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnTagsIsEnabled ? (
        <TableCell
          style={
            !roomColumnTagsIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <TagsCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnOwnerIsEnabled ? (
        <TableCell
          style={
            !roomColumnOwnerIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnActivityIsEnabled ? (
        <TableCell
          style={
            !roomColumnActivityIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}
      {roomQuotaColumnIsEnable ? (
        <TableCell className={"table-cell_Storage/Quota"}>
          <SpaceQuota
            item={item}
            type="room"
            withoutLimitQuota={!isDefaultRoomsQuotaSet}
          />
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ auth, tableStore }) => {
  const {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,
    roomQuotaColumnIsEnable,
  } = tableStore;
  const { currentQuotaStore } = auth;
  const { isDefaultRoomsQuotaSet } = currentQuotaStore;

  return {
    roomQuotaColumnIsEnable,
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,
    isDefaultRoomsQuotaSet,
  };
})(observer(RoomsRowDataComponent));
