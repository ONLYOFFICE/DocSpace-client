import React from "react";
import PropTypes from "prop-types";
import ModalDialog from "../modal-dialog";
import Button from "../button";
import AvatarEditorBody from "./sub-components/avatar-editor-body";
import StyledButtonsWrapper from "./styled-avatar-editor";

class AvatarEditor extends React.Component {
  avatarEditorBodyRef: any;
  constructor(props: any) {
    super(props);
    this.avatarEditorBodyRef = React.createRef();

    this.state = {
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      existImage: !!this.props.image,
      visible: props.visible,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      croppedImage: "",
    };
  }

  onImageChange = (file: any) => {
    this.setState({
      croppedImage: file,
    });
    // @ts-expect-error TS(2339): Property 'onImageChange' does not exist on type 'R... Remove this comment to see the full error message
    if (typeof this.props.onImageChange === "function")
      // @ts-expect-error TS(2339): Property 'onImageChange' does not exist on type 'R... Remove this comment to see the full error message
      this.props.onImageChange(file);
  };

  onDeleteImage = () => {
    this.setState({
      existImage: false,
    });
    // @ts-expect-error TS(2339): Property 'onDeleteImage' does not exist on type 'R... Remove this comment to see the full error message
    if (typeof this.props.onDeleteImage === "function")
      // @ts-expect-error TS(2339): Property 'onDeleteImage' does not exist on type 'R... Remove this comment to see the full error message
      this.props.onDeleteImage();
  };

  onSizeChange = (data: any) => {
    this.setState(data);
  };

  onPositionChange = (data: any) => {
    this.setState(data);
  };

  onLoadFileError = (error: any) => {
    // @ts-expect-error TS(2339): Property 'onLoadFileError' does not exist on type ... Remove this comment to see the full error message
    if (typeof this.props.onLoadFileError === "function")
      // @ts-expect-error TS(2339): Property 'onLoadFileError' does not exist on type ... Remove this comment to see the full error message
      this.props.onLoadFileError(error);
  };

  onLoadFile = (file: any, needSave: any) => {
    // @ts-expect-error TS(2339): Property 'onLoadFile' does not exist on type 'Read... Remove this comment to see the full error message
    if (typeof this.props.onLoadFile === "function") {
      var fileData = {
        // @ts-expect-error TS(2339): Property 'existImage' does not exist on type 'Read... Remove this comment to see the full error message
        existImage: this.state.existImage,
        position: {
          // @ts-expect-error TS(2339): Property 'x' does not exist on type 'Readonly<{}>'... Remove this comment to see the full error message
          x: this.state.x,
          // @ts-expect-error TS(2339): Property 'y' does not exist on type 'Readonly<{}>'... Remove this comment to see the full error message
          y: this.state.y,
          // @ts-expect-error TS(2339): Property 'width' does not exist on type 'Readonly<... Remove this comment to see the full error message
          width: this.state.width,
          // @ts-expect-error TS(2339): Property 'height' does not exist on type 'Readonly... Remove this comment to see the full error message
          height: this.state.height,
        },
        // @ts-expect-error TS(2339): Property 'croppedImage' does not exist on type 'Re... Remove this comment to see the full error message
        croppedImage: this.state.croppedImage,
      };

      needSave
        // @ts-expect-error TS(2339): Property 'onLoadFile' does not exist on type 'Read... Remove this comment to see the full error message
        ? this.props.onLoadFile(file, fileData)
        // @ts-expect-error TS(2339): Property 'onLoadFile' does not exist on type 'Read... Remove this comment to see the full error message
        : this.props.onLoadFile(file);
    }

    // @ts-expect-error TS(2339): Property 'existImage' does not exist on type 'Read... Remove this comment to see the full error message
    if (!this.state.existImage) this.setState({ existImage: true });
  };

  onSaveButtonClick = () => {
    // @ts-expect-error TS(2339): Property 'onSave' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.props.onSave && this.props.onSave();
    this.avatarEditorBodyRef.current.onSaveImage();
  };

  onCancelButtonClick = () => {
    // @ts-expect-error TS(2339): Property 'onCancel' does not exist on type 'Readon... Remove this comment to see the full error message
    this.props.onCancel();
  };

