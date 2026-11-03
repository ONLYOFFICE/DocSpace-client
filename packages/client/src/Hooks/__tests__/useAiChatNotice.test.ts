import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const handlers = new Map<string, () => void>();

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", () => ({
  default: {
    on: vi.fn((event: string, handler: () => void) =>
      handlers.set(event, handler),
    ),
    off: vi.fn((event: string) => handlers.delete(event)),
  },
  SocketEvents: { TopUpWallet: "top-up-wallet" },
}));

vi.mock("SRC_DIR/pages/PortalSettings/categories/payments/utils", () => ({
  PAYMENT_ROUTES: { wallet: "/portal-settings/payments/wallet" },
}));

import { getAiChatBlock, useAiChatNotice } from "../useAiChatNotice";

const t = ((key: string) => key) as never;
const LIMIT_MESSAGE =
  "Service limit exceeded: Service limit exceeded for customer No.1. Service group 'ai-services', amount limit 1.0, available 0.02 until 2099-10-23 23:59:59Z";

const walletError = {
  error: { code: "insufficient_funds", message: "402" },
  providerType: "onlyoffice",
};

const setup = (overrides: Partial<Parameters<typeof useAiChatNotice>[0]> = {}) => {
  const navigate = vi.fn();
  const view = renderHook((props: Parameters<typeof useAiChatNotice>[0]) =>
    useAiChatNotice(props), {
    initialProps: {
      t,
      language: "en",
      standalone: false,
      isAdmin: false,
      isPayer: false,
      isChatOpen: true,
      navigate,
      ...overrides,
    },
  });
  return { ...view, navigate };
};

describe("getAiChatBlock", () => {
  it("tells the portal wallet from a provider's own credits", () => {
    expect(getAiChatBlock(walletError, false)).toEqual({ kind: "wallet" });
    expect(
      getAiChatBlock({ ...walletError, providerType: "openai" }, false),
    ).toEqual({ kind: "provider" });
  });

  it("reads a spending limit and its reset date", () => {
    expect(
      getAiChatBlock({ error: { code: "auth", message: LIMIT_MESSAGE } }, false),
    ).toEqual({ kind: "limit", until: "2099-10-23T23:59:59Z" });
  });

  it("has no wallet or limit on standalone, and ignores non-money errors", () => {
    expect(getAiChatBlock(walletError, true)).toEqual({ kind: "provider" });
    expect(
      getAiChatBlock({ error: { code: "auth", message: LIMIT_MESSAGE } }, true),
    ).toBeNull();
    expect(getAiChatBlock({ error: { code: "network" } }, false)).toBeNull();
  });
});

describe("useAiChatNotice", () => {
  beforeEach(() => {
    handlers.clear();
  });

  it("shows nothing until a round fails for lack of money", () => {
    const { result } = setup();
    expect(result.current.composerNotice).toBeNull();
    act(() => result.current.onStreamError({ error: { code: "network" } }));
    expect(result.current.composerNotice).toBeNull();
  });

  it("blocks sending on an empty wallet and lifts it on the top-up event", () => {
    const { result } = setup();
    act(() => result.current.onStreamError(walletError));
    expect(result.current.composerNotice).toEqual({
      title: "Common:AIPaused",
      description: "Common:AIPausedWalletEmptyContactPayer",
      action: undefined,
      blocksSending: true,
    });
    act(() => handlers.get("top-up-wallet")?.());
    expect(result.current.composerNotice).toBeNull();
  });

  it("offers the Payer the top-up", () => {
    const { result, navigate } = setup({ isPayer: true });
    act(() => result.current.onStreamError(walletError));
    const notice = result.current.composerNotice;
    expect(notice?.description).toBe("Common:AIPausedWalletEmpty");
    expect(notice?.action?.text).toBe("Common:TopUpWallet");
    notice?.action?.onClick();
    expect(navigate).toHaveBeenCalledWith("/portal-settings/payments/wallet");
  });

  it("re-checks the wallet when the chat is opened again", async () => {
    const fetchWalletBalance = vi.fn().mockResolvedValue(5);
    const { result, rerender } = setup({ isAdmin: true, fetchWalletBalance });
    act(() => result.current.onStreamError(walletError));
    const props = {
      t,
      language: "en",
      standalone: false,
      isAdmin: true,
      isPayer: false,
      navigate: vi.fn(),
      fetchWalletBalance,
    };
    rerender({ ...props, isChatOpen: false });
    expect(result.current.composerNotice).not.toBeNull();
    await act(async () => {
      rerender({ ...props, isChatOpen: true });
    });
    expect(fetchWalletBalance).toHaveBeenCalledWith(true);
    expect(result.current.composerNotice).toBeNull();
  });

  it("explains a spending limit and lets the admin change it", () => {
    const { result, navigate } = setup({ isAdmin: true });
    act(() =>
      result.current.onStreamError({
        error: { code: "auth", message: LIMIT_MESSAGE },
      }),
    );
    const notice = result.current.composerNotice;
    expect(notice?.title).toBe("Common:AILimitReached");
    expect(notice?.blocksSending).toBe(true);
    notice?.action?.onClick();
    expect(navigate).toHaveBeenCalledWith("/portal-settings/ai-settings/limits");
  });

  it("keeps a provider's credits notice open for sending until an answer completes", () => {
    const { result } = setup();
    act(() =>
      result.current.onStreamError({ ...walletError, providerType: "openai" }),
    );
    expect(result.current.composerNotice).toEqual({
      title: "Common:AIProviderOutOfCredits",
      description: "Common:AIProviderOutOfCreditsTopUp",
    });
    act(() => result.current.onStreamEnd());
    expect(result.current.composerNotice).toBeNull();
  });
});
