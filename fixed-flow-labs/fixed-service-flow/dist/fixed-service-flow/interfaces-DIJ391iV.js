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
const VALUE_MODEM = 40;
/**
 * Opciones de contrato para servicio de internet fijo
 *
 * CON CONTRATO:
 * - 12 meses: Instalación $80.00
 * - 24 meses: Instalación $0.00 (sin costo)
 *
 * SIN CONTRATO:
 * - Instalación $160.00
 */
const CONTRACT_OPTIONS = [
    {
        typeId: 1,
        type: 'Con Contrato',
        contract: [
            {
                contractId: 2,
                deadlines: 12,
                installation: 80,
                activation: 0,
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
                installation: 160,
                activation: 0,
                modem: 0,
            },
        ],
    },
];
const SERVICE_MESSAGES = {
    GPON: 'Tenemos fibra óptica en tu área y podrás navegar con velocidades de hasta 1,000 megas.',
    VRAD: 'Tenemos servicio de internet DSL disponible en tu área.',
    'CLARO HOGAR': 'Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.',
    CLARO_HOGAR: 'Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.',
    NO_COVERAGE: '¡Fuera de área! Por el momento no contamos con cobertura en tu zona.',
    PR_LIMIT: 'Actualmente usted se encuentra fuera del rango de cobertura, si usted desea contratar el servicio para otra locación utilice la barra de dirección.',
};

export { CONTRACT_OPTIONS as C, SERVICE_MESSAGES as S };
//# sourceMappingURL=interfaces-DIJ391iV.js.map

//# sourceMappingURL=interfaces-DIJ391iV.js.map