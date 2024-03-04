import { useRef } from "react";
import { Row } from "@docspace/shared/components/row";
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
    roleSelectorRef.current?.contains(e.target) || toggleAccount();
  };

  return (
    <Row
      sectionWidth={sectionWidth}
      key={data.key}
      data={data}
      checked={isChecked}
      contextButtonSpacerWidth="0"
      onRowClick={handleAccountToggle}
      onSelect={handleAccountToggle}
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
