import React from "react";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/zoom-minus.r... Remove this comment to see the full error message
import ZoomMinusReactSvgUrl from "PUBLIC_DIR/images/zoom-minus.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/zoom-plus.re... Remove this comment to see the full error message
import ZoomPlusReactSvgUrl from "PUBLIC_DIR/images/zoom-plus.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/catalog.tras... Remove this comment to see the full error message
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/catalog.trash.react.svg?url";
import Dropzone from "react-dropzone";
import ReactAvatarEditor from "./react-avatar-editor";
import PropTypes from "prop-types";
import Avatar from "../../avatar/index";
import accepts from "attr-accept";
import Text from "../../text";
import Box from "../../box";
import ContextMenuButton from "../../context-menu-button";
import IconButton from "../../icon-button";

import Slider from "../../slider";
import {
  isDesktop,
  //isTablet,
  //isMobile
} from "../../utils/device";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'resi... Remove this comment to see the full error message
import resizeImage from "resize-image";
import throttle from "lodash/throttle";
import Link from "../../link";

const step = 0.01;
const min = 1;
const max = 5;

import {
  StyledAvatarEditorBody,
  StyledAvatarContainer,
  DropZoneContainer,
  StyledErrorContainer,
} from "./styled-avatar-editor-body";

class AvatarEditorBody extends React.Component {
  dropzoneRef: any;
  setEditorRef: any;
  throttledSetCroppedImage: any;
  constructor(props: any) {
    super(props);

    this.state = {
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      image: this.props.image ? this.props.image : "",
      scale: 1,
      croppedImage: "",
      errorText: null,
      rotate: 0,
    };

    this.setEditorRef = React.createRef();
    this.dropzoneRef = React.createRef();

    this.throttledSetCroppedImage = throttle(this.setCroppedImage, 300);
  }

  onPositionChange = (position: any) => {
    // @ts-expect-error TS(2339): Property 'onPositionChange' does not exist on type... Remove this comment to see the full error message
    this.props.onPositionChange({
      x: position.x,
      y: position.y,
      width: this.setEditorRef.current.getImage().width,
      height: this.setEditorRef.current.getImage().height,
    });
  };

  onDropRejected = (rejectedFiles: any) => {
    // @ts-expect-error TS(2339): Property 'accept' does not exist on type 'Readonly... Remove this comment to see the full error message
    if (!accepts(rejectedFiles[0], this.props.accept)) {
      // @ts-expect-error TS(2339): Property 'onLoadFileError' does not exist on type ... Remove this comment to see the full error message
      this.props.onLoadFileError(0);
      this.setState({
        // @ts-expect-error TS(2339): Property 'unknownTypeError' does not exist on type... Remove this comment to see the full error message
        errorText: this.props.unknownTypeError,
      });
      return;
    // @ts-expect-error TS(2339): Property 'maxSize' does not exist on type 'Readonl... Remove this comment to see the full error message
    } else if (rejectedFiles[0].size > this.props.maxSize) {
      // @ts-expect-error TS(2339): Property 'onLoadFileError' does not exist on type ... Remove this comment to see the full error message
      this.props.onLoadFileError(1);
      this.setState({
        // @ts-expect-error TS(2339): Property 'maxSizeFileError' does not exist on type... Remove this comment to see the full error message
        errorText: this.props.maxSizeFileError,
      });
      return;
    }
    this.setState({
      // @ts-expect-error TS(2339): Property 'unknownError' does not exist on type 'Re... Remove this comment to see the full error message
      errorText: this.props.unknownError,
    });
    // @ts-expect-error TS(2339): Property 'onLoadFileError' does not exist on type ... Remove this comment to see the full error message
    this.props.onLoadFileError(2);
  };

