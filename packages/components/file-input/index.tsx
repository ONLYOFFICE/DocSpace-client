import React, { Component } from "react";
import PropTypes from "prop-types";
import equal from "fast-deep-equal/react";
import Dropzone from "react-dropzone";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/catalog.fold... Remove this comment to see the full error message
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import { withTranslation } from "react-i18next";
import IconButton from "../icon-button";
import Button from "../button";
import TextInput from "../text-input";
import StyledFileInput from "./styled-file-input";
import Loader from "../loader";
import toastr from "../toast/toastr";

class FileInput extends Component {
  inputRef: any;
  constructor(props: any) {
    super(props);

    this.inputRef = React.createRef();

    this.state = {
      fileName: "",
      file: null,
    };
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !equal(this.props, nextProps) || !equal(this.state, nextState);
  }

  onDrop = (acceptedFiles: any) => {
    // @ts-expect-error TS(2339): Property 'onInput' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { onInput, t } = this.props;

    if (acceptedFiles.length === 0) {
      // @ts-expect-error TS(2554): Expected 5 arguments, but got 1.
      toastr.error(t("Common:NotSupportedFormat"));
      return;
    }

    this.setState({
      fileName: acceptedFiles[0].name,
    });

    onInput(acceptedFiles[0]);
  };

  render() {
    //console.log('render FileInput');
    // @ts-expect-error TS(2339): Property 'fileName' does not exist on type 'Readon... Remove this comment to see the full error message
    const { fileName } = this.state;
    const {
      // @ts-expect-error TS(2339): Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error TS(2339): Property 'placeholder' does not exist on type 'Rea... Remove this comment to see the full error message
      placeholder,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
      scale,
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Readon... Remove this comment to see the full error message
      hasError,
      // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Read... Remove this comment to see the full error message
      hasWarning,
      // @ts-expect-error TS(2339): Property 'accept' does not exist on type 'Readonly... Remove this comment to see the full error message
      accept,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'onInput' does not exist on type 'Readonl... Remove this comment to see the full error message
      onInput, // eslint-disable-line no-unused-vars
      // @ts-expect-error TS(2339): Property 'buttonLabel' does not exist on type 'Rea... Remove this comment to see the full error message
      buttonLabel,
      // @ts-expect-error TS(2339): Property 'idButton' does not exist on type 'Readon... Remove this comment to see the full error message
      idButton,
      // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
      isLoading,
      // @ts-expect-error TS(2339): Property 'fromStorage' does not exist on type 'Rea... Remove this comment to see the full error message
      fromStorage = false,
      // @ts-expect-error TS(2339): Property 'path' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      path,
      ...rest
    } = this.props;

    let iconSize = 0;
    let buttonSize = "";

    switch (size) {
      case "base":
        iconSize = 15;
        buttonSize = "extrasmall";
        break;
      case "middle":
        iconSize = 15;
        buttonSize = "small";
        break;
      case "big":
        iconSize = 16;
        buttonSize = "normal";
        break;
      case "huge":
        iconSize = 16;
        buttonSize = "medium";
        break;
      case "large":
        iconSize = 16;
        buttonSize = "medium";
        break;
    }

    // @ts-expect-error TS(2339): Property 'onClick' does not exist on type '{}'.
    const onClickProp = fromStorage ? { onClick: rest.onClick } : {};

    return (
      <Dropzone
        onDrop={this.onDrop}
        noClick={isDisabled || isLoading}
        accept={accept}
      >
        {({ getRootProps, getInputProps }) => (
          <StyledFileInput
            size={size}
            scale={scale ? 1 : 0}
            hasError={hasError}
            hasWarning={hasWarning}
            id={idButton}
            isDisabled={isDisabled}
            {...rest}
            {...getRootProps()}
          >
            <TextInput
              isReadOnly
              className="text-input"
              placeholder={placeholder}
              value={fromStorage ? path : fileName}
              size={size}
              isDisabled={isDisabled || isLoading}
              hasError={hasError}
              hasWarning={hasWarning}
              scale={scale}
              {...onClickProp}
            />
            {!fromStorage && (
              <input
                type="file"
                id={id}
                ref={this.inputRef}
                style={{ display: "none" }}
                {...getInputProps()}
              />
            )}

            {buttonLabel ? (
              <Button
                // @ts-expect-error TS(2322): Type '{ isDisabled: any; label: any; size: string;... Remove this comment to see the full error message
                isDisabled={isDisabled}
                label={buttonLabel}
                size={buttonSize}
              />
            ) : (
              <div className="icon" {...onClickProp}>
                {isLoading ? (
                  <Loader className="loader" size="20px" type="track" />
                ) : (
                  <IconButton
                    // @ts-expect-error TS(2322): Type '{ className: string; iconName: any; color: s... Remove this comment to see the full error message
                    className="icon-button"
                    iconName={CatalogFolderReactSvgUrl}
                    color={"#A3A9AE"}
                    size={iconSize}
                    isDisabled={isDisabled}
                  />
                )}
              </div>
            )}
          </StyledFileInput>
        )}
      </Dropzone>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
FileInput.propTypes = {
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Placeholder text for the input */
  placeholder: PropTypes.string,
  /** Supported size of the input fields */
  size: PropTypes.oneOf(["base", "middle", "big", "huge", "large"]),
  /** Indicates that the input field has scale */
  scale: PropTypes.bool,
  /** Accepts class */
  className: PropTypes.string,
  /** Indicates that the input field has an error */
  hasError: PropTypes.bool,
  /** Indicates that the input field has a warning */
  hasWarning: PropTypes.bool,
  /** Used as HTML `id` property */
  id: PropTypes.string,
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved) */
  isDisabled: PropTypes.bool,
  /** Tells when the button should show loader icon */
  isLoading: PropTypes.bool,
  /** Used as HTML `name` property */
  name: PropTypes.string,
  /** Called when a file is selected */
  onInput: PropTypes.func,
  /** Specifies the files visible for upload */
  accept: PropTypes.string,
  /** Specifies the label for the upload button */
  buttonLabel: PropTypes.string,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
FileInput.defaultProps = {
  size: "base",
  scale: false,
  hasWarning: false,
  hasError: false,
  isDisabled: false,
  isLoading: false,
  accept: "",
};

export default withTranslation("Common")(FileInput);
