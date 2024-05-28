import React from "react";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { TableCell } from "@docspace/shared/components/table";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";

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
          type={LoaderTypes.oval}
          size="16px"
        />
      ) : (
        <TableCell className="table-container_element-wrapper">
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

      <Text title={name} fontWeight="600" fontSize="13px">
        {name}
      </Text>
    </>
  );
};

export default NameCell;
