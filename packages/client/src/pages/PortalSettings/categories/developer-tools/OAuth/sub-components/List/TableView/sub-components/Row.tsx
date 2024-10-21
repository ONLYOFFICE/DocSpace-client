import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { TableCell } from "@docspace/shared/components/table";
import { Tags } from "@docspace/shared/components/tags";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import getCorrectDate from "@docspace/shared/utils/getCorrectDate";
import { getCookie } from "@docspace/shared/utils/cookie";
import { toastr } from "@docspace/shared/components/toast";

import NameCell from "../columns/name";
import CreatorCell from "../columns/creator";

import { StyledRowWrapper, StyledTableRow } from "../TableView.styled";
import { RowProps } from "../TableView.types";

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

  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  const editClient = () => {
    navigate(`${item.clientId}`);
  };

  const handleToggleEnabled = async () => {
    if (!changeClientStatus) return;
    try {
      await changeClientStatus(item.clientId, !item.enabled);

      if (!item.enabled) {
        toastr.success(t("ApplicationEnabledSuccessfully"));
      } else {
        toastr.success(t("ApplicationDisabledSuccessfully"));
      }
    } catch (e) {
      toastr.error(e as string);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (
      target.closest(".checkbox") ||
      target.closest(".table-container_row-checkbox") ||
      target.closest(".advanced-tag") ||
      target.closest(".tag") ||
      e.detail === 0
    ) {
      return;
    }

    if (
      target.closest(".type-combobox") ||
      target.closest(".table-container_row-context-menu-wrapper") ||
      target.closest(".toggleButton")
    ) {
      return setSelection && setSelection("");
    }

    editClient();
  };

  const contextOptions = getContextMenuItems?.(t, item);

  const getContextMenuModel = () =>
    getContextMenuItems ? getContextMenuItems(t, item) : [];

  const locale = getCookie("asc_language");

  const modifiedDate = getCorrectDate(locale || "", item.modifiedOn || "");

  return (
    <StyledRowWrapper className="handle">
      <StyledTableRow
        contextOptions={contextOptions || []}
        onClick={handleRowClick}
        getContextModel={getContextMenuModel}
        isIndexEditingMode={false}
        badgeUrl=""
      >
        <TableCell className="table-container_file-name-cell">
          <NameCell
            name={item.name}
            icon={item.logo}
            isChecked={isChecked}
            inProgress={inProgress}
            clientId={item.clientId}
            setSelection={setSelection}
          />
        </TableCell>
        <TableCell className="author-cell">
          <CreatorCell
            avatar={item.creatorAvatar || ""}
            displayName={item.creatorDisplayName || ""}
          />
        </TableCell>
        <TableCell className="">
          <Text
            as="span"
            fontWeight={400}
            className="mr-8 textOverflow description-text"
          >
            {modifiedDate}
          </Text>
        </TableCell>
        <TableCell className="">
          <Text
            as="span"
            fontWeight={400}
            className="mr-8 textOverflow description-text"
          >
            <Tags
              tags={item.scopes}
              removeTagIcon
              columnCount={tagCount}
              onSelectTag={() => {}}
            />
          </Text>
        </TableCell>
        <TableCell className="">
          <ToggleButton
            className="toggle toggleButton"
            isChecked={item.enabled}
            onChange={handleToggleEnabled}
          />
        </TableCell>
      </StyledTableRow>
    </StyledRowWrapper>
  );
};

export default Row;
