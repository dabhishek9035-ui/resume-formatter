import type {
  ResumeData,
} from './types';

const atsKeywords = [
  'typescript',
  'next.js',
  'react',
  'frontend',
  'ui',
  'ux',
  'typography',
  'layout systems',
  'accessibility',
  'responsive',
  'print',
  'pdf',
  'ats',
  'collaboration',
  'leadership',
  'design systems',
  'performance',
  'testing',
  'documentation',
  'project management',
];

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function getAtsAnalysis(resume: ResumeData) {
  const textCorpus = [
    resume.personalInfo.fullName,
    resume.personalInfo.headline,
    resume.personalInfo.location,
    resume.summary,
    resume.skills.join(' '),
    resume.education.map((entry) => [entry.degree, entry.institution, entry.details].join(' ')).join(' '),
    resume.experience
      .map((entry) => [entry.title, entry.company, entry.location, entry.bullets.join(' ')].join(' '))
      .join(' '),
    resume.projects.map((entry) => [entry.name, entry.role, entry.details, (entry.bullets || []).join(' ')].join(' ')).join(' '),
    resume.certifications.map((entry) => [entry.name, entry.issuer].join(' ')).join(' '),
    resume.achievements.map((entry) => entry.text).join(' '),
  ]
    .join(' ')
    .toLowerCase();

  const matchedKeywords = atsKeywords.filter((keyword) => textCorpus.includes(keyword));
  const missingKeywords = atsKeywords.filter((keyword) => !matchedKeywords.includes(keyword));

  const sectionPresence = [
    { label: 'Summary', present: clean(resume.summary).length > 0 },
    { label: 'Education', present: resume.education.length > 0 },
    { label: 'Experience', present: resume.experience.length > 0 },
    { label: 'Skills', present: resume.skills.length > 0 },
    { label: 'Projects', present: resume.projects.length > 0 },
    { label: 'Certifications', present: resume.certifications.length > 0 },
    { label: 'Achievements', present: resume.achievements.length > 0 },
  ];

  const missingSections = sectionPresence.filter((section) => !section.present).map((section) => section.label);

  const keywordScore = Math.round((matchedKeywords.length / atsKeywords.length) * 70);
  const sectionScore = Math.round((sectionPresence.filter((section) => section.present).length / sectionPresence.length) * 30);
  const score = Math.min(100, keywordScore + sectionScore);

  return {
    score,
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 6),
    missingSections,
    summary: missingSections.length > 0
      ? `Add the remaining sections: ${missingSections.join(', ')}.`
      : 'Core resume sections are present.',
    keywordSummary:
      matchedKeywords.length > 0
        ? `Matched ${matchedKeywords.length} ATS keywords locally.`
        : 'No ATS keywords matched yet. Add role-specific wording.',
  };
}
