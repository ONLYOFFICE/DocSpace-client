# IconButton

A versatile button component that displays an icon and handles various interaction states.

## Features

- Supports hover and click states with different icons and colors
- Customizable size and colors
- Supports both fill and stroke styles
- Touch device support
- Tooltip support
- Custom icon node support
- Comprehensive mouse event handling

## Usage

```js
import { IconButton } from "@docspace/shared/components/icon-button";
import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
```

### Basic Usage

```jsx
<IconButton
  size={25}
  iconName={SearchReactSvgUrl}
  onClick={() => console.log("Clicked")}
/>
```

### With Hover and Click States

```jsx
<IconButton
  iconName={SearchReactSvgUrl}
  iconHoverName={EyeReactSvgUrl}
  iconClickName={InfoReactSvgUrl}
  color="#333"
  hoverColor="#666"
  clickColor="#999"
  onClick={() => console.log("Clicked")}
/>
```

### With Custom Icon Node

```jsx
<IconButton
  size={25}
  iconNode={<CustomIcon />}
  onClick={() => console.log("Clicked")}
/>
```

### With Tooltip

```jsx
<IconButton
  iconName={SearchReactSvgUrl}
  dataTip="Search"
  title="Search button"
/>
```

## Properties

| Props           |      Type       | Required | Default | Description                         |
| --------------- | :-------------: | :------: | :-----: | ----------------------------------- |
| `className`     |    `string`     |    -     |    -    | Custom CSS class                    |
| `color`         |    `string`     |    -     |    -    | Default icon color                  |
| `hoverColor`    |    `string`     |    -     |    -    | Icon color on hover                 |
| `clickColor`    |    `string`     |    -     |    -    | Icon color on click                 |
| `size`          |    `number`     |    -     |   25    | Button size (width and height)      |
| `isFill`        |    `boolean`    |    -     |  true   | Whether to fill the icon            |
| `isStroke`      |    `boolean`    |    -     |  false  | Whether to apply stroke to the icon |
| `isDisabled`    |    `boolean`    |    -     |  false  | Disables the button                 |
| `isClickable`   |    `boolean`    |    -     |  false  | Shows clickable cursor              |
| `iconNode`      |   `ReactNode`   |    -     |    -    | Custom icon component               |
| `iconName`      |    `string`     |    -     |    -    | Main icon URL/path                  |
| `iconHoverName` |    `string`     |    -     |    -    | Icon URL/path for hover state       |
| `iconClickName` |    `string`     |    -     |    -    | Icon URL/path for click state       |
| `onClick`       |   `function`    |    -     |    -    | Click handler                       |
| `onMouseEnter`  |   `function`    |    -     |    -    | Mouse enter handler                 |
| `onMouseDown`   |   `function`    |    -     |    -    | Mouse down handler                  |
| `onMouseUp`     |   `function`    |    -     |    -    | Mouse up handler                    |
| `onMouseLeave`  |   `function`    |    -     |    -    | Mouse leave handler                 |
| `id`            |    `string`     |    -     |    -    | Button ID                           |
| `style`         | `CSSProperties` |    -     |    -    | Custom inline styles                |
| `dataTip`       |    `string`     |    -     |    -    | Tooltip text                        |
| `title`         |    `string`     |    -     |    -    | HTML title attribute                |

## Touch Device Support

The component automatically detects touch devices and adjusts its behavior accordingly:

- On touch devices, hover states are disabled
- Click states are handled appropriately for touch interactions

## Accessibility

The component supports:

- Keyboard navigation
- ARIA attributes
- Title tooltips
- Disabled states

## Examples

### Search Button with Hover Effect

```jsx
<IconButton
  iconName={SearchReactSvgUrl}
  iconHoverName={SearchHoverSvgUrl}
  size={25}
  hoverColor="#0066cc"
  title="Search"
  dataTip="Click to search"
/>
```

### Disabled Button

```jsx
<IconButton
  iconName={EditSvgUrl}
  isDisabled={true}
  size={20}
  title="Edit disabled"
/>
```

### Custom Styled Button

```jsx
<IconButton
  iconName={CustomSvgUrl}
  style={{ margin: "8px", borderRadius: "4px" }}
  className="custom-icon-button"
  isFill={false}
  isStroke={true}
/>
```
