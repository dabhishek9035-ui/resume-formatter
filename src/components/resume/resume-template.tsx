import * as React from 'react';
import type { ResumeData } from '@/lib/resume/types';
import { getAtsAnalysis } from '@/lib/resume/enhancements';
import {
  formatContactLine,
  formatDateRange,
  formatEducationLine,
  formatSkillsLine,
  getResumeChecks,
  normalizeBullets,
} from '@/lib/resume/rendering';

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function ResumeTemplate({ resume }: { resume: ResumeData }) {
  const checks = getResumeChecks(resume);
  const atsAnalysis = getAtsAnalysis(resume);
  const hasPersonalInfo = [
    resume.personalInfo.fullName,
    resume.personalInfo.headline,
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.website,
    resume.personalInfo.linkedin,
  ].some(hasText);
  const hasSummary = hasText(resume.summary);
  const hasExperience = resume.experience.some(
    (entry) =>
      [entry.title, entry.company, entry.location, entry.startDate, entry.endDate].some(hasText) ||
      normalizeBullets(entry.bullets).length > 0
  );
  const hasEducation = resume.education.some(
    (entry) => [entry.degree, entry.institution, entry.location, entry.startDate, entry.endDate, entry.details].some(hasText)
  );
  const hasSkills = normalizeBullets(resume.skills).length > 0;
  const hasProjects = resume.projects.some(
    (entry) => [entry.name, entry.role, entry.dateRange, entry.details].some(hasText)
  );
  const hasCertifications = resume.certifications.some((entry) => [entry.name, entry.issuer, entry.date].some(hasText));
  const hasAchievements = resume.achievements.some((entry) => hasText(entry.text));

  const contentSections: React.ReactNode[] = [];

  if (hasPersonalInfo) {
    contentSections.push(
      <section key="personal" className="space-y-2 text-center">
        {hasText(resume.personalInfo.fullName) ? (
          <h3 className="text-[18px] font-semibold tracking-tight text-black">{resume.personalInfo.fullName}</h3>
        ) : null}
        {hasText(resume.personalInfo.headline) ? (
          <p className="text-[14px] font-medium uppercase tracking-[0.18em] text-black/75">
            {resume.personalInfo.headline}
          </p>
        ) : null}
        {hasText(formatContactLine(resume)) ? <p className="text-[12px] text-black/70">{formatContactLine(resume)}</p> : null}
      </section>
    );
  }

  if (hasSummary) {
    contentSections.push(
      <section key="summary" className="space-y-2">
        <h4 className="text-[18px] font-bold uppercase tracking-[0.08em] text-black">Summary</h4>
        <p className="text-[12px] leading-7 text-black">{resume.summary}</p>
      </section>
    );
  }

  if (hasExperience) {
    contentSections.push(
      <section key="experience" className="space-y-4">
        <h4 className="text-[18px] font-bold uppercase tracking-[0.08em] text-black">Experience</h4>
        <div className="space-y-4">
          {resume.experience
            .filter(
              (entry) =>
                [entry.title, entry.company, entry.location, entry.startDate, entry.endDate].some(hasText) ||
                normalizeBullets(entry.bullets).length > 0
            )
            .map((entry) => (
              <article key={entry.id} className="space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {hasText(entry.title) ? (
                      <p className="text-[13px] font-semibold text-black">{entry.title}</p>
                    ) : (
                      <p className="text-[13px] font-semibold text-black">Job Title</p>
                    )}
                    {hasText(entry.company) ? (
                      <p className="text-[13px] italic text-black/75">{entry.company}</p>
                    ) : null}
                  </div>
                  {hasText(formatDateRange(entry.startDate, entry.endDate)) ? (
                    <p className="text-right text-[12px] uppercase tracking-[0.12em] text-black/70">
                      {formatDateRange(entry.startDate, entry.endDate)}
                    </p>
                  ) : null}
                </div>
                {hasText(entry.location) ? <p className="text-[12px] text-black/75">{entry.location}</p> : null}
                {normalizeBullets(entry.bullets).length > 0 ? (
                  <ul className="space-y-1 pt-1">
                    {normalizeBullets(entry.bullets).map((bullet, index) => (
                      <li key={`${entry.id}-${index}`} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black" />
                        <span className="text-[12px]">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
        </div>
      </section>
    );
  }

  if (hasEducation) {
    contentSections.push(
      <section key="education" className="space-y-3">
        <h4 className="text-[18px] font-bold uppercase tracking-[0.08em] text-black">Education</h4>
        <div className="space-y-3">
          {resume.education
            .filter((entry) => [entry.degree, entry.institution, entry.location, entry.startDate, entry.endDate, entry.details].some(hasText))
            .map((entry) => (
              <article key={entry.id}>
                {hasText(entry.degree) ? (
                  <p className="text-[13px] font-semibold text-black">{entry.degree}</p>
                ) : null}
                {hasText(entry.institution) ? (
                  <p className="text-[13px] italic text-black/75">{entry.institution}</p>
                ) : null}
                {hasText(formatEducationLine(entry)) ? (
                  <p className="text-[12px] uppercase tracking-[0.12em] text-black/70">{formatEducationLine(entry)}</p>
                ) : null}
                {hasText(entry.details) ? <p className="whitespace-pre-line text-[12px] text-black/80">{entry.details}</p> : null}
              </article>
            ))}
        </div>
      </section>
    );
  }

  if (hasSkills) {
    contentSections.push(
      <section key="skills" className="space-y-2">
        <h4 className="text-[18px] font-bold uppercase tracking-[0.08em] text-black">Skills</h4>
        <p className="whitespace-pre-line text-[12px] leading-7 text-black">{formatSkillsLine(resume.skills)}</p>
      </section>
    );
  }

  if (hasProjects) {
    contentSections.push(
      <section key="projects" className="space-y-3">
        <h4 className="text-[18px] font-bold uppercase tracking-[0.08em] text-black">Projects</h4>
        <div className="space-y-3">
          {resume.projects
            .filter((entry) => [entry.name, entry.role, entry.dateRange, entry.details].some(hasText))
            .map((entry) => (
              <article key={entry.id}>
                {hasText(entry.name) ? <p className="text-[13px] font-semibold text-black">{entry.name}</p> : null}
                {hasText(entry.role) ? <p className="text-[13px] italic text-black/75">{entry.role}</p> : null}
                {hasText(entry.dateRange) ? <p className="text-[12px] uppercase tracking-[0.12em] text-black/70">{entry.dateRange}</p> : null}
                {hasText(entry.details) ? <p className="text-[12px] text-black/80">{entry.details}</p> : null}
              </article>
            ))}
        </div>
      </section>
    );
  }

  if (resume.customSections && resume.customSections.length > 0) {
    contentSections.push(
      <section key="custom" className="space-y-3">
        <h4 className="text-[18px] font-bold uppercase tracking-[0.08em] text-black">Additional</h4>
        <div className="space-y-3">
          {resume.customSections
            .filter((s) => hasText(s.label) || hasText(s.text) || ((s.files || []).length > 0))
            .map((s) => (
              <article key={s.id}>
                <p className="text-[13px] font-semibold text-black">{s.label}</p>
                {s.type === 'text' && s.text ? <p className="whitespace-pre-line text-[12px] text-black/80">{s.text}</p> : null}
                {s.type === 'image' && s.files && s.files.length > 0 ? (
                  s.files.map((f, i) => <img key={`${s.id}-img-${i}`} src={f.dataUrl} alt={f.name} className="max-w-full" />)
                ) : null}
                {s.type === 'files' && s.files && s.files.length > 0 ? (
                  <ul className="space-y-1">
                    {s.files.map((f, i) => (
                      <li key={`${s.id}-file-${i}`}>
                        <a href={f.dataUrl} download={f.name} className="text-[12px] text-blue-600 underline">{f.name}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
        </div>
      </section>
    );
  }

  if (hasCertifications) {
    contentSections.push(
      <section key="certifications" className="space-y-3">
        <h4 className="text-[18px] font-bold uppercase tracking-[0.08em] text-black">Certifications</h4>
        <div className="space-y-3">
          {resume.certifications
            .filter((entry) => [entry.name, entry.issuer, entry.date].some(hasText))
            .map((entry) => (
              <article key={entry.id}>
                {hasText(entry.name) ? <p className="text-[13px] font-semibold text-black">{entry.name}</p> : null}
                {hasText(entry.issuer) ? <p className="text-[13px] italic text-black/75">{entry.issuer}</p> : null}
                {hasText(entry.date) ? <p className="text-[12px] uppercase tracking-[0.12em] text-black/70">{entry.date}</p> : null}
              </article>
            ))}
        </div>
      </section>
    );
  }

  if (hasAchievements) {
    contentSections.push(
      <section key="achievements" className="space-y-3">
        <h4 className="text-[18px] font-bold uppercase tracking-[0.08em] text-black">Achievements</h4>
        <ul className="space-y-1">
          {resume.achievements
            .filter((entry) => hasText(entry.text))
            .map((entry) => (
              <li key={entry.id} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black" />
                <span className="text-[12px]">{entry.text}</span>
              </li>
            ))}
        </ul>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="border border-border bg-white p-8 text-[12px] leading-7 text-black shadow-[0_10px_35px_-24px_rgba(15,23,42,0.35)] print:border-0 print:shadow-none">
        <div className="space-y-5">
          {contentSections.map((section, index) => (
            <React.Fragment key={index}>
              {section}
              {index < contentSections.length - 1 ? <div className="my-5 h-px w-full bg-black/15" /> : null}
            </React.Fragment>
          ))}
        </div>
      </section>

      <div className="my-5 h-px w-full bg-black/15" />

      <section className="border border-border bg-background p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground">Formatting checks</h4>
            <p className="mt-1 text-sm text-muted-foreground">Lightweight validation to keep the preview ATS-friendly.</p>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Local rules only</div>
        </div>

        <div className="mt-4 space-y-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-start gap-3 text-sm">
              <span className={check.ok ? 'mt-2 h-2 w-2 rounded-full bg-foreground' : 'mt-2 h-2 w-2 rounded-full bg-muted-foreground'} />
              <div>
                <p className="font-medium text-foreground">{check.label}</p>
                <p className="text-muted-foreground">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="my-5 h-px w-full bg-black/15" />

      <section className="border border-border bg-background p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground">ATS analysis</h4>
            <p className="mt-1 text-sm text-muted-foreground">Local keyword coverage and missing-section detection.</p>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Score {atsAnalysis.score}/100</div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{atsAnalysis.keywordSummary}</p>
            <p className="text-sm text-muted-foreground">{atsAnalysis.summary}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Matched keywords</p>
            <div className="flex flex-wrap gap-2">
              {atsAnalysis.matchedKeywords.length > 0 ? (
                atsAnalysis.matchedKeywords.map((keyword) => (
                  <span key={keyword} className="border border-border px-2 py-1 text-xs text-foreground">
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No matches yet.</span>
              )}
            </div>
          </div>

          {atsAnalysis.missingSections.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Missing sections</p>
              <p className="text-sm text-muted-foreground">{atsAnalysis.missingSections.join(', ')}</p>
            </div>
          ) : null}

          {atsAnalysis.missingKeywords.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Suggested keywords</p>
              <p className="text-sm text-muted-foreground">{atsAnalysis.missingKeywords.join(', ')}</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
