// ============================================
// STEP CONTRACT - Contract Type Selection
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { flowState, flowActions } from '../../../store/flow.store';
import { CONTRACT_OPTIONS, SelectedContract, ContractTypeId, ContractOption } from '../../../store/interfaces';
import { formatPrice } from '../../../utils/formatters';

@Component({
  tag: 'step-contract',
  styleUrl: 'step-contract.scss',
  shadow: true,
})
export class StepContract {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() activeTab: ContractTypeId = 1; // 1 = Con contrato
  @State() selectedOption: SelectedContract | null = null;

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  componentWillLoad() {
    // Restaurar selección previa si existe (cuando el usuario vuelve a este paso)
    this.restorePreviousSelection();
  }

  // ------------------------------------------
  // METHODS
  // ------------------------------------------

  /**
   * Restaura la selección previa desde el store o sessionStorage
   * Esto permite mantener la selección cuando el usuario navega hacia atrás
   */
  private restorePreviousSelection() {
    // Primero intentar desde el store
    if (flowState.selectedContract) {
      this.selectedOption = flowState.selectedContract;
      this.activeTab = flowState.selectedContract.typeId;
      return;
    }

    // Si no está en el store, intentar desde sessionStorage
    const typeContractId = sessionStorage.getItem('typeContractId');
    if (typeContractId !== null) {
      const typeId = parseInt(typeContractId) as ContractTypeId;
      const deadlines = parseInt(sessionStorage.getItem('contractInstallment') || '0');
      const installation = parseInt(sessionStorage.getItem('contractInstallation') || '0');
      const activation = parseInt(sessionStorage.getItem('contractActivation') || '0');
      const modem = parseInt(sessionStorage.getItem('contractModen') || '0');

      const contractType = CONTRACT_OPTIONS.find(c => c.typeId === typeId);

      this.selectedOption = {
        typeId,
        typeName: contractType?.type || '',
        deadlines,
        installation,
        activation,
        modem,
      };
      this.activeTab = typeId;

      // Sincronizar con el store
      flowActions.setContract(this.selectedOption);
    }
  }

  private handleTabChange = (typeId: ContractTypeId) => {
    this.activeTab = typeId;
    // No limpiar la selección si ya hay una del mismo tipo
    if (this.selectedOption?.typeId !== typeId) {
      this.selectedOption = null;
    }
  };

  private handleSelectOption = (typeId: ContractTypeId, option: any) => {
    const contractType = CONTRACT_OPTIONS.find(c => c.typeId === typeId);

    this.selectedOption = {
      typeId,
      typeName: contractType?.type || '',
      deadlines: option.deadlines,
      installation: option.installation,
      activation: option.activation,
      modem: option.modem,
    };

    flowActions.setContract(this.selectedOption);
  };

  private handleContinue = () => {
    if (this.selectedOption) {
      this.onNext?.();
    }
  };

  /**
   * Calcula el costo total de instalación (instalación + activación + modem)
   * Este es el valor que se muestra en la UI según el diseño de referencia
   */
  private getTotalInstallationCost(option: ContractOption): number {
    return option.installation + option.activation + option.modem;
  }

  /**
   * Formatea la duración del contrato para mostrar en la card
   * Ej: "12 Meses de Contrato", "24 Meses de Contrato", "Sin contrato"
   */
  private formatContractLabel(months: number): string {
    if (months === 0) return 'Sin contrato';
    return `${months} Meses de Contrato`;
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const withContract = CONTRACT_OPTIONS.find(c => c.typeId === 1);
    const withoutContract = CONTRACT_OPTIONS.find(c => c.typeId === 0);

    return (
      <Host>
        <div class="step-contract">
          {/* Header */}
          <header class="step-contract__header">
            <button class="step-contract__back-link" onClick={this.onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Regresar</span>
            </button>
            <h1 class="step-contract__title">Selecciona un tipo de contrato</h1>
            <div class="step-contract__divider"></div>
          </header>

          {/* Tabs */}
          <div class="step-contract__tabs">
            <button
              class={{
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 1,
              }}
              onClick={() => this.handleTabChange(1)}
            >
              <span class="step-contract__tab-title">Con contrato</span>
              <span class="step-contract__tab-subtitle">12 y 24 meses de contrato</span>
            </button>
            <button
              class={{
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 0,
              }}
              onClick={() => this.handleTabChange(0)}
            >
              <span class="step-contract__tab-title">Sin contrato</span>
              <span class="step-contract__tab-subtitle">Plan mensual con pago por adelantado</span>
            </button>
          </div>

          {/* Content */}
          <div class="step-contract__content">
            {this.activeTab === 1 && withContract && (
              <div class="step-contract__options">
                {withContract.contract.map((option) => {
                  const totalCost = this.getTotalInstallationCost(option);
                  return (
                    <label
                      class={{
                        'step-contract__option': true,
                        'step-contract__option--selected':
                          this.selectedOption?.deadlines === option.deadlines &&
                          this.selectedOption?.typeId === 1,
                      }}
                    >
                      <input
                        type="radio"
                        name="contract"
                        checked={
                          this.selectedOption?.deadlines === option.deadlines &&
                          this.selectedOption?.typeId === 1
                        }
                        onChange={() => this.handleSelectOption(1, option)}
                      />
                      <div class="step-contract__option-content">
                        <span class="step-contract__option-title">
                          {this.formatContractLabel(option.deadlines)}
                        </span>
                        <span class="step-contract__option-price">
                          Instalación: {totalCost > 0 ? formatPrice(totalCost) : '$0.00'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {this.activeTab === 0 && withoutContract && (
              <div class="step-contract__options step-contract__options--single">
                {withoutContract.contract.map((option) => {
                  const totalCost = this.getTotalInstallationCost(option);
                  return (
                    <label
                      class={{
                        'step-contract__option': true,
                        'step-contract__option--selected':
                          this.selectedOption?.typeId === 0,
                      }}
                    >
                      <input
                        type="radio"
                        name="contract"
                        checked={this.selectedOption?.typeId === 0}
                        onChange={() => this.handleSelectOption(0, option)}
                      />
                      <div class="step-contract__option-content">
                        <span class="step-contract__option-title">Sin contrato</span>
                        <span class="step-contract__option-price">
                          Instalación: {formatPrice(totalCost)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div class="step-contract__actions">
            <button
              class="step-contract__btn-continue"
              onClick={this.handleContinue}
              disabled={!this.selectedOption}
            >
              Continuar
            </button>
          </div>
        </div>
      </Host>
    );
  }
}
