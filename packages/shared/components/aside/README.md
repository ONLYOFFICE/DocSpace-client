# Aside Component

The Aside component provides a sliding panel that can contain any content. It can be shown/hidden and customized with various styling options.

## Usage

```tsx
import { Aside } from "@docspace/components";

const MyComponent = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Aside visible={isVisible} onClose={() => setIsVisible(false)}>
      Your content here
    </Aside>
  );
};
```

## Props

| Prop              | Type       | Default | Description                                   |
| ----------------- | ---------- | ------- | --------------------------------------------- |
| visible           | boolean    | -       | Controls the visibility of the aside panel    |
| onClose           | () => void | -       | Callback function when the aside is closed    |
| scale             | boolean    | false   | Enables scaling animation                     |
| zIndex            | number     | 400     | Sets the z-index of the aside panel           |
| withoutHeader     | boolean    | false   | Removes the header section if true            |
| withoutBodyScroll | boolean    | false   | Disables body scroll when aside is open       |
| className         | string     | -       | Additional CSS class names                    |
| children          | ReactNode  | -       | Content to be rendered inside the aside panel |

Additionally, the component accepts all props from `AsideHeader` component:

- `header`: string | ReactNode - Custom header content
- `headerIcons`: HeaderIcon[] - Array of icons to display in the header
- `isLoading`: boolean - Shows loading state in the header
- `withoutBorder`: boolean - Removes the header border
- `headerHeight`: string - Custom header height

## Examples

### Basic Usage

```tsx
<Aside visible={true} onClose={() => console.log("Close clicked")}>
  <div>Basic content</div>
</Aside>
```

### Without Header

```tsx
<Aside
  visible={true}
  withoutHeader
  onClose={() => console.log("Close clicked")}
>
  <div>Content without header</div>
</Aside>
```

### Custom Header

```tsx
<Aside
  visible={true}
  header="Custom Header"
  headerIcons={[
    {
      key: "settings",
      url: "path/to/icon",
      onClick: () => console.log("Icon clicked"),
    },
  ]}
  onClose={() => console.log("Close clicked")}
>
  <div>Content with custom header</div>
</Aside>
```
