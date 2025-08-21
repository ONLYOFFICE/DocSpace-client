# Label

A versatile label component for form fields that supports required indicators, error states, and various display options.

## Usage

```js
import { Label } from "@docspace/shared/components/label";
```

### Basic Example

```jsx
<Label
  text="First name:"
  title="first name"
  htmlFor="firstNameField"
  display="block"
/>
```

### With Custom Styling

```jsx
<Label
  text="Username"
  isInline
  style={{ fontWeight: 600, marginRight: "8px" }}
  className="custom-label"
/>
```

### With Children

```jsx
<Label text="Phone:">
  <span style={{ color: "#666" }}>(optional)</span>
</Label>
```

## Properties

| Props             | Type                  | Required | Default | Description                               |
| ----------------- | :-------------------- | :------: | :------ | :---------------------------------------- |
| `text`            | `string \| ReactNode` |    -     | -       | Label's text content                      |
| `htmlFor`         | `string`              |    -     | -       | Associates the label with a form control  |
| `isRequired`      | `boolean`             |    -     | `false` | Shows required field indicator (\*)       |
| `error`           | `boolean`             |    -     | `false` | Displays the label in error state         |
| `isInline`        | `boolean`             |    -     | `false` | Sets the label to display inline-block    |
| `title`           | `string`              |    -     | -       | Tooltip text shown on hover               |
| `truncate`        | `boolean`             |    -     | `false` | Truncates overflowing text with ellipsis  |
| `display`         | `string`              |    -     | -       | CSS display property value                |
| `className`       | `string`              |    -     | -       | Additional CSS class names                |
| `id`              | `string`              |    -     | -       | HTML id attribute                         |
| `style`           | `React.CSSProperties` |    -     | -       | Custom CSS styles                         |
| `children`        | `React.ReactNode`     |    -     | -       | Additional content to render inside label |
| `tooltipMaxWidth` | `string`              |    -     | -       | Maximum width for the tooltip             |
