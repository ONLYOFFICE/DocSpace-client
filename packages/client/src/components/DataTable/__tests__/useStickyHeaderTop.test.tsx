import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStickyHeaderTop } from "../useStickyHeaderTop";

// jsdom lays nothing out: each bar reports the height it is given.
const HEIGHTS: Record<string, number> = { pinned: 69, tabs: 33, filter: 90 };

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
    function offsetHeight(this: HTMLElement) {
      return HEIGHTS[this.dataset.testid ?? ""] ?? 0;
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const Table = ({ shown }: { shown: boolean }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });
  // Like a list that renders nothing until its rows have loaded.
  if (!shown) return null;
  return <div ref={tableRef} data-testid="table" />;
};

const Page = ({ shown, tabs }: { shown: boolean; tabs: boolean }) => (
  <div className="section-scroll">
    <div className="section-sticky-container" data-testid="pinned" />
    <div>
      {tabs ? (
        <div data-testid="tabs" style={{ position: "sticky", top: "69px" }} />
      ) : null}
      <div>
        <Table shown={shown} />
      </div>
    </div>
  </div>
);

const headerTop = () =>
  screen.getByTestId("table").style.getPropertyValue("--data-table-header-top");

describe("useStickyHeaderTop", () => {
  it("stops the header under the pinned header", () => {
    render(<Page shown tabs={false} />);
    expect(headerTop()).toBe("69px");
  });

  it("stops the header under sticky tabs pinned below it", () => {
    render(<Page shown tabs />);
    expect(headerTop()).toBe("102px");
  });

  it("measures a table that comes after the first render", () => {
    const { rerender } = render(<Page shown={false} tabs />);
    rerender(<Page shown tabs />);
    expect(headerTop()).toBe("102px");
  });

  it("stops the header under a sticky filter as tall as it really is", () => {
    // A files list in the Section's stickyTableHeader mode: the filter, room
    // groups included, sticks under the pinned header.
    const FilesTable = () => {
      const tableRef = useRef<HTMLDivElement>(null);
      useStickyHeaderTop(tableRef);
      return <div ref={tableRef} data-testid="table" />;
    };
    const { unmount } = render(
      <div className="section-scroll">
        <div className="section-sticky-container" data-testid="pinned" />
        <div
          className="section-body_sticky-filter"
          data-testid="filter"
          style={{ position: "sticky", top: "69px" }}
        />
        <FilesTable />
      </div>,
    );
    const table = screen.getByTestId("table");

    expect(table.style.getPropertyValue("--section-filter-bottom")).toBe(
      "159px",
    );

    unmount();
    expect(table.style.getPropertyValue("--section-filter-bottom")).toBe("");
  });

  it("leaves the filter's bottom to the page without a sticky filter", () => {
    render(<Page shown tabs={false} />);
    expect(
      screen
        .getByTestId("table")
        .style.getPropertyValue("--section-filter-bottom"),
    ).toBe("");
  });
});
