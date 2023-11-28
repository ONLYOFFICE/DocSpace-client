import { useRef } from "react";
import Row from "@docspace/components/row";
import UsersTypeRowContent from "./UsersTypeRowContent";

const UsersTypeRow = ({
  data,
  sectionWidth,
  typeOptions,
  isChecked,
  toggleAccount,
}) => {
  const roleSelectorRef = useRef();

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.closest(".dropdown-container") ||
      roleSelectorRef.current?.contains(e.target) ||
      toggleAccount();
  };

  return (
    <Row
      sectionWidth={sectionWidth}
      key={data.key}
      data={data}
      checked={isChecked}
      onClick={handleAccountToggle}
      contextButtonSpacerWidth="0"
    >
      <UsersTypeRowContent
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

export default UsersTypeRow;
