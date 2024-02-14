# ColorPicker

Color picker dialog

### Usage

```js
import { ColorPicker } from "@docspace/shared/components/color-picker";
```

```jsx
<ColorPicker
  appliedColor="#4781D1"
  onApply={(color) => console.log(color)}
  onClose={() => hideColorPicker()}
  applyButtonLabel="Apply"
  cancelButtonLabel="Cancel"
/>
```

#### Properties

| Props               |   Type   | Required | Values |  Default  | Description                                          |
| ------------------- | :------: | :------: | :----: | :-------: | ---------------------------------------------------- |
| `className`         | `string` |    -     |   -    |    ''     | Allows to set classname                              |
| `id`                | `string` |    -     |   -    |    ''     | Allows to set id                                     |
| `appliedColor`      | `string` |    -     |   -    | '#4781D1' | Selected color                                       |
| `onApply`           |  `func`  |    -     |   -    |     -     | Triggers function on color apply                     |
| `onClose`           |  `func`  |    -     |   -    |     -     | Triggers function on color picker close              |
| `applyButtonLabel`  | `string` |    -     |   -    |     -     | Apply button text                                    |
| `cancelButtonLabel` | `string` |    -     |   -    |     -     | Cancel button text                                   |
| `handleChange`      |  `func`  |    -     |   -    |     -     | Allows handling the changing values of the component |
