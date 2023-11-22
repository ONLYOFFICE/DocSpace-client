import { useRef } from "react";
import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UsersRow = (props) => {
  const { data, sectionWidth, typeOptions, isChecked, toggleAccount } = props;

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
      key={data.key}
      data={data}
      checked={isChecked}
      checkbox={isChecked}
      onClick={handleAccountToggle}
      contextButtonSpacerWidth="0"
    >
      <UsersRowContent
        id={data.key}
        sectionWidth={sectionWidth}
        displayName={data.displayName}
        email={data.email}
        type={data.userType}
        typeOptions={typeOptions}
        roleSelectorRef={roleSelectorRef}
      />
    </Row>
  );
};

export default UsersRow;
