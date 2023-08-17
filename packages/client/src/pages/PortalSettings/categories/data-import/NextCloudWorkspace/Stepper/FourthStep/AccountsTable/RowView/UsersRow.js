import { useState } from "react";
import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UserskRow = (props) => {
  const { data, sectionWidth, isChecked, toggleAccount } = props;

  return (
    <Row
      sectionWidth={sectionWidth}
      data={data}
      checked={isChecked}
      checkbox
      onClick={toggleAccount}
      onSelect={toggleAccount}>
      <UsersRowContent
        sectionWidth={sectionWidth}
        displayName={data.displayName}
        email={data.email}
      />
    </Row>
  );
};

export default UserskRow;
