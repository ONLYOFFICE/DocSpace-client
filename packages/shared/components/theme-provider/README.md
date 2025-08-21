# ThemeProvider

Custom theme provider based on [Theme Provider](https://www.styled-components.com/docs/advanced).

List of themes:

- [Base theme](https://dotnet.onlyoffice.com:8084/?path=/story/components-themeprovider--base-theme)
- [Dark theme](https://dotnet.onlyoffice.com:8084/?path=/story/components-themeprovider--dark-theme)

You can change the CSS styles in the theme, and they will be applied to all children components of ThemeProvider

### Usage

```tsx
import ThemeProvider from "@docspace/shared/components/theme-provider";
import { Base, Dark } from "@docspace/shared/themes";

// Basic usage with default theme
const App = () => (
  <ThemeProvider theme={Base}>
    <YourApp />
  </ThemeProvider>
);

// Using dark theme with custom color scheme
const AppWithColorScheme = () => (
  <ThemeProvider
    theme={Dark}
    currentColorScheme={{
      main: {
        accent: "#333333",
        buttons: "#0F4071",
      },
      text: {
        accent: "#333333",
        buttons: "#FFFFFF",
      },
    }}
  >
    <YourApp />
  </ThemeProvider>
);
```

### ThemeProvider Properties

| Props                |        Type         | Required | Values |    Default    | Description                                     |
| -------------------- | :-----------------: | :------: | :----: | :-----------: | ----------------------------------------------- |
| `theme`              |      `object`       |    ✅    |   -    | `Base styles` | Applies a theme to all children components      |
| `currentColorScheme` | `object`, `boolean` |    ✅    |   -    |       -       | Applies a colorTheme to all children components |
