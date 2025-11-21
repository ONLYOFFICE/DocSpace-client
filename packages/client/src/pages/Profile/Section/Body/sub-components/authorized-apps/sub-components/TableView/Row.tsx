import { useTranslation } from "react-i18next";

import { TableCell } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";

import getCorrectDate from "@docspace/shared/utils/getCorrectDate";

import { getCookie } from "@docspace/shared/utils/cookie";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

import NameCell from "./columns/name";

import { StyledRowWrapper, StyledTableRow } from "./TableView.styled";
import { RowProps } from "./TableView.types";

const Row = (props: RowProps) => {
  const {
    item,

    isChecked,
    inProgress,
    getContextMenuItems,
    setSelection,
    dataTestId,
  } = props;

  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  const contextOptions = getContextMenuItems?.(t, item, false, false);

  const locale = getCookie("asc_language");

  const modifiedDate = getCorrectDate(locale || "", item.modifiedOn || "");

  const getContextMenuModel = () =>
    getContextMenuItems ? getContextMenuItems(t, item, false, false) : [];

  return (
    <StyledRowWrapper className="handle">
      <StyledTableRow
        contextOptions={contextOptions}
        getContextModel={getContextMenuModel}
        isIndexEditingMode={false}
        badgeUrl=""
        dataTestId={dataTestId}
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

        <TableCell className="">
          <Text
            as="span"
            fontWeight={400}
            className="mr-8 textOverflow description-text"
          >
            <Link
              className="description-text"
              href={item.websiteUrl}
              type={LinkType.action}
              target={LinkTarget.blank}
              isHovered
              dataTestId="website_link"
            >
              {item.websiteUrl}
            </Link>
          </Text>
        </TableCell>

        <TableCell className="">
          <Text
            as="span"
            fontWeight={400}
            className="mr-8 textOverflow description-text"
            dataTestId="modified_date_text"
          >
            {modifiedDate}
          </Text>
        </TableCell>
      </StyledTableRow>
    </StyledRowWrapper>
  );
};

export default Row;
