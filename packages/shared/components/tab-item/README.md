# TabItem

A component used for creating tab navigation interfaces with support for active states and custom styling.

## Installation

```bash
import { TabItem } from "@docspace/shared/components/tab-item";
```

## Usage

```jsx
// Basic usage
<TabItem
  label="Tab Label"
  isActive={false}
  onSelect={() => console.log("Tab selected")}
/>

// Active tab
<TabItem
  label="Active Tab"
  isActive={true}
  onSelect={handleTabSelect}
/>

// With custom class
<TabItem
  label="Custom Tab"
  isActive={false}
  className="custom-tab-class"
  onSelect={handleTabSelect}
/>

// With React node as label
<TabItem
  label={
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ color: "#2DA7DB" }}>●</span>
      <span>Tab with Icon</span>
    </div>
  }
  isActive={false}
  onSelect={handleTabSelect}
/>

// Tab group example
const TabGroup = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <TabItem
        label="First Tab"
        isActive={activeTab === "tab1"}
        onSelect={() => setActiveTab("tab1")}
      />
      <TabItem
        label="Second Tab"
        isActive={activeTab === "tab2"}
        onSelect={() => setActiveTab("tab2")}
      />
      <TabItem
        label="Third Tab"
        isActive={activeTab === "tab3"}
        onSelect={() => setActiveTab("tab3")}
      />
    </div>
  );
};
```

## Properties

| Prop        | Type                                | Default | Description                                         |
| ----------- | ----------------------------------- | ------- | --------------------------------------------------- |
| `label`     | `string` \| `React.ReactNode`       | -       | Text or React node to display as the tab label      |
| `isActive`  | `boolean`                           | `false` | When true, applies active styling to the tab        |
| `onSelect`  | `(event: React.MouseEvent) => void` | -       | Callback function triggered when the tab is clicked |
| `className` | `string`                            | -       | Optional CSS class name for custom styling          |

## Accessibility

The TabItem component includes the following accessibility features:

- `aria-selected` attribute to indicate the selected state of the tab
- Data attributes (`data-testid="tab-item"` and `data-testid="tab-item-text"`) for testing

## Testing

The TabItem component has comprehensive unit tests covering:

- Rendering with default and active states
- Click event handling
- Toggling active state
- Custom className support
- Rendering with React node as label

## Storybook

The TabItem component includes Storybook stories that demonstrate:

- Default state
- Active state
- Custom class usage
- React node as label
- Interactive tab group
