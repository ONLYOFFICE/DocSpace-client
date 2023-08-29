import React from "react";
import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UsersRow = (props) => {
  const { t, data, sectionWidth, isChecked, toggleAccount } = props;

  return (
    <Row
      sectionWidth={sectionWidth}
      data={data}
      checked={isChecked}
      checkbox
      onClick={toggleAccount}
      onSelect={toggleAccount}>
      <UsersRowContent
        t={t}
        sectionWidth={sectionWidth}
        displayName={data.displayName}
        email={data.email}
        isDuplicate={data.isDuplicate}
      />
    </Row>
  );
};

export default UsersRow;
