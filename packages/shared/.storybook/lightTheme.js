import { create } from "@storybook/theming/create";

import Logo from "../../../public/images/logo/lightsmall.svg?url";

export default create({
  base: "light",

  brandTitle: "ONLYOFFICE",
  brandUrl: "https://www.onlyoffice.com/docspace.aspx",
  brandImage: Logo,
  brandTarget: "_self",
});
