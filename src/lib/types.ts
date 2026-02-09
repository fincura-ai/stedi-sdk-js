// COMMON

type Provider = {
  entityIdentifier: string;
  entityType: string;
  npi: string;
  providerName: string;
};

type Address = {
  address1: string;
  city: string;
  postalCode: string;
  state: string;
};

type Subscriber = {
  address?: Address;
  dateOfBirth?: string;
  entityIdentifier?: string;
  entityType?: string;
  firstName?: string;
  gender?: string;
  groupDescription?: string;
  groupNumber?: string;
  lastName?: string;
  memberId?: string;
  planNetworkDescription?: string;
  planNetworkIdNumber?: string;
};

type ErrorDetail = {
  code: string;
  description: string;
  field: string;
  followupAction: string;
  location: string;
  possibleResolutions: string;
};

// ELIGIBILITY

export type StediEligibilityInput = {
  controlNumber: string;
  dependents?: Array<{
    dateOfBirth: string;
    firstName: string;
    lastName: string;
    memberId: string;
  }>;
  encounter?: {
    dateOfService: string;
  };
  provider: {
    npi: string;
    organizationName: string;
  };
  subscriber?: {
    dateOfBirth: string;
    firstName: string;
    lastName: string;
    memberId: string;
  };
  tradingPartnerName: string;
  tradingPartnerServiceId: string;
};

type AdditionalInformation = {
  description: string;
};

type BenefitsServiceDelivery = {
  quantity?: string;
  quantityQualifier?: string;
  quantityQualifierCode?: string;
  sampleSelectionModulus?: string;
  unitForMeasurementCode?: string;
  unitForMeasurementQualifier?: string;
  unitForMeasurementQualifierCode?: string;
};

export type BenefitsInformation = {
  additionalInformation?: AdditionalInformation[];
  authOrCertIndicator?: string;
  benefitAmount?: string;
  benefitPercent?: string;
  benefitQuantity?: string;
  benefitsServiceDelivery?: BenefitsServiceDelivery[];
  code?: string;
  coverageLevel?: string;
  coverageLevelCode?: string;
  id?: string;
  inPlanNetworkIndicator?: string;
  inPlanNetworkIndicatorCode?: string;
  insuranceType?: string;
  insuranceTypeCode?: string;
  name?: string;
  planCoverage?: string;
  quantityQualifier?: string;
  quantityQualifierCode?: string;
  serviceTypeCodes?: string[];
  serviceTypes?: string[];
  timeQualifier?: string;
  timeQualifierCode?: string;
};

type Contact = {
  communicationMode?: string;
  communicationNumber?: string;
};

type Dependent = {
  address: Address;
  dateOfBirth: string;
  entityType: string;
  firstName: string;
  gender: string;
  groupNumber: string;
  insuredIndicator: string;
  lastName: string;
  maintenanceReasonCode: string;
  maintenanceTypeCode: string;
  middleName: string;
  relationToSubscriber: string;
  relationToSubscriberCode: string;
};

type Meta = {
  applicationMode: string;
  outboundTraceId: string;
  senderId: string;
  submitterId: string;
  traceId: string;
};

type PlanInformation = {
  eligibilityBegin?: string;
  groupDescription?: string;
  groupNumber?: string;
  planBegin?: string;
  planEnd?: string;
  planNetworkIdDescription?: string;
  planNetworkIdNumber?: string;
};

type PlanDateInformation = {
  eligibilityBegin?: string;
  groupDescription?: string;
  groupNumber?: string;
  planBegin?: string;
  planEnd?: string;
};

type PlanStatus = {
  planDetails?: string;
  serviceTypeCodes?: string[];
  status?: string;
  statusCode?: string;
};

export type StediEligibilityResponse = {
  benefitsInformation: BenefitsInformation[];
  controlNumber: string;
  dependents?: Dependent[];
  eligibilitySearchId: string;
  errors: ErrorDetail[];
  meta: Meta;
  payer: {
    contactInformation?: {
      contacts?: Contact[];
    };
    entityIdentifier?: string;
    entityType?: string;
    federalTaxpayersIdNumber?: string;
    name?: string;
  };
  planDateInformation: PlanDateInformation;
  planInformation: PlanInformation;
  planStatus?: PlanStatus[];
  provider: Provider;
  reassociationKey: string;
  subscriber: Subscriber;
  tradingPartnerServiceId: string;
  x12?: string;
};

