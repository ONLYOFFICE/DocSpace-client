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
    e.preventDefault();
    e.stopPropagation();
    e.target.closest(".dropdown-container") ||
      userTypeRef.current?.contains(e.target) ||
      toggleAccount();
  };

  return (
    <>
      <Row
        sectionWidth={sectionWidth}
        key={data.key}
        data={data}
        checked={isChecked}
        checkbox={isChecked}
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
          userTypeRef={userTypeRef}
        />
      </Row>
    </>
  );
};

export default UsersTypeRow;
