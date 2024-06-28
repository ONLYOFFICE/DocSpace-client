import { useEffect } from "react";

const Watermark = ({
  text,
  rotate,
  image,
  color,

  isSemitransparent,

  children,
}) => {
  const setCtxText = (ctx) => {
    const getColor = () => {
      if (color)
        return Array.isArray(color)
          ? `rgb(${color[0]}, ${color[1]}, ${color[2]}, 1)`
          : color;

      if (isSemitransparent) return "rgba(223, 226, 227, 1)";

      return "rgba(208, 213, 218, 1)";
    };

    ctx.fillStyle = getColor();
    ctx.textAlign = "center";
    ctx.font = `${13}px Arial`;
  };

  const setCtxCenteredText = (imgContent, ctx) => {
    ctx.translate(imgContent.width / 2, imgContent.height / 2);
  };

  const setCtxRotate = (ctx) => {
    const angle = (Math.PI / 180) * Number(rotate);
    ctx.rotate(angle);
  };

  const setCtxTextWrap = (ctx, canvas) => {
    let line = "",
      marginTop = 0,
      marginLeft = 0,
      lineHeight = 15;

    for (var n = 0; n < text.length; n++) {
      let testLine = line + text[n];
      let testWidth = ctx.measureText(testLine).width;

      const percentWidth = ((canvas.width - testWidth) * 100) / canvas.width;

      if (
        (percentWidth < 32 && text[n] === " ") ||
        testWidth > canvas.width - 4
      ) {
        ctx.fillText(line, marginLeft, marginTop);
        line = text[n];
        marginTop += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, marginLeft, marginTop);
  };

  const getContent = (canvas, ctx, imgContent, imgWidth, imgHeight) => {
    setCtxText(ctx);

    ctx.drawImage(imgContent, 0, 0, imgWidth, imgHeight);

    setCtxCenteredText(imgContent, ctx);
    setCtxRotate(ctx);
    setCtxTextWrap(ctx, canvas);
  };

  const drawCanvas = (drawContent, ctx, canvas) => {
    canvas.width = drawContent.naturalWidth;
    canvas.height = drawContent.naturalHeight;

    getContent(
      canvas,
      ctx,
      drawContent || "",
      drawContent.naturalWidth,
      drawContent.naturalHeight
    );
  };

  const renderWatermark = () => {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();

    img.onload = () => {
      drawCanvas(img, ctx, canvas);
    };
    img.onerror = () => {
      drawCanvas(text);
    };
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    img.src = image;
  };

  useEffect(() => {
    renderWatermark();
  }, [text, rotate, isSemitransparent]);

  return (
    <canvas>
      <div>{children}</div>
    </canvas>
  );
};
export default Watermark;
