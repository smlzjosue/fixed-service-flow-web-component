# ui-select



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description              | Type             | Default         |
| ------------- | ------------- | ------------------------ | ---------------- | --------------- |
| `disabled`    | `disabled`    | Disabled state           | `boolean`        | `false`         |
| `error`       | `error`       | Error message to display | `string`         | `undefined`     |
| `label`       | `label`       | Select label text        | `string`         | `undefined`     |
| `name`        | `name`        | Select name attribute    | `string`         | `undefined`     |
| `options`     | --            | Options array            | `SelectOption[]` | `[]`            |
| `placeholder` | `placeholder` | Placeholder text         | `string`         | `'Seleccionar'` |
| `required`    | `required`    | Required field           | `boolean`        | `false`         |
| `value`       | `value`       | Current selected value   | `string`         | `''`            |


## Events

| Event         | Description                | Type                      |
| ------------- | -------------------------- | ------------------------- |
| `selectBlur`  | Emitted on blur            | `CustomEvent<FocusEvent>` |
| `selectFocus` | Emitted on focus           | `CustomEvent<FocusEvent>` |
| `valueChange` | Emitted when value changes | `CustomEvent<string>`     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
