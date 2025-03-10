# Text Component

A flexible and customizable text component for rendering text content with various styling options.

## Installation

The Text component is part of the @docspace/shared package:

```js
import { Text } from "@docspace/shared/components";
```

## Basic Usage

```jsx
<Text as="p" title="Some title">
  Some text
</Text>
```

## Styling Override

To override styles, use styled-components with forwardedAs prop:

```js
const StyledText = styled(Text)`
  &:hover {
    border-bottom: 1px dotted;
  }
`;

<StyledText forwardedAs="span" title="Some title">
  Some text
</StyledText>;
```

## Component Properties

| Props             |              Type               | Required | Default | Description                                           |
| ----------------- | :-----------------------------: | :------: | :-----: | ----------------------------------------------------- |
| `as`              |       `React.ElementType`       |    -     |   `p`   | HTML element type to render (`p`, `span`, `h1`, etc.) |
| `tag`             |            `string`             |    -     |    -    | Alternative to `as` prop for element type             |
| `backgroundColor` |            `string`             |    -     |    -    | Background color of the text element                  |
| `color`           |            `string`             |    -     |    -    | Text color                                            |
| `display`         |            `string`             |    -     |    -    | CSS display property                                  |
| `fontSize`        |            `string`             |    -     | `13px`  | Font size                                             |
| `fontWeight`      |       `number \| string`        |    -     |  `400`  | Font weight                                           |
| `isBold`          |            `boolean`            |    -     | `false` | Sets font weight to `700` when true                   |
| `isInline`        |            `boolean`            |    -     | `false` | Sets display to `inline-block` when true              |
| `isItalic`        |            `boolean`            |    -     | `false` | Sets font style to italic                             |
| `lineHeight`      |            `string`             |    -     |    -    | Line height                                           |
| `noSelect`        |            `boolean`            |    -     | `false` | Disables text selection when true                     |
| `textAlign`       |            `string`             |    -     | `left`  | Text alignment (`left`, `center`, `right`, `justify`) |
| `title`           |            `string`             |    -     |    -    | Tooltip text on hover                                 |
| `truncate`        |            `boolean`            |    -     | `false` | Enables text truncation with ellipsis                 |
| `dir`             |   `"ltr" \| "rtl" \| "auto"`    |    -     |    -    | Text direction                                        |
| `className`       |            `string`             |    -     |    -    | Additional CSS class names                            |
| `style`           |      `React.CSSProperties`      |    -     |    -    | Additional inline styles                              |
| `onClick`         | `(e: React.MouseEvent) => void` |    -     |    -    | Click event handler                                   |

## Examples

### Default Text

```jsx
<Text>Default text with standard styling</Text>
```

### Heading Text

```jsx
<Text as="h1" fontSize="24px" fontWeight="700">
  Heading Text
</Text>
```

### Inline Text

```jsx
<>
  <Text isInline>First inline text</Text>{" "}
  <Text isInline>Second inline text</Text>
</>
```

### Styled Text

```jsx
<Text
  fontSize="16px"
  fontWeight="600"
  color="white"
  backgroundColor="black"
  textAlign="center"
  isBold
  isItalic
  lineHeight="1.5"
>
  Styled text with custom properties
</Text>
```

### Interactive Text

```jsx
<Text
  isInline
  onClick={() => console.log("clicked")}
  style={{ cursor: "pointer" }}
>
  Click me!
</Text>
```

### Non-Selectable Text

```jsx
<Text noSelect>This text cannot be selected</Text>
```

### Truncated Text

```jsx
<Text truncate>
  This is a very long text that will be truncated when it exceeds the container
  width
</Text>
```

## Accessibility

The Text component supports:

- Custom HTML elements via `as` prop for semantic markup
- Text direction control via `dir` prop
- ARIA attributes through props spreading
- Keyboard interaction for clickable text

## Browser Support

The Text component is compatible with all modern browsers and includes:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

For bug reports and feature requests, please create an issue in the repository.