// PAYERS

export type StediPayerItem = {
  aliases: string[];
  coverageTypes?: string[];
  displayName: string;
  names: string[];
  primaryPayerId: string;
  stediId: string;
  transactionSupport: {
    claimPayment: string;
    claimStatus: string;
    claimSubmission: string;
    coordinationOfBenefits: string;
    eligibilityCheck: string;
    institutionalClaimSubmission: string;
    professionalClaimSubmission: string;
  };
};

export type StediPayerSearchResponse = {
  items: Array<{
    payer: StediPayerItem;
    score: number;
  }>;
};

export type StediPayerResponse = {
  items: StediPayerItem[];
};

// TRANSACTIONS

export type StediX12Metadata = {
  /**
   * Functional group information
   */
  functionalGroup: {
    /**
     * The control number for the functional group
     */
    controlNumber: number;

    /**
     * The date of the functional group
     */
    date: string;

    /**
     * The functional identifier code
     */
    functionalIdentifierCode: string;

    /**
     * The release of the functional group
     */
    release: string;

    /**
     * The time of the functional group
     */
    time: string;

    /**
     * Additional functional group properties could be added based on the nested content
     */
  };

  /**
   * Interchange information
   */
  interchange: {
    /**
     * The acknowledgment requested code
     */
    acknowledgmentRequestedCode: string;

    /**
     * The control number for the interchange
     */
    controlNumber: number;

    /**
     * Additional interchange properties could be added based on the nested content
     */
  };

  /**
   * Receiver information
   */
  receiver: {
    /**
     * The application code of the receiver
     */
    applicationCode: string;

    /**
     * The ISA information for the receiver
     */
    isa: {
      id: string;
      qualifier: string;
    };
  };

  /**
   * Sender information
   */
  sender: {
    /**
     * The application code of the sender
     */
    applicationCode: string;

    /**
     * The ISA information for the sender
     */
    isa: {
      id: string;
      qualifier: string;
    };
  };

  /**
   * Transaction information
   */
  transaction: {
    /**
     * The control number for the transaction
     */
    controlNumber: string;

    /**
     * The transaction set identifier
     */
    transactionSetIdentifier: string;

    /**
     * Additional transaction properties could be added based on the nested content
     */
  };
};

/**
 * Represents a transaction item in the Stedi Transactions API response
 */
