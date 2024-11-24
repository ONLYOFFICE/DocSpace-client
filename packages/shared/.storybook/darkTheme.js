import { create } from "@storybook/theming/create";
import Logo from "../../../public/images/logo/dark_lightsmall.svg?url";
import { globalColors } from "../themes";

export default create({
  base: "dark",
  appBg: globalColors.black,

  brandTitle: "ONLYOFFICE",
  brandUrl: "https://www.onlyoffice.com/docspace.aspx",
  brandImage: Logo,
  brandTarget: "_self",
});
