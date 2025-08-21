# Portal Logo Component

The Portal Logo component is a reusable React component responsible for rendering the portal's logo across different views and screen sizes.

## Usage

```js
import PortalLogo from "@docspace/shared/components/portal-logo";
```

```jsx
<PortalLogo className="custom-logo" isResizable={true} />
```

### Properties

| Props         | Type      | Default | Description                                       | Required |
| ------------- | --------- | ------- | ------------------------------------------------- | -------- |
| `className`   | `string`  | `null`  | Custom CSS class for the logo container           | No       |
| `isResizable` | `boolean` | `false` | Controls logo resizability across different views | No       |
