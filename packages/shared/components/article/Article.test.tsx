import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";

import "@testing-library/jest-dom";

import { DeviceType } from "../../enums";
import { renderWithTheme } from "../../utils/render-with-theme";
import Article from "./index";

// Mock child components
jest.mock("./sub-components/Header", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="article-header">{children}</div>
  ),
}));

jest.mock("./sub-components/Profile", () => ({
  __esModule: true,
  default: () => <div data-testid="article-profile">Profile</div>,
}));

jest.mock("./sub-components/LiveChat", () => ({
  __esModule: true,
  default: () => <div data-testid="article-live-chat">LiveChat</div>,
}));

jest.mock("./sub-components/Apps", () => ({
  __esModule: true,
  default: () => <div data-testid="article-apps">Apps</div>,
}));

jest.mock("./sub-components/DevToolsBar", () => ({
  __esModule: true,
  default: () => <div data-testid="article-dev-tools">DevTools</div>,
}));

jest.mock("./sub-components/HideMenuButton", () => ({
  __esModule: true,
  default: () => <div data-testid="article-hide-menu">HideMenu</div>,
}));

// Mock react-device-detect
jest.mock("react-device-detect", () => ({
  isMobile: false,
  isMobileOnly: false,
  isIOS: false,
}));

const defaultProps = {
  showText: true,
  setShowText: jest.fn(),
  articleOpen: false,
  toggleShowText: jest.fn(),
  toggleArticleOpen: jest.fn(),
  setIsMobileArticle: jest.fn(),
  hideProfileBlock: false,
  hideAppsBlock: false,
  currentColorScheme: {
    main: {
      accent: "#000",
    },
  },
  setArticleOpen: jest.fn(),
  withSendAgain: false,
  mainBarVisible: false,
  isLiveChatAvailable: true,
  isShowLiveChat: true,
  currentDeviceType: DeviceType.desktop,
  showArticleLoader: false,
  isAdmin: false,
  withCustomArticleHeader: false,
  isBurgerLoading: false,
  languageBaseName: "en",
  zendeskEmail: "test@test.com",
  chatDisplayName: "Test User",
  isMobileArticle: false,
  zendeskKey: "test-key",
  showProgress: false,
  children: [],
  logoText: "",
  showBackButton: false,
  downloaddesktopUrl: "",
  officeforandroidUrl: "",
  officeforiosUrl: "",
  limitedAccessDevToolsForUsers: false,
};

const renderComponent = (props = {}) => {
  return renderWithTheme(<Article {...defaultProps} {...props} />);
};

describe("Article", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders without crashing", () => {
    renderComponent();
    expect(screen.getByTestId("article")).toBeInTheDocument();
  });

  it("renders header content correctly", () => {
    const headerContent = <div>Header Content</div>;
    const children = [
      <Article.Header key="header">{headerContent}</Article.Header>,
    ];

    renderComponent({ children });
    expect(screen.getByTestId("article-header")).toBeInTheDocument();
    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("renders main button when provided and not mobile", () => {
    const buttonContent = <button type="button">Main Button</button>;
    const children = [
      <Article.MainButton key="button">{buttonContent}</Article.MainButton>,
    ];

    renderComponent({ children, withMainButton: true });
    expect(screen.getByText("Main Button")).toBeInTheDocument();
  });

  it("renders body content correctly", () => {
    const bodyContent = <div>Body Content</div>;
    const children = [<Article.Body key="body">{bodyContent}</Article.Body>];

    renderComponent({ children });
    expect(screen.getByText("Body Content")).toBeInTheDocument();
  });

  it("shows profile when not hidden", () => {
    renderComponent({ hideProfileBlock: false });
    expect(screen.getByTestId("article-profile")).toBeInTheDocument();
  });

  it("hides profile when hideProfileBlock is true", () => {
    renderComponent({ hideProfileBlock: true });
    expect(screen.queryByTestId("article-profile")).not.toBeInTheDocument();
  });

  it("shows dev tools when user is admin", () => {
    renderComponent({ isAdmin: true });
    expect(screen.getByTestId("article-dev-tools")).toBeInTheDocument();
  });

  it("hides dev tools when user is visitor", () => {
    renderComponent({ user: { isVisitor: true } });
    expect(screen.queryByTestId("article-dev-tools")).not.toBeInTheDocument();
  });

  it("hides dev tools when user is not admin and limitedAccessDevToolsForUsers is true", () => {
    renderComponent({
      user: { isAdmin: false },
      limitedAccessDevToolsForUsers: true,
    });
    expect(screen.queryByTestId("article-dev-tools")).not.toBeInTheDocument();
  });

  it("shows live chat when available", () => {
    renderComponent({ isLiveChatAvailable: true, isShowLiveChat: true });
    expect(screen.getByTestId("article-live-chat")).toBeInTheDocument();
  });

  it("hides live chat when not available", () => {
    renderComponent({ isLiveChatAvailable: false });
    expect(screen.queryByTestId("article-live-chat")).not.toBeInTheDocument();
  });

  it("handles mobile back action", () => {
    const setArticleOpen = jest.fn();
    renderComponent({
      currentDeviceType: DeviceType.mobile,
      setArticleOpen,
    });

    act(() => {
      window.dispatchEvent(new Event("popstate"));
    });

    expect(setArticleOpen).toHaveBeenCalledWith(false);
  });

  it("updates mobile article state based on device type", () => {
    const setIsMobileArticle = jest.fn();
    const setShowText = jest.fn();

    renderComponent({
      currentDeviceType: DeviceType.mobile,
      setIsMobileArticle,
      setShowText,
    });

    expect(setIsMobileArticle).toHaveBeenCalledWith(true);
    expect(setShowText).toHaveBeenCalledWith(true);
  });

  it("handles tablet device type correctly", () => {
    const setIsMobileArticle = jest.fn();
    const setShowText = jest.fn();

    renderComponent({
      currentDeviceType: DeviceType.tablet,
      setIsMobileArticle,
      setShowText,
    });

    expect(setIsMobileArticle).toHaveBeenCalledWith(true);
  });

  it("shows backdrop on mobile when article is open", () => {
    renderComponent({
      currentDeviceType: DeviceType.mobile,
      articleOpen: true,
    });

    expect(screen.getByTestId("backdrop")).toBeInTheDocument();
  });

  it("calls toggleArticleOpen when mobile backdrop is clicked", () => {
    const toggleArticleOpen = jest.fn();
    renderComponent({
      currentDeviceType: DeviceType.mobile,
      articleOpen: true,
      toggleArticleOpen,
    });

    fireEvent.click(screen.getByTestId("backdrop"));
    expect(toggleArticleOpen).toHaveBeenCalled();
  });
});
