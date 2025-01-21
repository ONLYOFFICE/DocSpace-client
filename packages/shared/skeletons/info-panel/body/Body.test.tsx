import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import InfoPanelBodyLoader from "./index";

describe("InfoPanelBodyLoader", () => {
  it("renders details view by default", () => {
    render(<InfoPanelBodyLoader view="details" />);
    // Details view has specific skeleton structure that we can test for
    expect(screen.getByTestId("details-loader")).toBeInTheDocument();
  });

  it("renders users view", () => {
    render(<InfoPanelBodyLoader view="users" />);
    expect(screen.getByTestId("users-loader")).toBeInTheDocument();
  });

  it("renders members view", () => {
    render(<InfoPanelBodyLoader view="members" />);
    expect(screen.getByTestId("members-loader")).toBeInTheDocument();
  });

  it("renders history view", () => {
    render(<InfoPanelBodyLoader view="history" />);
    expect(screen.getByTestId("history-loader")).toBeInTheDocument();
  });

  it("renders gallery view", () => {
    render(<InfoPanelBodyLoader view="gallery" />);
    expect(screen.getByTestId("gallery-loader")).toBeInTheDocument();
  });

  it("renders groups view", () => {
    render(<InfoPanelBodyLoader view="groups" />);
    expect(screen.getByTestId("groups-loader")).toBeInTheDocument();
  });

  it("renders noItem view", () => {
    render(<InfoPanelBodyLoader view="noItem" />);
    expect(screen.getByTestId("no-item-loader")).toBeInTheDocument();
  });

  it("renders severalItems view", () => {
    render(<InfoPanelBodyLoader view="severalItems" />);
    expect(screen.getByTestId("several-items-loader")).toBeInTheDocument();
  });
});
