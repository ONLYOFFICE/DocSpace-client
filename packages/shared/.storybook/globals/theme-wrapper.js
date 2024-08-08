import PropTypes from "prop-types";
import { ThemeProvider } from "../../components/theme-provider";
import { globalColors } from "../../themes";

const ThemeWrapper = ({ theme, children }) => {
  return (
    <ThemeProvider
      theme={theme}
      currentColorScheme={{
        main: {
          accent: globalColors.lightBlueMain,
          buttons: globalColors.lightSecondMain,
        },
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
