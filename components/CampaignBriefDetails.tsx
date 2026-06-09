import { ExternalLink, Film, Globe, Megaphone, Target } from 'lucide-react';
import { formatPlatform, formatVideoFormat } from '@/lib/campaign-brief';

type CampaignBriefDetailsProps = {
  campaign: {
    title?: string;
    brief?: string;
    referenceVideoUrl?: string;
    productUrl?: string;
    targetPlatform?: string;
    videoFormat?: string;
    talkingPoints?: string;
    dosAndDonts?: string;
  };
  showTitle?: boolean;
};

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:underline break-all"
    >
      {label}
      <ExternalLink size={14} className="shrink-0" />
    </a>
  );
}

export default function CampaignBriefDetails({ campaign, showTitle = false }: CampaignBriefDetailsProps) {
  return (
    <div className="space-y-5">
      {showTitle && campaign.title ? (
        <h2 className="text-lg font-bold text-gray-900">{campaign.title}</h2>
      ) : null}

      {campaign.brief ? (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Campaign brief</div>
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{campaign.brief}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {campaign.targetPlatform ? (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500 mb-1">
              <Target size={14} /> Target platform
            </div>
            <div className="text-sm font-medium text-gray-900">{formatPlatform(campaign.targetPlatform)}</div>
          </div>
        ) : null}
        {campaign.videoFormat ? (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500 mb-1">
              <Film size={14} /> Video format
            </div>
            <div className="text-sm font-medium text-gray-900">{formatVideoFormat(campaign.videoFormat)}</div>
          </div>
        ) : null}
      </div>

      {(campaign.referenceVideoUrl || campaign.productUrl) && (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Links & references</div>
          {campaign.referenceVideoUrl ? (
            <div>
              <div className="text-xs text-gray-500 mb-1">Reference / inspiration video</div>
              <LinkRow href={campaign.referenceVideoUrl} label={campaign.referenceVideoUrl} />
            </div>
          ) : null}
          {campaign.productUrl ? (
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Globe size={12} /> Product or landing page
              </div>
              <LinkRow href={campaign.productUrl} label={campaign.productUrl} />
            </div>
          ) : null}
        </div>
      )}

      {campaign.talkingPoints ? (
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            <Megaphone size={14} /> Key talking points & CTA
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.talkingPoints}</p>
        </div>
      ) : null}

      {campaign.dosAndDonts ? (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Do&apos;s & don&apos;ts</div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.dosAndDonts}</p>
        </div>
      ) : null}
    </div>
  );
}
