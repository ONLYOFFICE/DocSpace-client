# RadioButton

The `RadioButton` component allows you to create radio buttons with customizable labels, styles, and behaviors.

### Usage

```js
import { RadioButton } from "@docspace/shared/components/radio-button";
```

```jsx
<RadioButton 
  name="fruits" 
  value="apple" 
  label="Sweet apple" 
  isChecked={false} 
  isDisabled={false} 
  orientation="vertical" 
  spacing="15px" 
  fontSize="14px" 
  fontWeight={400} 
  onChange={(e) => console.log(e.target.value)}
/>
```

### Properties

| Props            |       Type       | Required |          Values          |   Default    | Description                                                                                                                                                                                                       |
| ---------------- | :--------------: | :------: | :----------------------: | :----------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`      |     `string`     |    -     |            -             |      -       | Additional CSS class for the root label element                                                                                                                                                                    |
| `id`             |     `string`     |    -     |            -             |      -       | HTML id attribute for the root label element                                                                                                                                                                       |
| `isChecked`      |     `boolean`    |    -     |            -             |   `false`    | Used as HTML `checked` property for the `<input>` tag                                                                                                                                                              |
| `isDisabled`     |     `boolean`    |    -     |            -             |   `false`    | Used as HTML `disabled` property for the `<input>` tag                                                                                                                                                             |
| `label`          | `ReactNode/string` |    -     |            -             |      -       | Label text or node to display next to the radio button. If not provided, value will be used as label                                                                                                               |
| `fontSize`       |     `string`     |    -     |            -             |      -       | Font size for the label text                                                                                                                                                                                      |
| `fontWeight`     |     `number`     |    -     |            -             |      -       | Font weight for the label text                                                                                                                                                                                    |
| `name`           |     `string`     |   Yes    |            -             |      -       | Used as HTML `name` property for the `<input>` tag. Required for proper radio button group functionality                                                                                                          |
| `onChange`       | `function`       |    -     |            -             |      -       | Callback fired when radio button selection state changes                                                                                                                                                          |
| `onClick`        | `function`       |    -     |            -             |      -       | Callback fired when radio button is clicked                                                                                                                                                                       |
| `value`          |     `string`     |   Yes    |            -             |      -       | Used as HTML `value` property for the `<input>` tag. Facilitates identification of each radio button                                                                                                               |
| `spacing`        |     `string`     |    -     |            -             |   `15px`     | Sets margin between radio buttons. For horizontal orientation, sets margin-inline-start. For vertical orientation, sets margin-block-end.                                                                          |
| `orientation`    | `"horizontal" \| "vertical"` |    -     | "horizontal", "vertical" | "vertical" | Layout orientation of radio buttons when used in a group                                                                                                                                                           |
| `classNameInput` |     `string`     |    -     |            -             |      -       | Additional CSS class for the input element                                                                                                                                                                        |
| `autoFocus`      |     `boolean`    |    -     |            -             |   `false`    | Used as HTML `autoFocus` property for the `<input>` tag                                                                                                                                                            |

### Notes
- Ensure that the `name` prop is unique within a group of radio buttons to ensure proper functionality.
- The `orientation` and `spacing` props help in arranging multiple radio buttons in a group layout.
