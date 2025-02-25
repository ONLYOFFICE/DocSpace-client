# ViewSelector

A component that allows users to switch between different view modes (e.g., row, tile, some).

### Usage

```js
import { ViewSelector } from "@docspace/shared/components";
import ViewRowsReactSvgUrl from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvgUrl from "PUBLIC_DIR/images/view-tiles.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
```

### View Settings

```js
const viewSettings = [
  {
    value: "row",
    icon: ViewRowsReactSvgUrl,
    id: "row-view",
  },
  {
    value: "tile",
    icon: ViewTilesReactSvgUrl,
    id: "tile-view",
    callback: () => console.log("Tile view callback"),
  },
  {
    value: "some",
    icon: EyeReactSvgUrl,
    id: "some-view",
  },
];
```

```jsx
<ViewSelector
  isDisabled={false}
  onChangeView={(view) => console.log("current view:", view)}
  viewSettings={viewSettings}
  viewAs="row"
  isFilter={false}
  className="custom-view-selector"
  style={{ backgroundColor: "#f5f5f5" }}
/>
```

### Properties

| Props          |      Type       | Required | Values |  Default  | Description                                      |
| -------------- | :-------------: | :------: | :----: | :-------: | ------------------------------------------------ |
| `isDisabled`   |     `bool`     |    -     |   -    |  `false`  | Disables the button functionality                |
| `isFilter`     |     `bool`     |    -     |   -    |  `false`  | Show only one view option at a time              |
| `onChangeView` |     `func`     |    ✓     |   -    |     -     | Callback when view mode changes                  |
| `viewSettings` |     `arr`      |    ✓     |   -    |     -     | Array of view options (see View Settings below)  |
| `viewAs`       |    `string`    |    ✓     |   -    |     -     | Current active view mode                         |
| `className`    |    `string`    |    -     |   -    |     -     | Additional CSS class name                        |
| `style`        | `CSSProperties`|    -     |   -    |     -     | Additional inline styles                         |

### View Settings Properties

| Property   |   Type   | Required | Description                                    |
| ---------- | :------: | :------: | ---------------------------------------------- |
| `value`    | `string` |    ✓     | Unique identifier for the view mode           |
| `icon`     | `string` |    ✓     | URL to the SVG icon                           |
| `id`       | `string` |    -     | Optional ID for the view option               |
| `callback` |  `func`  |    -     | Optional callback when this view is selected  |

### Features

- Supports multiple view modes with customizable icons
- Optional callbacks for individual view modes
- Filter mode to show one option at a time
- Customizable styling through CSS classes and inline styles
- Keyboard accessible
- Internationalization support for tooltips
- Responsive design that adapts to the number of view options
