import React, { useRef } from "react";
import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UserskRow = (props) => {
  const { t, data, sectionWidth, isChecked, toggleAccount } = props;

  const roleSelectorRef = useRef();

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.closest(".dropdown-container") ||
      roleSelectorRef.current?.contains(e.target) ||
      toggleAccount(e);
  };

  return (
    <Row
      sectionWidth={sectionWidth}
      data={data}
      checked={isChecked}
      checkbox
      onClick={handleAccountToggle}>
      <UsersRowContent
        t={t}
        sectionWidth={sectionWidth}
        displayName={data.displayName}
        email={data.email}
        roleSelectorRef={roleSelectorRef}
      />
    </Row>
  );
};

export default UserskRow;
