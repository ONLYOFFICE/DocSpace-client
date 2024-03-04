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
  const userTypeRef = useRef();

  const handleAccountToggle = (e) => {
    userTypeRef.current?.contains(e.target) || toggleAccount();
  };

  return (
    <>
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
          userTypeRef={userTypeRef}
        />
      </Row>
    </>
  );
};

export default UsersTypeRow;
