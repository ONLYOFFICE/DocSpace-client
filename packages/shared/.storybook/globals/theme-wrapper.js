import PropTypes from "prop-types";
import { ThemeProvider } from "../../components/theme-provider";

const ThemeWrapper = ({ theme, children }) => {
  return (
    <ThemeProvider
      theme={theme}
      currentColorScheme={{
        main: { accent: "#4781D1", buttons: "#5299E0" },
      }}
    >
      {children}
    </ThemeProvider>
  );
};

ThemeWrapper.propTypes = {
  theme: PropTypes.any,
};

export default ThemeWrapper;
