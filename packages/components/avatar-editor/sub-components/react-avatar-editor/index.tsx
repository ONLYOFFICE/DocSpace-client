/* eslint-env browser, node */
import PropTypes from "prop-types";
import React from "react";

import loadImageURL from "./utils/load-image-url";
import loadImageFile from "./utils/load-image-file";
import { isTouchDevice } from "../../../utils/device";
const makeCancelable = (promise: any) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    /* eslint-disable prefer-promise-reject-errors */
    promise.then(
      (val: any) => hasCanceled_ ? reject({ isCanceled: true }) : resolve(val),
      (error: any) => hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
    );
    /* eslint-enable */
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};

const isFileAPISupported = typeof File !== "undefined";

const isPassiveSupported = () => {
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  let passiveSupported = false;
  try {
    const options = Object.defineProperty({}, "passive", {
      get: function () {
        passiveSupported = true;
      },
    });

    // @ts-expect-error TS(2769): No overload matches this call.
    window.addEventListener("test", options, options);
    // @ts-expect-error TS(2769): No overload matches this call.
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }
  return passiveSupported;
};

const draggableEvents = {
  touch: {
    react: {
      down: "onTouchStart",
      mouseDown: "onMouseDown",
      drag: "onTouchMove",
      move: "onTouchMove",
      mouseMove: "onMouseMove",
      up: "onTouchEnd",
      mouseUp: "onMouseUp",
    },
    native: {
      down: "touchstart",
      mouseDown: "mousedown",
      drag: "touchmove",
      move: "touchmove",
      mouseMove: "mousemove",
      up: "touchend",
      mouseUp: "mouseup",
    },
  },
  desktop: {
    react: {
      down: "onMouseDown",
      drag: "onDragOver",
      move: "onMouseMove",
      up: "onMouseUp",
    },
    native: {
      down: "mousedown",
      drag: "dragStart",
      move: "mousemove",
      up: "mouseup",
    },
  },
};
const deviceEvents = isTouchDevice
  ? draggableEvents.touch
  : draggableEvents.desktop;

let pixelRatio =
  typeof window !== "undefined" && window.devicePixelRatio
    ? window.devicePixelRatio
    : 1;

// Draws a rounded rectangle on a 2D context.
const drawRoundedRect = (context: any, x: any, y: any, width: any, height: any, borderRadius: any) => {
  if (borderRadius === 0) {
    context.rect(x, y, width, height);
  } else {
    const widthMinusRad = width - borderRadius;
    const heightMinusRad = height - borderRadius;
    context.translate(x, y);
    context.arc(
      borderRadius,
      borderRadius,
      borderRadius,
      Math.PI,
      Math.PI * 1.5
    );
    context.lineTo(widthMinusRad, 0);
    context.arc(
      widthMinusRad,
      borderRadius,
      borderRadius,
      Math.PI * 1.5,
      Math.PI * 2
    );
    context.lineTo(width, heightMinusRad);
    context.arc(
      widthMinusRad,
      heightMinusRad,
      borderRadius,
      Math.PI * 2,
      Math.PI * 0.5
    );
    context.lineTo(borderRadius, height);
    context.arc(
      borderRadius,
      heightMinusRad,
      borderRadius,
      Math.PI * 0.5,
      Math.PI
    );
    context.translate(-x, -y);
  }
};

const defaultEmptyImage = {
  x: 0.5,
  y: 0.5,
};

class AvatarEditor extends React.Component {
  static propTypes = {
    scale: PropTypes.number,
    rotate: PropTypes.number,
    image: PropTypes.oneOfType([
      PropTypes.string,
      ...(isFileAPISupported ? [PropTypes.instanceOf(File)] : []),
    ]),
    border: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    borderRadius: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
    color: PropTypes.arrayOf(PropTypes.number),
    crossOrigin: PropTypes.oneOf(["", "anonymous", "use-credentials"]),

    onLoadFailure: PropTypes.func,
    onLoadSuccess: PropTypes.func,
    onImageReady: PropTypes.func,
    onImageChange: PropTypes.func,
    onMouseUp: PropTypes.func,
    onMouseMove: PropTypes.func,
    onPositionChange: PropTypes.func,
    disableBoundaryChecks: PropTypes.bool,
    disableHiDPIScaling: PropTypes.bool,
    disableCanvasRotation: PropTypes.bool,
  };

