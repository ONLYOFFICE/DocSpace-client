import { useState } from "react";
import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UserskRow = (props) => {
  const { data, sectionWidth } = props;

  const [isChecked, setIsChecked] = useState(false);

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <>
      <Row
        sectionWidth={sectionWidth}
        key={data.id}
        data={data}
        onClick={() => console.log("row click")}
      >
        <UsersRowContent
          sectionWidth={sectionWidth}
          displayName={data.displayName}
          email={data.email}
          dublicate={data.dublicate}
          isChecked={isChecked}
          onChangeCheckbox={onChangeCheckbox}
        />
      </Row>
    </>
  );
};

export default UserskRow;
