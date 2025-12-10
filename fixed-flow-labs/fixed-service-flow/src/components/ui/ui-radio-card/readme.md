# ui-radio-card



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute     | Description                                | Type      | Default     |
| -------------------- | ------------- | ------------------------------------------ | --------- | ----------- |
| `badge`              | `badge`       | Badge text (optional, e.g., "Recomendado") | `string`  | `undefined` |
| `cardTitle`          | `card-title`  | Card title                                 | `string`  | `undefined` |
| `checked`            | `checked`     | Whether this card is selected              | `boolean` | `false`     |
| `description`        | `description` | Card description                           | `string`  | `undefined` |
| `disabled`           | `disabled`    | Disabled state                             | `boolean` | `false`     |
| `icon`               | `icon`        | Icon name or URL (optional)                | `string`  | `undefined` |
| `name` _(required)_  | `name`        | Radio name (for grouping)                  | `string`  | `undefined` |
| `price`              | `price`       | Price to display (optional)                | `string`  | `undefined` |
| `value` _(required)_ | `value`       | Radio value                                | `string`  | `undefined` |


## Events

| Event        | Description                   | Type                  |
| ------------ | ----------------------------- | --------------------- |
| `cardSelect` | Emitted when card is selected | `CustomEvent<string>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
