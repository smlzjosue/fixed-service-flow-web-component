# fixed-service-flow



<!-- Auto Generated Below -->


## Properties

| Property                     | Attribute         | Description                          | Type                                   | Default     |
| ---------------------------- | ----------------- | ------------------------------------ | -------------------------------------- | ----------- |
| `apiUrl` _(required)_        | `api-url`         | Base URL for the API                 | `string`                               | `undefined` |
| `correlationId`              | `correlation-id`  | Optional correlation ID for tracking | `string`                               | `undefined` |
| `debug`                      | `debug`           | Debug mode                           | `boolean`                              | `false`     |
| `googleMapsKey` _(required)_ | `google-maps-key` | Google Maps API Key                  | `string`                               | `undefined` |
| `initialStep`                | `initial-step`    | Initial step (default: 1)            | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8` | `1`         |


## Events

| Event          | Description                                  | Type                             |
| -------------- | -------------------------------------------- | -------------------------------- |
| `flowCancel`   | Emitted when user cancels the flow           | `CustomEvent<void>`              |
| `flowComplete` | Emitted when the flow completes successfully | `CustomEvent<FlowCompleteEvent>` |
| `flowError`    | Emitted when an error occurs                 | `CustomEvent<FlowErrorEvent>`    |
| `stepChange`   | Emitted when step changes                    | `CustomEvent<StepChangeEvent>`   |


## Dependencies

### Depends on

- [step-location](../steps/step-location)
- [step-plans](../steps/step-plans)
- [step-contract](../steps/step-contract)
- [step-form](../steps/step-form)
- [step-confirmation](../steps/step-confirmation)
- [step-catalogue](../steps/step-catalogue)
- [step-product-detail](../steps/step-product-detail)
- [step-order-summary](../steps/step-order-summary)
- [step-shipping](../steps/step-shipping)
- [step-payment](../steps/step-payment)

### Graph
```mermaid
graph TD;
  fixed-service-flow --> step-location
  fixed-service-flow --> step-plans
  fixed-service-flow --> step-contract
  fixed-service-flow --> step-form
  fixed-service-flow --> step-confirmation
  fixed-service-flow --> step-catalogue
  fixed-service-flow --> step-product-detail
  fixed-service-flow --> step-order-summary
  fixed-service-flow --> step-shipping
  fixed-service-flow --> step-payment
  step-plans --> ui-carousel
  style fixed-service-flow fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