export type StediTransactionItem = {
  /**
   * The artifacts associated with this transaction
   */
  artifacts: Array<{
    /**
     * The type of artifact
     */
    artifactType:
      | 'application/edi-x12'
      | 'application/edifact'
      | 'application/filepart'
      | 'application/json'
      | 'application/pdf'
      | 'application/xml'
      | 'application/zip'
      | 'text/csv'
      | 'text/psv'
      | 'text/tsv';

    /**
     * The model of the artifact
     */
    model: 'execution' | 'fault' | 'fragment' | 'transaction';

    /**
     * The size of the artifact in bytes
     */
    sizeBytes: number;

    /**
     * The URL to access the artifact
     */
    url: string;

    /**
     * The usage of the artifact
     */
    usage: 'input' | 'metadata' | 'output';
  }>;

  /**
   * Business identifiers for the transaction (optional)
   */
  businessIdentifiers?: Array<{
    /**
     * The element where the business identifier was found, e.g. BEG-03
     */
    element: string;

    /**
     * The identifier of the element as seen in the EDI ref
     */
    elementId: string;

    /**
     * The friendly name of the business identifier, e.g. Purchase Order Number
     */
    name: string;

    /**
     * The value of the business identifier
     */
    value: string;
  }>;

  /**
   * The direction of the transaction
   */
  direction: 'INBOUND' | 'OUTBOUND' | 'UNKNOWN';

  /**
   * A unique identifier for the file execution that processed this transaction
   */
  fileExecutionId: string;

  /**
   * Fragment information (optional)
   */
  fragments?: {
    /**
     * The batch size
     */
    batchSize: number;

    /**
     * The count of fragments
     */
    fragmentCount: number;

    /**
     * The key name for the fragment
     */
    keyName: string;
  };

  /**
   * The mode in which the transaction was processed
   */
  mode: 'other' | 'production' | 'test';

  /**
   * The operation (optional)
   */
  operation?: string;

  /**
   * The partnership information for this transaction
   */
  partnership: {
    /**
     * Identifier chosen by the user to uniquely identify a partnership
     */
    partnershipId: string;

    /**
     * The type of partnership
     */
    partnershipType: 'edifact' | 'x12';

    /**
     * The receiver information
     */
    receiver: {
      /**
       * The profile ID of the receiver
       */
      profileId: string;
    };

    /**
     * The sender information
     */
    sender: {
      /**
       * The profile ID of the sender
       */
      profileId: string;
    };
  };

  /**
   * The timestamp when the transaction was processed
   */
  processedAt: string;

  /**
   * The status of the transaction
   */
  status: 'failed' | 'succeeded';

  /**
   * A unique identifier for the processed transaction within Stedi
   */
  transactionId: string;

  /**
   * Any translation errors that occurred (optional)
   */
  translationErrors?: Array<{
    /**
     * The context of the error (optional)
     */
    context?: {
      /**
       * The error code
       */
      code?: string;

      /**
       * The schema path where the error occurred
       */
      schemaPath?: string;
    };

    /**
     * The mark indicating the location of the error in the document
     */
    mark?: {
      /**
       * The end position (optional)
       */
      end?: {
        /**
         * The column number
         */
        column: number;

        /**
         * The line number
         */
        line: number;
      };

      /**
       * The start position
       */
      start: {
        /**
         * The column number
         */
        column: number;

        /**
         * The line number
         */
        line: number;
      };
    };

    /**
     * The error message
     */
    message: string;
  }>;

  /**
   * X12 specific information (optional)
   */
  x12?: {
    /**
     * Metadata about the X12 document
     */
    metadata: StediX12Metadata;

    /**
     * The transaction setting (optional)
     */
    transactionSetting?: {
      /**
       * The guide ID
       */
      guideId?: string;

      /**
       * The transaction setting ID
       */
      transactionSettingId?: string;
    };
  };
};

export type StediTransactionGetResponse = StediTransactionItem;

export type StediTransactionListResponse = {
  items: StediTransactionItem[];
  nextPageToken?: string;
};

// PROVIDER

export type StediProviderInput = {
  contacts: Array<{
    city: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
    streetAddress1: string;
    zipCode: string;
  }>;
  name: string;
  npi: string;
  taxId: string;
  taxIdType: string;
};

export type StediProviderResponse = {
  contacts: Array<{
    city: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    phone: string;
    state: string;
    streetAddress1: string;
    zipCode: string;
  }>;
  createdAt: string;
  id: string;
  name: string;
  npi: string;
  taxId: string;
  taxIdType: string;
  updatedAt: string;
};

export type StediProviderListItem = {
  id: string;
  name: string;
  npi: string;
  taxId: string;
  taxIdType: string;
};

export type StediProviderListResponse = {
  items: StediProviderListItem[];
  nextPageToken?: string;
};

export type StediListProvidersParams = {
  /**
   * Filter for providers with properties matching a query string.
   * Supports fuzzy matching on provider name, NPI, or tax ID.
   */
  filter?: string;
  /**
   * The maximum number of elements to return in a page (1-500, default 100).
   */
  pageSize?: number;
  /**
   * An opaque token for pagination, returned by a previous call in `nextPageToken`.
   */
  pageToken?: string;
  /**
   * Filter for providers with NPIs matching any value in this list.
   */
  providerNpis?: string[];
  /**
   * Filter for providers with tax IDs matching any value in this list.
   */
  providerTaxIds?: string[];
};

export type StediEnrollmentInput = {
  payer: {
    idOrAlias: string;
  };
  primaryContact: {
    city: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
    streetAddress1: string;
    zipCode: string;
  };
  provider: {
    id: string;
  };
  source: string;
  status: StediEnrollmentStatus;
  transactions: {
    claimPayment: {
      enroll: boolean;
    };
  };
  userEmail: string;
};

