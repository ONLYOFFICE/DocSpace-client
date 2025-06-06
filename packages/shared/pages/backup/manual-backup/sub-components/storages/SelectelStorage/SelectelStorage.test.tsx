import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ButtonSize } from "../../../../../../components/button";
import { ThirdPartyStorages } from "../../../../../../enums";
import type { TTranslation } from "../../../../../../types";
import { SelectelStorage } from "./index";

jest.mock("../../../../../../components/selectel-settings", () => ({
  SelectelSettings: ({
    t,
    isNeedFilePath,
  }: {
    t: TTranslation;
    isNeedFilePath: boolean;
  }) => (
    <div data-testid="selectel-settings">
      <span>{t("Common:SelectelSettings")}</span>
      <span>{isNeedFilePath ? "FilePath" : "NoFilePath"}</span>
    </div>
  ),
  formNames: jest.fn().mockReturnValue({
    username: "",
    password: "",
    container: "",
  }),
}));

const defaultProps = {
  t: jest.fn((key) => key),
  isValidForm: true,
  buttonSize: ButtonSize.normal,
  isMaxProgress: true,
  isLoadingData: false,
  isNeedFilePath: true,
  isLoading: false,
  selectedStorage: {
    id: ThirdPartyStorages.SelectelId,
    isSet: true,
    title: "Selectel",
    properties: [
      { name: "username", title: "Username", value: "test-username" },
      { name: "password", title: "Password", value: "test-password" },
      { name: "container", title: "Container", value: "test-container" },
    ],
  },
  formSettings: {
    username: "test-username",
    password: "test-password",
    container: "test-container",
  },
  errorsFieldsBeforeSafe: {},
  addValueInFormSettings: jest.fn(),
  setRequiredFormSettings: jest.fn(),
  setIsThirdStorageChanged: jest.fn(),
  setCompletedFormFields: jest.fn(),
  onMakeCopyIntoStorage: jest.fn(),
};

describe("SelectelStorage", () => {
  it("renders without errors", () => {
    render(<SelectelStorage {...defaultProps} />);
    expect(screen.getByTestId("selectel-storage")).toBeInTheDocument();
    expect(screen.getByTestId("selectel-settings")).toBeInTheDocument();
    expect(screen.getByText("Common:CreateCopy")).toBeInTheDocument();
  });

  it("calls onMakeCopyIntoStorage when create copy button is clicked", () => {
    render(<SelectelStorage {...defaultProps} />);
    fireEvent.click(screen.getByText("Common:CreateCopy"));
    expect(defaultProps.onMakeCopyIntoStorage).toHaveBeenCalled();
  });

  it("disables create copy button when isValidForm is false", () => {
    render(<SelectelStorage {...defaultProps} isValidForm={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when isMaxProgress is false", () => {
    render(<SelectelStorage {...defaultProps} isMaxProgress={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when selectedStorage is not set", () => {
    render(
      <SelectelStorage
        {...defaultProps}
        selectedStorage={{
          id: ThirdPartyStorages.SelectelId,
          isSet: false,
          title: "Selectel",
          properties: [
            { name: "username", title: "Username", value: "" },
            { name: "password", title: "Password", value: "" },
            { name: "container", title: "Container", value: "" },
          ],
        }}
      />,
    );
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("calls setCompletedFormFields on mount", () => {
    render(<SelectelStorage {...defaultProps} />);
    expect(defaultProps.setCompletedFormFields).toHaveBeenCalled();
  });

  it("passes correct props to SelectelSettings", () => {
    render(<SelectelStorage {...defaultProps} />);
    const settingsComponent = screen.getByTestId("selectel-settings");
    expect(settingsComponent).toBeInTheDocument();
    expect(screen.getByText("FilePath")).toBeInTheDocument();
  });
});
