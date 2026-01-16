// Type definitions for Mongoose models (separated to avoid client-side bundling issues)

export interface IUser {
  id: string;
  userId: string; // Clerk user ID
  email?: string;
  credits: number;
  promptWizardCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectVersion {
  V1 = "V1",
  V2 = "V2",
}

export interface IProject {
  id: string;
  name: string;
  replicateModelId?: string;
  stripePaymentId?: string;
  modelVersionId?: string;
  modelStatus?: string;
  instanceName: string;
  instanceClass: string;
  imageUrls: string[];
  zipImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  credits: number;
  promptWizardCredits: number;
  version: ProjectVersion;
}

export enum HdStatus {
  NO = "NO",
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
}

export interface IShot {
  id: string;
  prompt: string;
  replicateId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  outputUrl?: string;
  bookmarked?: boolean;
  blurhash?: string;
  seed?: number;
  hdStatus: HdStatus;
  hdPredictionId?: string;
  hdOutputUrl?: string;
}

export interface IMedia {
  id: string;
  userId: string;
  url: string;
  prompt?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  id: string;
  type: string;
  status: string;
  stripeSessionId: string;
  createdAt: Date;
  projectId?: string;
  userId?: string;
}

