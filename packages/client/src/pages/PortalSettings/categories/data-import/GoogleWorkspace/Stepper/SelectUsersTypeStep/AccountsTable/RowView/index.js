import { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import UsersTypeRow from "./UsersTypeRow";

import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import RowContainer from "@docspace/components/row-container";
import Row from "@docspace/components/row";
import Text from "@docspace/components/text";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";

const StyledRowContainer = styled(RowContainer)`
  margin: 0 0 20px;

  .table-group-menu {
    height: 60px;
    position: absolute;
    z-index: 201;
    left: -20px;
    top: -35px;
    width: 100%;

    .table-container_group-menu {
      padding: 0px 20px;
      border-image-slice: 0;
      box-shadow: rgba(0, 0, 0, 0.07) 0px 4px 4px;
    }

    .table-container_group-menu-checkbox {
      margin-left: 7px;
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }
  }

  .header-container-text {
    font-size: 12px;
    color: #a3a9ae;
  }

  .table-container_header {
    position: absolute;
  }
`;

const StyledRow = styled(Row)`
  box-sizing: border-box;
  min-height: 40px;

  .row-header-title {
    color: #a3a9ae;
    font-weight: 600;
    font-size: 12px;
  }

  @media ${tablet} {
    .row_content {
      height: auto;
    }
  }
`;

const RowView = ({
  t,
  sectionWidth,
  viewAs,
  setViewAs,
  accountsData,
  typeOptions,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [checkbox, setCheckbox] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

  const headerMenu = [
    {
      id: "change-type",
      key: "change-type",
      label: "Change type",
      disabled: false,
      onClick: () => console.log("open-menu"),
      withDropDown: true,
      options: typeOptions,
      iconUrl: ChangeTypeReactSvgUrl,
    },
  ];

  const onChangeAllCheckbox = (checked) => {
    setIsChecked(checked);
    if (checked) {
      setCheckbox(accountsData.map((data) => data.id));
    } else {
      setCheckbox([]);
    }
  };

  const onChangeCheckbox = (id, checked) => {
    if (checked) {
      setCheckbox([...checkbox, id]);
    } else {
      setCheckbox([...checkbox.filter((item) => item !== id)]);
    }
  };

  return (
    <StyledRowContainer forwardedRef={rowRef} useReactWindow={false}>
      {checkbox.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            onChange={onChangeAllCheckbox}
            headerMenu={headerMenu}
            isChecked={isChecked}
            isIndeterminate={checkbox.length && !isChecked}
            withoutInfoPanelToggler
            sectionWidth={sectionWidth}
            withComboBox={false}
          />
        </div>
      )}

      <StyledRow
        key="Name"
        sectionWidth={sectionWidth}
        onClick={onChangeAllCheckbox}
      >
        <Text className="row-header-title">{t("Common:Name")}</Text>
      </StyledRow>

      {accountsData.map((data) => (
        <UsersTypeRow
          key={data.id}
          id={data.id}
          data={data}
          sectionWidth={sectionWidth}
          checkbox={checkbox}
          isChecked={isChecked}
          onChangeCheckbox={onChangeCheckbox}
          typeOptions={typeOptions}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ setup }) => {
  const { viewAs, setViewAs } = setup;

  return {
    viewAs,
    setViewAs,
  };
})(observer(RowView));
