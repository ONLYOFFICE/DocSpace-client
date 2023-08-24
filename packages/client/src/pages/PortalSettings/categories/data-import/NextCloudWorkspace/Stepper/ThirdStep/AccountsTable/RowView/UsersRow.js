import React, { useRef } from "react";
import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UsersRow = (props) => {
  const { data, sectionWidth, isChecked, toggleAccount } = props;

  const emailInputRef = useRef();
  const emailTextRef = useRef();

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    emailInputRef.current?.contains(e.target) ||
      emailTextRef.current?.contains(e.target) ||
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
        sectionWidth={sectionWidth}
        displayName={data.displayName}
        email={data.email}
        emailInputRef={emailInputRef}
        emailTextRef={emailTextRef}
      />
    </Row>
  );
};

export default UsersRow;
