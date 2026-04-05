export enum ClaimType {
  AUTO = 'AUTO',
  PROPERTY = 'PROPERTY',
  HEALTH = 'HEALTH',
  OTHER = 'OTHER',
}

export enum ClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ClaimPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ValidationIssueType {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
