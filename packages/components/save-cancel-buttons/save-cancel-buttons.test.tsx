import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import SaveCancelButtons from ".";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<MainButton />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      <SaveCancelButtons
        // @ts-expect-error TS(2769): No overload matches this call.
        showReminder={true}
        reminderText="You have unsaved changes"
        saveButtonLabel="Save"
        cancelButtonLabel="Cancel"
      />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(
      <SaveCancelButtons
        // @ts-expect-error TS(2769): No overload matches this call.
        showReminder={true}
        reminderText="You have unsaved changes"
        saveButtonLabel="Save"
        cancelButtonLabel="Cancel"
        id="testId"
      />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      <SaveCancelButtons
        // @ts-expect-error TS(2769): No overload matches this call.
        showReminder={true}
        reminderText="You have unsaved changes"
        saveButtonLabel="Save"
        cancelButtonLabel="Cancel"
        className="test"
      />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });
});
