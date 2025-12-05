import React from "react";
import classNames from "classnames";

import { TextWithTooltip as Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { TableCell } from "@docspace/shared/components/table";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";
import styles from "../../../authorized-apps.module.scss";

interface NameCellProps {
  name: string;
  clientId: string;
  icon?: string;
  inProgress?: boolean;
  isChecked?: boolean;
  setSelection?: (clientId: string) => void;
}

const NameCell = ({
  name,
  icon,
  clientId,
  inProgress,
  isChecked,
  setSelection,
}: NameCellProps) => {
  const onChange = () => {
    setSelection?.(clientId);
  };

  return (
    <>
      {inProgress ? (
        <Loader
          className="table-container_row-loader"
          color=""
          size="20px"
          type={LoaderTypes.track}
        />
      ) : (
        <TableCell
          className="table-container_element-wrapper"
          hasAccess
          checked={isChecked}
        >
          <div
            className={classNames(
              "table-container_element-container",
              styles.nameContainer,
            )}
          >
            <div className="table-container_element">
              {icon ? (
                <img src={icon} alt="App icon" className={styles.styledImage} />
              ) : null}
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={isChecked}
              title={name}
              dataTestId="row_selection_checkbox"
            />
          </div>
        </TableCell>
      )}

      <Text title={name} fontWeight="600" fontSize="13px">
        {name}
      </Text>
    </>
  );
};

export default NameCell;
