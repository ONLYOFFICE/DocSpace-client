import { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import styled from "styled-components";
import SearchInput from "@docspace/components/search-input";
import RowContainer from "@docspace/components/row-container";
import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";
import UsersTypeRow from "./UsersTypeRow";
import { mockData } from "../../mockData.js";

const StyledRowContainer = styled(RowContainer)`
  margin: 20px 0;

  .table-group-menu {
    height: 60px;
    position: absolute;
    z-index: 201;
    left: -20px;
    top: 0;
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
  }

  .table-container_header {
    position: absolute;
  }
`;

const data = [
  {
    key: "docspace-admin",
    label: "DocSpace admin",
    onClick: () => console.log("changed-type"),
  },
  {
    key: "room-admin",
    label: "Room admin",
    onClick: () => console.log("changed-type"),
  },
  {
    key: "power-user",
    label: "Power user",
    onClick: () => console.log("changed-type"),
  },
];

const RowView = (props) => {
  const { sectionWidth, viewAs, setViewAs } = props;
  const [isChecked, setIsChecked] = useState(false);
  const [checkbox, setCheckbox] = useState([]);
  const rowRef = useRef(null);

  const onCheck = (checked) => {
    setIsChecked(checked);
    if (checked) {
      setCheckbox(mockData.map((data) => data.id));
    } else {
      setCheckbox([]);
    }
  };

  const onChangeAllCheckbox = (e) => {
    onCheck(e.target.checked);
  };

  const onChangeCheckbox = (id, checked) => {
    if (checked) {
      setCheckbox([...checkbox, id]);
    } else {
      setCheckbox([...checkbox.filter((item) => item !== id)]);
    }
  };

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
      options: data,
      iconUrl: ChangeTypeReactSvgUrl,
    },
  ];

  return (
    <StyledRowContainer forwardedRef={rowRef} useReactWindow={false}>
      <div className="table-group-menu">
        {checkbox.length > 0 && (
          <TableGroupMenu
            onChange={onCheck}
            headerMenu={headerMenu}
            isChecked={isChecked}
            isIndeterminate={checkbox.length && !isChecked}
            withoutInfoPanelToggler
            sectionWidth={sectionWidth}
            withComboBox={false}
          />
        )}
      </div>
      <SearchInput
        id="search-users-input"
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
        placeholder="Search"
      />
      {mockData.map((data) => (
        <UsersTypeRow
          key={data.id}
          id={data.id}
          data={data}
          sectionWidth={sectionWidth}
          checkbox={checkbox}
          isChecked={isChecked}
          onChangeCheckbox={onChangeCheckbox}
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
