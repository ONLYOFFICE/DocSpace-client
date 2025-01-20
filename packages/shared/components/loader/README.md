# Loader

Loader component is used for displaying loading states and animations in the application. It supports multiple types of loaders and can be customized with different sizes, colors, and themes.

### Usage

```js
import { Loader } from "@docspace/shared/components/loader";
import { LoaderTypes } from "@docspace/shared/components/loader";
```

```jsx
// Basic usage
<Loader type={LoaderTypes.base} size="18px" label="Loading..." />

// With custom color and primary style
<Loader
  type={LoaderTypes.dualRing}
  color="#2196F3"
  size="40px"
  primary
  label="Loading content..."
/>

// Disabled state
<Loader
  type={LoaderTypes.track}
  size="30px"
  isDisabled
  label="Processing..."
/>
```

### Properties

| Props        |         Type          | Required |                    Values                     | Default | Description                         |
| ------------ | :-------------------: | :------: | :-------------------------------------------: | :-----: | ----------------------------------- |
| `className`  |       `string`        |    -     |                       -                       |    -    | Custom CSS class                    |
| `color`      |       `string`        |    -     |              Any valid CSS color              |    -    | Custom color for the loader         |
| `id`         |       `string`        |    -     |                       -                       |    -    | Unique identifier                   |
| `label`      |       `string`        |    -     |                       -                       |    -    | Accessible label for screen readers |
| `size`       |       `string`        |    -     |            Any valid CSS size unit            | `40px`  | Size of the loader                  |
| `style`      | `React.CSSProperties` |    -     |                       -                       |    -    | Additional inline styles            |
| `type`       |     `LoaderTypes`     |    -     | `base`, `oval`, `dual-ring`, `rombs`, `track` | `base`  | Type of loader animation            |
| `primary`    |       `boolean`       |    -     |                `true`, `false`                | `false` | Use primary color from theme        |
| `isDisabled` |       `boolean`       |    -     |                `true`, `false`                | `false` | Show loader in disabled state       |

### Loader Types

- **base**: Simple circular spinner
- **oval**: Oval-shaped loading animation
- **dual-ring**: Two concentric rotating rings
- **rombs**: Diamond-shaped loading animation
- **track**: Circular track with rotating segment

### Theme Support

The loader component supports both light and dark themes. In dark mode, the loader automatically adjusts its colors for better visibility.

### Accessibility

- Each loader includes an `aria-label` for screen readers
- The label prop can be used to provide descriptive text for the loading state
- Color contrast ratios are maintained for visibility

### Examples

```jsx
// Different types of loaders
<div style={{ display: "flex", gap: "20px" }}>
  <Loader type={LoaderTypes.base} size="20px" />
  <Loader type={LoaderTypes.oval} size="30px" />
  <Loader type={LoaderTypes.dualRing} size="40px" />
  <Loader type={LoaderTypes.rombs} size="35px" />
  <Loader type={LoaderTypes.track} size="25px" />
</div>

// With different colors
<div style={{ display: "flex", gap: "20px" }}>
  <Loader type={LoaderTypes.dualRing} color="#2196F3" size="40px" />
  <Loader type={LoaderTypes.dualRing} color="#4CAF50" size="40px" />
  <Loader type={LoaderTypes.dualRing} color="#FFC107" size="40px" />
</div>
```
