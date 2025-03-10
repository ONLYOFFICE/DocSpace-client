# Checkbox

A customizable checkbox input component with support for indeterminate state and custom styling.

### Usage

```js
import { Checkbox } from "@docspace/shared/components/checkbox";
```

Basic usage:

```jsx
<Checkbox
  id="basic-checkbox"
  name="basic"
  value="value"
  label="Basic Checkbox"
  isChecked={false}
  onChange={(e) => console.log(e.target.checked)}
/>
```

With indeterminate state:

```jsx
<Checkbox
  label="Indeterminate Checkbox"
  isIndeterminate
  onChange={handleChange}
/>
```

With error state and help button:

```jsx
<Checkbox
  label="Checkbox with Error"
  hasError
  helpButton={<InfoIcon />}
  onChange={handleChange}
/>
```

### Properties

| Props             |              Type              | Required | Default | Description                                                |
| ----------------- | :----------------------------: | :------: | :-----: | ---------------------------------------------------------- |
| `className`       |            `string`            |    -     |    -    | Additional CSS class for styling                           |
| `hasError`        |           `boolean`            |    -     | `false` | Displays the checkbox in an error state                    |
| `helpButton`      |          `ReactNode`           |    -     |    -    | Custom help button element to display next to the checkbox |
| `id`              |            `string`            |    -     |    -    | HTML id attribute for the input element                    |
| `isChecked`       |           `boolean`            |    -     | `false` | Controls the checked state of the checkbox                 |
| `isDisabled`      |           `boolean`            |    -     | `false` | Disables the checkbox input                                |
| `isIndeterminate` |           `boolean`            |    -     | `false` | Shows a rectangle instead of a checkmark when true         |
| `label`           |            `string`            |    -     |    -    | Text label displayed next to the checkbox                  |
| `name`            |            `string`            |    -     |    -    | HTML name attribute for the input element                  |
| `onChange`        |           `function`           |    -     |    -    | Callback fired when the checkbox state changes             |
| `style`           |            `object`            |    -     |    -    | Additional inline styles                                   |
| `tabIndex`        |            `number`            |    -     |   -1    | Tab order of the checkbox                                  |
| `title`           |            `string`            |    -     |    -    | Tooltip text shown on hover                                |
| `truncate`        |           `boolean`            |    -     | `false` | Whether to truncate the label text if it overflows         |
| `value`           | `string \| number \| string[]` |    -     |    -    | Value associated with the checkbox                         |
