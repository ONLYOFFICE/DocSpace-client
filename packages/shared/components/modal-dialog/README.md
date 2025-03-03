# ModalDialog

A versatile modal dialog component that supports both modal and aside (side panel) display types.

## Usage

```js
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
```

### Basic Example

```jsx
<ModalDialog visible={true} displayType="modal" onClose={() => {}}>
  <ModalDialog.Header>Change password</ModalDialog.Header>
  <ModalDialog.Body>
    <div>
      Send the password change instruction to the{" "}
      <a href="mailto:example@email.com">example@email.com</a>
    </div>
  </ModalDialog.Body>
  <ModalDialog.Footer>
    <Button
      label="Send"
      primary
      size="normal"
      onClick={() => {}}
    />
    <Button
      label="Cancel"
      size="normal"
      onClick={() => {}}
    />
  </ModalDialog.Footer>
</ModalDialog>
```

### Aside Example

```jsx
<ModalDialog 
  visible={true} 
  displayType="aside"
  withBodyScroll
  onClose={() => {}}
>
  <ModalDialog.Header>Side Panel</ModalDialog.Header>
  <ModalDialog.Body>
    {/* Long scrollable content */}
  </ModalDialog.Body>
</ModalDialog>
```

## Properties

| Props                | Type                    | Required | Default | Description                                                  |
| ------------------- | :---------------------- | :------: | :-----: | ------------------------------------------------------------ |
| `children`          | `ReactElement[]`        |    -     |    -    | Modal content components (Header, Body, Footer)              |
| `visible`           | `boolean`               |    -     | `false` | Controls modal visibility                                    |
| `displayType`       | `ModalDialogType`       |    -     | `modal` | Display type (`modal` or `aside`)                           |
| `displayTypeDetailed`| `ModalDialogTypeDetailed`|    -    |    -    | Detailed display type for different screen sizes            |
| `onClose`           | `() => void`            |    -     |    -    | Callback when modal is closed                               |
| `zIndex`            | `number`                |    -     |  `310`  | CSS z-index for modal layering                              |
| `isLoading`         | `boolean`               |    -     | `false` | Shows loader in body                                        |
| `isCloseable`       | `boolean`               |    -     |  `true` | Controls if modal can be closed                             |

### Modal-only Properties

| Props              | Type      | Required | Default | Description                                           |
| ----------------- | :-------- | :------: | :-----: | ----------------------------------------------------- |
| `isLarge`         | `boolean` |    -     | `false` | Sets width: 520px and max-height: 400px               |
| `isHuge`          | `boolean` |    -     | `false` | Sets predefined huge size                             |
| `autoMaxWidth`    | `boolean` |    -     | `false` | Sets max-width: auto                                  |
| `autoMaxHeight`   | `boolean` |    -     | `false` | Sets max-height: auto                                 |
| `withFooterBorder`| `boolean` |    -     | `false` | Displays border between body and footer               |

### Aside-only Properties

| Props               | Type      | Required | Default | Description                                           |
| ------------------ | :-------- | :------: | :-----: | ----------------------------------------------------- |
| `withBodyScroll`   | `boolean` |    -     | `false` | Enables body scroll                                   |
| `isScrollLocked`   | `boolean` |    -     | `false` | Locks the scroll in body section                      |
| `containerVisible` | `boolean` |    -     | `false` | Allows embedding modal as aside dialog                |

### Additional Properties

| Props                  | Type      | Required | Default | Description                                           |
| --------------------- | :-------- | :------: | :-----: | ----------------------------------------------------- |
| `withForm`            | `boolean` |    -     | `false` | Wraps content in form element                         |
| `onSubmit`            | `function`|    -     |    -    | Form submit handler                                   |
| `withoutPadding`      | `boolean` |    -     | `false` | Removes default padding from body                     |
| `hideContent`         | `boolean` |    -     | `false` | Hides modal content                                   |
| `blur`                | `number`  |    -     |    0    | Sets backdrop blur value                              |
| `isInvitePanelLoader` | `boolean` |    -     | `false` | Shows invite panel loader                             |
| `withBodyScrollForcibly`| `boolean`|    -    | `false` | Forces body scroll regardless of display type         |

## Sub-components

### ModalDialog.Header
Container for modal header content.

### ModalDialog.Body
Container for modal body content. Supports scrolling in aside mode.

### ModalDialog.Footer
Container for modal footer content, typically used for action buttons.

## Examples

### Modal with Form

```jsx
<ModalDialog 
  visible={true}
  withForm
  onSubmit={(e) => {
    e.preventDefault();
    // Handle form submission
  }}
>
  <ModalDialog.Header>Form Example</ModalDialog.Header>
  <ModalDialog.Body>
    <form>
      {/* Form fields */}
    </form>
  </ModalDialog.Body>
  <ModalDialog.Footer>
    <Button type="submit" label="Submit" primary />
  </ModalDialog.Footer>
</ModalDialog>
```

### Large Modal

```jsx
<ModalDialog 
  visible={true}
  isLarge
  withFooterBorder
>
  <ModalDialog.Header>Large Modal</ModalDialog.Header>
  <ModalDialog.Body>
    {/* Content */}
  </ModalDialog.Body>
  <ModalDialog.Footer>
    {/* Actions */}
  </ModalDialog.Footer>
</ModalDialog>
```

### Scrollable Aside Panel

```jsx
<ModalDialog 
  visible={true}
  displayType="aside"
  withBodyScroll
  isScrollLocked={false}
>
  <ModalDialog.Header>Scrollable Panel</ModalDialog.Header>
  <ModalDialog.Body>
    {/* Long scrollable content */}
  </ModalDialog.Body>
</ModalDialog>
