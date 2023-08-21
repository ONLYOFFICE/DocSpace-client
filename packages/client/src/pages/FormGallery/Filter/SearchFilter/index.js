import InputBlock from "@docspace/components/input-block";
import SearchInput from "@docspace/components/search-input";
import TextInput from "@docspace/components/text-input";
import FieldContainer from "@docspace/components/field-container";

import { useState, useRef } from "react";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

import styled from "styled-components";

export const StyledTextInput = styled(TextInput)`
  width: 100%;
  max-width: 653px;
`;

const SearchFilter = ({}) => {
  const [value, setValue] = useState("asd");

  const onChangeValue = (e) => {
    setValue(e.target.value);
  };

  const onClearSearch = () => {
    setValue("");
  };

  const ref = useRef(null);
  const handleClick = () => {
    if (!ref?.current) return;
    console.log(ref.current);
  };

  return (
    <div>
      <TextInput
        ref={ref}
        className="first-name"
        placeholder={"Search"}
        value={value}
        onChange={onChangeValue}
        onMouseDown={() => {}}
        onBlur={() => console.log("blur")}
        onFocus={() => console.log("onFocus")}
        onClick={handleClick}
        // tabIndex={1}
        // isAutoFocussed={true}
        // isDisabled={false}
        // onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default SearchFilter;
