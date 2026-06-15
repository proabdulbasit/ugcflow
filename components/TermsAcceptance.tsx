'use client';

import type { TermsSection } from '@/lib/terms/creator-terms';

type TermsAcceptanceProps = {
  title: string;
  intro: string;
  sections: TermsSection[];
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  checkboxLabel?: string;
};

export default function TermsAcceptance({
  title,
  intro,
  sections,
  accepted,
  onAcceptedChange,
  checkboxLabel = 'I have read and agree to these Terms & Conditions',
}: TermsAcceptanceProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-4">
        <p className="leading-relaxed">{intro}</p>
        {sections.map((section) => (
          <div key={section.heading}>
            <h4 className="font-bold text-gray-900 mb-2">{section.heading}</h4>
            <ul className="list-disc pl-5 space-y-1.5">
              {section.items.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptedChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 leading-relaxed">{checkboxLabel}</span>
      </label>
    </div>
  );
}
