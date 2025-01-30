# RadioButtonGroup

The `RadioButtonGroup` component allows you to create a group of radio buttons with various configurations, including horizontal/vertical layouts, disabled states, and text labels.

### Usage

```js
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
```

```jsx
<RadioButtonGroup
  name="fruits"
  selected="banana"
  options={[
    { value: "apple", label: "Sweet apple" },
    { value: "banana", label: "Banana" },
    { type: "text", label: "Choose your favorite fruit:" },
  ]}
  onClick={(e) => console.log(e.target.value)}
  orientation="horizontal"
  isDisabled={false}
  fontSize="14px"
  fontWeight="bold"
  spacing="10px"
  width="100%"
/>
```

### Properties

| Props         |          Type          | Required |          Values          |   Default    | Description                                                                                                                                                                           |
| ------------- | :--------------------: | :------: | :----------------------: | :----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`   |        `string`        |    -     |            -             |      -       | Custom class name for additional styling.                                                                                                                                             |
| `id`          |        `string`        |    -     |            -             |      -       | Unique identifier for the component.                                                                                                                                                  |
| `isDisabled`  |       `boolean`        |    -     |            -             |   `false`    | Disables all radio buttons in the group.                                                                                                                                              |
| `name`        |        `string`        |    ✅    |            -             |      -       | Used as the HTML `name` property for `<input>` tags, facilitating identification of each `RadioButtonGroup`.                                                                          |
| `onClick`     |       `function`       |    -     |            -             |      -       | Callback function to handle click events on the radio buttons. Receives the event as an argument.                                                                                     |
| `options`     | `TRadioButtonOption[]` |    ✅    |            -             |      -       | Array of option objects, each containing properties for individual radio buttons. Supports `value`, `label`, `type`, `disabled`, `id`, and `autoFocus`.                               |
| `orientation` |        `oneOf`         |    -     | `vertical`, `horizontal` | `horizontal` | Position of radiobuttons.                                                                                                                                                             |
| `selected`    |        `string`        |    -     |            -             |      -       | Value of the currently selected radio button.                                                                                                                                         |
| `spacing`     |        `string`        |    -     |            -             |    `15px`    | Sets the margin between radio buttons. For horizontal orientation, `margin-left` is applied to all except the first; for vertical, `margin-bottom` is applied to all except the last. |
| `style`       |    `CSSProperties`     |    -     |            -             |      -       | Inline styles to apply to the container.                                                                                                                                              |
| `width`       |        `string`        |    -     |            -             |    `100%`    | Width of RadioButtonGroup container.                                                                                                                                                  |
| `fontSize`    |        `string`        |    -     |            -             |      -       | Font size of link.                                                                                                                                                                    |
| `fontWeight`  |    `number, string`    |    -     |            -             |      -       | Font weight of link.                                                                                                                                                                  |
