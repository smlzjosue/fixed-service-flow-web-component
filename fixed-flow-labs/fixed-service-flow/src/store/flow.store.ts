// ============================================
// FLOW STORE - Global State Management
// Fixed Service Flow Web Component
// ============================================

import { createStore } from '@stencil/store';
import {
  FlowState,
  FlowStep,
  LocationData,
  Plan,
  SelectedContract,
  FormData,
} from './interfaces';

// ------------------------------------------
// INITIAL STATE
// ------------------------------------------

const initialState: FlowState = {
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

const { state, onChange, reset, dispose } = createStore<FlowState>(initialState);

// ------------------------------------------
// STORE ACTIONS
// ------------------------------------------

export const flowActions = {
  // Authentication
  setToken: (token: string, correlationId: string) => {
    state.token = token;
    state.correlationId = correlationId;
    // Persist to sessionStorage
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('correlationId', correlationId);
  },

  getStoredToken: (): { token: string | null; correlationId: string | null } => {
    return {
      token: sessionStorage.getItem('token'),
      correlationId: sessionStorage.getItem('correlationId'),
    };
  },

  hasToken: (): boolean => {
    return !!state.token || !!sessionStorage.getItem('token');
  },

  clearToken: () => {
    state.token = null;
    state.correlationId = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('correlationId');
  },

  // Navigation
  setStep: (step: FlowStep) => {
    state.currentStep = step;
  },

  nextStep: () => {
    if (state.currentStep < 5) {
      state.currentStep = (state.currentStep + 1) as FlowStep;
    }
  },

  prevStep: () => {
    if (state.currentStep > 1) {
      state.currentStep = (state.currentStep - 1) as FlowStep;
    }
  },

  // Location (Step 1)
  setLocation: (location: LocationData) => {
    state.location = location;
    // Persist to sessionStorage (Base64 encoded as per spec)
    sessionStorage.setItem('latitud', btoa(String(location.latitude)));
    sessionStorage.setItem('longitud', btoa(String(location.longitude)));
    sessionStorage.setItem('planCodeInternet', btoa(location.serviceType));
  },

  // Plans (Step 2)
  setAvailablePlans: (plans: Plan[]) => {
    state.availablePlans = plans;
  },

  selectPlan: (plan: Plan) => {
    state.selectedPlan = plan;
    // Persist to sessionStorage
    sessionStorage.setItem('planId', String(plan.planId));
    sessionStorage.setItem('planPrice', String(plan.decPrice));
    sessionStorage.setItem('plan', JSON.stringify(plan));
  },

  // Contract (Step 3)
  setContract: (contract: SelectedContract) => {
    state.selectedContract = contract;
    // Persist to sessionStorage
    sessionStorage.setItem('typeContractId', String(contract.typeId));
    sessionStorage.setItem('contractInstallment', String(contract.deadlines));
    sessionStorage.setItem('contractInstallation', String(contract.installation));
    sessionStorage.setItem('contractActivation', String(contract.activation));
    sessionStorage.setItem('contractModen', String(contract.modem));
  },

  // Form (Step 4)
  setFormData: (formData: FormData) => {
    state.formData = formData;
  },

  // Confirmation (Step 5)
  setOrderResult: (orderId: string | null, error: string | null) => {
    state.orderId = orderId;
    state.requestError = error;
  },

  // UI State
  setLoading: (isLoading: boolean) => {
    state.isLoading = isLoading;
  },

  setError: (error: string | null) => {
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

if (typeof window !== 'undefined' && (window as any).__FSF_DEBUG__) {
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