  onClose = () => {
    // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
    if (this.state.visible) {
      this.setState({ visible: false });
      // @ts-expect-error TS(2339): Property 'onClose' does not exist on type 'Readonl... Remove this comment to see the full error message
      this.props.onClose();
    }
  };

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
    if (this.props.visible !== prevProps.visible) {
      // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
      this.setState({ visible: this.props.visible });
    }
    // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
    if (this.props.image !== prevProps.image) {
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      this.setState({ existImage: !!this.props.image });
    }
  }

  keyPress = (e: any) => {
    if (e.keyCode === 13) {
      this.onSaveButtonClick();
    }
  };

  componentDidMount() {
    addEventListener("keydown", this.keyPress, false);
  }

  componentWillUnmount() {
    removeEventListener("keydown", this.keyPress, false);
  }

  render() {
    const {
      // @ts-expect-error TS(2339): Property 'displayType' does not exist on type 'Rea... Remove this comment to see the full error message
      displayType,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'headerLabel' does not exist on type 'Rea... Remove this comment to see the full error message
      headerLabel,
      // @ts-expect-error TS(2339): Property 'maxSize' does not exist on type 'Readonl... Remove this comment to see the full error message
      maxSize,
      // @ts-expect-error TS(2339): Property 'accept' does not exist on type 'Readonly... Remove this comment to see the full error message
      accept,
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      image,
      // @ts-expect-error TS(2339): Property 'selectNewPhotoLabel' does not exist on t... Remove this comment to see the full error message
      selectNewPhotoLabel,
      // @ts-expect-error TS(2339): Property 'orDropFileHereLabel' does not exist on t... Remove this comment to see the full error message
      orDropFileHereLabel,
      // @ts-expect-error TS(2339): Property 'unknownTypeError' does not exist on type... Remove this comment to see the full error message
      unknownTypeError,
      // @ts-expect-error TS(2339): Property 'maxSizeFileError' does not exist on type... Remove this comment to see the full error message
      maxSizeFileError,
      // @ts-expect-error TS(2339): Property 'unknownError' does not exist on type 'Re... Remove this comment to see the full error message
      unknownError,
      // @ts-expect-error TS(2339): Property 'saveButtonLabel' does not exist on type ... Remove this comment to see the full error message
      saveButtonLabel,
      // @ts-expect-error TS(2339): Property 'saveButtonLoading' does not exist on typ... Remove this comment to see the full error message
      saveButtonLoading,
      // @ts-expect-error TS(2339): Property 'useModalDialog' does not exist on type '... Remove this comment to see the full error message
      useModalDialog,
      // @ts-expect-error TS(2339): Property 'cancelButtonLabel' does not exist on typ... Remove this comment to see the full error message
      cancelButtonLabel,
      // @ts-expect-error TS(2339): Property 'maxSizeLabel' does not exist on type 'Re... Remove this comment to see the full error message
      maxSizeLabel,
    } = this.props;

    return useModalDialog ? (
      <ModalDialog
        // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
        visible={this.state.visible}
        displayType="aside"
        scale={false}
        // @ts-expect-error TS(2322): Type '{ children: Element[]; visible: any; display... Remove this comment to see the full error message
        contentHeight="initial"
        contentWidth="initial"
        onClose={this.onClose}
        className={className}
        id={id}
        style={style}
      >
        // @ts-expect-error TS(2559): Type '{ children: any; }' has no properties in com... Remove this comment to see the full error message
        <ModalDialog.Header>{headerLabel}</ModalDialog.Header>
        // @ts-expect-error TS(2559): Type '{ children: Element; }' has no properties in... Remove this comment to see the full error message
        <ModalDialog.Body>
          <AvatarEditorBody
            ref={this.avatarEditorBodyRef}
            // @ts-expect-error TS(2322): Type '{ ref: any; visible: any; onImageChange: (fi... Remove this comment to see the full error message
            visible={this.state.visible}
            onImageChange={this.onImageChange}
            onPositionChange={this.onPositionChange}
            onSizeChange={this.onSizeChange}
            onLoadFileError={this.onLoadFileError}
            onLoadFile={this.onLoadFile}
            deleteImage={this.onDeleteImage}
            maxSize={maxSize * 1024 * 1024} // megabytes to bytes
            accept={accept}
            image={image}
            selectNewPhotoLabel={selectNewPhotoLabel}
            orDropFileHereLabel={orDropFileHereLabel}
            unknownTypeError={unknownTypeError}
            maxSizeFileError={maxSizeFileError}
            unknownError={unknownError}
            maxSizeLabel={maxSizeLabel}
            isLoading={saveButtonLoading}
          />
        </ModalDialog.Body>
        // @ts-expect-error TS(2559): Type '{ children: Element[]; }' has no properties ... Remove this comment to see the full error message
        <ModalDialog.Footer>
          <Button
            key="SaveBtn"
            // @ts-expect-error TS(2322): Type '{ key: string; label: any; isLoading: any; p... Remove this comment to see the full error message
            label={saveButtonLabel}
            isLoading={saveButtonLoading}
            primary={true}
            size="normal"
            scale
            onClick={this.onSaveButtonClick}
          />
          <Button
            key="CancelBtn"
            // @ts-expect-error TS(2322): Type '{ key: string; label: any; size: string; sca... Remove this comment to see the full error message
            label={cancelButtonLabel}
            size="normal"
            scale
            onClick={this.onCancelButtonClick}
          />
        </ModalDialog.Footer>
      </ModalDialog>
    ) : (
      <>
        <AvatarEditorBody
          // @ts-expect-error TS(2322): Type '{ className: string; ref: any; visible: any;... Remove this comment to see the full error message
          className="use_modal-avatar_editor_body"
          ref={this.avatarEditorBodyRef}
          // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
          visible={this.state.visible}
          onImageChange={this.onImageChange}
          onPositionChange={this.onPositionChange}
          onSizeChange={this.onSizeChange}
          onLoadFileError={this.onLoadFileError}
          onLoadFile={this.onLoadFile}
          deleteImage={this.onDeleteImage}
          maxSize={maxSize * 1000000} // megabytes to bytes
          accept={accept}
          image={image}
          selectNewPhotoLabel={selectNewPhotoLabel}
          orDropFileHereLabel={orDropFileHereLabel}
          unknownTypeError={unknownTypeError}
          maxSizeFileError={maxSizeFileError}
          unknownError={unknownError}
          useModalDialog={false}
          maxSizeLabel={maxSizeLabel}
          isLoading={saveButtonLoading}
        />
        <StyledButtonsWrapper className="use_modal-buttons_wrapper">
          <Button
            key="SaveBtn"
            // @ts-expect-error TS(2322): Type '{ key: string; label: any; isLoading: any; p... Remove this comment to see the full error message
            label={saveButtonLabel}
            isLoading={saveButtonLoading}
            primary={true}
            size="normal"
            onClick={this.onSaveButtonClick}
          />
          <Button
            key="CancelBtn"
            // @ts-expect-error TS(2322): Type '{ key: string; label: any; primary: boolean;... Remove this comment to see the full error message
            label={cancelButtonLabel}
            primary={false}
            size="normal"
            onClick={this.onCancelButtonClick}
          />
        </StyledButtonsWrapper>
      </>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AvatarEditor.propTypes = {
  /** Displays avatar editor */
  visible: PropTypes.bool,
  /** Translation string for title */
  headerLabel: PropTypes.string,
  /** Translation string for file selection */
  selectNewPhotoLabel: PropTypes.string,
  /** Translation string for file dropping (concat with selectNewPhotoLabel prop) */
  orDropFileHereLabel: PropTypes.string,
  /** Translation string for save button */
  saveButtonLabel: PropTypes.string,
  /** Translation string for cancel button */
  cancelButtonLabel: PropTypes.string,
  /** Sets the button to show loader icon */
  saveButtonLoading: PropTypes.bool,
  /** Translation string for size warning */
  maxSizeFileError: PropTypes.string,
  /** Display avatar editor */
  image: PropTypes.string,
  /** Max size of image */
  maxSize: PropTypes.number,
  /** Accepted file types */
  accept: PropTypes.arrayOf(PropTypes.string),
  /** Save event */
  onSave: PropTypes.func,
  /** Closing event */
  onClose: PropTypes.func,
  /** Image deletion event */
  onDeleteImage: PropTypes.func,
  /** Image upload event */
  onLoadFile: PropTypes.func,
  /** Image change event */
  onImageChange: PropTypes.func,
  /** Translation string for load file warning */
  onLoadFileError: PropTypes.func,
  /** Translation string for file type warning */
  unknownTypeError: PropTypes.string,
  /** Translation string for warning */
  unknownError: PropTypes.string,
  /** Specifies the display type */
  displayType: PropTypes.oneOf(["auto", "modal", "aside"]),
  /** Accepts class" */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Enables/disables modal dialog view */
  useModalDialog: PropTypes.bool,
  maxSizeLabel: PropTypes.string,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
AvatarEditor.defaultProps = {
  visible: false,
  maxSize: 25,
  headerLabel: "Edit Photo",
  saveButtonLabel: "Save",
  cancelButtonLabel: "Cancel",
  accept: ["image/png", "image/jpeg"],
  displayType: "auto",
  useModalDialog: true,
};

export default AvatarEditor;
