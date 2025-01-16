# Empty View Component

The Empty View component is a versatile React component used to display placeholder content when no data is available, with support for icons, titles, descriptions, and interactive options.

## Usage

```js
import { EmptyView } from "@docspace/shared/components/empty-view";
```

```jsx
<EmptyView 
  title="No Items" 
  description="There are no items to display" 
  icon={<MyIcon />} 
  options={[
    {
      key: "create",
      title: "Create New Item",
      description: "Click to add a new item",
      icon: <AddIcon />,
      onClick: handleCreate
    }
  ]} 
/>
```

### Properties

| Props         | Type                     | Default | Description                                       | Required |
| ------------- | ------------------------ | ------- | ------------------------------------------------- | -------- |
| `title`       | `string`                 | -       | Title text to display                             | Yes      |
| `description` | `string`                 | -       | Description text or content                       | Yes      |
| `icon`        | `React.ReactElement`     | -       | Icon component to display                         | Yes      |
| `options`     | `EmptyViewOptionsType`   | `null`  | Array of interactive options or links             | No       |

### Option Types

Options can be of two types:

#### Item Option
| Props         | Type                     | Default | Description                                       | Required |
| ------------- | ------------------------ | ------- | ------------------------------------------------- | -------- |
| `key`         | `React.Key`              | -       | Unique identifier for the option                  | Yes      |
| `title`       | `string`                 | -       | Option title text                                 | Yes      |
| `description` | `React.ReactNode`        | -       | Option description                                | Yes      |
| `icon`        | `React.ReactElement`     | -       | Option icon                                       | Yes      |
| `onClick`     | `(event) => void`        | -       | Click event handler                               | No       |
| `disabled`    | `boolean`                | `false` | Disable the option                                | No       |

#### Link Option
| Props         | Type                     | Default | Description                                       | Required |
| ------------- | ------------------------ | ------- | ------------------------------------------------- | -------- |
| `key`         | `React.Key`              | -       | Unique identifier for the link                    | Yes      |
| `to`          | `To`                     | -       | Target route or URL                               | Yes      |
| `description` | `string`                 | -       | Link description text                             | Yes      |
| `icon`        | `React.ReactElement`     | -       | Link icon                                         | Yes      |
| `onClick`     | `(event) => void`        | -       | Optional click handler                            | No       |
