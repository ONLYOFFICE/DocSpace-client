import { DefaultTheme } from "styled-components";
import isEmpty from "lodash/isEmpty";

import { Base } from "../themes";

interface PropsWithTheme {
  theme?: DefaultTheme;
  [key: string]: unknown;
}
/**
 * pass this to styled component's attrs to set Base theme as default prop
 * */
export const injectDefaultTheme = ({ theme }: PropsWithTheme) => ({
  theme: theme && !isEmpty(theme) ? theme : Base,
});
