// import React from "react";

// import { screen, render } from "@testing-library/react";
// import "@testing-library/jest-dom";

// import { TabsContainer } from "./TabsContainer";

// const ArrayItems = [
//   {
//     key: "tab0",
//     title: "Title1",
//     content: (
//       <div>
//         <button>BUTTON</button>
//         <button>BUTTON</button>
//         <button>BUTTON</button>
//       </div>
//     ),
//   },
//   {
//     key: "tab1",
//     title: "Title2",
//     content: (
//       <div>
//         <label>LABEL</label>
//         <label>LABEL</label>
//         <label>LABEL</label>
//       </div>
//     ),
//   },
//   {
//     key: "tab2",
//     title: "Title3",
//     content: (
//       <div>
//         <input></input>
//         <input></input>
//         <input></input>
//       </div>
//     ),
//   },
//   {
//     key: "tab3",
//     title: "Title4",
//     content: (
//       <div>
//         <button>BUTTON</button>
//         <button>BUTTON</button>
//         <button>BUTTON</button>
//       </div>
//     ),
//   },
//   {
//     key: "tab4",
//     title: "Title5",
//     content: (
//       <div>
//         <label>LABEL</label>
//         <label>LABEL</label>
//         <label>LABEL</label>
//       </div>
//     ),
//   },
// ];

describe("<TabContainer />", () => {
  it("renders without error", () => {
    // render(
    //   <TabContainer
    //     elements={[
    //       {
    //         key: "0",
    //         title: "Title1",
    //         content: (
    //           <div>
    //             <button>BUTTON</button>
    //             <button>BUTTON</button>
    //             <button>BUTTON</button>
    //           </div>
    //         ),
    //       },
    //     ]}
    //   />,
    // );
    // expect(wrapper).toExist();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("TabsContainer not re-render test", () => {
  //   // @ts-expect-error TS(2322): Type '{ elements: { key: string; title: string; co... Remove this comment to see the full error message
  //   const wrapper = mount(<TabContainer elements={array_items} />).instance();
  //   const shouldUpdate = wrapper.shouldComponentUpdate(
  //     wrapper.props,
  //     wrapper.state,
  //   );
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(false);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("TabsContainer not re-render test", () => {
  //   // @ts-expect-error TS(2322): Type '{ elements: { key: string; title: string; co... Remove this comment to see the full error message
  //   const wrapper = mount(<TabContainer elements={array_items} />).instance();
  //   const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props, {
  //     ...wrapper.state,
  //     activeTab: 3,
  //   });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(true);
  // });
});
