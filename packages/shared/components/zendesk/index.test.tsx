import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { Zendesk } from "./index";
import { zendeskAPI } from "./Zendesk.utils";

vi.mock("./Zendesk.utils", () => ({
  zendeskAPI: {
    getChanges: vi.fn(),
    addChanges: vi.fn(),
    clearChanges: vi.fn(),
  },
}));

describe("Zendesk", () => {
  const mockZendeskKey = "test-key-123";
  let mockScript: HTMLScriptElement;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset window.zE and zESettings
    // @ts-expect-error Fix types
    delete window.zE;
    delete window.zESettings;

    // Mock createElement and appendChild
    mockScript = document.createElement("script");
    vi.spyOn(document, "createElement").mockReturnValue(mockScript);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => mockScript);

    // Mock getElementById to simulate script not already loaded
    vi.spyOn(document, "getElementById").mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not insert script when live chat is disabled", () => {
    render(<Zendesk zendeskKey={mockZendeskKey} isShowLiveChat={false} />);

    expect(document.createElement).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  it("should insert script with correct attributes when live chat is enabled", () => {
    render(<Zendesk zendeskKey={mockZendeskKey} isShowLiveChat />);

    expect(document.createElement).toHaveBeenCalledWith("script");
    expect(mockScript.id).toBe("ze-snippet");
    expect(mockScript.src).toBe(
      `https://static.zdassets.com/ekr/snippet.js?key=${mockZendeskKey}`,
    );
    expect(mockScript.async).toBe(true);
    expect(document.body.appendChild).toHaveBeenCalledWith(mockScript);
  });

  it("should set script to defer when defer prop is true", () => {
    render(<Zendesk zendeskKey={mockZendeskKey} isShowLiveChat defer />);

    expect(mockScript.defer).toBe(true);
    expect(mockScript.async).toBe(undefined);
  });

  it("should not insert script if it already exists", () => {
    vi.spyOn(document, "getElementById").mockReturnValue(
      document.createElement("script"),
    );

    render(<Zendesk zendeskKey={mockZendeskKey} isShowLiveChat />);

    expect(document.createElement).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  it("should set window.zESettings with provided config", () => {
    const mockConfig = { webWidget: { color: { theme: "#000000" } } };

    render(
      <Zendesk
        zendeskKey={mockZendeskKey}
        isShowLiveChat
        config={mockConfig}
      />,
    );

    expect(window.zESettings).toEqual(mockConfig);
  });

  it("should call onLoaded callback when script loads", () => {
    const onLoaded = vi.fn();
    vi.mocked(zendeskAPI.getChanges).mockReturnValue([]);

    render(
      <Zendesk
        zendeskKey={mockZendeskKey}
        isShowLiveChat
        onLoaded={onLoaded}
      />,
    );

    // Simulate script load
    act(() => {
      mockScript.dispatchEvent(new Event("load"));
    });

    expect(onLoaded).toHaveBeenCalled();
  });

  it("should process waiting changes when script loads", () => {
    const mockChanges = [
      ["webWidget", "show"],
      ["webWidget", "updateSettings", { color: { theme: "#000000" } }],
    ];
    vi.mocked(zendeskAPI.getChanges).mockReturnValue(mockChanges);

    render(<Zendesk zendeskKey={mockZendeskKey} isShowLiveChat />);

    // Simulate script load
    act(() => {
      mockScript.dispatchEvent(new Event("load"));
    });

    expect(zendeskAPI.getChanges).toHaveBeenCalled();
    mockChanges.forEach((change) => {
      expect(zendeskAPI.addChanges).toHaveBeenCalledWith(...change);
    });
    expect(zendeskAPI.clearChanges).toHaveBeenCalled();
  });

  it("should not process changes if there are no waiting changes", () => {
    vi.mocked(zendeskAPI.getChanges).mockReturnValue([]);

    render(<Zendesk zendeskKey={mockZendeskKey} isShowLiveChat />);

    // Simulate script load
    act(() => {
      mockScript.dispatchEvent(new Event("load"));
    });

    expect(zendeskAPI.getChanges).toHaveBeenCalled();
    expect(zendeskAPI.addChanges).not.toHaveBeenCalled();
    expect(zendeskAPI.clearChanges).not.toHaveBeenCalled();
  });
});
