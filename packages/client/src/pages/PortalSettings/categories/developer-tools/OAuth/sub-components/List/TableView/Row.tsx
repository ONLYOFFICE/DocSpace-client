import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

//@ts-ignore
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";

import NameCell from "./columns/name";

import { StyledRowWrapper, StyledTableRow } from "./TableView.styled";
import { RowProps } from "./TableView.types";
import CreatorCell from "./columns/creator";

const Row = (props: RowProps) => {
  const {
    item,
    changeClientStatus,
    isChecked,
    inProgress,
    getContextMenuItems,
    setSelection,
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
            <Text as="span" fontWeight={400} className="mr-8 textOverflow">
              {item.description}
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