  static defaultProps = {
    scale: 1,
    rotate: 0,
    border: 25,
    borderRadius: 0,
    width: 200,
    height: 200,
    color: [0, 0, 0, 0.5],
    onLoadFailure() {},
    onLoadSuccess() {},
    onImageReady() {},
    onImageChange() {},
    onMouseUp() {},
    onMouseMove() {},
    onPositionChange() {},
    disableBoundaryChecks: false,
    disableHiDPIScaling: false,
    disableCanvasRotation: true,
  };

  _isMounted: any;
  canvas: any;
  loadingImage: any;

  constructor(props: any) {
    super(props);
    this.canvas = null;
  }

  state = {
    drag: false,
    my: null,
    mx: null,
    image: defaultEmptyImage,
  };

  componentDidMount() {
    this._isMounted = true;
    // scaling by the devicePixelRatio can impact performance on mobile as it creates a very large canvas. This is an override to increase performance.
    // @ts-expect-error TS(2339): Property 'disableHiDPIScaling' does not exist on t... Remove this comment to see the full error message
    if (this.props.disableHiDPIScaling) {
      pixelRatio = 1;
    }
    const context = this.canvas.getContext("2d");
    // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
    if (this.props.image && this._isMounted) {
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      this.loadImage(this.props.image);
    }
    this.paint(context);
    if (document) {
      const passiveSupported = isPassiveSupported();
      const thirdArgument = passiveSupported ? { passive: false } : false;

      const nativeEvents = deviceEvents.native;
      document.addEventListener(
        nativeEvents.move,
        this.handleMouseMove,
        thirdArgument
      );
      document.addEventListener(
        nativeEvents.up,
        this.handleMouseUp,
        thirdArgument
      );
      if (isTouchDevice) {
        document.addEventListener(
          // @ts-expect-error TS(2339): Property 'mouseMove' does not exist on type '{ dow... Remove this comment to see the full error message
          nativeEvents.mouseMove,
          this.handleMouseMove,
          thirdArgument
        );
        document.addEventListener(
          // @ts-expect-error TS(2339): Property 'mouseUp' does not exist on type '{ down:... Remove this comment to see the full error message
          nativeEvents.mouseUp,
          this.handleMouseUp,
          thirdArgument
        );
      }
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      (this.props.image && this.props.image !== prevProps.image) ||
      // @ts-expect-error TS(2339): Property 'width' does not exist on type 'Readonly<... Remove this comment to see the full error message
      this.props.width !== prevProps.width ||
      // @ts-expect-error TS(2339): Property 'height' does not exist on type 'Readonly... Remove this comment to see the full error message
      this.props.height !== prevProps.height
    ) {
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      this.loadImage(this.props.image);
    // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
    } else if (!this.props.image && prevState.image !== defaultEmptyImage) {
      this.clearImage();
    }

    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.paint(context);
    // @ts-expect-error TS(2339): Property 'border' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.paintImage(context, this.state.image, this.props.border);

    if (
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      prevProps.image !== this.props.image ||
      // @ts-expect-error TS(2339): Property 'width' does not exist on type 'Readonly<... Remove this comment to see the full error message
      prevProps.width !== this.props.width ||
      // @ts-expect-error TS(2339): Property 'height' does not exist on type 'Readonly... Remove this comment to see the full error message
      prevProps.height !== this.props.height ||
      // @ts-expect-error TS(2339): Property 'position' does not exist on type 'Readon... Remove this comment to see the full error message
      prevProps.position !== this.props.position ||
      // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
      prevProps.scale !== this.props.scale ||
      // @ts-expect-error TS(2339): Property 'rotate' does not exist on type 'Readonly... Remove this comment to see the full error message
      prevProps.rotate !== this.props.rotate ||
      prevState.my !== this.state.my ||
      prevState.mx !== this.state.mx ||
      prevState.image.x !== this.state.image.x ||
      prevState.image.y !== this.state.image.y
    ) {
      // @ts-expect-error TS(2339): Property 'onImageChange' does not exist on type 'R... Remove this comment to see the full error message
      this.props.onImageChange();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (document) {
      const nativeEvents = deviceEvents.native;
      document.removeEventListener(
        nativeEvents.move,
        this.handleMouseMove,
        false
      );
      document.removeEventListener(nativeEvents.up, this.handleMouseUp, false);
      if (isTouchDevice) {
        document.removeEventListener(
          // @ts-expect-error TS(2339): Property 'mouseMove' does not exist on type '{ dow... Remove this comment to see the full error message
          nativeEvents.mouseMove,
          this.handleMouseMove,
          false
        );
        document.removeEventListener(
          // @ts-expect-error TS(2339): Property 'mouseUp' does not exist on type '{ down:... Remove this comment to see the full error message
          nativeEvents.mouseUp,
          this.handleMouseUp,
          false
        );
      }
    }
  }

  isVertical() {
    // @ts-expect-error TS(2339): Property 'disableCanvasRotation' does not exist on... Remove this comment to see the full error message
    return !this.props.disableCanvasRotation && this.props.rotate % 180 !== 0;
  }

  // @ts-expect-error TS(2339): Property 'border' does not exist on type 'Readonly... Remove this comment to see the full error message
  getBorders(border = this.props.border) {
    return Array.isArray(border) ? border : [border, border];
  }

  getDimensions() {
    // @ts-expect-error TS(2339): Property 'width' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { width, height, rotate, border } = this.props;

    const canvas = {};

    const [borderX, borderY] = this.getBorders(border);

    const canvasWidth = width;
    const canvasHeight = height;

    if (this.isVertical()) {
      // @ts-expect-error TS(2339): Property 'width' does not exist on type '{}'.
      canvas.width = canvasHeight;
      // @ts-expect-error TS(2339): Property 'height' does not exist on type '{}'.
      canvas.height = canvasWidth;
    } else {
      // @ts-expect-error TS(2339): Property 'width' does not exist on type '{}'.
      canvas.width = canvasWidth;
      // @ts-expect-error TS(2339): Property 'height' does not exist on type '{}'.
      canvas.height = canvasHeight;
    }

    // @ts-expect-error TS(2339): Property 'width' does not exist on type '{}'.
    canvas.width += borderX * 2;
    // @ts-expect-error TS(2339): Property 'height' does not exist on type '{}'.
    canvas.height += borderY * 2;

    return {
      canvas,
      rotate,
      width,
      height,
      border,
    };
  }

  getImage() {
    // get relative coordinates (0 to 1)
    const cropRect = this.getCroppingRect();
    const image = this.state.image;

    // get actual pixel coordinates
    // @ts-expect-error TS(2339): Property 'resource' does not exist on type '{ x: n... Remove this comment to see the full error message
    if (image.resource) {
      // @ts-expect-error TS(2339): Property 'resource' does not exist on type '{ x: n... Remove this comment to see the full error message
      cropRect.x *= image.resource.width;
      // @ts-expect-error TS(2339): Property 'resource' does not exist on type '{ x: n... Remove this comment to see the full error message
      cropRect.y *= image.resource.height;
      // @ts-expect-error TS(2339): Property 'resource' does not exist on type '{ x: n... Remove this comment to see the full error message
      cropRect.width *= image.resource.width;
      // @ts-expect-error TS(2339): Property 'resource' does not exist on type '{ x: n... Remove this comment to see the full error message
      cropRect.height *= image.resource.height;

      // create a canvas with the correct dimensions
      const canvas = document.createElement("canvas");

      if (this.isVertical()) {
        canvas.width = cropRect.height;
        canvas.height = cropRect.width;
      } else {
        canvas.width = cropRect.width;
        canvas.height = cropRect.height;
      }

      // draw the full-size image at the correct position,
      // the image gets truncated to the size of the canvas.
      const context = canvas.getContext("2d");

      // @ts-expect-error TS(2531): Object is possibly 'null'.
      context.translate(canvas.width / 2, canvas.height / 2);
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      context.rotate((this.props.rotate * Math.PI) / 180);
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      context.translate(-(canvas.width / 2), -(canvas.height / 2));

      if (this.isVertical()) {
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        context.translate(
          (canvas.width - canvas.height) / 2,
          (canvas.height - canvas.width) / 2
        );
      }

      // @ts-expect-error TS(2531): Object is possibly 'null'.
      context.drawImage(image.resource, -cropRect.x, -cropRect.y);

      return canvas;
    }
  }

  /**
   * Get the image scaled to original canvas size.
   * This was default in 4.x and is now kept as a legacy method.
   */
  getImageScaledToCanvas() {
    const { width, height } = this.getDimensions();

    const canvas = document.createElement("canvas");

    if (this.isVertical()) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // don't paint a border here, as it is the resulting image
    this.paintImage(canvas.getContext("2d"), this.state.image, 0, 1);

    return canvas;
  }

  getXScale() {
    // @ts-expect-error TS(2339): Property 'width' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const canvasAspect = this.props.width / this.props.height;
    // @ts-expect-error TS(2339): Property 'width' does not exist on type '{ x: numb... Remove this comment to see the full error message
    const imageAspect = this.state.image.width / this.state.image.height;

    return Math.min(1, canvasAspect / imageAspect);
  }

  getYScale() {
    // @ts-expect-error TS(2339): Property 'height' does not exist on type 'Readonly... Remove this comment to see the full error message
    const canvasAspect = this.props.height / this.props.width;
    // @ts-expect-error TS(2339): Property 'height' does not exist on type '{ x: num... Remove this comment to see the full error message
    const imageAspect = this.state.image.height / this.state.image.width;

    return Math.min(1, canvasAspect / imageAspect);
  }

  getCroppingRect() {
    // @ts-expect-error TS(2339): Property 'position' does not exist on type 'Readon... Remove this comment to see the full error message
    const position = this.props.position || {
      x: this.state.image.x,
      y: this.state.image.y,
    };
    // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const width = (1 / this.props.scale) * this.getXScale();
    // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const height = (1 / this.props.scale) * this.getYScale();

    const croppingRect = {
      x: position.x - width / 2,
      y: position.y - height / 2,
      width,
      height,
    };

    let xMin = 0;
    let xMax = 1 - croppingRect.width;
    let yMin = 0;
    let yMax = 1 - croppingRect.height;

    // If the cropping rect is larger than the image, then we need to change
    // our maxima & minima for x & y to allow the image to appear anywhere up
    // to the very edge of the cropping rect.
    const isLargerThanImage =
      // @ts-expect-error TS(2339): Property 'disableBoundaryChecks' does not exist on... Remove this comment to see the full error message
      this.props.disableBoundaryChecks || width > 1 || height > 1;

    if (isLargerThanImage) {
      xMin = -croppingRect.width;
      xMax = 1;
      yMin = -croppingRect.height;
      yMax = 1;
    }

    return {
      ...croppingRect,
      x: Math.max(xMin, Math.min(croppingRect.x, xMax)),
      y: Math.max(yMin, Math.min(croppingRect.y, yMax)),
    };
  }

  loadImage(image: any) {
    if (isFileAPISupported && image instanceof File) {
      this.loadingImage = makeCancelable(loadImageFile(image))
        .promise.then(this.handleImageReady)
        // @ts-expect-error TS(2339): Property 'onLoadFailure' does not exist on type 'R... Remove this comment to see the full error message
        .catch(this.props.onLoadFailure);
    } else if (typeof image === "string") {
      this.loadingImage = makeCancelable(
        // @ts-expect-error TS(2339): Property 'crossOrigin' does not exist on type 'Rea... Remove this comment to see the full error message
        loadImageURL(image, this.props.crossOrigin)
      )
        .promise.then(this.handleImageReady)
        // @ts-expect-error TS(2339): Property 'onLoadFailure' does not exist on type 'R... Remove this comment to see the full error message
        .catch(this.props.onLoadFailure);
    }
  }

  handleImageReady = (image: any) => {
    const imageState = this.getInitialSize(image.width, image.height);
    // @ts-expect-error TS(2339): Property 'resource' does not exist on type '{ heig... Remove this comment to see the full error message
    imageState.resource = image;
    // @ts-expect-error TS(2339): Property 'x' does not exist on type '{ height: any... Remove this comment to see the full error message
    imageState.x = 0.5;
    // @ts-expect-error TS(2339): Property 'y' does not exist on type '{ height: any... Remove this comment to see the full error message
    imageState.y = 0.5;
    // @ts-expect-error TS(2339): Property 'onImageReady' does not exist on type 'Re... Remove this comment to see the full error message
    this.setState({ drag: false, image: imageState }, this.props.onImageReady);
    // @ts-expect-error TS(2339): Property 'onLoadSuccess' does not exist on type 'R... Remove this comment to see the full error message
    this.props.onLoadSuccess(imageState);
  };

  getInitialSize(width: any, height: any) {
    let newHeight;
    let newWidth;

    const dimensions = this.getDimensions();
    const canvasRatio = dimensions.height / dimensions.width;
    const imageRatio = height / width;

    if (canvasRatio > imageRatio) {
      newHeight = this.getDimensions().height;
      newWidth = width * (newHeight / height);
    } else {
      newWidth = this.getDimensions().width;
      newHeight = height * (newWidth / width);
    }

    return {
      height: newHeight,
      width: newWidth,
    };
  }

  clearImage = () => {
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setState({
      image: defaultEmptyImage,
    });
  };

  paintImage(context: any, image: any, border: any, scaleFactor = pixelRatio) {
    if (image.resource) {
      const position = this.calculatePosition(image, border);

      context.save();

      context.translate(context.canvas.width / 2, context.canvas.height / 2);
      // @ts-expect-error TS(2339): Property 'rotate' does not exist on type 'Readonly... Remove this comment to see the full error message
      context.rotate((this.props.rotate * Math.PI) / 180);
      context.translate(
        -(context.canvas.width / 2),
        -(context.canvas.height / 2)
      );

      if (this.isVertical()) {
        context.translate(
          (context.canvas.width - context.canvas.height) / 2,
          (context.canvas.height - context.canvas.width) / 2
        );
      }

      context.scale(scaleFactor, scaleFactor);

      context.globalCompositeOperation = "destination-over";
      context.drawImage(
        image.resource,
        position.x,
        position.y,
        position.width,
        position.height
      );

      context.restore();
    }
  }

  calculatePosition(image: any, border: any) {
    image = image || this.state.image;

    const [borderX, borderY] = this.getBorders(border);

    const croppingRect = this.getCroppingRect();

    // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const width = image.width * this.props.scale;
    // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const height = image.height * this.props.scale;

    let x = -croppingRect.x * width;
    let y = -croppingRect.y * height;

    if (this.isVertical()) {
      x += borderY;
      y += borderX;
    } else {
      x += borderX;
      y += borderY;
    }

    return {
      x,
      y,
      height,
      width,
    };
  }

  paint(context: any) {
    context.save();
    context.scale(pixelRatio, pixelRatio);
    context.translate(0, 0);
    // @ts-expect-error TS(2339): Property 'color' does not exist on type 'Readonly<... Remove this comment to see the full error message
    context.fillStyle = "rgba(" + this.props.color.slice(0, 4).join(",") + ")";

    // @ts-expect-error TS(2339): Property 'borderRadius' does not exist on type 'Re... Remove this comment to see the full error message
    let borderRadius = this.props.borderRadius;
    const dimensions = this.getDimensions();
    const [borderSizeX, borderSizeY] = this.getBorders(dimensions.border);
    // @ts-expect-error TS(2339): Property 'height' does not exist on type '{}'.
    const height = dimensions.canvas.height;
    // @ts-expect-error TS(2339): Property 'width' does not exist on type '{}'.
    const width = dimensions.canvas.width;

    // clamp border radius between zero (perfect rectangle) and half the size without borders (perfect circle or "pill")
    borderRadius = Math.max(borderRadius, 0);
    borderRadius = Math.min(
      borderRadius,
      width / 2 - borderSizeX,
      height / 2 - borderSizeY
    );

    context.beginPath();
    // inner rect, possibly rounded
    drawRoundedRect(
      context,
      borderSizeX,
      borderSizeY,
      width - borderSizeX * 2,
      height - borderSizeY * 2,
      borderRadius
    );
    context.rect(width, 0, -width, height); // outer rect, drawn "counterclockwise"
    context.fill("evenodd");

    context.restore();
  }

  handleMouseDown = (e: any) => {
    e = e || window.event;
    // if e is a touch event, preventDefault keeps
    // corresponding mouse events from also being fired
    // later.
    e.preventDefault();
    this.setState({
      drag: true,
      mx: null,
      my: null,
    });
  };
  handleMouseUp = () => {
    if (this.state.drag) {
      this.setState({ drag: false });
      // @ts-expect-error TS(2339): Property 'onMouseUp' does not exist on type 'Reado... Remove this comment to see the full error message
      this.props.onMouseUp();
    }
  };

  handleMouseMove = (e: any) => {
    e = e || window.event;
    if (this.state.drag === false) {
      return;
    }

    e.preventDefault(); // stop scrolling on iOS Safari

    const mousePositionX = e.targetTouches
      ? e.targetTouches[0].pageX
      : e.clientX;
    const mousePositionY = e.targetTouches
      ? e.targetTouches[0].pageY
      : e.clientY;

    const newState = {
      mx: mousePositionX,
      my: mousePositionY,
    };

    // @ts-expect-error TS(2339): Property 'rotate' does not exist on type 'Readonly... Remove this comment to see the full error message
    let rotate = this.props.rotate;

    rotate %= 360;
    rotate = rotate < 0 ? rotate + 360 : rotate;

    if (this.state.mx && this.state.my) {
      const mx = this.state.mx - mousePositionX;
      const my = this.state.my - mousePositionY;

      // @ts-expect-error TS(2339): Property 'width' does not exist on type '{ x: numb... Remove this comment to see the full error message
      const width = this.state.image.width * this.props.scale;
      // @ts-expect-error TS(2339): Property 'height' does not exist on type '{ x: num... Remove this comment to see the full error message
      const height = this.state.image.height * this.props.scale;

      let { x: lastX, y: lastY } = this.getCroppingRect();

      lastX *= width;
      lastY *= height;

      // helpers to calculate vectors
      const toRadians = (degree: any) => degree * (Math.PI / 180);
      const cos = Math.cos(toRadians(rotate));
      const sin = Math.sin(toRadians(rotate));

      const x = lastX + mx * cos + my * sin;
      const y = lastY + -mx * sin + my * cos;

      // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
      const relativeWidth = (1 / this.props.scale) * this.getXScale();
      // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
      const relativeHeight = (1 / this.props.scale) * this.getYScale();

      const position = {
        x: x / width + relativeWidth / 2,
        y: y / height + relativeHeight / 2,
      };

      // @ts-expect-error TS(2339): Property 'onPositionChange' does not exist on type... Remove this comment to see the full error message
      this.props.onPositionChange(position);

      // @ts-expect-error TS(2339): Property 'image' does not exist on type '{ mx: any... Remove this comment to see the full error message
      newState.image = {
        ...this.state.image,
        ...position,
      };
    }

    this.setState(newState);

    // @ts-expect-error TS(2339): Property 'onMouseMove' does not exist on type 'Rea... Remove this comment to see the full error message
    this.props.onMouseMove(e);
  };

  setCanvas = (canvas: any) => {
    this.canvas = canvas;
  };

  render() {
    const {
      // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
      scale,
      // @ts-expect-error TS(2339): Property 'rotate' does not exist on type 'Readonly... Remove this comment to see the full error message
      rotate,
      // @ts-expect-error TS(2339): Property 'image' does not exist on type 'Readonly<... Remove this comment to see the full error message
      image,
      // @ts-expect-error TS(2339): Property 'border' does not exist on type 'Readonly... Remove this comment to see the full error message
      border,
      // @ts-expect-error TS(2339): Property 'borderRadius' does not exist on type 'Re... Remove this comment to see the full error message
      borderRadius,
      // @ts-expect-error TS(2339): Property 'width' does not exist on type 'Readonly<... Remove this comment to see the full error message
      width,
      // @ts-expect-error TS(2339): Property 'height' does not exist on type 'Readonly... Remove this comment to see the full error message
      height,
      // @ts-expect-error TS(2339): Property 'position' does not exist on type 'Readon... Remove this comment to see the full error message
      position,
      // @ts-expect-error TS(2339): Property 'color' does not exist on type 'Readonly<... Remove this comment to see the full error message
      color,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      // eslint-disable-next-line react/prop-types
      style,
      // @ts-expect-error TS(2339): Property 'crossOrigin' does not exist on type 'Rea... Remove this comment to see the full error message
      crossOrigin,
      // @ts-expect-error TS(2339): Property 'onLoadFailure' does not exist on type 'R... Remove this comment to see the full error message
      onLoadFailure,
      // @ts-expect-error TS(2339): Property 'onLoadSuccess' does not exist on type 'R... Remove this comment to see the full error message
      onLoadSuccess,
      // @ts-expect-error TS(2339): Property 'onImageReady' does not exist on type 'Re... Remove this comment to see the full error message
      onImageReady,
      // @ts-expect-error TS(2339): Property 'onImageChange' does not exist on type 'R... Remove this comment to see the full error message
      onImageChange,
      // @ts-expect-error TS(2339): Property 'onMouseUp' does not exist on type 'Reado... Remove this comment to see the full error message
      onMouseUp,
      // @ts-expect-error TS(2339): Property 'onMouseMove' does not exist on type 'Rea... Remove this comment to see the full error message
      onMouseMove,
      // @ts-expect-error TS(2339): Property 'onPositionChange' does not exist on type... Remove this comment to see the full error message
      onPositionChange,
      // @ts-expect-error TS(2339): Property 'disableBoundaryChecks' does not exist on... Remove this comment to see the full error message
      disableBoundaryChecks,
      // @ts-expect-error TS(2339): Property 'disableHiDPIScaling' does not exist on t... Remove this comment to see the full error message
      disableHiDPIScaling,
      // @ts-expect-error TS(2339): Property 'disableCanvasRotation' does not exist on... Remove this comment to see the full error message
      disableCanvasRotation,
      ...rest
    } = this.props;

    const dimensions = this.getDimensions();
    const defaultStyle = {
      // @ts-expect-error TS(2339): Property 'width' does not exist on type '{}'.
      width: dimensions.canvas.width,
      // @ts-expect-error TS(2339): Property 'height' does not exist on type '{}'.
      height: dimensions.canvas.height,
      cursor: this.state.drag ? "grabbing" : "grab",
      touchAction: "none",
    };

    const attributes = {
      // @ts-expect-error TS(2339): Property 'width' does not exist on type '{}'.
      width: dimensions.canvas.width * pixelRatio,
      // @ts-expect-error TS(2339): Property 'height' does not exist on type '{}'.
      height: dimensions.canvas.height * pixelRatio,
      style: {
        ...defaultStyle,
        ...style,
      },
    };

    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    attributes[deviceEvents.react.down] = this.handleMouseDown;
    if (isTouchDevice) {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      attributes[deviceEvents.react.mouseDown] = this.handleMouseDown;
    }

    return <canvas ref={this.setCanvas} {...attributes} {...rest} />;
  }
}

export default AvatarEditor;
