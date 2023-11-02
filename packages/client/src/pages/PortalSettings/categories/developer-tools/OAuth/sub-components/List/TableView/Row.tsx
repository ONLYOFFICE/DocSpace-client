import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

//@ts-ignore
import TableCell from "@docspace/components/table-container/TableCell";
//@ts-ignore
import Tags from "@docspace/components/tags";
import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";
//@ts-ignore
import getCorrectDate from "@docspace/components/utils/getCorrectDate";
//@ts-ignore
import { getCookie } from "@docspace/components/utils/cookie";

import NameCell from "./columns/name";
import CreatorCell from "./columns/creator";

import { StyledRowWrapper, StyledTableRow } from "./TableView.styled";
import { RowProps } from "./TableView.types";

const Row = (props: RowProps) => {
  const {
    item,
    changeClientStatus,
    isChecked,
    inProgress,
    getContextMenuItems,
    setSelection,
    tagCount,
  } = props;
  const navigate = useNavigate();

  const { t } = useTranslation(["Common"]);

  const editClient = () => {
    navigate(`${item.clientId}`);
  };

  const handleToggleEnabled = async () => {
    if (!changeClientStatus) return;
    await changeClientStatus(item.clientId, !item.enabled);
  };

  const handleRowClick = (e: any) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.target.closest(".advanced-tag") ||
      e.target.closest(".tag") ||
      e.detail === 0
    ) {
      return;
    }

    if (
      e.target.closest(".type-combobox") ||
      e.target.closest(".table-container_row-context-menu-wrapper") ||
      e.target.closest(".toggleButton")
    ) {
      return setSelection && setSelection("");
    }

    editClient();
  };

  const contextOptions = getContextMenuItems && getContextMenuItems(t, item);

  const local = getCookie("asc_language");
  const modifiedDate = getCorrectDate(local, item.modifiedOn);

  return (
    <>
      <StyledRowWrapper className="handle">
        <StyledTableRow
          contextOptions={contextOptions}
          onClick={handleRowClick}
        >
          <TableCell className={"table-container_file-name-cell"}>
            <NameCell
              name={item.name}
              icon={item.logo}
              isChecked={isChecked}
              inProgress={inProgress}
              clientId={item.clientId}
              setSelection={setSelection}
            />
          </TableCell>
          <TableCell>
            <CreatorCell
              avatar={item.creatorAvatar || ""}
              displayName={item.creatorDisplayName || ""}
            />
          </TableCell>
          <TableCell>
            {/* @ts-ignore */}
            <Text
              as="span"
              fontWeight={400}
              className="mr-8 textOverflow description-text"
            >
              {modifiedDate}
            </Text>
          </TableCell>
          <TableCell>
            {/* @ts-ignore */}
            <Text
              as="span"
              fontWeight={400}
              className="mr-8 textOverflow description-text"
            >
              <Tags
                tags={item.scopes}
                columnCount={tagCount}
                onSelectTag={() => {}}
              />
            </Text>
          </TableCell>
          <TableCell>
            <ToggleButton
              className="toggle toggleButton"
              isChecked={item.enabled}
              onChange={handleToggleEnabled}
            />
          </TableCell>
        </StyledTableRow>
      </StyledRowWrapper>
    </>
  );
};

export default Row;
