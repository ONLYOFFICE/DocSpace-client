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

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    ready: true,
  }),
}));

// Mock loader components
jest.mock("../loader", () => ({
  default: () => <div>Loading...</div>,
}));

// Test wrapper with providers if needed
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui);
};

describe("Error Components", () => {
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
});
