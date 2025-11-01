import React from "react";
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";
import { DeviceType } from "../../enums";
import type { TUser } from "../../api/people/types";
import type { TFirebaseSettings } from "../../api/settings/types";

// Mock Error520 component
vi.mock("../errors/Error520", () => ({
  __esModule: true,
  default: ({ errorLog }: { errorLog: Error }) => (
    <div data-testid="error-520">Error: {errorLog.message}</div>
  ),
}));

// Mock console.error to avoid test output noise
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Mock firebase class
class MockFirebaseHelper {
  remoteConfig = null;

  firebaseConfig = null;

  firebaseStorage = null;

  firebaseDB = null;

  private isEnabledValue: boolean = true;

  private isEnabledDBValue: boolean = true;

  static defaultConfig: TFirebaseSettings = {
    apiKey: "test-key",
    authDomain: "test-domain",
    databaseURL: "test-url",
    projectId: "test-project",
    storageBucket: "test-bucket",
    messagingSenderId: "test-id",
    appId: "test-app-id",
    measurementId: "test-measurement-id",
  };

  private configSettings: TFirebaseSettings;

  constructor() {
    this.configSettings = { ...MockFirebaseHelper.defaultConfig };
  }

  get config(): TFirebaseSettings {
    return this.configSettings;
  }

  get isEnabled() {
    return this.isEnabledValue;
  }

  get isEnabledDB() {
    return this.isEnabledDBValue;
  }

  checkMaintenance = vi.fn();

  checkBar = vi.fn();

  checkCampaigns = vi.fn();

  getCampaignsImages = vi.fn();

  getCampaignsTranslations = vi.fn();

  getCampaignConfig = vi.fn();

  sendCrashReport = vi.fn();

  sendToastReport = vi.fn();
}

describe("ErrorBoundary", () => {
  const mockUser: TUser = {
    id: "test-user",
    displayName: "Test User",
    firstName: "Test",
    lastName: "User",
    userName: "testuser",
    email: "test@example.com",
    avatarMax: "",
    avatarMedium: "",
    avatarOriginal: "",
    avatar: "",
    isOwner: false,
    isAdmin: false,
    isVisitor: false,
    isCollaborator: false,
    activationStatus: 1,
    status: 1,
    cultureName: "en",
    isSSO: false,
    isLDAP: false,
    listAdminModules: [],
    avatarSmall: "",
    profileUrl: "",
    mobilePhone: "",
    department: "",
    workFrom: "",
    title: "",
    access: 0,
    isRoomAdmin: false,
    mobilePhoneActivationStatus: 0,
    hasAvatar: false,
    isAnonim: false,
  };

  const mockFirebaseHelper = new MockFirebaseHelper();

  const defaultProps = {
    user: mockUser,
    version: "1.0.0",
    firebaseHelper: mockFirebaseHelper,
    currentDeviceType: DeviceType.desktop,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when there's no error", () => {
    render(
      <ErrorBoundary {...defaultProps}>
        <div data-testid="test-child">Test Content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.queryByTestId("error-520")).not.toBeInTheDocument();
  });

  it("renders Error520 component when there's an error", () => {
    const ThrowError = () => {
      const error = new Error("Test error");
      throw error;
    };

    render(
      <ErrorBoundary {...defaultProps}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("error-520")).toBeInTheDocument();
    expect(screen.getByText("Error: Test error")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary {...defaultProps} onError={onError}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalled();
  });

  it("handles errors without error message", () => {
    const ThrowError = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary {...defaultProps}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("error-520")).toBeInTheDocument();
  });

  it("handles undefined errors with default message", () => {
    const ThrowUndefinedError = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary {...defaultProps}>
        <ThrowUndefinedError />
      </ErrorBoundary>,
    );

    const errorElement = screen.getByTestId("error-520");
    expect(errorElement.textContent).toContain("Error:");
  });
});
