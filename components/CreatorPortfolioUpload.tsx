'use client';

import { useRef, useState } from 'react';
import { Camera, Film, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import {
  uploadCreatorMediaFile,
  type PortfolioMediaItem,
  type UploadPurpose,
} from '@/lib/api/uploads';
import { ApiError } from '@/lib/api/client';
import {
  ACCEPTED_PORTFOLIO_TYPES,
  ACCEPTED_PROFILE_TYPES,
  MAX_PORTFOLIO_ITEMS,
  MIN_PORTFOLIO_ITEMS,
} from '@/lib/creator-portfolio';
import { toast } from '@/lib/toast';

type Props = {
  uploadSessionId?: string;
  profilePictureUrl: string;
  onProfilePictureChange: (url: string) => void;
  portfolioMedia: PortfolioMediaItem[];
  onPortfolioChange: (items: PortfolioMediaItem[]) => void;
};

export default function CreatorPortfolioUpload({
  uploadSessionId,
  profilePictureUrl,
  onProfilePictureChange,
  portfolioMedia,
  onPortfolioChange,
}: Props) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  const uploadFile = async (file: File, purpose: UploadPurpose) => {
    return uploadCreatorMediaFile(file, purpose, uploadSessionId);
  };

  const handleProfileUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploadingProfile(true);
    try {
      const result = await uploadFile(file, 'profile-picture');
      onProfilePictureChange(result.url);
      toast.success('Profile picture uploaded');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Profile upload failed');
    } finally {
      setUploadingProfile(false);
      if (profileInputRef.current) profileInputRef.current.value = '';
    }
  };

  const handlePortfolioUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    const remaining = MAX_PORTFOLIO_ITEMS - portfolioMedia.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PORTFOLIO_ITEMS} portfolio items allowed.`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setUploadingPortfolio(true);

    try {
      const uploaded: PortfolioMediaItem[] = [];
      for (const file of selected) {
        const result = await uploadFile(file, 'portfolio');
        uploaded.push(result);
      }
      onPortfolioChange([...portfolioMedia, ...uploaded]);
      toast.success(`${uploaded.length} portfolio item${uploaded.length === 1 ? '' : 's'} uploaded`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Portfolio upload failed');
    } finally {
      setUploadingPortfolio(false);
      if (portfolioInputRef.current) portfolioInputRef.current.value = '';
    }
  };

  const removePortfolioItem = (index: number) => {
    onPortfolioChange(portfolioMedia.filter((_, i) => i !== index));
  };

  const portfolioCount = portfolioMedia.length;
  const portfolioValid = portfolioCount >= MIN_PORTFOLIO_ITEMS && portfolioCount <= MAX_PORTFOLIO_ITEMS;

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
            {profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="text-gray-400" size={28} />
            )}
          </div>
          <div>
            <input
              ref={profileInputRef}
              type="file"
              accept={ACCEPTED_PROFILE_TYPES}
              className="hidden"
              onChange={(e) => handleProfileUpload(e.target.files)}
            />
            <button
              type="button"
              disabled={uploadingProfile}
              onClick={() => profileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-100 disabled:opacity-50"
            >
              {uploadingProfile ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Upload Photo
            </button>
            <p className="text-xs text-gray-500 mt-2">Optional. JPG, PNG, or WEBP.</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Portfolio Samples</label>
            <p className="text-xs text-gray-500 mt-1">
              Upload {MIN_PORTFOLIO_ITEMS}–{MAX_PORTFOLIO_ITEMS} sample images or videos (required).
            </p>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              portfolioValid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {portfolioCount}/{MAX_PORTFOLIO_ITEMS}
          </span>
        </div>

        <input
          ref={portfolioInputRef}
          type="file"
          accept={ACCEPTED_PORTFOLIO_TYPES}
          multiple
          className="hidden"
          onChange={(e) => handlePortfolioUpload(e.target.files)}
        />

        <button
          type="button"
          disabled={uploadingPortfolio || portfolioCount >= MAX_PORTFOLIO_ITEMS}
          onClick={() => portfolioInputRef.current?.click()}
          className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 disabled:opacity-50"
        >
          {uploadingPortfolio ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ImagePlus size={18} />
          )}
          {uploadingPortfolio ? 'Uploading…' : 'Add Portfolio Images / Videos'}
        </button>

        {portfolioCount < MIN_PORTFOLIO_ITEMS ? (
          <p className="text-sm text-amber-700 mb-4">
            Add at least {MIN_PORTFOLIO_ITEMS - portfolioCount} more sample
            {MIN_PORTFOLIO_ITEMS - portfolioCount === 1 ? '' : 's'} to complete your profile.
          </p>
        ) : null}

        {portfolioMedia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {portfolioMedia.map((item, index) => (
              <div key={`${item.key}-${index}`} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[4/5]">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" controls muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1">
                  {item.type === 'video' ? <Film size={10} /> : <Camera size={10} />}
                  {item.type}
                </div>
                <button
                  type="button"
                  onClick={() => removePortfolioItem(index)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove portfolio item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
