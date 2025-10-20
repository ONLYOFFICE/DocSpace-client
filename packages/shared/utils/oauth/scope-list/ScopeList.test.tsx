import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ScopeList } from "./ScopeList";
import { mockScopes } from "./mockData";

describe("ScopeList", () => {
  const mockT = (key: string) => key;

  it("renders without errors", () => {
    render(
      <ScopeList
        selectedScopes={["files:read"]}
        scopes={mockScopes}
        t={mockT}
      />,
    );

    expect(screen.getByTestId("scope-list")).toBeInTheDocument();
  });

  it("renders only selected scopes", () => {
    render(
      <ScopeList
        selectedScopes={["files:read"]}
        scopes={mockScopes}
        t={mockT}
      />,
    );

    expect(
      screen.getByText("OAuthFilesReadDescription", { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("OAuthAccountsWriteDescription", { exact: false }),
    ).not.toBeInTheDocument();
  });

  it("renders empty list when no scopes are selected", () => {
    render(<ScopeList selectedScopes={[]} scopes={mockScopes} t={mockT} />);

    const scopeList = screen.getByTestId("scope-list");
    expect(scopeList.children.length).toBe(0);
  });

  it("prioritizes write scope when both read and write are selected", () => {
    render(
      <ScopeList
        selectedScopes={["files:read", "files:write"]}
        scopes={mockScopes}
        t={mockT}
      />,
    );

    expect(
      screen.getByText("OAuthFilesWriteDescription", { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("OAuthFilesReadDescription", { exact: false }),
    ).not.toBeInTheDocument();
  });
});
