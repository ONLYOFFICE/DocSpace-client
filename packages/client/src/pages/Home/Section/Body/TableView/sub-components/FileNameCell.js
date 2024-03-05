import React from "react";
import { Link } from "@docspace/shared/components/link";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { TableCell } from "@docspace/shared/components/table";
import { Loader } from "@docspace/shared/components/loader";

const FileNameCell = ({
  item,
  titleWithoutExt,
  linkStyles,
  element,
  onContentSelect,
  checked,
  theme,
  t,
  inProgress,
}) => {
  const { title, viewAccessibility } = item;

  const onChange = (e) => {
    onContentSelect && onContentSelect(e.target.checked, item);
  };

  const isMedia = viewAccessibility?.ImageView || viewAccessibility?.MediaView;

  return (
    <>
      {inProgress ? (
        <Loader
          className="table-container_row-loader"
          type="oval"
          size="16px"
        />
      ) : (
        <TableCell
          className="table-container_element-wrapper"
          hasAccess={true}
          checked={checked}
        >
          <div className="table-container_element-container">
            <div className="table-container_element">{element}</div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={checked}
              title={t("Common:TitleSelectFile")}
            />
          </div>
        </TableCell>
      )}

      <Link
        type="page"
        title={title}
        fontWeight="600"
        fontSize="13px"
        {...linkStyles}
        color={theme.filesSection.tableView.fileName.linkColor}
        isTextOverflow
        className="item-file-name"
        dir="auto"
      >
        {titleWithoutExt}
      </Link>
    </>
  );
};

export default FileNameCell;
