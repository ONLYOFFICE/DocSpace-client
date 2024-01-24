# ColorInput

Color input

### Usage

```js
import { ColorInput } from "@docspace/shared/components/color-input";
```

```jsx
<ColorInput
  defaultColor="#4781D1"
  handleChange={(color) => console.log(color)}
/>
```

#### Properties

| Props          |   Type   | Required | Values | Default | Description                                          |
| -------------- | :------: | :------: | :----: | :-----: | ---------------------------------------------------- |
| `className`    | `string` |    -     |   -    |   ''    | Allows to set classname                              |
| `id`           | `string` |    -     |   -    |   ''    | Allows to set id                                     |
| `defaultColor` | `string` |    -     |   -    |    -    | Default color                                        |
| `handleChange` |  `func`  |    -     |   -    |    -    | Allows handling the changing values of the component |
| `size`         |  `bool`  |    -     |   -    |    -    | Supported size of the input fields.                  |
| `scale`        |  `bool`  |    -     |   -    |    -    | Indicates the input field has scale                  |
| `isDisabled`   |  `bool`  |    -     |   -    |    -    | Indicates that the field cannot be used              |
| `hasError`     |  `bool`  |    -     |   -    |    -    | Indicates the input field has an error               |
| `hasWarning`   |  `bool`  |    -     |   -    |    -    | Indicates the input field has a warning              |
