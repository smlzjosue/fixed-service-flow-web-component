// ============================================
// STEP CONTRACT - Contract Type Selection
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { flowActions } from '../../../store/flow.store';
import { CONTRACT_OPTIONS, SelectedContract, ContractTypeId } from '../../../store/interfaces';
import { formatPrice, formatContractDuration } from '../../../utils/formatters';

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
  // METHODS
  // ------------------------------------------

  private handleTabChange = (typeId: ContractTypeId) => {
    this.activeTab = typeId;
    this.selectedOption = null;
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
            <h1 class="step-contract__title">Selecciona un tipo de contrato</h1>
            <button class="step-contract__btn-back" onClick={this.onBack}>
              Regresar
            </button>
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
              <span class="step-contract__tab-subtitle">Sin verificación de crédito<br/>1 mes de plan por adelantado</span>
            </button>
          </div>

          {/* Content */}
          <div class="step-contract__content">
            {this.activeTab === 1 && withContract && (
              <div class="step-contract__options">
                {withContract.contract.map((option) => (
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
                        {formatContractDuration(option.deadlines)}
                      </span>
                      <div class="step-contract__option-details">
                        <span>Instalación: {option.installation > 0 ? formatPrice(option.installation) : 'Sin Costo'}</span>
                        <span>Activación: {option.activation > 0 ? formatPrice(option.activation) : 'Sin Costo'}</span>
                        <span>Modem: {option.modem > 0 ? formatPrice(option.modem) : 'Sin Costo'}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {this.activeTab === 0 && withoutContract && (
              <div class="step-contract__options">
                {withoutContract.contract.map((option) => (
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
                      <div class="step-contract__option-details">
                        <span>Activación: Sin costo</span>
                        <span>Modem: {formatPrice(option.modem)}</span>
                        <span>Instalación: {formatPrice(option.installation)}</span>
                      </div>
                    </div>
                  </label>
                ))}
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
