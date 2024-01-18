import React from "react";

import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { FieldContainer } from "./FieldContainer";
import { InputSize, InputType, TextInput } from "../text-input";

describe("<FieldContainer />", () => {
  it("renders without error", () => {
    render(
      <FieldContainer labelText="Name:">
        <TextInput
          value=""
          onChange={() => {}}
          type={InputType.text}
          size={InputSize.base}
        />
      </FieldContainer>,
    );

    expect(screen.getByTestId("field-container")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; }' is not assignable to type '... Remove this comment to see the full error message
  //   const wrapper = mount(<FieldContainer id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; }' is not assignable to... Remove this comment to see the full error message
  //   const wrapper = mount(<FieldContainer className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   // @ts-expect-error TS(2322): Type '{ style: { color: string; }; }' is not assig... Remove this comment to see the full error message
  //   const wrapper = mount(<FieldContainer style={{ color: "red" }} />);

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
