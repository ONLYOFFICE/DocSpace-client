export const CommonTheme = {
  rtlFontIncreaseValue: 2,
  interfaceDirection: "ltr",

  getCorrectFontSize: function (currentValue: any) {
    if (
      !currentValue ||
      currentValue === "0px" ||
      this.interfaceDirection !== "rtl"
    ) {
      return currentValue;
    }

    let numberValue = 0;

    if (typeof currentValue === "string") {
      numberValue = +currentValue.replace("px", "");
    }

    if (typeof currentValue === "number") {
      numberValue = currentValue;
    }

    return numberValue + this.rtlFontIncreaseValue + "px";
  },
};
