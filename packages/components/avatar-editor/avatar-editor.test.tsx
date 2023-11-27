import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import AvatarEditor from ".";

const baseProps = {
  visible: true,
  headerLabel: "test",
  selectNewPhotoLabel: "test",
  orDropFileHere: "test",
  saveButtonLabel: "test",
  maxSizeFileError: "test",
  image: "",
  maxSize: 1,
  accept: ["image/png", "image/jpeg"],
  unknownTypeError: "test",
  unknownError: "test",
  displayType: "auto",
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<AvatarEditor />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<AvatarEditor {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; visible: boolean; headerLabel:... Remove this comment to see the full error message
    const wrapper = mount(<AvatarEditor {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; visible: boolean; heade... Remove this comment to see the full error message
    const wrapper = mount(<AvatarEditor {...baseProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ style: { color: string; }; visible: boolea... Remove this comment to see the full error message
      <AvatarEditor {...baseProps} style={{ color: "red" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("componentDidUpdate() props lifecycle test", () => {
    const wrapper = shallow(<AvatarEditor {...baseProps} />);
    const instance = wrapper.instance();

    instance.componentDidUpdate({ visible: false }, wrapper.state());

    instance.componentDidUpdate({ visible: true }, wrapper.state());

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props()).toBe(wrapper.props());
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onClose()", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onClose = jest.fn();
    // @ts-expect-error TS(2322): Type '{ onClose: any; visible: boolean; headerLabe... Remove this comment to see the full error message
    const wrapper = mount(<AvatarEditor {...baseProps} onClose={onClose} />);
    const instance = wrapper.instance();

    instance.onClose();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("visible")).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onSaveButtonClick()", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onSave = jest.fn();
    // @ts-expect-error TS(2322): Type '{ onSave: any; visible: boolean; headerLabel... Remove this comment to see the full error message
    const wrapper = mount(<AvatarEditor {...baseProps} onSave={onSave} />);
    const instance = wrapper.instance();

    wrapper.setState({ existImage: false });

    instance.onSaveButtonClick();

    wrapper.setState({ existImage: true });

    instance.onSaveButtonClick();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("visible")).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onImageChange()", () => {
    const fileString = "";
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onImageChange = jest.fn();
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onImageChange: any; visible: boolean; head... Remove this comment to see the full error message
      <AvatarEditor {...baseProps} onImageChange={onImageChange} />
    );
    const instance = wrapper.instance();

    instance.onImageChange(fileString);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onImageChange).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onImageChange() no onImageChange", () => {
    const fileString = "";
    const wrapper = mount(<AvatarEditor {...baseProps} />);
    const instance = wrapper.instance();

    instance.onImageChange(fileString);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("croppedImage")).toBe(fileString);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onDeleteImage()", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onDeleteImage = jest.fn();
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onDeleteImage: any; visible: boolean; head... Remove this comment to see the full error message
      <AvatarEditor {...baseProps} onDeleteImage={onDeleteImage} />
    );
    const instance = wrapper.instance();

    instance.onDeleteImage();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onDeleteImage).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onDeleteImage() no onDeleteImage", () => {
    const wrapper = mount(<AvatarEditor {...baseProps} />);
    const instance = wrapper.instance();

    instance.onDeleteImage();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("existImage")).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onPositionChange()", () => {
    const data = { test: "test" };
    const wrapper = mount(<AvatarEditor {...baseProps} />);
    const instance = wrapper.instance();

    instance.onPositionChange(data);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("test")).toBe("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onLoadFileError()", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onLoadFileError = jest.fn();
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onLoadFileError: any; visible: boolean; he... Remove this comment to see the full error message
      <AvatarEditor {...baseProps} onLoadFileError={onLoadFileError} />
    );
    const instance = wrapper.instance();

    instance.onLoadFileError();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onLoadFileError).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onLoadFileError() no onLoadFileError", () => {
    const wrapper = mount(<AvatarEditor {...baseProps} />);
    const instance = wrapper.instance();

    instance.onLoadFileError();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("existImage")).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onLoadFile()", () => {
    const file = "test";
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onLoadFile = jest.fn();
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onLoadFile: any; visible: boolean; headerL... Remove this comment to see the full error message
      <AvatarEditor {...baseProps} onLoadFile={onLoadFile} />
    );
    const instance = wrapper.instance();

    instance.onLoadFile(file);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onLoadFile).toHaveBeenCalled();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("existImage")).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onLoadFile() no onLoadFile", () => {
    const wrapper = mount(<AvatarEditor {...baseProps} />);
    const instance = wrapper.instance();

    instance.onLoadFile();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("existImage")).toBe(true);
  });
});
