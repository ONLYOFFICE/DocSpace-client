# Textarea

Textarea is used for displaying custom textarea and beautified JSON object. It supports line numeration, JSON formatting, copy functionality, and responsive height adjustments.

### Usage

```js
import { Textarea } from "@docspace/shared/components/textarea";
```

```jsx
<Textarea
  placeholder="Add comment"
  onChange={(event) => alert(event.target.value)}
  value="value"
  isJSONField={false}
/>
```

### Properties

| Props               |        Type        | Required | Values |              Default               | Description                                              |
|---------------------| :----------------: | :------: | :----: | :--------------------------------: |----------------------------------------------------------|
| `className`         |      `string`      |    -     |   -    |                 -                  | Class name                                               |
| `wrapperClassName`  |      `string`      |    -     |   -    |                 -                  | Class name for root div                                  |
| `id`                |      `string`      |    -     |   -    |                 -                  | Used as HTML `id` property                               |
| `isDisabled`        |       `bool`       |    -     |   -    |              `false`               | Indicates that the field cannot be used                  |
| `isReadOnly`        |       `bool`       |    -     |   -    |              `false`               | Indicates that the field is displaying read-only content |
| `hasError`          |       `bool`       |    -     |   -    |              `false`               | Indicates the input field has an error                   |
| `name`              |      `string`      |    -     |   -    |                 -                  | Used as HTML `name` property                             |
| `onChange`          |       `func`       |    -     |   -    |                 -                  | Allow you to handle changing events of component         |
| `placeholder`       |      `string`      |    -     |   -    |                " "                 | Placeholder for Textarea                                 |
| `style`             |   `obj`, `array`   |    -     |   -    |                 -                  | Accepts css style                                        |
| `value`             |      `string`      |    -     |   -    |                 ""                 | Value for Textarea                                       |
| `fontSize`          |      `number`      |    -     |   -    |                 13                 | Value for font-size                                      |
| `heightTextArea`    | `string`, `number` |    -     |   -    |                 -                  | Value for height text-area                               |
| `isJSONField`       |       `bool`       |    -     |   -    |              `false`               | Indicates that the field is displaying JSON object       |
| `copyInfoText`      |      `string`      |    -     |   -    | `Content was copied successfully!` | Indicates the text of toast/informational alarm          |
| `enableCopy`        |       `bool`       |    -     |   -    |              `false`               | Enables copy functionality with a button                 |
| `hasNumeration`     |       `bool`       |    -     |   -    |              `false`               | Shows line numbers on the left side                      |
| `heightScale`       |       `bool`       |    -     |   -    |              `false`               | Enables height scaling to 67vh                           |
| `isFullHeight`      |       `bool`       |    -     |   -    |              `false`               | Makes textarea take full height of container             |
| `color`             |      `string`      |    -     |   -    |                 -                  | Text color override                                      |
| `autoFocus`         |       `bool`       |    -     |   -    |              `false`               | Automatically focus the textarea on mount                |
| `areaSelect`        |       `bool`       |    -     |   -    |              `false`               | Automatically select all text on mount                   |
| `tabIndex`          |      `number`      |    -     |   -    |                 -1                 | Tab index for keyboard navigation                        |

### Features

- **RTL Support**: Automatically handles right-to-left text direction
- **JSON Formatting**: Beautifies JSON content when `isJSONField` is true
- **Copy Functionality**: Provides a copy button when `enableCopy` is true
- **Line Numbers**: Shows line numbers when `hasNumeration` is true
- **Adaptive Height**: Supports various height modes (fixed, scaled, full)
- **Accessibility**: Full keyboard navigation and screen reader support
- **Theme Support**: Integrates with the application's theme system
- **Auto-resize**: Automatically adjusts height based on content

### Styling

The component uses SCSS modules for styling and supports theme customization through CSS variables. It includes:

- Common input styles from the shared style system
- Responsive height adjustments
- RTL text direction support
- Custom scrollbar styling
- Focus and error states
- Disabled state styling
