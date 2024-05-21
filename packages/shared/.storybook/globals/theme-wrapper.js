import PropTypes from "prop-types";
import { ThemeProvider } from "../../components/theme-provider";

const ThemeWrapper = ({ theme, children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

ThemeWrapper.propTypes = {
  theme: PropTypes.any,
};

export default ThemeWrapper;
