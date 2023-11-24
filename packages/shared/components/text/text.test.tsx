import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import Text from ".";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<Text />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; as: string; title: strin... Remove this comment to see the full error message
      <Text as="p" title="Some title">
        Some text
      </Text>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });
});
