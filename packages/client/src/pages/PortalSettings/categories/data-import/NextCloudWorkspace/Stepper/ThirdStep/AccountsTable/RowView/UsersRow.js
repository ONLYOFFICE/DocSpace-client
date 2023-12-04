import { useState, useRef } from "react";
import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UsersRow = (props) => {
  const { t, data, sectionWidth, isChecked, toggleAccount, isEmailOpen, setOpenedEmailKey } = props;

  const emailInputRef = useRef();
  const emailTextRef = useRef();

  const [isPrevEmailValid, setIsPrevEmailValid] = useState(data.email.length > 0);

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    !isPrevEmailValid ||
      emailInputRef.current?.contains(e.target) ||
      emailTextRef.current?.contains(e.target) ||
      toggleAccount();
  };

  return (
    <Row
      sectionWidth={sectionWidth}
      checked={isChecked}
      onClick={handleAccountToggle}
      isDisabled={!isPrevEmailValid}>
      <UsersRowContent
        t={t}
        id={data.key}
        sectionWidth={sectionWidth}
        displayName={data.displayName}
        email={data.email}
        emailInputRef={emailInputRef}
        emailTextRef={emailTextRef}
        isChecked={isChecked}
        isEmailOpen={isEmailOpen}
        setOpenedEmailKey={setOpenedEmailKey}
        setIsPrevEmailValid={setIsPrevEmailValid}
        toggleAccount={toggleAccount}
      />
    </Row>
  );
};

export default UsersRow;
