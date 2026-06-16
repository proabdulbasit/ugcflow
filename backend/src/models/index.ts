import mongoose from 'mongoose';

export type UserRole = 'admin' | 'brand' | 'creator';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type CampaignStatus = 'draft' | 'active' | 'completed';
export type DeliverableStatus = 'pending' | 'approved' | 'rejected';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'brand', 'creator'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model<IUser>('User', userSchema);

export interface IBrand {
  _id: mongoose.Types.ObjectId;
  companyName?: string;
  websiteUrl?: string;
  brandGoals?: string;
  status: ApplicationStatus;
  credits: number;
  packageTier?: 'starter' | 'growth' | 'scale';
  termsAcceptedAt?: Date;
  createdAt: Date;
}

const brandSchema = new mongoose.Schema<IBrand>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    companyName: String,
    websiteUrl: String,
    brandGoals: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    credits: { type: Number, default: 0 },
    packageTier: { type: String, enum: ['starter', 'growth', 'scale'] },
    termsAcceptedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);

export interface ICreator {
  _id: mongoose.Types.ObjectId;
  portfolioUrl?: string;
  profilePictureUrl?: string;
  portfolioMedia?: Array<{
    url: string;
    type: 'image' | 'video';
    key: string;
  }>;
  bio?: string;
  address?: string;
  status: ApplicationStatus;
  termsAcceptedAt?: Date;
  createdAt: Date;
}

const portfolioMediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    key: { type: String, required: true },
  },
  { _id: false }
);

const creatorSchema = new mongoose.Schema<ICreator>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    portfolioUrl: String,
    profilePictureUrl: String,
    portfolioMedia: { type: [portfolioMediaSchema], default: [] },
    bio: String,
    address: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    termsAcceptedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Creator = mongoose.model<ICreator>('Creator', creatorSchema);

export interface IPackage {
  _id: mongoose.Types.ObjectId;
  name: string;
  tagline?: string;
  description?: string;
  price: number;
  currency: string;
  videoCount: number;
  creatorCount: number;
  revisionRounds: number;
  turnaroundDays: number;
  matchingTier: string;
  tier: 'starter' | 'growth' | 'scale';
  features: string[];
  stripePriceId?: string;
  createdAt: Date;
}

const packageSchema = new mongoose.Schema<IPackage>(
  {
    name: { type: String, required: true },
    tagline: String,
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'AUD' },
    videoCount: { type: Number, default: 1 },
    creatorCount: { type: Number, default: 1 },
    revisionRounds: { type: Number, default: 0 },
    turnaroundDays: { type: Number, default: 5 },
    matchingTier: { type: String, default: 'standard' },
    tier: { type: String, enum: ['starter', 'growth', 'scale'], required: true },
    features: { type: [String], default: [] },
    stripePriceId: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Package = mongoose.model<IPackage>('Package', packageSchema);

export interface ICampaign {
  _id: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  title: string;
  brief?: string;
  referenceVideoUrl?: string;
  productUrl?: string;
  targetPlatform?: string;
  videoFormat?: string;
  talkingPoints?: string;
  dosAndDonts?: string;
  status: CampaignStatus;
  payoutAmount: number;
  maxCreators: number;
  revisionRounds: number;
  matchingTier: string;
  turnaroundDays: number;
  createdAt: Date;
}

const campaignSchema = new mongoose.Schema<ICampaign>(
  {
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    brief: String,
    referenceVideoUrl: String,
    productUrl: String,
    targetPlatform: String,
    videoFormat: String,
    talkingPoints: String,
    dosAndDonts: String,
    status: { type: String, enum: ['draft', 'active', 'completed'], default: 'active' },
    payoutAmount: { type: Number, default: 89 },
    maxCreators: { type: Number, default: 1 },
    revisionRounds: { type: Number, default: 0 },
    matchingTier: { type: String, default: 'standard' },
    turnaroundDays: { type: Number, default: 5 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

export interface ICampaignApplication {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  message?: string;
  createdAt: Date;
}

const campaignApplicationSchema = new mongoose.Schema<ICampaignApplication>(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    message: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

campaignApplicationSchema.index({ campaignId: 1, creatorId: 1 }, { unique: true });

export const CampaignApplication = mongoose.model<ICampaignApplication>(
  'CampaignApplication',
  campaignApplicationSchema
);

export interface ICampaignCreator {
  campaignId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  assignedAt: Date;
}

const campaignCreatorSchema = new mongoose.Schema<ICampaignCreator>({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
});

campaignCreatorSchema.index({ campaignId: 1, creatorId: 1 }, { unique: true });

export const CampaignCreator = mongoose.model<ICampaignCreator>('CampaignCreator', campaignCreatorSchema);

export interface IDeliverable {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  fileUrl?: string;
  status: DeliverableStatus;
  feedback?: string;
  revisionCount: number;
  createdAt: Date;
}

const deliverableSchema = new mongoose.Schema<IDeliverable>(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    feedback: String,
    revisionCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Deliverable = mongoose.model<IDeliverable>('Deliverable', deliverableSchema);

export interface ICreatorEarning {
  _id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  deliverableId: mongoose.Types.ObjectId;
  amount: number;
  status: string;
  createdAt: Date;
}

const creatorEarningSchema = new mongoose.Schema<ICreatorEarning>(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    deliverableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deliverable', required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CreatorEarning = mongoose.model<ICreatorEarning>('CreatorEarning', creatorEarningSchema);

export interface IPayment {
  _id: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  amount: number;
  stripePaymentIntentId?: string;
  status: string;
  createdAt: Date;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    amount: { type: Number, required: true },
    stripePaymentIntentId: { type: String, unique: true, sparse: true },
    status: { type: String, default: 'completed' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
