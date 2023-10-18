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
import { StyledQuickButtonsContainer } from "../StyledTable";

const RoomsRowDataComponent = (props) => {
  const {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnQuickButtonsIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,

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
    quickButtonsComponent,
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

      {roomColumnQuickButtonsIsEnabled ? (
        <TableCell
          style={
            !roomColumnQuickButtonsIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <StyledQuickButtonsContainer>
            {quickButtonsComponent}
          </StyledQuickButtonsContainer>
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore }) => {
  const {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnQuickButtonsIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,
  } = tableStore;

  return {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnQuickButtonsIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,
  };
})(observer(RoomsRowDataComponent));
