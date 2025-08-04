import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { QuotaForm } from "./index";

describe("QuotaForm", () => {
  const defaultProps = {
    isLoading: false,
    isError: false,
    onSetQuotaBytesSize: jest.fn(),
    initialSize: 1048576,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<QuotaForm {...defaultProps} />);
    expect(screen.getByTestId("quota-form")).toBeInTheDocument();
  });

  it("renders with label and description", () => {
    const label = "Storage Quota";
    const description = "Set the maximum storage limit";
    render(
      <QuotaForm {...defaultProps} label={label} description={description} />,
    );
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it("renders with checkbox for unlimited option", () => {
    const checkboxLabel = "Unlimited storage";
    render(<QuotaForm {...defaultProps} checkboxLabel={checkboxLabel} />);
    expect(screen.getByText(checkboxLabel)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders with save/cancel buttons when isButtonsEnable is true", () => {
    render(<QuotaForm {...defaultProps} isButtonsEnable />);
    expect(screen.getByText("Common:SaveButton")).toBeInTheDocument();
    expect(screen.getByText("Common:CancelButton")).toBeInTheDocument();
  });

  it("disables inputs when isDisabled is true", () => {
    render(<QuotaForm {...defaultProps} isDisabled />);
    expect(screen.getByTestId("quota-text-input")).toBeDisabled();
  });

  it("calls onSetQuotaBytesSize when text input changes", async () => {
    render(<QuotaForm {...defaultProps} />);
    const input = screen.getByTestId("quota-text-input");
    await userEvent.clear(input);
    await userEvent.type(input, "2");
    expect(defaultProps.onSetQuotaBytesSize).toHaveBeenCalled();
  });

  it("calls onSetQuotaBytesSize with -1 when unlimited checkbox is checked", async () => {
    const onSetQuotaBytesSize = jest.fn();
    render(
      <QuotaForm
        {...defaultProps}
        checkboxLabel="Unlimited storage"
        onSetQuotaBytesSize={onSetQuotaBytesSize}
      />,
    );
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    expect(onSetQuotaBytesSize).toHaveBeenCalledWith("-1");
  });

  it("disables input fields when unlimited checkbox is checked", async () => {
    render(<QuotaForm {...defaultProps} checkboxLabel="Unlimited storage" />);
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    expect(screen.getByTestId("quota-text-input")).toBeDisabled();
  });

  it("calls onSave when save button is clicked", async () => {
    const onSave = jest.fn();
    render(<QuotaForm {...defaultProps} isButtonsEnable onSave={onSave} />);
    const input = screen.getByTestId("quota-text-input");
    await userEvent.type(input, "2");
    await userEvent.click(screen.getByText("Common:SaveButton"));
    expect(onSave).toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = jest.fn();
    render(<QuotaForm {...defaultProps} isButtonsEnable onCancel={onCancel} />);
    const input = screen.getByTestId("quota-text-input");
    await userEvent.type(input, "2");
    await userEvent.click(screen.getByText("Common:CancelButton"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("resets to initial values when cancel button is clicked", async () => {
    const onSetQuotaBytesSize = jest.fn();
    render(
      <QuotaForm
        {...defaultProps}
        isButtonsEnable
        onSetQuotaBytesSize={onSetQuotaBytesSize}
      />,
    );
    const input = screen.getByTestId("quota-text-input");
    await userEvent.clear(input);
    await userEvent.type(input, "2");
    await userEvent.click(screen.getByText("Common:CancelButton"));
    expect(input).toHaveValue("1");
  });

  it("submits form when Enter key is pressed in input field", async () => {
    const onSave = jest.fn();
    render(<QuotaForm {...defaultProps} isButtonsEnable onSave={onSave} />);
    const input = screen.getByTestId("quota-text-input");
    await userEvent.clear(input);
    await userEvent.type(input, "2");
    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
    });
    expect(onSave).toHaveBeenCalled();
  });

  it("does not submit form on Enter key if isButtonsEnable is false", async () => {
    const onSave = jest.fn();
    render(<QuotaForm {...defaultProps} onSave={onSave} />);
    const input = screen.getByTestId("quota-text-input");
    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("disables save button when values are unchanged", async () => {
    render(<QuotaForm {...defaultProps} isButtonsEnable />);
    const saveButton = screen.getByTestId("save-button");
    expect(saveButton).toBeDisabled();
    const input = screen.getByTestId("quota-text-input");
    await userEvent.clear(input);
    await userEvent.type(input, "2");
    expect(saveButton).not.toBeDisabled();
  });

  it("initializes with unlimited option when initialSize is -1", () => {
    render(
      <QuotaForm
        {...defaultProps}
        initialSize={-1}
        checkboxLabel="Unlimited storage"
      />,
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByTestId("quota-text-input")).toBeDisabled();
  });

  it("applies custom maxInputWidth", () => {
    render(<QuotaForm {...defaultProps} maxInputWidth="500px" />);
    const input = screen.getByTestId("quota-text-input");
    expect(input).toHaveStyle("max-width: 500px");
  });
});
