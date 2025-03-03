# ComboBox

A versatile and accessible combo box component that combines a text input with a dropdown list. It allows users to either type a value directly or choose from a predefined list of options. The component supports various display types, search functionality, and customizable styling options.

### Features

- Multiple display types (default, badge, onlyIcon, descriptive)
- Search functionality with customizable placeholder
- Support for icons and advanced options
- Accessible keyboard navigation
- Customizable styling and theming
- Responsive design with mobile view support

### Installation

```js
import { ComboBox } from "@docspace/shared/components/combobox";
```

### Basic Usage

```jsx
const options = [
  {
    key: 1,
    icon: "path/to/icon.svg", // optional
    label: "Option 1",
    disabled: false, // optional
    onClick: () => {}, // optional
  },
];

<ComboBox
  options={options}
  selectedOption={{ key: 1, label: "Option 1" }}
  onSelect={(option) => console.log("Selected:", option)}
/>
```

### Advanced Usage

```jsx
<ComboBox
  options={options}
  selectedOption={{ key: 1, label: "Option 1" }}
  displayType="descriptive"
  withSearch={true}
  searchPlaceholder="Search options..."
  dropDownMaxHeight={200}
  advancedOptions={<div>Advanced options content</div>}
  directionX="right"
  directionY="bottom"
/>
```

### Props

| Prop | Type | Required | Options | Default | Description |
|------|------|----------|----------|---------|-------------|
| `options` | `array` | ✅ | - | - | Array of options to display in the dropdown |
| `selectedOption` | `object` | ✅ | - | - | Currently selected option |
| `onSelect` | `function` | ✅ | - | - | Callback when an option is selected |
| `displayType` | `string` | - | `default`, `badge`, `onlyIcon`, `descriptive` | `default` | Display style of the combobox |
| `withSearch` | `boolean` | - | - | `false` | Enable search functionality |
| `searchPlaceholder` | `string` | - | - | - | Placeholder text for search input |
| `dropDownMaxHeight` | `number` | - | - | `200` | Maximum height of dropdown in pixels |
| `isDisabled` | `boolean` | - | - | `false` | Disable the combobox |
| `noBorder` | `boolean` | - | - | `false` | Remove border from combobox |
| `scaled` | `boolean` | - | - | `true` | Enable scaling based on parent |
| `size` | `string` | - | `base`, `middle`, `big`, `huge`, `content` | `base` | Size of the combobox |
| `directionX` | `string` | - | `left`, `right` | - | Horizontal direction of dropdown |
| `directionY` | `string` | - | `top`, `bottom` | - | Vertical direction of dropdown |
| `advancedOptions` | `node` | - | - | - | Additional content for advanced options |
| `className` | `string` | - | - | - | Additional CSS class |

### Option Properties

Each option in the `options` array can have the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string\|number` | ✅ | Unique identifier for the option |
| `label` | `string` | ✅ | Display text for the option |
| `icon` | `string` | - | URL or path to option icon |
| `disabled` | `boolean` | - | Disable the option |
| `onClick` | `function` | - | Custom click handler for the option |
| `description` | `string` | - | Additional description (for descriptive display type) |

### Accessibility

The ComboBox component implements ARIA attributes and keyboard navigation for improved accessibility:

- `aria-expanded`: Indicates dropdown state
- `aria-haspopup`: Indicates popup presence
- `aria-label`: Provides component description
- `role="combobox"`: Identifies the component type

Keyboard support:
- `Enter/Space`: Open/close dropdown
- `Arrow Up/Down`: Navigate through options
- `Escape`: Close dropdown
- `Tab`: Focus next/previous element
