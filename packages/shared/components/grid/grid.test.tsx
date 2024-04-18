// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import { render } from "@testing-library/react";

import { Grid } from "./grid";

describe("<Grid />", () => {
  it("renders without error", () => {
    render(<Grid />);
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("id, className, style is exists", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ id: string; className: string; style: { co... Remove this comment to see the full error message
  //     <Grid id="testId" className="test" style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("props transfer test", () => {
  //   const wrapper = mount(
  //     <Grid
  //       // @ts-expect-error TS(2322): Type '{ alignContent: string; alignItems: string; ... Remove this comment to see the full error message
  //       alignContent="center"
  //       alignItems="center"
  //       alignSelf="center"
  //       areasProp={[
  //         { name: "header", start: [0, 0], end: [2, 0] },
  //         { name: "navbar", start: [0, 1], end: [0, 1] },
  //         { name: "main", start: [1, 1], end: [1, 1] },
  //         { name: "sidebar", start: [2, 1], end: [2, 1] },
  //         { name: "footer", start: [0, 2], end: [2, 2] },
  //       ]}
  //       columnsProp={[["100px", "1fr"], "3fr", ["100px", "1fr"]]}
  //       gridArea="grid"
  //       gridColumnGap="10px"
  //       gridGap="10px"
  //       gridRowGap="10px"
  //       heightProp="100vh"
  //       justifyContent="center"
  //       justifyItems="center"
  //       justifySelf="center"
  //       marginProp="10px"
  //       paddingProp="10px"
  //       rowsProp={["auto", "1fr", "auto"]}
  //       tag="div"
  //       widthProp="100vw"
  //     />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().alignContent).toEqual("center");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().alignItems).toEqual("center");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().alignSelf).toEqual("center");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp.length).toEqual(5);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[0].name).toEqual("header");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[0].start)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[0].start.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[0].start[0]).toEqual(0);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[0].start[1]).toEqual(0);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[0].end)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[0].end.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[0].end[0]).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[0].end[1]).toEqual(0);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[1].name).toEqual("navbar");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[1].start)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[1].start.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[1].start[0]).toEqual(0);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[1].start[1]).toEqual(1);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[1].end)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[1].end.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[1].end[0]).toEqual(0);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[1].end[1]).toEqual(1);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[2].name).toEqual("main");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[2].start)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[2].start.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[2].start[0]).toEqual(1);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[2].start[1]).toEqual(1);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[2].end)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[2].end.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[2].end[0]).toEqual(1);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[2].end[1]).toEqual(1);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[3].name).toEqual("sidebar");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[3].start)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[3].start.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[3].start[0]).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[3].start[1]).toEqual(1);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[3].end)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[3].end.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[3].end[0]).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[3].end[1]).toEqual(1);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[4].name).toEqual("footer");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[4].start)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[4].start.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[4].start[0]).toEqual(0);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[4].start[1]).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().areasProp[4].end)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[4].end.length).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[4].end[0]).toEqual(2);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().areasProp[4].end[1]).toEqual(2);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().columnsProp)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().columnsProp.length).toEqual(3);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().gridArea).toEqual("grid");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().gridColumnGap).toEqual("10px");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().gridGap).toEqual("10px");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().gridRowGap).toEqual("10px");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().heightProp).toEqual("100vh");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().justifyContent).toEqual("center");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().justifyItems).toEqual("center");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().justifySelf).toEqual("center");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().marginProp).toEqual("10px");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().paddingProp).toEqual("10px");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper.props().rowsProp)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().rowsProp.length).toEqual(3);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().rowsProp[0]).toEqual("auto");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().rowsProp[1]).toEqual("1fr");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().rowsProp[2]).toEqual("auto");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().tag).toEqual("div");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().widthProp).toEqual("100vw");

  //   // @ts-expect-error TS(2322): Type '{ columnsProp: { count: number; size: string... Remove this comment to see the full error message
  //   const wrapper2 = mount(<Grid columnsProp={{ count: 3, size: "100px" }} />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(typeof wrapper.props().columnsProp).toEqual("object");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper2.props().columnsProp.count).toEqual(3);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper2.props().columnsProp.size).toEqual("100px");

  //   // @ts-expect-error TS(2322): Type '{ columnsProp: string; }' is not assignable ... Remove this comment to see the full error message
  //   const wrapper3 = mount(<Grid columnsProp="25%" />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(typeof wrapper3.props().columnsProp).toEqual("string");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper3.props().columnsProp).toEqual("25%");

  //   // @ts-expect-error TS(2322): Type '{ rowsProp: string; }' is not assignable to ... Remove this comment to see the full error message
  //   const wrapper4 = mount(<Grid rowsProp="50px" />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(typeof wrapper4.props().rowsProp).toEqual("string");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper4.props().rowsProp).toEqual("50px");

  //   const wrapper5 = mount(
  //     <Grid
  //       // @ts-expect-error TS(2322): Type '{ areasProp: string[][]; }' is not assignabl... Remove this comment to see the full error message
  //       areasProp={[
  //         ["header", "header", "header"],
  //         ["navbar", "main", "sidebar"],
  //         ["footer", "footer", "footer"],
  //       ]}
  //     />,
  //   );
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper5.props().areasProp)).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp.length).toEqual(3);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper5.props().areasProp[0])).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[0].length).toEqual(3);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[0][0]).toEqual("header");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[0][1]).toEqual("header");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[0][2]).toEqual("header");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper5.props().areasProp[1])).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[1].length).toEqual(3);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[1][0]).toEqual("navbar");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[1][1]).toEqual("main");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[1][2]).toEqual("sidebar");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(Array.isArray(wrapper5.props().areasProp[2])).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[2].length).toEqual(3);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[2][0]).toEqual("footer");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[2][1]).toEqual("footer");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper5.props().areasProp[2][2]).toEqual("footer");
  // });

  // //TODO: Uncomment after fix https://github.com/styled-components/jest-styled-components/issues/294
  // /* test('it applies styles', () => {
  //   const tree = renderer.create(<Grid />).toJSON();
  //   expect(tree).toHaveStyleRule('display', 'grid');

  //   const tree1 = renderer.create(<Grid columnsProp={["200px", ["100px","1fr"], "auto"]} />).toJSON();
  //   expect(tree1).toHaveStyleRule('grid-template-columns', '200px minmax(100px,1fr) auto');

  //   const tree2 = renderer.create(<Grid columnsProp="25%" />).toJSON();
  //   expect(tree2).toHaveStyleRule('grid-template-columns', 'repeat(auto-fill,25%)');

  //   const tree3 = renderer.create(<Grid columnsProp={{ count: 3, size: "100px" }} />).toJSON();
  //   expect(tree3).toHaveStyleRule('grid-template-columns', 'repeat(3,100px)');

  //   const tree4 = renderer.create(<Grid columnsProp={{ count: 3, size: ["100px", "1fr"] }} />).toJSON();
  //   expect(tree4).toHaveStyleRule('grid-template-columns', 'repeat(3,minmax(100px,1fr))');

  //   const tree5 = renderer.create(<Grid rowsProp={["100px", ["100px","1fr"], "auto"]} />).toJSON();
  //   expect(tree5).toHaveStyleRule('grid-template-rows', '100px minmax(100px,1fr) auto');

  //   const tree6 = renderer.create(<Grid rowsProp="50px" />).toJSON();
  //   expect(tree6).toHaveStyleRule('grid-auto-rows', '50px');

  //   const tree7 = renderer.create(<Grid areasProp={[["header","header"],["navbar","main"]]} />).toJSON();
  //   expect(tree7).toHaveStyleRule('grid-template-areas', '"header header" "navbar main"');

  //   const tree8 = renderer.create(<Grid
  //   rowsProp={["auto", "1fr", "auto"]}
  //   columnsProp={[["100px","1fr"], "3fr", ["100px","1fr"]]}
  //   areasProp={[
  //     { name: "header", start: [0, 0], end: [2, 0] },
  //     { name: "navbar", start: [0, 1], end: [0, 1] },
  //     { name: "main", start: [1, 1], end: [1, 1] },
  //     { name: "sidebar", start: [2, 1], end: [2, 1] },
  //     { name: "footer", start: [0, 2], end: [2, 2] }
  //   ]} />).toJSON();
  //   expect(tree8).toHaveStyleRule('grid-template-areas', '"header header header" "navbar main sidebar" "footer footer footer"');
  //   expect(tree8).toHaveStyleRule('grid-template-columns', 'minmax(100px,1fr) 3fr minmax(100px,1fr)');
  //   expect(tree8).toHaveStyleRule('grid-template-rows', 'auto 1fr auto');
  // });  */
});
