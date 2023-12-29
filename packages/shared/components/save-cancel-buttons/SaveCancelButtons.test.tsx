import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { SaveCancelButtons } from "./SaveCancelButton";

describe("<MainButton />", () => {
  it("renders without error", () => {
    render(
      <SaveCancelButtons
        showReminder
        reminderText="You have unsaved changes"
        saveButtonLabel="Save"
        cancelButtonLabel="Cancel"
      />,
    );

    expect(screen.getByTestId("save-cancel-buttons")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(
  //     <SaveCancelButtons
  //       showReminder={true}
  //       reminderText="You have unsaved changes"
  //       saveButtonLabel="Save"
  //       cancelButtonLabel="Cancel"
  //       id="testId"
  //     />,
  //   );

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     <SaveCancelButtons
  //       showReminder={true}
  //       reminderText="You have unsaved changes"
  //       saveButtonLabel="Save"
  //       cancelButtonLabel="Cancel"
  //       className="test"
  //     />,
  //   );

  //   expect(wrapper.prop("className")).toEqual("test");
  // });
});
