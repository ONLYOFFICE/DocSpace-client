export const CommonTheme = {
  rtlFontIncreaseValue: 2,
  interfaceDirection: "ltr",

  getCorrectFontSize: function (currentValue) {
    if (
      !currentValue ||
      currentValue === "0px" ||
      this.interfaceDirection !== "rtl"
    ) {
      return currentValue;
    }

    const cleanValue = currentValue.replace("px", "");

    return Number(cleanValue) + this.rtlFontIncreaseValue + "px";
  },
};
