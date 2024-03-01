import { useRef, useState, useEffect } from "react";

const useFitText = (
  campaignImage: string,
  currentFontSize: string = "13px",
) => {
  const ref: React.RefObject<HTMLDivElement> = useRef(null);

  const [fontSize, setFontSize] = useState(parseInt(currentFontSize, 10));

  useEffect(() => {
    setFontSize(parseInt(currentFontSize, 10));
  }, [campaignImage, currentFontSize]);

  useEffect(() => {
    const isOverflow =
      !!ref.current && ref.current.scrollHeight > ref.current.offsetHeight;

    if (isOverflow) {
      setFontSize((prevFontSize) => prevFontSize - 1);
    }
  }, [currentFontSize, fontSize, ref?.current?.scrollHeight]);

  return { fontSize: `${fontSize}px`, ref };
};

export default useFitText;
