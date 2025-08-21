# Button

A versatile button component that supports various states, sizes, and styling options.

## Installation

```bash
import { Button } from "@docspace/shared/components/button";
```

## Usage

```jsx
// Basic usage
<Button
  label="Click me"
  onClick={() => console.log("Button clicked")}
/>

// Primary button with icon
<Button
  primary
  label="Submit"
  icon={<IconComponent />}
  onClick={handleSubmit}
/>

// Loading state
<Button
  label="Loading..."
  isLoading
  disabled
/>

// Full width button
<Button
  label="Full Width"
  scale
  size={ButtonSize.normal}
/>
```

## Properties

| Prop           | Type                                               | Default    | Description                                                                                                                        |
| -------------- | -------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `label`        | `string`                                           | -          | Text content displayed inside the button                                                                                           |
| `title`        | `string`                                           | -          | Tooltip text shown on hover                                                                                                        |
| `primary`      | `boolean`                                          | `false`    | When true, applies primary button styling with brand colors                                                                        |
| `size`         | `ButtonSize`                                       | `normal`   | Controls button dimensions (`extraSmall`, `small`, `normal`, `medium`). Normal size is 36px height on Desktop, 40px on Touchscreen |
| `scale`        | `boolean`                                          | `false`    | When true, button width expands to fill its container (width: 100%)                                                                |
| `icon`         | `ReactNode`                                        | -          | Optional icon element rendered before the label                                                                                    |
| `tabIndex`     | `number`                                           | -          | Overrides the default tab order of the button                                                                                      |
| `className`    | `string`                                           | -          | Additional CSS classes to apply                                                                                                    |
| `id`           | `string`                                           | -          | HTML id attribute                                                                                                                  |
| `style`        | `CSSProperties`                                    | -          | Custom inline styles                                                                                                               |
| `isHovered`    | `boolean`                                          | `false`    | Forces hover state display                                                                                                         |
| `isClicked`    | `boolean`                                          | `false`    | Forces active/clicked state display                                                                                                |
| `isDisabled`   | `boolean`                                          | `false`    | Disables button interactions                                                                                                       |
| `isLoading`    | `boolean`                                          | `false`    | Shows loading spinner and disables button                                                                                          |
| `minWidth`     | `string`                                           | -          | Sets minimum button width (CSS value)                                                                                              |
| `onClick`      | `(e: React.MouseEvent<HTMLButtonElement>) => void` | -          | Click event handler                                                                                                                |
| `type`         | `'button' \| 'submit' \| 'reset'`                  | `'button'` | HTML button type attribute                                                                                                         |

## Examples

### Different Sizes

```jsx
<>
  <Button size={ButtonSize.extraSmall} label="Extra Small" />
  <Button size={ButtonSize.small} label="Small" />
  <Button size={ButtonSize.normal} label="Normal" />
  <Button size={ButtonSize.medium} label="Medium" />
</>
```

### States

```jsx
<>
  <Button primary label="Primary" />
  <Button isDisabled label="Disabled" />
  <Button isLoading label="Loading" />
  <Button isHovered label="Hover State" />
</>
```

### With Icon

```jsx
<Button icon={<Icon />} label="With Icon" primary />
```

### Full Width

```jsx
<Button scale label="Full Width Button" minWidth="200px" />
```
