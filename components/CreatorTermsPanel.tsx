import { CREATOR_TERMS } from '@/lib/terms/creator-terms';

export default function CreatorTermsPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-indigo-100 bg-indigo-50/50 ${
        compact ? 'p-5' : 'p-6 md:p-8'
      }`}
    >
      <h2 className={`font-bold text-gray-900 ${compact ? 'text-lg mb-2' : 'text-xl mb-3'}`}>
        {CREATOR_TERMS.title}
      </h2>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{CREATOR_TERMS.intro}</p>
      <div
        className={`overflow-y-auto rounded-xl border border-white bg-white/80 p-4 text-sm text-gray-700 space-y-4 ${
          compact ? 'max-h-72' : 'max-h-96'
        }`}
      >
        {CREATOR_TERMS.sections.map((section) => (
          <div key={section.heading}>
            <h3 className="font-bold text-gray-900 mb-2">{section.heading}</h3>
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
    </div>
  );
}
