import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import TabContainer from ".";

const array_items = [
  {
    key: "tab0",
    title: "Title1",
    content: (
      <div>
        <button>BUTTON</button>
        <button>BUTTON</button>
        <button>BUTTON</button>
      </div>
    ),
  },
  {
    key: "tab1",
    title: "Title2",
    content: (
      <div>
        <label>LABEL</label>
        <label>LABEL</label>
        <label>LABEL</label>
      </div>
    ),
  },
  {
    key: "tab2",
    title: "Title3",
    content: (
      <div>
        <input></input>
        <input></input>
        <input></input>
      </div>
    ),
  },
  {
    key: "tab3",
    title: "Title4",
    content: (
      <div>
        <button>BUTTON</button>
        <button>BUTTON</button>
        <button>BUTTON</button>
      </div>
    ),
  },
  {
    key: "tab4",
    title: "Title5",
    content: (
      <div>
        <label>LABEL</label>
        <label>LABEL</label>
        <label>LABEL</label>
      </div>
    ),
  },
];

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<TabContainer />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      <TabContainer
        // @ts-expect-error TS(2322): Type '{ elements: { key: string; title: string; co... Remove this comment to see the full error message
        elements={[
          {
            key: "0",
            title: "Title1",
            content: (
              <div>
                <>
                  <button>BUTTON</button>
                </>
                <>
                  <button>BUTTON</button>
                </>
                <>
                  <button>BUTTON</button>
                </>
              </div>
            ),
          },
        ]}
      />
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("TabsContainer not re-render test", () => {
    // @ts-expect-error TS(2322): Type '{ elements: { key: string; title: string; co... Remove this comment to see the full error message
    const wrapper = mount(<TabContainer elements={array_items} />).instance();
    const shouldUpdate = wrapper.shouldComponentUpdate(
      wrapper.props,
      wrapper.state
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("TabsContainer not re-render test", () => {
    // @ts-expect-error TS(2322): Type '{ elements: { key: string; title: string; co... Remove this comment to see the full error message
    const wrapper = mount(<TabContainer elements={array_items} />).instance();
    const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props, {
      ...wrapper.state,
      activeTab: 3,
    });
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });
});
