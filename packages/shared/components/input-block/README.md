# InputBlock

A versatile input component that combines a text input with optional icon and children elements. It supports various states, sizes, and customization options.

### Usage

```js
import { InputBlock } from "@docspace/shared/components";
import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
```

### Basic Example

```jsx
<InputBlock
  id="search-input"
  iconName={SearchReactSvgUrl}
  placeholder="Search..."
  onChange={(e) => console.log(e.target.value)}
  onIconClick={() => console.log("Search clicked")}
/>
```

### With Mask Example

```jsx
const dateMask = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];

<InputBlock
  mask={dateMask}
  placeholder="DD/MM/YYYY"
  onChange={(e) => console.log(e.target.value)}
/>;
```

### With Children Example

```jsx
<InputBlock
  iconName={SearchReactSvgUrl}
  onChange={(e) => console.log(e.target.value)}
>
  <Button
    size="base"
    onClick={() => console.log("Button clicked")}
    label="Search"
  />
</InputBlock>
```

### Properties

| Props                 | Type                         | Required | Default  | Description                                           |
| --------------------- | :--------------------------- | :------: | :------- | ----------------------------------------------------- |
| `id`                  | `string`                     |    -     | -        | Input field identifier                                |
| `name`                | `string`                     |    -     | -        | Input field name                                      |
| `type`                | `string`                     |    -     | `"text"` | Input type (e.g., 'text', 'password')                 |
| `value`               | `string`                     |    -     | `""`     | Input value                                           |
| `placeholder`         | `string`                     |    -     | -        | Placeholder text                                      |
| `tabIndex`            | `number`                     |    -     | `-1`     | Tab order of the input                                |
| `maxLength`           | `number`                     |    -     | `255`    | Maximum input length                                  |
| `autoComplete`        | `string`                     |    -     | `"off"`  | HTML autocomplete attribute                           |
| `mask`                | `Array<RegExp \| string>`    |    -     | -        | Input mask pattern                                    |
| `keepCharPositions`   | `boolean`                    |    -     | `false`  | Keep character positions when applying mask           |
| `hasError`            | `boolean`                    |    -     | `false`  | Error state                                           |
| `hasWarning`          | `boolean`                    |    -     | `false`  | Warning state                                         |
| `isDisabled`          | `boolean`                    |    -     | `false`  | Disabled state                                        |
| `isReadOnly`          | `boolean`                    |    -     | `false`  | Read-only state                                       |
| `isAutoFocussed`      | `boolean`                    |    -     | `false`  | Auto-focus on mount                                   |
| `scale`               | `boolean`                    |    -     | `false`  | Enable input scaling                                  |
| `iconName`            | `string`                     |    -     | `""`     | Icon URL or name                                      |
| `iconNode`            | `ReactNode`                  |    -     | -        | Custom icon component                                 |
| `iconSize`            | `number`                     |    -     | -        | Custom icon size                                      |
| `iconColor`           | `string`                     |    -     | -        | Icon color                                            |
| `hoverColor`          | `string`                     |    -     | -        | Icon hover color                                      |
| `iconButtonClassName` | `string`                     |    -     | `""`     | Icon button class name                                |
| `isIconFill`          | `boolean`                    |    -     | `false`  | Fill icon style                                       |
| `size`                | `InputSize`                  |    -     | `base`   | Input size (`base`, `middle`, `big`, `huge`, `large`) |
| `className`           | `string`                     |    -     | -        | Container class name                                  |
| `style`               | `CSSProperties`              |    -     | -        | Container inline styles                               |
| `onChange`            | `(e: ChangeEvent) => void`   |    -     | -        | Change event handler                                  |
| `onIconClick`         | `(e: MouseEvent) => void`    |    -     | -        | Icon click handler                                    |
| `onBlur`              | `(e: FocusEvent) => void`    |    -     | -        | Blur event handler                                    |
| `onFocus`             | `(e: FocusEvent) => void`    |    -     | -        | Focus event handler                                   |
| `onKeyDown`           | `(e: KeyboardEvent) => void` |    -     | -        | Keydown event handler                                 |
| `onClick`             | `(e: MouseEvent) => void`    |    -     | -        | Click event handler                                   |
| `children`            | `ReactNode`                  |    -     | -        | Child components                                      |
| `forwardedRef`        | `Ref<HTMLInputElement>`      |    -     | -        | Forward ref to input element                          |

### Size Options

The component supports the following sizes through the `size` prop:

- `base` (default): 16px icon
- `middle`: 18px icon
- `big`: 21px icon
- `huge`: 24px icon
- `large`: 24px icon
