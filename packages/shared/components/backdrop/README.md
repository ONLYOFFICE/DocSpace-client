# Backdrop Component

A flexible backdrop component that provides a customizable overlay for modals, dialogs, and aside components. The component supports multiple instances, touch events, and responsive behavior for mobile and tablet devices.

## Features

- 🎨 Customizable background and blur effects
- 📱 Responsive design with mobile/tablet support
- 🔝 Configurable z-index for proper stacking
- 🔄 Multiple backdrop support for aside components
- 🖱️ Touch event handling for mobile devices

## Usage

```tsx
import { Backdrop } from "@docspace/components";

// Basic usage
<Backdrop visible onClick={handleBackdropClick} />

// With modal dialog
<Backdrop
  visible
  isModalDialog
  withBackground
  zIndex={1000}
  onClick={handleBackdropClick}
/>

// With aside component
<Backdrop
  visible
  isAside
  withBackground
  onClick={handleBackdropClick}
/>
```

## Props

| Prop                | Type                            | Default | Description                                        |
| ------------------- | ------------------------------- | ------- | -------------------------------------------------- |
| `visible`           | `boolean`                       | `false` | Controls the visibility of the backdrop            |
| `zIndex`            | `number`                        | `203`   | Sets the z-index CSS property for stacking context |
| `className`         | `string \| string[]`            | -       | Custom CSS class name(s) to apply                  |
| `id`                | `string`                        | -       | HTML id attribute for the backdrop element         |
| `style`             | `React.CSSProperties`           | -       | Custom inline styles                               |
| `withBackground`    | `boolean`                       | `false` | Enables background visibility                      |
| `isAside`           | `boolean`                       | `false` | Indicates backdrop is used with an Aside component |
| `withoutBlur`       | `boolean`                       | `false` | Disables the blur effect                           |
| `withoutBackground` | `boolean`                       | `false` | Forces backdrop to render without background       |
| `isModalDialog`     | `boolean`                       | `false` | Indicates backdrop is used with a modal dialog     |
| `onClick`           | `(e: React.MouseEvent) => void` | -       | Click event handler                                |

## Examples

### Modal Dialog

```tsx
const ModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Backdrop
        visible={isOpen}
        isModalDialog
        withBackground
        onClick={() => setIsOpen(false)}
      />
      {isOpen && <Modal>Modal Content</Modal>}
    </>
  );
};
```

### Multiple Backdrops with Aside

```tsx
const AsideExample = () => {
  const [isFirstOpen, setFirstOpen] = useState(false);
  const [isSecondOpen, setSecondOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setFirstOpen(true)}>Open First Aside</Button>
      <Button onClick={() => setSecondOpen(true)}>Open Second Aside</Button>

      <Backdrop
        visible={isFirstOpen}
        isAside
        withBackground
        onClick={() => setFirstOpen(false)}
      />
      <Backdrop
        visible={isSecondOpen}
        isAside
        withBackground
        onClick={() => setSecondOpen(false)}
      />

      {isFirstOpen && <Aside>First Aside Content</Aside>}
      {isSecondOpen && <Aside>Second Aside Content</Aside>}
    </>
  );
};
```

## Mobile and Tablet Support

The component automatically adjusts its behavior for mobile and tablet devices:

- Automatically shows background on mobile/tablet devices unless `withoutBlur` is set
- Handles touch events appropriately for modal dialogs
- Prevents default touch behavior for non-modal backdrops

## Theme Support

The component uses the following theme properties:

- `theme.backdrop.backgroundColor`: Background color when visible
- `theme.backdrop.unsetBackgroundColor`: Background color when hidden or disabled

## Notes

- When using multiple backdrops with `isAside`, up to two backdrops can be displayed simultaneously
- `withoutBackground` takes precedence over `withBackground`
- Background is not displayed if viewport width > 1024px unless explicitly enabled
- Touch events are prevented by default unless `isModalDialog` is true
