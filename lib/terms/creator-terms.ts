export type TermsSection = {
  heading: string;
  items: string[];
};

export const CREATOR_TERMS = {
  title: 'Creator Terms & Conditions',
  intro:
    'By creating an account, applying for campaigns, or accepting campaign opportunities through the platform, creators agree to the following Terms & Conditions.',
  sections: [
    {
      heading: '1. Content Delivery',
      items: [
        'All content must be submitted within 5 business days of receiving the product unless otherwise specified in the campaign brief.',
        'Failure to meet the required deadline without prior approval may result in campaign cancellation and account review.',
      ],
    },
    {
      heading: '2. Campaign Requirements',
      items: [
        'Content must be created in accordance with the campaign brief provided by the brand.',
        'All deliverables must be completed as outlined in the brief.',
        'Content must be of a professional, high-quality standard suitable for brand marketing and advertising purposes.',
      ],
    },
    {
      heading: '3. Revisions',
      items: [
        'Brands may request reasonable revisions if content does not meet the campaign brief.',
        'Creators must complete requested revisions within 2 business days of receiving feedback.',
      ],
    },
    {
      heading: '4. Failure to Deliver',
      items: [
        'If content is not submitted by the agreed deadline or does not meet campaign requirements, the creator may be removed from the campaign.',
        'The platform reserves the right to restrict access to future campaigns for creators who repeatedly fail to deliver.',
      ],
    },
    {
      heading: '5. Product Returns',
      items: [
        'If a campaign is not completed, content is not delivered, or content fails to meet the required standard after revision opportunities have been provided, the creator must return the product to the brand at their own expense within 7 days of notification.',
      ],
    },
    {
      heading: '6. Communication',
      items: [
        'Creators must maintain timely communication with the platform and participating brands throughout the campaign.',
        'Failure to respond to messages or requests may result in campaign cancellation.',
      ],
    },
    {
      heading: '7. Authenticity & Original Content',
      items: [
        'All content submitted must be original and created by the creator.',
        'Content must not infringe on any copyright, trademark, privacy, publicity, or intellectual property rights of any third party.',
      ],
    },
    {
      heading: '8. Platform Conduct',
      items: [
        'Creators are expected to act professionally and respectfully when interacting with brands and platform representatives.',
      ],
    },
    {
      heading: '9. Content Usage Rights',
      items: [
        'Unless otherwise agreed in writing before a campaign is accepted, all content submitted through the platform grants the brand full, unrestricted, perpetual, worldwide usage rights.',
        'Brands may use, edit, reproduce, distribute, publish, modify, promote, advertise, and repurpose the content across any platform or marketing channel.',
        'No additional compensation is payable unless agreed in writing before the campaign commences.',
      ],
    },
    {
      heading: '10. Disclosure Requirements',
      items: [
        'Creators must comply with all applicable advertising and consumer laws.',
        'Sponsored, gifted, or paid collaborations must be clearly disclosed where required.',
      ],
    },
    {
      heading: '11. Free Product Campaigns',
      items: [
        'Creators may not accept campaigns solely for the purpose of receiving free products.',
        'Acceptance of a campaign constitutes a commitment to complete all campaign requirements.',
      ],
    },
    {
      heading: '12. Independent Contractor Status',
      items: [
        'Creators participate as independent contractors and are not employees, agents, or representatives of the platform or participating brands.',
      ],
    },
    {
      heading: '13. Right to Reject Content',
      items: [
        'Brands and the platform reserve the right to reject content that is offensive, misleading, unlawful, unsafe, or inconsistent with the campaign brief.',
      ],
    },
    {
      heading: '14. Eligibility',
      items: [
        'Creators must be at least 18 years of age.',
        'Creators under 18 may only participate with the consent of a parent or legal guardian.',
      ],
    },
    {
      heading: '15. Non-Circumvention',
      items: [
        'Creators agree not to directly engage, negotiate, contract, or accept campaign opportunities from brands introduced through the platform for the purpose of avoiding platform fees or bypassing the platform.',
        'Any collaboration resulting from a connection made through the platform must remain on the platform unless approved in writing by the platform.',
        'Breaches may result in account suspension, removal, and/or additional fees.',
      ],
    },
    {
      heading: '16. Account Suspension & Removal',
      items: [
        'The platform reserves the right to suspend or permanently remove creator accounts for repeated missed deadlines, poor-quality submissions, failure to follow campaign briefs, non-communication, fraudulent activity, or breaches of these Terms.',
      ],
    },
    {
      heading: '17. Modification & Platform Authority',
      items: [
        'The platform reserves the right to modify these Terms & Conditions at any time and to make final decisions regarding account eligibility, campaign participation, disputes, and platform access.',
      ],
    },
    {
      heading: '18. Acceptance of Terms',
      items: [
        'By creating an account, applying for campaigns, or accepting campaign opportunities, creators acknowledge that they have read, understood, and agree to these Terms & Conditions.',
      ],
    },
  ] as TermsSection[],
};
