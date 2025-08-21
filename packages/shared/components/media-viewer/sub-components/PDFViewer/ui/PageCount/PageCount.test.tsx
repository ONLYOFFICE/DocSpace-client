// (c) Copyright Ascensio System SIA 2009-2025
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
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { PageCount } from "./PageCount";
import { PageCountRef } from "./PageCount.props";

jest.mock("react-device-detect", () => ({
  isMobile: false,
}));

// Mock PanelReactSvg
jest.mock("PUBLIC_DIR/images/panel.react.svg", () => {
  return function DummyPanelSvg() {
    return <div>Panel Icon</div>;
  };
});

// Mock classnames
jest.mock("classnames", () => {
  return function dummyClassnames(...args: unknown[]) {
    return args.join(" ");
  };
});

// Mock styles
jest.mock(
  "./sub-components/PDFViewer/ui/PageCountPageCount.module.scss",
  () => ({
    pageCountWrapper: "pageCountWrapper",
    isPanelOpen: "isPanelOpen",
    isMobile: "isMobile",
  }),
);

describe("PageCount", () => {
  const defaultProps = {
    visible: true,
    isPanelOpen: false,
    setIsOpenMobileDrawer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when visible", () => {
    const ref = React.createRef<PageCountRef>();
    render(<PageCount {...defaultProps} ref={ref} />);

    expect(screen.getByTestId("page-count")).toBeInTheDocument();
    expect(screen.getByTestId("page-numbers")).toBeInTheDocument();
    expect(screen.getByTestId("current-page")).toHaveTextContent("0");
    expect(screen.getByTestId("total-pages")).toHaveTextContent("0");
  });

  it("does not render when not visible", () => {
    const ref = React.createRef<PageCountRef>();
    render(<PageCount {...defaultProps} visible={false} ref={ref} />);

    expect(screen.queryByTestId("page-count")).not.toBeInTheDocument();
  });
});
