import { ChangeEvent } from "react";
import { useState } from "react";
import Label from "@docspace/components/label";
import TextInput from "@docspace/components/text-input";
import FieldContainer from "@docspace/components/field-container";
import * as Styled from "./index.styled";

interface GroupNameParamProps {
  groupName: string;
  onChangeGroupName: (e: ChangeEvent<HTMLInputElement>) => void;
}

const GroupNameParam = ({
  groupName,
  onChangeGroupName,
}: GroupNameParamProps) => {
  return (
    <Styled.GroupNameParam>
      <Label
        title={"Name"}
        className="input-label"
        display="display"
        htmlFor={"create-group-name"}
        text={"Name"}
      />

      <FieldContainer
        isVertical={true}
        labelVisible={false}
        // hasError={!isValidTitle || isWrongTitle}
        // errorMessage={errorMessage}
        errorMessageWidth={"100%"}
      >
        <TextInput
          id={"create-group-name"}
          value={groupName}
          onChange={onChangeGroupName}
          // onFocus={onFocus}
          // onBlur={onBlur}
          scale
          placeholder={"Enter name"}
          tabIndex={2}
          // isDisabled={isDisabled}
          // hasError={!isValidTitle}
          isAutoFocussed={true}
          // onKeyUp={onKeyUp}
          // onKeyDown={onKeyDown}
          maxLength={170}
        />
      </FieldContainer>
    </Styled.GroupNameParam>
  );
};

export default GroupNameParam;
