// ============================================
// FLOW STORE - Global State Management
// Fixed Service Flow Web Component
// ============================================
import { createStore } from "@stencil/store";
// ------------------------------------------
// INITIAL STATE
// ------------------------------------------
const initialState = {
    // Navigation
    currentStep: 1,
    // Authentication
    token: null,
    correlationId: null,
    // Step 1: Location
    location: null,
    // Step 2: Plans
    availablePlans: [],
    selectedPlan: null,
    // Step 3: Contract
    selectedContract: null,
    // Step 4: Form
    formData: null,
    // Step 5: Confirmation
    orderId: null,
    requestError: null,
    // UI State
    isLoading: false,
    error: null,
};
// ------------------------------------------
// CREATE STORE
// ------------------------------------------
const { state, onChange, reset, dispose } = createStore(initialState);
// ------------------------------------------
// STORE ACTIONS
// ------------------------------------------
export const flowActions = {
    // Authentication
    setToken: (token, correlationId) => {
        state.token = token;
        state.correlationId = correlationId;
        // Persist to sessionStorage
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('correlationId', correlationId);
    },
    getStoredToken: () => {
        return {
            token: sessionStorage.getItem('token'),
            correlationId: sessionStorage.getItem('correlationId'),
        };
    },
    hasToken: () => {
        return !!state.token || !!sessionStorage.getItem('token');
    },
    clearToken: () => {
        state.token = null;
        state.correlationId = null;
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('correlationId');
    },
    // Navigation
    setStep: (step) => {
        state.currentStep = step;
    },
    nextStep: () => {
        if (state.currentStep < 5) {
            state.currentStep = (state.currentStep + 1);
        }
    },
    prevStep: () => {
        if (state.currentStep > 1) {
            state.currentStep = (state.currentStep - 1);
        }
    },
    // Location (Step 1)
    setLocation: (location) => {
        state.location = location;
        // Persist to sessionStorage (Base64 encoded as per spec)
        sessionStorage.setItem('latitud', btoa(String(location.latitude)));
        sessionStorage.setItem('longitud', btoa(String(location.longitude)));
        sessionStorage.setItem('planCodeInternet', btoa(location.serviceType));
    },
    // Plans (Step 2)
    setAvailablePlans: (plans) => {
        state.availablePlans = plans;
    },
    selectPlan: (plan) => {
        state.selectedPlan = plan;
        // Persist to sessionStorage
        sessionStorage.setItem('planId', String(plan.planId));
        sessionStorage.setItem('planPrice', String(plan.decPrice));
        sessionStorage.setItem('plan', JSON.stringify(plan));
    },
    // Contract (Step 3)
    setContract: (contract) => {
        state.selectedContract = contract;
        // Persist to sessionStorage
        sessionStorage.setItem('typeContractId', String(contract.typeId));
        sessionStorage.setItem('contractInstallment', String(contract.deadlines));
        sessionStorage.setItem('contractInstallation', String(contract.installation));
        sessionStorage.setItem('contractActivation', String(contract.activation));
        sessionStorage.setItem('contractModen', String(contract.modem));
    },
    // Form (Step 4)
    setFormData: (formData) => {
        state.formData = formData;
    },
    // Confirmation (Step 5)
    setOrderResult: (orderId, error) => {
        state.orderId = orderId;
        state.requestError = error;
    },
    // UI State
    setLoading: (isLoading) => {
        state.isLoading = isLoading;
    },
    setError: (error) => {
        state.error = error;
    },
    clearError: () => {
        state.error = null;
    },
    // Reset
    resetFlow: () => {
        // Clear sessionStorage items
        const keysToRemove = [
            'planCodeInternet',
            'latitud',
            'longitud',
            'planId',
            'planPrice',
            'plan',
            'typeContractId',
            'contractInstallment',
            'contractInstallation',
            'contractActivation',
            'contractModen',
        ];
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        // Reset store to initial state
        reset();
    },
    // Get complete state for submission
    getSubmissionData: () => {
        return {
            location: state.location,
            plan: state.selectedPlan,
            contract: state.selectedContract,
            formData: state.formData,
        };
    },
};
// ------------------------------------------
// STORE WATCHERS (for debugging)
// ------------------------------------------
if (typeof window !== 'undefined' && window.__FSF_DEBUG__) {
    onChange('currentStep', (value) => {
        console.log('[FSF Store] Step changed:', value);
    });
    onChange('isLoading', (value) => {
        console.log('[FSF Store] Loading:', value);
    });
    onChange('error', (value) => {
        if (value) {
            console.error('[FSF Store] Error:', value);
        }
    });
}
// ------------------------------------------
// EXPORTS
// ------------------------------------------
export { state as flowState, onChange, reset, dispose };
export default state;
//# sourceMappingURL=flow.store.js.map
