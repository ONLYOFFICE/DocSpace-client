# ToggleButton

A customizable toggle button component that supports various states and styling options.

## Usage

```jsx
import { ToggleButton } from "@docspace/components";

const MyComponent = () => {
  const [isChecked, setIsChecked] = React.useState(false);

  const handleChange = (e) => {
    setIsChecked(e.target.checked);
  };

  return (
    <ToggleButton
      label="Toggle me"
      isChecked={isChecked}
      onChange={handleChange}
    />
  );
};
```

## Properties

| Name        | Type                                    | Default | Description                    |
|-------------|-----------------------------------------|---------|--------------------------------|
| id          | string                                  | -       | Element ID                     |
| className   | string                                  | -       | CSS class name                 |
| style       | CSSProperties                           | -       | Inline styles                  |
| name        | string                                  | -       | Input name attribute           |
| label       | string                                  | -       | Label text                     |
| isChecked   | boolean                                 | false   | Checked state                  |
| isDisabled  | boolean                                 | false   | Disabled state                 |
| isLoading   | boolean                                 | false   | Loading state                  |
| noAnimation | boolean                                 | false   | Disables animation effects     |
| onChange    | (e: ChangeEvent<HTMLInputElement>) => void | -    | Change event handler          |
| fontWeight  | number                                  | -       | Label font weight              |
| fontSize    | string                                  | -       | Label font size                |

## Styling

The component uses CSS modules with CSS variables for theming. Key variables include:

```css
--toggle-button-fill-color-default
--toggle-button-fill-color-off
--toggle-button-hover-fill-color-off
--toggle-button-fill-circle-color
--toggle-button-fill-circle-color-off
--toggle-button-text-color
--toggle-button-text-disable-color
```

## Examples

### Basic Usage
```jsx
<ToggleButton label="Basic toggle" />
```

### With Custom Styling
```jsx
<ToggleButton
  label="Custom styled"
  fontSize="16px"
  fontWeight={600}
  style={{ padding: "8px" }}
/>
```

### Disabled State
```jsx
<ToggleButton
  label="Disabled toggle"
  isDisabled={true}
/>
```

### Loading State
```jsx
<ToggleButton
  label="Loading"
  isLoading={true}
/>
```

### Without Animation
```jsx
<ToggleButton
  label="No animation"
  noAnimation={true}
/>
