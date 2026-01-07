import { B as BUILD, c as consoleDevInfo, H, w as win, N as NAMESPACE, p as promiseResolve, g as globalScripts, b as bootstrapLazy } from './index-zT41ZBSk.js';
export { s as setNonce } from './index-zT41ZBSk.js';

/*
 Stencil Client Patch Browser v4.39.0 | MIT Licensed | https://stenciljs.com
 */

var patchBrowser = () => {
  if (BUILD.isDev && !BUILD.isTesting) {
    consoleDevInfo("Running in development mode.");
  }
  if (BUILD.cloneNodeFix) {
    patchCloneNodeFix(H.prototype);
  }
  const scriptElm = BUILD.scriptDataOpts ? win.document && Array.from(win.document.querySelectorAll("script")).find(
    (s) => new RegExp(`/${NAMESPACE}(\\.esm)?\\.js($|\\?|#)`).test(s.src) || s.getAttribute("data-stencil-namespace") === NAMESPACE
  ) : null;
  const importMeta = import.meta.url;
  const opts = BUILD.scriptDataOpts ? (scriptElm || {})["data-opts"] || {} : {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return promiseResolve(opts);
};
var patchCloneNodeFix = (HTMLElementPrototype) => {
  const nativeCloneNodeFn = HTMLElementPrototype.cloneNode;
  HTMLElementPrototype.cloneNode = function(deep) {
    if (this.nodeName === "TEMPLATE") {
      return nativeCloneNodeFn.call(this, deep);
    }
    const clonedNode = nativeCloneNodeFn.call(this, false);
    const srcChildNodes = this.childNodes;
    if (deep) {
      for (let i = 0; i < srcChildNodes.length; i++) {
        if (srcChildNodes[i].nodeType !== 2) {
          clonedNode.appendChild(srcChildNodes[i].cloneNode(true));
        }
      }
    }
    return clonedNode;
  };
};

patchBrowser().then(async (options) => {
  await globalScripts();
  return bootstrapLazy([["fixed-service-flow",[[769,"fixed-service-flow",{"apiUrl":[1,"api-url"],"googleMapsKey":[1,"google-maps-key"],"correlationId":[1,"correlation-id"],"initialStep":[2,"initial-step"],"debug":[4],"currentStep":[32],"isLoading":[32],"error":[32],"isInitialized":[32]},null,{"apiUrl":["handleApiUrlChange"]}]]],["step-product-detail",[[769,"step-product-detail",{"onNext":[16],"onBack":[16],"product":[32],"catalogueProduct":[32],"isLoading":[32],"error":[32],"isAddingToCart":[32],"selectedColorIndex":[32],"selectedStorageIndex":[32],"selectedInstallments":[32],"quantity":[32],"isAvailable":[32],"showUnavailableAlert":[32],"colorOptions":[32],"storageOptions":[32],"installmentOptions":[32],"productImages":[32]}]]],["step-order-summary",[[769,"step-order-summary",{"onNext":[16],"onBack":[16],"cart":[32],"isLoading":[32],"error":[32],"promoCode":[32],"isApplyingPromo":[32],"promoError":[32],"promoSuccess":[32],"termsAccepted":[32],"deletingItemId":[32]}]]],["step-payment",[[769,"step-payment",{"onNext":[16],"onBack":[16],"paymentIframeUrl":[1,"payment-iframe-url"],"screen":[32],"error":[32],"cart":[32],"orderBan":[32],"totalAmount":[32],"paymentItems":[32],"iframeUrl":[32],"iframeHeight":[32],"paymentResult":[32]}]]],["step-shipping",[[769,"step-shipping",{"onNext":[16],"onBack":[16],"isLoading":[32],"error":[32],"name":[32],"secondName":[32],"lastname":[32],"secondLastname":[32],"idType":[32],"idNumber":[32],"expirationDate":[32],"phone":[32],"phone2":[32],"businessName":[32],"position":[32],"address":[32],"city":[32],"zipcode":[32],"email":[32],"existingCustomer":[32],"formErrors":[32],"touched":[32]}]]],["ui-button",[[769,"ui-button",{"variant":[1],"size":[1],"disabled":[4],"loading":[4],"fullWidth":[4,"full-width"],"type":[1]}]]],["ui-checkbox",[[769,"ui-checkbox",{"checked":[1028],"label":[1],"name":[1],"disabled":[4],"hasError":[4,"has-error"],"errorMessage":[1,"error-message"]}]]],["ui-date-picker",[[769,"ui-date-picker",{"label":[1],"name":[1],"value":[1025],"placeholder":[1],"min":[1],"max":[1],"required":[4],"disabled":[4],"readonly":[4],"error":[1],"helperText":[1,"helper-text"],"isFocused":[32],"hasValue":[32]},null,{"value":["handleValueChange"]}]]],["ui-input",[[769,"ui-input",{"label":[1],"type":[1],"name":[1],"value":[1025],"placeholder":[1],"required":[4],"disabled":[4],"readonly":[4],"error":[1],"helperText":[1,"helper-text"],"maxlength":[2],"minlength":[2],"pattern":[1],"autocomplete":[1],"isFocused":[32],"hasValue":[32]},null,{"value":["handleValueChange"]}]]],["ui-radio",[[769,"ui-radio",{"label":[1],"name":[1],"value":[1],"checked":[4],"disabled":[4]}]]],["ui-radio-card",[[769,"ui-radio-card",{"cardTitle":[1,"card-title"],"description":[1],"name":[1],"value":[1],"checked":[4],"disabled":[4],"icon":[1],"price":[1],"badge":[1]}]]],["ui-select",[[769,"ui-select",{"label":[1],"name":[1],"value":[1025],"placeholder":[1],"options":[16],"required":[4],"disabled":[4],"error":[1],"isFocused":[32],"hasValue":[32]},null,{"value":["handleValueChange"]}]]],["step-catalogue",[[769,"step-catalogue",{"onNext":[16],"onBack":[16],"products":[32],"isLoading":[32],"error":[32],"productsWithDetails":[32],"loadingDetails":[32],"selectedProduct":[32],"selectedProductDetail":[32],"isAddingToCart":[32],"showUnavailableModal":[32],"summaryData":[32]}]]],["step-form",[[769,"step-form",{"onNext":[16],"onBack":[16],"formData":[32],"errors":[32],"touched":[32],"currentSection":[32],"isMobile":[32]}]]],["step-plans",[[769,"step-plans",{"onNext":[16],"onBack":[16],"plans":[32],"selectedPlan":[32],"isLoading":[32],"error":[32],"isAddingToCart":[32]}]]],["step-confirmation",[[769,"step-confirmation",{"onComplete":[16],"onCancel":[16],"onBack":[16],"status":[32],"orderId":[32],"orderNumber":[32],"confirmationSent":[32],"errorMessage":[32]}]]],["step-contract",[[769,"step-contract",{"onNext":[16],"onBack":[16],"activeTab":[32],"selectedOption":[32]}]]],["step-location",[[769,"step-location",{"googleMapsKey":[1,"google-maps-key"],"onNext":[16],"onBack":[16],"address":[32],"isValidating":[32],"isLoadingMap":[32],"isGettingLocation":[32],"locationData":[32],"mapError":[32],"currentCoordinates":[32],"geocodeResult":[32],"showErrorModal":[32],"errorMessage":[32]}]]],["ui-image-carousel",[[769,"ui-image-carousel",{"images":[16],"loop":[4],"showNavigation":[4,"show-navigation"],"showIndicators":[4,"show-indicators"],"autoplayInterval":[2,"autoplay-interval"],"fallbackImage":[1,"fallback-image"],"currentIndex":[32],"loadedImages":[32],"failedImages":[32]},null,{"images":["onImagesChange"]}]]],["ui-stepper",[[769,"ui-stepper",{"steps":[16],"currentStep":[2,"current-step"],"size":[1]}]]],["ui-carousel",[[769,"ui-carousel",{"totalItems":[2,"total-items"],"slidesPerView":[2,"slides-per-view"],"gap":[2],"showNavigation":[4,"show-navigation"],"showPagination":[4,"show-pagination"],"loop":[4],"autoplay":[2],"breakpoints":[16],"currentIndex":[32],"currentSlidesPerView":[32],"isDragging":[32],"startX":[32],"translateX":[32]},null,{"totalItems":["handleTotalItemsChange"]}]]]], options);
});
//# sourceMappingURL=fixed-service-flow.esm.js.map

//# sourceMappingURL=fixed-service-flow.esm.js.map