import { DefaultTheme } from "styled-components";

import { Base } from "../themes";

interface PropsWithTheme {
  theme?: DefaultTheme;
  [key: string]: unknown;
}
/**
 * pass this to styled component's attrs to set Base theme as default prop
 * */
export const injectDefaultTheme = (props: PropsWithTheme) => ({
  theme: props.theme || Base,
});
