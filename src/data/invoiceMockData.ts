export interface InvoiceUtilityLine {
    category: string;
    meterNo: string;
    period: string;
    consumption: string;
    exclVat: number;
    vat: number;
    lineTotal: number;
}

export interface InvoiceRefuse {
    councilTotal: number;
    proRataPercent: number;
    calculatedShare: number;
    landlordClaimed: number;
    approved: boolean;
    cappedAmount: number;
}

export interface BASAllocation {
    category: string;
    code: string;
    amount: number;
    icon: string;
    objective: string;
    responsibility: string;
    fund: string;
    asset: string;
    item: string;
    infrastructure: string;
}

export interface InvoiceRecord {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    billingMonth: string;
    landlordName: string;
    vatNumber: string;
    bankName: string;
    bankAccount: string;
    propertyName: string;
    propertyAddress: string;
    buildingSize: number;
    leasedArea: number;
    proRataShare: number;
    paymentMethod: 'EBT' | 'Manual';
    utilities: InvoiceUtilityLine[];
    refuse: InvoiceRefuse;
    totalExclVat: number;
    totalVat: number;
    totalAmount: number;
    basAllocations: BASAllocation[];
    status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'In Review' | 'Paid';
    currentStep: number;
    submittedBy: string;
    submittedDate: string;
    checklist: { label: string; checked: boolean }[];
    signedBy?: string;
    signedDate?: string;
}

export const INVOICE_STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Pending Approval', label: 'Pending Approval' },
    { value: 'In Review', label: 'In Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Paid', label: 'Paid' },
];

export const BAS_OPTIONS = {
    objectives: [
        { value: '001', label: '001 - Rural Electrification' },
        { value: '002', label: '002 - Urban Development' },
        { value: '003', label: '003 - Municipal Services' },
    ],
    responsibilities: [
        { value: '8821', label: '8821 - Northern Cape Hub' },
        { value: '8822', label: '8822 - Western Cape Hub' },
        { value: '8823', label: '8823 - Gauteng Hub' },
    ],
    funds: [
        { value: '12', label: '12 - Equitable Share' },
        { value: '14', label: '14 - Conditional Grant' },
        { value: '16', label: '16 - Municipal Fund' },
    ],
    assets: [
        { value: '0000', label: '0000 - General Admin' },
        { value: '0001', label: '0001 - Land & Buildings' },
        { value: '0002', label: '0002 - Infrastructure' },
    ],
    items: [
        { value: '5411', label: '5411 - Electricity Services' },
        { value: '5412', label: '5412 - Water Services' },
        { value: '5413', label: '5413 - Sewerage Services' },
        { value: '5414', label: '5414 - Refuse Services' },
    ],
    infrastructures: [
        { value: 'STAND-00', label: 'STAND-00 - Existing Site' },
        { value: 'STAND-01', label: 'STAND-01 - New Site' },
    ],
};

const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

