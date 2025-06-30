import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Error401 } from "./Error401";
import { Error403 } from "./Error403";
import Error404 from "./Error404";
import Error520 from "./Error520";
import { ErrorOfflineContainer } from "./ErrorOffline";
import ErrorUnavailable from "./ErrorUnavailable";
import { AccessRestricted } from "./AccessRestricted";
import FirebaseHelper from "../../utils/firebase";
import type { TColorScheme } from "../../themes";
import { DeviceType } from "../../enums";

// Mock react-svg
jest.mock("react-svg", () => ({
  ReactSVG: ({ src }: { src: string }) => (
    <div data-testid="mock-svg">{src}</div>
  ),
}));

// Mock toast components
jest.mock("../toast/sub-components/Toastr", () => ({
  Check: () => <div data-test-id="check-toast">Check Toast</div>,
  Danger: () => <div data-test-id="danger-toast">Danger Toast</div>,
  Info: () => <div data-test-id="info-toast">Info Toast</div>,
}));

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    ready: true,
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock loader components
jest.mock("../loader", () => ({
  default: () => <div>Loading...</div>,
}));

// Mock FirebaseHelper
jest.mock("../../utils/firebase", () => {
  return jest.fn().mockImplementation(() => ({
    remoteConfig: null,
    firebaseConfig: null,
    firebaseStorage: null,
    firebaseDB: null,
    isEnabledDB: true,
    sendCrashReport: jest.fn(),
    config: null,
    isEnabled: true,
  }));
});

// Mock getCrashReport and getCurrentDate
jest.mock("../../utils/crashReport", () => ({
  getCrashReport: jest
    .fn()
    .mockReturnValue({ description: "Test crash report" }),
  getCurrentDate: jest.fn().mockReturnValue("2023-01-01"),
}));

// Mock zendeskAPI
jest.mock("../zendesk/Zendesk.utils", () => ({
  zendeskAPI: {
    addChanges: jest.fn(),
  },
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// Test wrapper with providers if needed
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui);
};

describe("Error Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReset();
    mockSessionStorage.setItem.mockReset();
    mockSessionStorage.removeItem.mockReset();
  });

  describe("Error401", () => {
    it("renders without crashing", () => {
      renderWithProviders(<Error401 />);
      expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("displays correct error message", () => {
      renderWithProviders(<Error401 />);
      expect(screen.getByText(/401/i)).toBeInTheDocument();
    });
  });

  describe("Error403", () => {
    it("renders without crashing", () => {
      renderWithProviders(<Error403 />);
      expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("displays correct error message", () => {
      renderWithProviders(<Error403 />);
      expect(screen.getByText(/403/i)).toBeInTheDocument();
    });
  });

  describe("Error404", () => {
    it("renders without crashing", () => {
      renderWithProviders(<Error404 />);
      expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("displays correct error message", () => {
      renderWithProviders(<Error404 />);
      expect(screen.getByText(/404/i)).toBeInTheDocument();
    });
  });

  describe("ErrorOffline", () => {
    it("renders without crashing", () => {
      renderWithProviders(<ErrorOfflineContainer />);
      expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("displays offline message", () => {
      renderWithProviders(<ErrorOfflineContainer />);
      expect(screen.getByRole("heading")).toHaveTextContent(/offline/i);
    });
  });

  describe("ErrorUnavailable", () => {
    it("renders without crashing", () => {
      renderWithProviders(<ErrorUnavailable />);
      expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("displays unavailable message", () => {
      renderWithProviders(<ErrorUnavailable />);
      expect(screen.getByText(/ErrorDeactivatedText/i)).toBeInTheDocument();
    });
  });

  describe("AccessRestricted", () => {
    it("renders without crashing", () => {
      renderWithProviders(<AccessRestricted />);
      expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("displays access restricted message", () => {
      renderWithProviders(<AccessRestricted />);
      expect(screen.getByText(/AccessDenied/i)).toBeInTheDocument();
    });
  });

  describe("Error520", () => {
    const mockUser = {
      id: "test-user",
      access: 1,
      firstName: "Test",
      lastName: "User",
      userName: "testuser",
      email: "test@example.com",
      status: 1,
      activationStatus: 1,
      department: "",
      workFrom: "",
      avatarMax: "",
      avatarMedium: "",
      avatarOriginal: "",
      avatar: "",
      isAdmin: false,
      isRoomAdmin: false,
      isLDAP: false,
      listAdminModules: [],
      isOwner: false,
      isVisitor: false,
      isCollaborator: false,
      mobilePhoneActivationStatus: 0,
      isSSO: false,
      displayName: "Test User",
      avatarSmall: "",
      profileUrl: "",
      hasAvatar: false,
      cultureName: "en",
      isAnonim: false,
    };

    const mockColorScheme: TColorScheme = {
      id: 1,
      name: "Light",
      main: {
        accent: "#333333",
        buttons: "#333333",
      },
      text: {
        accent: "#333333",
        buttons: "#FFFFFF",
      },
    };

    const mockFirebaseHelper = new FirebaseHelper({
      apiKey: "test-key",
      authDomain: "test-domain",
      projectId: "test-project",
      storageBucket: "test-bucket",
      messagingSenderId: "test-id",
      appId: "test-app-id",
      measurementId: "test-measurement-id",
      databaseURL: "test-url",
    });

    const mockProps = {
      user: mockUser,
      version: "1.0.0",
      errorLog: new Error("Test error message"),
      firebaseHelper: mockFirebaseHelper,
      currentDeviceType: DeviceType.desktop,
      currentColorScheme: mockColorScheme,
    };

    it("renders without crashing", () => {
      renderWithProviders(<Error520 {...mockProps} />);
      expect(screen.getByTestId("ErrorContainer")).toBeInTheDocument();
    });

    it("displays error message when firebase is disabled", () => {
      const disabledFirebaseHelper = new FirebaseHelper({
        apiKey: "test-key",
        authDomain: "test-domain",
        projectId: "test-project",
        storageBucket: "test-bucket",
        messagingSenderId: "test-id",
        appId: "test-app-id",
        measurementId: "test-measurement-id",
        databaseURL: "test-url",
      });
      Object.defineProperty(disabledFirebaseHelper, "isEnabledDB", {
        get: () => false,
      });

      const propsWithDisabledFirebase = {
        ...mockProps,
        firebaseHelper: disabledFirebaseHelper,
      };

      renderWithProviders(<Error520 {...propsWithDisabledFirebase} />);
      expect(screen.getByText("SomethingWentWrong")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("displays custom error message from session storage", () => {
      const customError = new Error("Custom session storage error");
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(customError));

      renderWithProviders(<Error520 {...mockProps} />);
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("auto sends crash report when firebase is enabled", () => {
      const sendCrashReportSpy = jest.spyOn(
        mockFirebaseHelper,
        "sendCrashReport",
      );

      renderWithProviders(<Error520 {...mockProps} />);
      expect(sendCrashReportSpy).toHaveBeenCalled();

      sendCrashReportSpy.mockRestore();
    });
  });
});
