'use client';

import { ExternalLink, Film, ImageIcon, Lock, MapPin } from 'lucide-react';

type PortfolioItem = {
  url: string;
  type: 'image' | 'video';
};

type CreatorProfiles = {
  full_name?: string;
  email?: string;
  portfolio_url?: string;
  profile_picture_url?: string;
  portfolio_media?: PortfolioItem[];
  bio?: string;
  shipping_details?: string | null;
};

type Props = {
  profiles?: CreatorProfiles | null;
  status?: string;
  isAssigned?: boolean;
  compact?: boolean;
};

export default function CreatorProfileCard({ profiles, status, isAssigned, compact = false }: Props) {
  if (!profiles) return null;

  const media = profiles.portfolio_media ?? [];

  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50/50 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex gap-4 items-start">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border border-gray-200 shrink-0">
          {profiles.profile_picture_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profiles.profile_picture_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No photo</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-gray-900">{profiles.full_name ?? 'Creator'}</span>
            {status ? (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                {status}
              </span>
            ) : null}
            {isAssigned ? (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                Assigned
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-500">{profiles.email ?? '—'}</p>
          {profiles.bio ? (
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{profiles.bio}</p>
          ) : null}
          {profiles.portfolio_url ? (
            <a
              href={profiles.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-2"
            >
              External portfolio <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      </div>

      {isAssigned && profiles.shipping_details ? (
        <div className="mt-4 p-3 rounded-lg bg-white border border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            <MapPin size={12} />
            Shipping Details
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{profiles.shipping_details}</p>
        </div>
      ) : !isAssigned ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <Lock size={12} />
          Shipping details shared after creator is assigned to your campaign.
        </div>
      ) : null}

      {media.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Portfolio Samples ({media.length})
          </p>
          <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
            {media.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="relative rounded-lg overflow-hidden border border-gray-100 aspect-[4/5] bg-gray-100"
              >
                {item.type === 'video' ? (
                  <video src={item.url} controls className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={`Sample ${index + 1}`} className="w-full h-full object-cover" />
                )}
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                  {item.type === 'video' ? <Film size={8} /> : <ImageIcon size={8} />}
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-gray-500 italic">No portfolio samples uploaded.</p>
      )}
    </div>
  );
}
