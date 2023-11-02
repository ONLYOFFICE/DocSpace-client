import React from "react";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
//@ts-ignore
import TableCell from "@docspace/components/table-container/TableCell";
import Loader from "@docspace/components/loader";

const StyledContainer = styled.div`
  .table-container_row-checkbox {
    margin-left: -8px;

    width: 16px;

    padding: 16px 8px 16px 16px;
  }
`;

const StyledImage = styled.img`
  width: 32px;
  height: 32px;

  border-radius: 3px;
`;

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
    setSelection && setSelection(clientId);
  };

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
          checked={isChecked}
        >
          <StyledContainer className="table-container_element-container">
            <div className="table-container_element">
              {icon && <StyledImage src={icon} alt={"App icon"} />}
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={isChecked}
              title={name}
            />
          </StyledContainer>
        </TableCell>
      )}

      {/* @ts-ignore */}
      <Text
        type="page"
        title={name}
        fontWeight="600"
        fontSize="13px"
        isTextOverflow
      >
        {name}
      </Text>
    </>
  );
};

export default NameCell;
