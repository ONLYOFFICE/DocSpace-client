/* eslint-disable class-methods-use-this */
import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import Section from "./index";
import SectionBody from "./sub-components/SectionBody";
import SectionFilter from "./sub-components/SectionFilter";
import SectionFooter from "./sub-components/SectionFooter";
import SectionHeader from "./sub-components/SectionHeader";
import SectionWarning from "./sub-components/SectionWarning";
import SectionSubmenu from "./sub-components/SectionSubmenu";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

describe("<Section />", () => {
  const defaultProps = {
    withBodyScroll: true,
    isHeaderVisible: true,
    isInfoPanelAvailable: false,
    settingsStudio: false,
    isEmptyPage: false,
    maintenanceExist: false,
    snackbarExist: false,
    showText: true,
    secondaryActiveOperations: [],
    primaryOperationsArray: [],
    clearSecondaryProgressData: () => {},
    clearPrimaryProgressData: () => {},
  };

  it("renders all section components correctly", () => {
    render(
      <Section {...defaultProps}>
        <SectionHeader className="header-class">Header Content</SectionHeader>
        <SectionFilter>Filter Content</SectionFilter>
        <SectionBody withScroll autoFocus={false} settingsStudio={false}>
          Body Content
        </SectionBody>
        <SectionFooter>Footer Content</SectionFooter>
        <SectionWarning>Warning Content</SectionWarning>
        <SectionSubmenu>Submenu Content</SectionSubmenu>
      </Section>,
    );

    expect(screen.getByText("Header Content")).toBeInTheDocument();
    expect(screen.getByText("Filter Content")).toBeInTheDocument();
    expect(screen.getByText("Body Content")).toBeInTheDocument();
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
    expect(screen.getByText("Warning Content")).toBeInTheDocument();
    expect(screen.getByText("Submenu Content")).toBeInTheDocument();
  });
});
