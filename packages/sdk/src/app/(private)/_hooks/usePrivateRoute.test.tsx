import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  search: "",
  replace: vi.fn(),
  sdkMethods: null as Record<string, (data?: unknown) => unknown> | null,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mocks.search),
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => "/private",
}));
vi.mock("@docspace/shared/utils/common", () => ({
  frameCallEvent: vi.fn(),
  getFrameId: () => "frame",
}));
vi.mock("@/providers/sdkMethods", () => ({
  useSdkMethods: (methods: Record<string, (data?: unknown) => unknown>) => {
    mocks.sdkMethods = methods;
  },
}));

import { PrivateRoomsOptInContext } from "../_components/opt-in/PrivateRoomsOptInContext";
import { usePrivateRoute } from "./usePrivateRoute";
import { usePrivateFrameBridge } from "./usePrivateFrameBridge";

let root: Root | null = null;
let route: (path: string) => string;

const RouteCapture = () => {
  route = usePrivateRoute();
  return null;
};
const BridgeCapture = () => {
  usePrivateFrameBridge();
  return null;
};

const renderInPrivateLayout = (child: React.ReactNode) => {
  root = createRoot(document.createElement("div"));
  act(() => {
    root!.render(
      <PrivateRoomsOptInContext.Provider value>
        {child}
      </PrivateRoomsOptInContext.Provider>,
    );
  });
};

describe("Private pages keep the host opt-in", () => {
  beforeEach(() => {
    // The rooms filter rewrote the address and dropped the opt-in.
    mocks.search = "sortBy=title&sortOrder=ascending";
    mocks.replace.mockReset();
    mocks.sdkMethods = null;
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Room opened after sorting", () => {
    renderInPrivateLayout(<RouteCapture />);

    expect(route("/private/42")).toBe("/private/42?privateRooms=true");
  });

  it("Room opened after sorting, through the host's navigateSection", () => {
    renderInPrivateLayout(<BridgeCapture />);

    act(() => {
      mocks.sdkMethods!.navigateSection({ section: "archive" });
    });

    expect(mocks.replace).toHaveBeenCalledWith(
      "/private/archive?privateRooms=true",
    );
  });

  it("reads the address outside the private layout", () => {
    mocks.search = "privateRooms=true";
    root = createRoot(document.createElement("div"));
    act(() => root!.render(<RouteCapture />));

    expect(route("/private/42")).toBe("/private/42?privateRooms=true");
  });
});
