import { useTranslation } from "react-i18next";

//@ts-ignore
import TableCell from "@docspace/components/table-container/TableCell";

import Text from "@docspace/components/text";

//@ts-ignore
import getCorrectDate from "@docspace/components/utils/getCorrectDate";
//@ts-ignore
import { getCookie } from "@docspace/components/utils/cookie";
import Link from "@docspace/components/link";

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
  } = props;

  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  const contextOptions =
    getContextMenuItems && getContextMenuItems(t, item, false, false);

  const locale = getCookie("asc_language");

  const modifiedDate = getCorrectDate(locale, item.modifiedOn);

  return (
    <>
      <StyledRowWrapper className="handle">
        <StyledTableRow contextOptions={contextOptions}>
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
            {/* @ts-ignore */}
            <Text
              as="span"
              fontWeight={400}
              className="mr-8 textOverflow description-text"
            >
              {/* @ts-ignore */}
              <Link
                className="description-text"
                href={item.websiteUrl}
                type={"action"}
                target={"_blank"}
                isHovered
              >
                {item.websiteUrl}
              </Link>
            </Text>
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
        </StyledTableRow>
      </StyledRowWrapper>
    </>
  );
};

export default Row;