  onDropAccepted = (acceptedFiles: any) => {
    const _this = this;
    var fr = new FileReader();
    fr.readAsDataURL(acceptedFiles[0]);
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var canvas = resizeImage.resize2Canvas(img, img.width, img.height);
        var data = resizeImage.resize(
          canvas,
          img.width / 4,
          img.height / 4,
          resizeImage.JPEG
        );
        _this.setState({
          image: data,
          rotate: 0,
          errorText: null,
        });
        fetch(data)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "File name", {
              type: "image/jpg",
            });
            //console.log(`file size ${file.size / 1024 / 1024} mb`);
            // @ts-expect-error TS(2339): Property 'onLoadFile' does not exist on type 'Read... Remove this comment to see the full error message
            _this.props.onLoadFile(file);
          });
      };
      // @ts-expect-error TS(2322): Type 'string | ArrayBuffer | null' is not assignab... Remove this comment to see the full error message
      img.src = fr.result;
    };
  };

  deleteImage = () => {
    this.setState({
      image: "",
      rotate: 0,
      croppedImage: "",
    });
    // @ts-expect-error TS(2339): Property 'deleteImage' does not exist on type 'Rea... Remove this comment to see the full error message
    this.props.deleteImage();
  };

  setCroppedImage = () => {
    if (this.setEditorRef && this.setEditorRef.current) {
      const image = this.setEditorRef.current.getImage()?.toDataURL();
      this.setState({
        croppedImage: image,
      });
      // @ts-expect-error TS(2339): Property 'onImageChange' does not exist on type 'R... Remove this comment to see the full error message
      this.props.onImageChange(image);
    }
  };

  dist = 0;
  scaling = false;
  curr_scale = 1.0;
  scale_factor = 1.0;

  distance = (p1: any, p2: any) => {
    return Math.sqrt(
      Math.pow(p1.clientX - p2.clientX, 2) +
        Math.pow(p1.clientY - p2.clientY, 2)
    );
  };

  onTouchStart = (evt: any) => {
    //evt.preventDefault();
    var tt = evt.targetTouches;
    if (tt.length >= 2) {
      this.dist = this.distance(tt[0], tt[1]);
      this.scaling = true;
    } else {
      this.scaling = false;
    }
  };

  onTouchMove = (evt: any) => {
    //evt.preventDefault();
    var tt = evt.targetTouches;
    if (this.scaling) {
      this.curr_scale =
        (this.distance(tt[0], tt[1]) / this.dist) * this.scale_factor;

      this.setState({
        scale:
          this.curr_scale < min
            ? min
            : this.curr_scale > max
            ? max
            : this.curr_scale,
      });
      // @ts-expect-error TS(2339): Property 'onSizeChange' does not exist on type 'Re... Remove this comment to see the full error message
      this.props.onSizeChange({
        width: this.setEditorRef.current.getImage().width,
        height: this.setEditorRef.current.getImage().height,
      });
    }
  };

  onTouchEnd = (evt: any) => {
    var tt = evt.targetTouches;
    if (tt.length < 2) {
      this.scaling = false;
      if (this.curr_scale < 1) {
        this.scale_factor = 1;
      } else {
        if (this.curr_scale > 10) {
          this.scale_factor = 10;
        } else {
          this.scale_factor = this.curr_scale;
        }
      }
    } else {
      this.scaling = true;
    }
  };

  onWheel = (e: any) => {
    // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.props.isLoading) return;
    if (!this.setEditorRef.current) return;
    e = e || window.event;
    const delta = e.deltaY || e.detail || e.wheelDelta;
    let scale =
      // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
      delta > 0 && this.state.scale === 1
        ? 1
        // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
        : this.state.scale - (delta / 100) * 0.1;
    scale = Math.round(scale * 10) / 10;
    this.setState({
      scale: scale < 1 ? 1 : scale > 10 ? 10 : scale,
    });
    // @ts-expect-error TS(2339): Property 'onSizeChange' does not exist on type 'Re... Remove this comment to see the full error message
    this.props.onSizeChange({
      width: this.setEditorRef.current.getImage().width,
      height: this.setEditorRef.current.getImage().height,
    });
  };

  onRotateLeftClick = (e: any) => {
    e.preventDefault();
    this.setState({
      // @ts-expect-error TS(2339): Property 'rotate' does not exist on type 'Readonly... Remove this comment to see the full error message
      rotate: this.state.rotate - 90,
    });
  };

  onRotateRightClick = (e: any) => {
    e.preventDefault();
    this.setState({
      // @ts-expect-error TS(2339): Property 'rotate' does not exist on type 'Readonly... Remove this comment to see the full error message
      rotate: this.state.rotate + 90,
    });
  };

  onFlipVerticalClick = () => {};

  onFlipHorizontalClick = () => {};

  onZoomMinusClick = () => {
    // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.props.isLoading) return;
    // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const newScale = this.state.scale - step;
    this.setState({ scale: newScale < min ? min : newScale });
  };

  onZoomPlusClick = () => {
    // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.props.isLoading) return;
    // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const newScale = this.state.scale + step;
    this.setState({ scale: newScale > max ? max : newScale });
  };

  handleScale = (e: any) => {
    // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.props.isLoading) return;
    const scale = parseFloat(e.target.value);
    this.setState({ scale });
    // @ts-expect-error TS(2339): Property 'onSizeChange' does not exist on type 'Re... Remove this comment to see the full error message
    this.props.onSizeChange({
      width: this.setEditorRef.current.getImage().width,
      height: this.setEditorRef.current.getImage().height,
    });
  };

  onImageReady = () => {
    this.setState({
      croppedImage: this.setEditorRef.current.getImage().toDataURL(),
    });
    // @ts-expect-error TS(2339): Property 'onImageChange' does not exist on type 'R... Remove this comment to see the full error message
    this.props.onImageChange(this.setEditorRef.current.getImage().toDataURL());
    // @ts-expect-error TS(2339): Property 'onPositionChange' does not exist on type... Remove this comment to see the full error message
    this.props.onPositionChange({
      x: 0.5,
      y: 0.5,
      width: this.setEditorRef.current.getImage().width,
      height: this.setEditorRef.current.getImage().height,
    });
  };

  onSaveImage() {
    var img = new Image();
    var _this = this;
    img.crossOrigin = "Anonymous";
    // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
    img.src = this.state.image;
    // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
    if (!this.state.image) _this.props.onLoadFile(null);
    img.onload = () => {
      var canvas = document.createElement("canvas");
      // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      canvas.setAttribute("width", img.width);
      // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      canvas.setAttribute("height", img.height);
      var context = canvas.getContext("2d");

      // @ts-expect-error TS(2531): Object is possibly 'null'.
      context.translate(canvas.width / 2, canvas.height / 2);
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      context.rotate((this.state.rotate * Math.PI) / 180);
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      context.drawImage(img, -img.width / 2, -img.height / 2);

      var rotatedImageSrc = canvas.toDataURL("image/jpeg");
      fetch(rotatedImageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "File name", { type: "image/jpg" });
          // @ts-expect-error TS(2339): Property 'onLoadFile' does not exist on type 'Read... Remove this comment to see the full error message
          _this.props.onLoadFile(file, true);
        });
    };
  }

  componentDidUpdate(prevProps: any) {
    if (
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      prevProps.image !== this.props.image ||
      // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
      prevProps.visible !== this.props.visible
    ) {
      this.setState({
        // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
        image: this.props.image ? this.props.image : "",
        rotate: 0,
      });
    }
  }

  openDialog = () => {
    // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
    if (!this.state.image) return;
    // Note that the ref is set async,
    // so it might be null at some point
    if (this.dropzoneRef.current) {
      this.dropzoneRef.current.open();
    }
  };

  renderLinkContainer = () => {
    const {
      // @ts-expect-error TS(2339): Property 'selectNewPhotoLabel' does not exist on t... Remove this comment to see the full error message
      selectNewPhotoLabel,
      // @ts-expect-error TS(2339): Property 'orDropFileHereLabel' does not exist on t... Remove this comment to see the full error message
      orDropFileHereLabel,
      // @ts-expect-error TS(2339): Property 'maxSizeLabel' does not exist on type 'Re... Remove this comment to see the full error message
      maxSizeLabel,
      // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Reado... Remove this comment to see the full error message
      isLoading,
    } = this.props;
    // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { image } = this.state;

    const desktopMode = isDesktop();
    const labelAlign = image === "" ? "center" : "left";

    //console.log("maxSizeLabel", maxSizeLabel);
    const onClickProp = !isLoading ? { onClick: this.openDialog } : {};

    return (
      // @ts-expect-error TS(2322): Type '{ children: Element[]; as: string; textAlign... Remove this comment to see the full error message
      <Text as="span" textAlign={!desktopMode ? labelAlign : "left"}>
        // @ts-expect-error TS(2322): Type '{ children: any[]; displayProp: string; alig... Remove this comment to see the full error message
        <Box displayProp="flex" alignItems="center">
          <Link type="action" fontWeight={600} isHovered {...onClickProp}>
            {selectNewPhotoLabel}
          </Link>
          &nbsp;
          {desktopMode && orDropFileHereLabel}
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: any; as: string; fontSize: strin... Remove this comment to see the full error message
        <Text
          as="p"
          // color="#A3A9AE"
          fontSize="12px"
          fontWeight="600"
          textAlign={labelAlign}
        >
          {maxSizeLabel}
        </Text>
      </Text>
    );
  };

  render() {
    // @ts-expect-error TS(2339): Property 'maxSize' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { maxSize, accept, role, title, useModalDialog, isLoading } =
      this.props;

    const desktopMode = isDesktop();
    //const tabletMode = isTablet();
    //const mobileMode = isMobile();

    let editorWidth = 174;
    let editorHeight = 174;

    if (!useModalDialog) {
      editorWidth = 270;
      editorHeight = 270;
    }

    /*if (tabletMode) {
      editorWidth = 320;
      editorHeight = 320;
    } else if (mobileMode) {
      editorWidth = 287;
      editorHeight = 287;
    }*/

    const onDeleteProp = !isLoading ? { onClick: this.deleteImage } : {};

    return (
      <StyledAvatarEditorBody
        onWheel={this.onWheel}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
        // @ts-expect-error TS(2769): No overload matches this call.
        useModalDialog={useModalDialog}
        // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
        image={this.state.image}
      >
        <Dropzone
          ref={this.dropzoneRef}
          onDropAccepted={this.onDropAccepted}
          onDropRejected={this.onDropRejected}
          maxSize={maxSize}
          accept={accept}
          // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
          noClick={this.state.image !== ""}
        >
          {({ getRootProps, getInputProps }) => (
            <DropZoneContainer {...getRootProps()}>
              <input {...getInputProps()} />
              // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
              {this.state.image === "" ? (
                // @ts-expect-error TS(2322): Type '{ children: Element; className: string; }' i... Remove this comment to see the full error message
                <Box className="dropzone-text">
                  {this.renderLinkContainer()}
                </Box>
              ) : (
                // @ts-expect-error TS(2769): No overload matches this call.
                <StyledAvatarContainer useModalDialog={useModalDialog}>
                  // @ts-expect-error TS(2322): Type '{ children: any[]; className: string; }' is ... Remove this comment to see the full error message
                  <Box className="preview-container">
                    // @ts-expect-error TS(2322): Type '{ children: Element[]; className: string; }'... Remove this comment to see the full error message
                    <Box className="editor-container">
                      <ReactAvatarEditor
                        ref={this.setEditorRef}
                        width={editorWidth}
                        height={editorHeight}
                        borderRadius={200}
                        // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
                        scale={this.state.scale}
                        // @ts-expect-error TS(2322): Type '{ ref: any; width: number; height: number; b... Remove this comment to see the full error message
                        className="react-avatar-editor"
                        // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
                        image={this.state.image}
                        // @ts-expect-error TS(2339): Property 'rotate' does not exist on type 'Readonly... Remove this comment to see the full error message
                        rotate={this.state.rotate}
                        color={[196, 196, 196, 0.5]}
                        onImageChange={this.throttledSetCroppedImage}
                        onPositionChange={this.onPositionChange}
                        onImageReady={this.onImageReady}
                        crossOrigin="anonymous"
                      />
                      // @ts-expect-error TS(2322): Type '{ children: Element[]; className: string; }'... Remove this comment to see the full error message
                      <Box className="editor-buttons">
                        <Box></Box>
                        <Box></Box>
                        <Box></Box>
                        <Box></Box>
                        <Box></Box>
                        <IconButton
                          size="16"
                          isDisabled={isLoading}
                          {...onDeleteProp}
                          // @ts-expect-error TS(2322): Type '{ iconName: any; isFill: boolean; isClickabl... Remove this comment to see the full error message
                          iconName={CatalogTrashReactSvgUrl}
                          isFill={true}
                          isClickable={true}
                          className="editor-button"
                        />
                      </Box>
                      // @ts-expect-error TS(2322): Type '{ children: Element[]; className: string; }'... Remove this comment to see the full error message
                      <Box className="zoom-container">
                        <IconButton
                          // @ts-expect-error TS(2322): Type '{ className: string; size: string; isDisable... Remove this comment to see the full error message
                          className="zoom-container-svg_zoom-minus"
                          size="16"
                          isDisabled={isLoading}
                          onClick={this.onZoomMinusClick}
                          iconName={ZoomMinusReactSvgUrl}
                          isFill={true}
                          isClickable={false}
                        />
                        <Slider
                          id="scale"
                          type="range"
                          className="custom-range"
                          // @ts-expect-error TS(2339): Property 'allowZoomOut' does not exist on type 'Re... Remove this comment to see the full error message
                          min={this.state.allowZoomOut ? "0.1" : min}
                          max={max}
                          step={step}
                          // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
                          value={this.state.scale}
                          onChange={this.handleScale}
                        />
                        <IconButton
                          // @ts-expect-error TS(2322): Type '{ size: string; className: string; isDisable... Remove this comment to see the full error message
                          size="16"
                          className="zoom-container-svg_zoom-plus"
                          isDisabled={isLoading}
                          onClick={this.onZoomPlusClick}
                          iconName={ZoomPlusReactSvgUrl}
                          isFill={true}
                          isClickable={false}
                        />
                      </Box>
                    </Box>
                    {desktopMode && useModalDialog && (
                      // @ts-expect-error TS(2322): Type '{ children: Element[]; className: string; }'... Remove this comment to see the full error message
                      <Box className="avatar-container">
                        <Avatar
                          size="max"
                          role={role}
                          // @ts-expect-error TS(2339): Property 'croppedImage' does not exist on type 'Re... Remove this comment to see the full error message
                          source={this.state.croppedImage}
                          editing={false}
                        />
                        // @ts-expect-error TS(2322): Type '{ children: Element[]; className: string; }'... Remove this comment to see the full error message
                        <Box className="avatar-mini-preview">
                          <Avatar
                            size="min"
                            role={role}
                            // @ts-expect-error TS(2339): Property 'croppedImage' does not exist on type 'Re... Remove this comment to see the full error message
                            source={this.state.croppedImage}
                            editing={false}
                          />
                          // @ts-expect-error TS(2322): Type '{ children: any; as: string; fontSize: strin... Remove this comment to see the full error message
                          <Text
                            as="div"
                            fontSize="15px"
                            fontWeight={600}
                            title={title}
                            truncate={true}
                          >
                            {title}
                          </Text>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  // @ts-expect-error TS(2322): Type '{ children: Element; className: string; }' i... Remove this comment to see the full error message
                  <Box className="link-container">
                    {this.renderLinkContainer()}
                  </Box>
                </StyledAvatarContainer>
              )}
            </DropZoneContainer>
          )}
        </Dropzone>

        <StyledErrorContainer key="errorMsg">
          // @ts-expect-error TS(2339): Property 'errorText' does not exist on type 'Reado... Remove this comment to see the full error message
          {this.state.errorText !== null && (
            // @ts-expect-error TS(2322): Type '{ children: any; as: string; color: string; ... Remove this comment to see the full error message
            <Text as="p" color="#C96C27" isBold={true}>
              // @ts-expect-error TS(2339): Property 'errorText' does not exist on type 'Reado... Remove this comment to see the full error message
              {this.state.errorText}
            </Text>
          )}
        </StyledErrorContainer>
      </StyledAvatarEditorBody>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AvatarEditorBody.propTypes = {
  onImageChange: PropTypes.func,
  onPositionChange: PropTypes.func,
  onSizeChange: PropTypes.func,
  visible: PropTypes.bool,
  onLoadFileError: PropTypes.func,
  onLoadFile: PropTypes.func,
  deleteImage: PropTypes.func,
  maxSize: PropTypes.number,
  image: PropTypes.string,
  accept: PropTypes.arrayOf(PropTypes.string),
  selectNewPhotoLabel: PropTypes.string,
  orDropFileHereLabel: PropTypes.string,
  unknownTypeError: PropTypes.string,
  maxSizeFileError: PropTypes.string,
  unknownError: PropTypes.string,
  role: PropTypes.string,
  title: PropTypes.string,
  useModalDialog: PropTypes.bool,
  maxSizeLabel: PropTypes.string,
  isLoading: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
AvatarEditorBody.defaultProps = {
  accept: ["image/png", "image/jpeg"],
  maxSize: Number.MAX_SAFE_INTEGER,
  visible: false,
  selectNewPhotoLabel: "Select new photo",
  orDropFileHereLabel: "or drop file here",
  unknownTypeError: "Unknown image file type",
  maxSizeFileError: "Maximum file size exceeded",
  unknownError: "Error",
  role: "user",
  title: "Sample title",
  useModalDialog: true,
  isLoading: false,
};
export default AvatarEditorBody;
