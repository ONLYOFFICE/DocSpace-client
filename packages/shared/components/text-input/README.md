# TextInput

Input field for single-line strings

### Usage

```js
import { TextInput } from "@docspace/shared/components/text-input";
```

```js
const mask = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];
```

```jsx
<TextInput
  mask={mask}
  value="text"
  onChange={(event) => alert(event.target.value)}
/>
```

### Properties

| Props               |        Type        | Required |                  Values                  | Default | Description                                                                     |
| ------------------- | :----------------: | :------: | :--------------------------------------: | :-----: | ------------------------------------------------------------------------------- |
| `autoComplete`      |      `string`      |    -     |                    -                     | `"off"` | Used as HTML `autocomplete` property                                            |
| `className`         |      `string`      |    -     |                    -                     |    -    | CSS class name                                                                  |
| `forwardedRef`      | `Ref<HTMLElement>` |    -     |                    -                     |    -    | Forwarded ref                                                                   |
| `guide`             |       `bool`       |    -     |                    -                     | `false` | When true, Text Mask shows both placeholder and non-placeholder mask characters |
| `hasError`          |       `bool`       |    -     |                    -                     | `false` | Indicates the input field has an error                                          |
| `hasWarning`        |       `bool`       |    -     |                    -                     | `false` | Indicates the input field has a warning                                         |
| `id`                |      `string`      |    -     |                    -                     |    -    | Used as HTML `id` property                                                      |
| `isAutoFocussed`    |       `bool`       |    -     |                    -                     | `false` | Focus the input field on initial render                                         |
| `isDisabled`        |       `bool`       |    -     |                    -                     | `false` | Indicates that the field cannot be used                                         |
| `isReadOnly`        |       `bool`       |    -     |                    -                     | `false` | Indicates that the field is displaying read-only content                        |
| `keepCharPositions` |       `bool`       |    -     |                    -                     | `false` | Allows adding/deleting characters without changing positions of existing ones   |
| `mask`              |      `array`       |    -     |                    -                     |    -    | Input text mask                                                                 |
| `maxLength`         |      `number`      |    -     |                    -                     |  `255`  | Maximum length of the input value                                               |
| `name`              |      `string`      |    -     |                    -                     |    -    | Used as HTML `name` property                                                    |
| `onBlur`            |       `func`       |    -     |                    -                     |    -    | Called when field is blurred                                                    |
| `onChange`          |       `func`       |    -     |                    -                     |    -    | Called with the new value. Required when input is not read only                 |
| `onClick`           |       `func`       |    -     |                    -                     |    -    | Called when clicked                                                             |
| `onContextMenu`     |       `func`       |    -     |                    -                     |    -    | Called when context menu is triggered                                           |
| `onFocus`           |       `func`       |    -     |                    -                     |    -    | Called when field is focused                                                    |
| `onKeyDown`         |       `func`       |    -     |                    -                     |    -    | Called when a key is pressed                                                    |
| `placeholder`       |      `string`      |    -     |                    -                     |  `" "`  | Placeholder text for the input                                                  |
| `scale`             |       `bool`       |    -     |                    -                     | `false` | Indicates the input field has scale                                             |
| `size`              |      `string`      |    ✅    | `base`, `middle`, `big`, `huge`, `large` | `base`  | Supported size of the input fields                                              |
| `style`             |   `obj`, `array`   |    -     |                    -                     |    -    | Inline CSS styles                                                               |
| `tabIndex`          |      `number`      |    -     |                    -                     |   -1    | Used as HTML `tabindex` property                                                |
| `type`              |      `string`      |    ✅    |            `text`, `password`            | `text`  | Supported type of the input fields                                              |
| `value`             |      `string`      |    ✅    |                    -                     |    -    | Value of the input                                                              |
| `withBorder`        |       `bool`       |    -     |                    -                     | `true`  | Indicates that component contains border                                        |
| `fontWeight`        | `number`, `string` |    -     |                    -                     |  `400`  | Sets the font weight of the input text                                          |
| `isBold`            |       `bool`       |    -     |                    -                     | `false` | When true, sets font weight to 600                                              |
