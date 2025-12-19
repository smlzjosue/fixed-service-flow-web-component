// ============================================
// TYPESCRIPT INTERFACES
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// CONSTANTS
// ------------------------------------------
/**
 * Valor base del modem (usado en cálculos de Sin Contrato)
 * Fuente: TEL/frondend/src/app/shared/const/appConst.ts
 */
export const VALUE_MODEM = 40;
/**
 * Opciones de contrato para servicio de internet fijo
 * Fuente: TEL/frondend/src/app/shared/const/appConst.ts (INTERNET constant)
 *
 * CON CONTRATO:
 * - 24 meses: Todo sin costo (instalación, activación, modem)
 * - 12 meses: Instalación $25, Activación $20, Modem sin costo
 *
 * SIN CONTRATO:
 * - Instalación $50, Activación $40, Modem $40
 */
export const CONTRACT_OPTIONS = [
    {
        typeId: 1,
        type: 'Con Contrato',
        contract: [
            {
                contractId: 2,
                deadlines: 12,
                installation: 25,
                activation: 20,
                modem: 0,
            },
            {
                contractId: 3,
                deadlines: 24,
                installation: 0,
                activation: 0,
                modem: 0,
            },
        ],
    },
    {
        typeId: 0,
        type: 'Sin Contrato',
        contract: [
            {
                contractId: 1,
                deadlines: 0,
                installation: 50,
                activation: 40, // Corregido: era 0, debe ser 40 (según TEL)
                modem: 40,
            },
        ],
    },
];
export const SERVICE_MESSAGES = {
    GPON: 'Tenemos fibra óptica en tu área y podrás navegar con velocidades de hasta 1,000 megas.',
    VRAD: 'Tenemos servicio de internet DSL disponible en tu área.',
    'CLARO HOGAR': 'Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.',
    NO_COVERAGE: '¡Fuera de área! Por el momento no contamos con cobertura en tu zona.',
};
//# sourceMappingURL=interfaces.js.map
