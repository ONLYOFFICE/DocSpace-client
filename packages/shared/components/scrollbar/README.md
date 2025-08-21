# Scrollbar

Scrollbar is used for displaying custom scrollbar

### Usage

```js
import {Scrollbar} from "@docspace/shared/components";
```

Basic usage:
```jsx
<Scrollbar>Some content</Scrollbar>
```

### Examples

Basic scrollable content:
```jsx
<Scrollbar>
  <div style={{ height: "500px" }}>
    <p>Scrollable content here...</p>
  </div>
</Scrollbar>
```

Custom styling:
```jsx
<Scrollbar
  className="custom-scrollbar"
  scrollClass="scroll-area"
  style={{ height: "300px", width: "100%" }}
>
  <div>Content with custom styling</div>
</Scrollbar>
```

Horizontal scroll only:
```jsx
<Scrollbar
  noScrollY={true}
  style={{ width: "300px" }}
>
  <div style={{ display: "flex", width: "1000px" }}>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </div>
</Scrollbar>
```

With scroll event handling:
```jsx
<Scrollbar
  autoHide={false}
  onScroll={(e) => {
    console.log("Scroll position:", e.currentTarget.scrollTop);
  }}
>
  <div style={{ height: "400px" }}>
    Scrollable content with event handling
  </div>
</Scrollbar>
```

Fixed size scrollbar with padding:
```jsx
<Scrollbar
  fixedSize={true}
  paddingAfterLastItem="20px"
  style={{ height: "200px" }}
>
  <div>
    Content with fixed size scrollbar and bottom padding
  </div>
</Scrollbar>
```

### Properties

| Props                  |      Type      | Required |                Values                 |   Default    | Description                    |
| --------------------- | :------------: | :------: | :-----------------------------------: | :----------: | ------------------------------ |
| `className`           |    `string`    |    -     |                  -                    |      -       | Accepts class                  |
| `id`                  |    `string`    |    -     |                  -                    |      -       | Accepts id                     |
| `style`               | `obj`, `array` |    -     |                  -                    |      -       | Accepts css style              |
| `scrollClass`         |    `string`    |    -     |                  -                    |      -       | Scroll area class              |
| `autoHide`            |   `boolean`    |    -     |                  -                    |    true      | Enable tracks auto hiding      |
| `fixedSize`           |   `boolean`    |    -     |                  -                    |    false     | Fix scrollbar size             |
| `autoFocus`           |   `boolean`    |    -     |                  -                    |    false     | Focus on content after render  |
| `tabIndex`            | `number\|null` |    -     |                  -                    |      -       | Scroll body tabindex           |
| `paddingAfterLastItem`|    `string`    |    -     |                  -                    |      -       | Padding bottom to scroll-body  |
| `onScroll`            |   `function`   |    -     |                  -                    |      -       | Scroll event handler           |
| `noScrollY`           |   `boolean`    |    -     |                  -                    |      -       | Disable vertical scroll        |
| `noScrollX`           |   `boolean`    |    -     |                  -                    |      -       | Disable horizontal scroll      |
