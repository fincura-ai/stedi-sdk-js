import {
  type StediEligibilityInput,
  type StediEligibilityResponse,
  type StediPayerItem,
  type StediTransactionListResponse,
} from './lib/types.js';

/**
 * Placeholder EDI payload returned by the mock `downloadFile`.
 */
export const PLACEHOLDER_EDI =
  'ISA*00*          *00*          *ZZ*INMEMORY        *ZZ*INMEMORY        *250101*0000*^*00501*000000001*0*T*:~' +
  'GS*HB*INMEMORY*INMEMORY*20250101*0000*1*X*005010X279A1~' +
  'ST*271*0001~SE*1*0001~GE*1*1~IEA*1*000000001~';

/**
 * Generic, plausible payers served when Stedi is unreachable in test mode.
 */
export const DEFAULT_SEED_PAYERS: StediPayerItem[] = [
  {
    aliases: ['vanguard', 'benefits', 'corp'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Vanguard Benefits Corp',
    names: ['Vanguard Benefits', 'VANGUARD CARE'],
    primaryPayerId: 'demo_63088',
    stediId: '_GUAR',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
  {
    aliases: ['group', 'benefits', 'nimbus'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Nimbus Benefits Group',
    names: ['Nimbus', 'NIMBUS BENEFITS'],
    primaryPayerId: 'demo_62308',
    stediId: '_CIGN',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
  {
    aliases: ['healthcoverage', 'meridian'],
    coverageTypes: ['dental', 'medical'],
    displayName: 'Meridian HealthCoverage',
    names: ['Meridian Health', 'MHC Dental'],
    primaryPayerId: 'demo_87726',
    stediId: '_UHCD',
    transactionSupport: {
      claimPayment: 'SUPPORTED',
      claimStatus: 'SUPPORTED',
      claimSubmission: 'SUPPORTED',
      coordinationOfBenefits: 'SUPPORTED',
      eligibilityCheck: 'SUPPORTED',
      institutionalClaimSubmission: 'SUPPORTED',
      professionalClaimSubmission: 'SUPPORTED',
    },
  },
];

/**
 * Build a deterministic, schema-valid minimal eligibility response.
 *
 * @param input - The eligibility check parameters.
 * @returns A minimal {@link StediEligibilityResponse}.
 */
export const buildMockEligibilityResponse = (
  input: StediEligibilityInput,
): StediEligibilityResponse => ({
  benefitsInformation: [],
  controlNumber: input.controlNumber,
  eligibilitySearchId: `in-memory-eligibility-${input.controlNumber}`,
  errors: [],
  meta: {
    applicationMode: 'inmemory',
    outboundTraceId: `in-memory-${input.controlNumber}`,
    senderId: 'in-memory',
    submitterId: 'in-memory',
    traceId: `in-memory-${input.controlNumber}`,
  },
  payer: {},
  planDateInformation: {},
  planInformation: {},
  provider: {
    entityIdentifier: '',
    entityType: '',
    npi: input.provider.npi,
    providerName: input.provider.organizationName,
  },
  reassociationKey: `in-memory-${input.controlNumber}`,
  subscriber: {},
  tradingPartnerServiceId: input.tradingPartnerServiceId,
});

/**
 * Empty transaction page served when Stedi is unreachable in test mode.
 *
 * @returns An empty {@link StediTransactionListResponse}.
 */
export const buildMockTransactionPage = (): StediTransactionListResponse => ({
  items: [],
});

/**
 * Match the in-memory payer search semantics against the seed payers.
 *
 * @param queryParameters - Search parameters.
 * @returns Matching seed payers.
 */
export const searchMockPayers = (
  queryParameters: Record<string, string[] | number | string>,
): StediPayerItem[] => {
  const query =
    typeof queryParameters.query === 'string'
      ? queryParameters.query.toLowerCase()
      : undefined;
  const eligibilityCheck =
    typeof queryParameters.eligibilityCheck === 'string'
      ? queryParameters.eligibilityCheck
      : undefined;

  return DEFAULT_SEED_PAYERS.filter((payer) => {
    if (query !== undefined) {
      const haystack = [
        payer.displayName,
        payer.primaryPayerId,
        payer.stediId,
        ...payer.names,
        ...payer.aliases,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (
      eligibilityCheck !== undefined &&
      payer.transactionSupport.eligibilityCheck !== eligibilityCheck
    ) {
      return false;
    }

    return true;
  });
};
