import { useRef, useState, useEffect } from "react";

const useFitText = (
  campaignImage: string,
  currentFontSize: string = "13px",
) => {
  const ref = useRef(null);

  const [fontSize, setFontSize] = useState(13);

  useEffect(() => {
    const cfs = Number(currentFontSize.replace("px", ""));
    setFontSize(cfs);
  }, [currentFontSize, campaignImage]);

  useEffect(() => {
    const isOverflow =
      !!ref.current && ref.current.scrollHeight > ref.current.offsetHeight;

    if (isOverflow) {
      setFontSize(fontSize - 1);
    }
  }, [currentFontSize, fontSize, ref?.current?.scrollHeight]);

  return { fontSize: `${fontSize}px`, ref };
};

export default useFitText;
