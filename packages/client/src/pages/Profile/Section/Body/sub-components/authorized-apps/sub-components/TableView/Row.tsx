import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { TableCell, TableRow } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";

import getCorrectDate from "@docspace/shared/utils/getCorrectDate";

import { getCookie } from "@docspace/shared/utils/cookie";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

import NameCell from "./columns/name";

import { RowProps } from "./TableView.types";
import styles from "../../authorized-apps.module.scss";

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
    <div className={classNames(styles.rowWrapper, "handle")}>
      <TableRow
        className={styles.tableRow}
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
            className={classNames(
              styles.descriptionText,
              styles.textOverflow,
              styles.mr8,
            )}
          >
            <Link
              className={styles.descriptionText}
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
            className={classNames(
              styles.descriptionText,
              styles.textOverflow,
              styles.mr8,
            )}
            dataTestId="modified_date_text"
          >
            {modifiedDate}
          </Text>
        </TableCell>
      </TableRow>
    </div>
  );
};

export default Row;