export type StediEnrollmentStatus =
  | 'CANCELED'
  | 'DRAFT'
  | 'LIVE'
  | 'PROVISIONING'
  | 'REJECTED'
  | 'SUBMITTED';

export type StediEnrollmentSource = 'API' | 'UI';

export type StediEnrollmentTransaction =
  | 'claimPayment'
  | 'claimStatus'
  | 'claimSubmission'
  | 'coordinationOfBenefits'
  | 'eligibilityCheck';

export type StediEnrollmentDocument = {
  createdAt: string;
  enrollmentId: string;
  id: string;
  name: string;
  status: string;
  updatedAt: string;
};

export type StediEnrollmentHistoryItem = {
  changedAt: string;
  changedBy: string;
  newStatus: string;
  previousStatus?: string;
  type: string;
};

export type StediEnrollmentTask = {
  definition: {
    followInstructions?: {
      instructions: string;
    };
  };
  id: string;
  isComplete: boolean;
  rank: number;
  responsibleParty: string;
};

export type StediEnrollmentResponse = {
  createdAt: string;
  documents?: StediEnrollmentDocument[];
  history?: StediEnrollmentHistoryItem[];
  id: string;
  payer: {
    name?: string;
    stediPayerId: string;
    submittedPayerIdOrAlias?: string;
  };
  primaryContact?: {
    city?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    state?: string;
    streetAddress1?: string;
    zipCode?: string;
  };
  provider: {
    id: string;
    name?: string;
    npi?: string;
    taxId?: string;
    taxIdType?: string;
  };
  reason?: string;
  source?: string;
  status: StediEnrollmentStatus;
  statusLastUpdatedAt?: string;
  submittedAt?: string;
  tasks?: StediEnrollmentTask[];
  transactions?: {
    claimPayment?: {
      enroll: boolean;
    };
  };
  updatedAt: string;
  userEmail?: string;
};

export type StediListEnrollmentsParams = {
  /**
   * Filter for enrollments created from a specific date (ISO 8601 format).
   */
  createdFrom?: string;
  /**
   * Filter for enrollments created before a specific date (ISO 8601 format).
   */
  createdTo?: string;
  /**
   * Filter for enrollments with properties matching a query string.
   * Supports fuzzy matching on provider name, NPI, tax ID, or Stedi payer ID.
   */
  filter?: string;
  /**
   * The import ID associated with an enrollment through a CSV bulk import.
   */
  importId?: string;
  /**
   * The maximum number of elements to return in a page (1-500, default 100).
   */
  pageSize?: number;
  /**
   * An opaque token for pagination, returned by a previous call in `nextPageToken`.
   */
  pageToken?: string;
  /**
   * Filter for enrollments associated with specific Stedi payer IDs.
   */
  payerIds?: string[];
  /**
   * Filter for enrollments associated with specific provider names (case-sensitive, exact match).
   */
  providerNames?: string[];
  /**
   * Filter for enrollments associated with specific provider NPIs.
   */
  providerNpis?: string[];
  /**
   * Filter for enrollments associated with specific provider tax IDs.
   */
  providerTaxIds?: string[];
  /**
   * Sort the results by one or more properties in `property:direction` format.
   * Supported properties: `updatedAt`, `statusLastUpdatedAt`, `id`.
   * Direction: `asc` or `desc`.
   */
  sortBy?: string[];
  /**
   * Filter for enrollments submitted through specific sources (API or UI).
   */
  sources?: StediEnrollmentSource[];
  /**
   * Filter for enrollments with specific statuses.
   */
  status?: StediEnrollmentStatus[];
  /**
   * Filter for enrollments whose status was last updated from a specific date (ISO 8601 format).
   */
  statusUpdatedFrom?: string;
  /**
   * Filter for enrollments whose status was last updated before a specific date (ISO 8601 format).
   */
  statusUpdatedTo?: string;
  /**
   * Filter for enrollments for specific transaction types.
   */
  transactions?: StediEnrollmentTransaction[];
};

export type StediListEnrollmentsResponse = {
  items: StediEnrollmentResponse[];
  nextPageToken?: string;
  totalCount?: number;
};