export const MOCK_INVOICES: InvoiceRecord[] = [
    {
        id: 'INV-001',
        invoiceNumber: '91957/202601/1',
        invoiceDate: '2025-12-17',
        billingMonth: 'January 2026',
        landlordName: 'Centpret Properties (Pty) Ltd',
        vatNumber: '4590144004',
        bankName: 'NEDBANK',
        bankAccount: '1633333221',
        propertyName: 'Praetor Forum Building, Pretoria',
        propertyAddress: '198 Pretorius Street, Pretoria Central, 0002',
        buildingSize: 6105,
        leasedArea: 575,
        proRataShare: 9.4185,
        paymentMethod: 'EBT',
        utilities: [
            { category: 'Electricity', meterNo: 'EL-55829-01', period: '01/03 - 31/03', consumption: '1240 kWh', exclVat: 6450.00, vat: 967.50, lineTotal: 7417.50 },
            { category: 'Water', meterNo: 'WT-99231-X', period: '01/03 - 31/03', consumption: '34 KL', exclVat: 2820.25, vat: 423.04, lineTotal: 3243.29 },
            { category: 'Sewerage', meterNo: 'SW-1012', period: '01/03 - 31/03', consumption: 'Fixed Rate', exclVat: 1434.00, vat: 215.10, lineTotal: 1649.10 },
        ],
        refuse: { councilTotal: 4664.88, proRataPercent: 9.4185, calculatedShare: 439.36, landlordClaimed: 428.42, approved: true, cappedAmount: 428.42 },
        totalExclVat: 10704.25, totalVat: 1605.63, totalAmount: 12309.88,
        basAllocations: [
            { category: 'Electricity', code: '0101', amount: 4103.29, icon: '⚡', objective: '001', responsibility: '8821', fund: '12', asset: '0000', item: '5411', infrastructure: 'STAND-00' },
            { category: 'Water', code: '0204', amount: 2051.65, icon: '💧', objective: '001', responsibility: '8821', fund: '12', asset: '0000', item: '5412', infrastructure: 'STAND-00' },
            { category: 'Sewerage', code: '0311', amount: 3077.47, icon: '🔧', objective: '001', responsibility: '8821', fund: '12', asset: '0000', item: '5413', infrastructure: 'STAND-00' },
            { category: 'Refuse', code: '0409', amount: 3077.47, icon: '🗑️', objective: '003', responsibility: '8821', fund: '12', asset: '0000', item: '5414', infrastructure: 'STAND-00' },
        ],
        status: 'Pending Approval', currentStep: 4,
        submittedBy: 'Ms M Semenya', submittedDate: TODAY,
        checklist: [
            { label: 'Original invoice scanned and verified', checked: true },
            { label: 'Bank details cross-referenced with supplier database', checked: true },
            { label: 'Document integrity verification completed', checked: true },
        ],
        signedBy: 'M. Semenya', signedDate: TODAY,
    },
    {
        id: 'INV-002',
        invoiceNumber: '84221/202602/3',
        invoiceDate: '2026-01-15',
        billingMonth: 'February 2026',
        landlordName: 'Growthpoint Properties Ltd',
        vatNumber: '4120098876',
        bankName: 'ABSA',
        bankAccount: '4055667788',
        propertyName: 'Hatfield Gardens, Pretoria',
        propertyAddress: '412 Burnett St, Hatfield, 0083',
        buildingSize: 8200,
        leasedArea: 920,
        proRataShare: 11.2195,
        paymentMethod: 'EBT',
        utilities: [
            { category: 'Electricity', meterNo: 'EL-77210-02', period: '01/02 - 28/02', consumption: '1580 kWh', exclVat: 8210.00, vat: 1231.50, lineTotal: 9441.50 },
            { category: 'Water', meterNo: 'WT-33102-A', period: '01/02 - 28/02', consumption: '42 KL', exclVat: 3150.00, vat: 472.50, lineTotal: 3622.50 },
            { category: 'Sewerage', meterNo: 'SW-2201', period: '01/02 - 28/02', consumption: 'Fixed Rate', exclVat: 1680.00, vat: 252.00, lineTotal: 1932.00 },
        ],
        refuse: { councilTotal: 5200.00, proRataPercent: 11.2195, calculatedShare: 583.41, landlordClaimed: 610.00, approved: false, cappedAmount: 583.41 },
        totalExclVat: 13040.00, totalVat: 1956.00, totalAmount: 15579.41,
        basAllocations: [],
        status: 'In Review', currentStep: 2,
        submittedBy: 'Mr J Mokoena', submittedDate: '2026-02-05',
        checklist: [
            { label: 'Original invoice scanned and verified', checked: true },
            { label: 'Bank details cross-referenced with supplier database', checked: false },
            { label: 'Document integrity verification completed', checked: false },
        ],
    },
    {
        id: 'INV-003',
        invoiceNumber: '55102/202601/7',
        invoiceDate: '2025-11-30',
        billingMonth: 'December 2025',
        landlordName: 'Redefine Properties Ltd',
        vatNumber: '4780055612',
        bankName: 'FNB',
        bankAccount: '6244001199',
        propertyName: 'Sunnypark Centre, Pretoria',
        propertyAddress: '1 Esselen St, Sunnyside, 0002',
        buildingSize: 4500,
        leasedArea: 380,
        proRataShare: 8.4444,
        paymentMethod: 'Manual',
        utilities: [
            { category: 'Electricity', meterNo: 'EL-44102-05', period: '01/12 - 31/12', consumption: '890 kWh', exclVat: 4620.00, vat: 693.00, lineTotal: 5313.00 },
            { category: 'Water', meterNo: 'WT-11053-B', period: '01/12 - 31/12', consumption: '22 KL', exclVat: 1650.00, vat: 247.50, lineTotal: 1897.50 },
            { category: 'Sewerage', meterNo: 'SW-0891', period: '01/12 - 31/12', consumption: 'Fixed Rate', exclVat: 980.00, vat: 147.00, lineTotal: 1127.00 },
        ],
        refuse: { councilTotal: 3800.00, proRataPercent: 8.4444, calculatedShare: 320.89, landlordClaimed: 290.50, approved: true, cappedAmount: 290.50 },
        totalExclVat: 7250.00, totalVat: 1087.50, totalAmount: 8628.00,
        basAllocations: [
            { category: 'Electricity', code: '0101', amount: 5313.00, icon: '⚡', objective: '002', responsibility: '8823', fund: '14', asset: '0001', item: '5411', infrastructure: 'STAND-00' },
            { category: 'Water', code: '0204', amount: 1897.50, icon: '💧', objective: '002', responsibility: '8823', fund: '14', asset: '0001', item: '5412', infrastructure: 'STAND-00' },
            { category: 'Sewerage', code: '0311', amount: 1127.00, icon: '🔧', objective: '002', responsibility: '8823', fund: '14', asset: '0001', item: '5413', infrastructure: 'STAND-00' },
            { category: 'Refuse', code: '0409', amount: 290.50, icon: '🗑️', objective: '003', responsibility: '8823', fund: '14', asset: '0001', item: '5414', infrastructure: 'STAND-00' },
        ],
        status: 'Approved', currentStep: 4,
        submittedBy: 'Ms T Nkosi', submittedDate: '2025-12-10',
        checklist: [
            { label: 'Original invoice scanned and verified', checked: true },
            { label: 'Bank details cross-referenced with supplier database', checked: true },
            { label: 'Document integrity verification completed', checked: true },
        ],
        signedBy: 'T. Nkosi', signedDate: '2025-12-10',
    },
    {
        id: 'INV-004',
        invoiceNumber: '67443/202603/2',
        invoiceDate: '2026-02-28',
        billingMonth: 'March 2026',
        landlordName: 'Attacq Ltd',
        vatNumber: '4330022110',
        bankName: 'STANDARD BANK',
        bankAccount: '2810044556',
        propertyName: 'Waterfall Business Park, Midrand',
        propertyAddress: '10 Waterfall Dr, Midrand, 1685',
        buildingSize: 12000,
        leasedArea: 1100,
        proRataShare: 9.1667,
        paymentMethod: 'EBT',
        utilities: [
            { category: 'Electricity', meterNo: 'EL-88401-09', period: '01/03 - 31/03', consumption: '2100 kWh', exclVat: 10920.00, vat: 1638.00, lineTotal: 12558.00 },
            { category: 'Water', meterNo: 'WT-55890-C', period: '01/03 - 31/03', consumption: '58 KL', exclVat: 4350.00, vat: 652.50, lineTotal: 5002.50 },
            { category: 'Sewerage', meterNo: 'SW-3301', period: '01/03 - 31/03', consumption: 'Fixed Rate', exclVat: 2100.00, vat: 315.00, lineTotal: 2415.00 },
        ],
        refuse: { councilTotal: 6200.00, proRataPercent: 9.1667, calculatedShare: 568.33, landlordClaimed: 520.00, approved: true, cappedAmount: 520.00 },
        totalExclVat: 17370.00, totalVat: 2605.50, totalAmount: 20495.50,
        basAllocations: [],
        status: 'Draft', currentStep: 1,
        submittedBy: 'Mr K Dlamini', submittedDate: '2026-03-05',
        checklist: [
            { label: 'Original invoice scanned and verified', checked: false },
            { label: 'Bank details cross-referenced with supplier database', checked: false },
            { label: 'Document integrity verification completed', checked: false },
        ],
    },
    {
        id: 'INV-005',
        invoiceNumber: '72180/202601/4',
        invoiceDate: '2025-12-31',
        billingMonth: 'January 2026',
        landlordName: 'Fortress REIT Ltd',
        vatNumber: '4890033445',
        bankName: 'CAPITEC',
        bankAccount: '9120088334',
        propertyName: 'Eastgate Office Park, Sandton',
        propertyAddress: '55 Grayston Dr, Sandton, 2196',
        buildingSize: 5500,
        leasedArea: 480,
        proRataShare: 8.7273,
        paymentMethod: 'EBT',
        utilities: [
            { category: 'Electricity', meterNo: 'EL-22901-03', period: '01/01 - 31/01', consumption: '980 kWh', exclVat: 5096.00, vat: 764.40, lineTotal: 5860.40 },
            { category: 'Water', meterNo: 'WT-66301-D', period: '01/01 - 31/01', consumption: '28 KL', exclVat: 2100.00, vat: 315.00, lineTotal: 2415.00 },
            { category: 'Sewerage', meterNo: 'SW-1450', period: '01/01 - 31/01', consumption: 'Fixed Rate', exclVat: 1200.00, vat: 180.00, lineTotal: 1380.00 },
        ],
        refuse: { councilTotal: 4100.00, proRataPercent: 8.7273, calculatedShare: 357.82, landlordClaimed: 380.00, approved: false, cappedAmount: 357.82 },
        totalExclVat: 8396.00, totalVat: 1259.40, totalAmount: 10013.22,
        basAllocations: [
            { category: 'Electricity', code: '0101', amount: 5860.40, icon: '⚡', objective: '001', responsibility: '8822', fund: '12', asset: '0000', item: '5411', infrastructure: 'STAND-00' },
            { category: 'Water', code: '0204', amount: 2415.00, icon: '💧', objective: '001', responsibility: '8822', fund: '12', asset: '0000', item: '5412', infrastructure: 'STAND-00' },
            { category: 'Sewerage', code: '0311', amount: 1380.00, icon: '🔧', objective: '001', responsibility: '8822', fund: '12', asset: '0000', item: '5413', infrastructure: 'STAND-00' },
            { category: 'Refuse', code: '0409', amount: 357.82, icon: '🗑️', objective: '003', responsibility: '8822', fund: '12', asset: '0000', item: '5414', infrastructure: 'STAND-00' },
        ],
        status: 'Paid', currentStep: 4,
        submittedBy: 'Ms L van Wyk', submittedDate: '2026-01-08',
        checklist: [
            { label: 'Original invoice scanned and verified', checked: true },
            { label: 'Bank details cross-referenced with supplier database', checked: true },
            { label: 'Document integrity verification completed', checked: true },
        ],
        signedBy: 'L. van Wyk', signedDate: '2026-01-08',
    },
    {
        id: 'INV-006',
        invoiceNumber: '39210/202602/1',
        invoiceDate: '2026-01-31',
        billingMonth: 'February 2026',
        landlordName: 'Vukile Property Fund',
        vatNumber: '4660077889',
        bankName: 'INVESTEC',
        bankAccount: '7830011223',
        propertyName: 'Menlyn Maine, Pretoria',
        propertyAddress: '100 Amarand Ave, Menlyn, 0181',
        buildingSize: 9500,
        leasedArea: 850,
        proRataShare: 8.9474,
        paymentMethod: 'Manual',
        utilities: [
            { category: 'Electricity', meterNo: 'EL-99001-07', period: '01/02 - 28/02', consumption: '1750 kWh', exclVat: 9100.00, vat: 1365.00, lineTotal: 10465.00 },
            { category: 'Water', meterNo: 'WT-44201-E', period: '01/02 - 28/02', consumption: '50 KL', exclVat: 3750.00, vat: 562.50, lineTotal: 4312.50 },
            { category: 'Sewerage', meterNo: 'SW-2890', period: '01/02 - 28/02', consumption: 'Fixed Rate', exclVat: 1890.00, vat: 283.50, lineTotal: 2173.50 },
        ],
        refuse: { councilTotal: 5800.00, proRataPercent: 8.9474, calculatedShare: 518.95, landlordClaimed: 495.00, approved: true, cappedAmount: 495.00 },
        totalExclVat: 14740.00, totalVat: 2211.00, totalAmount: 17446.00,
        basAllocations: [],
        status: 'Rejected', currentStep: 3,
        submittedBy: 'Mr P Govender', submittedDate: '2026-02-12',
        checklist: [
            { label: 'Original invoice scanned and verified', checked: true },
            { label: 'Bank details cross-referenced with supplier database', checked: true },
            { label: 'Document integrity verification completed', checked: false },
        ],
    },
];
