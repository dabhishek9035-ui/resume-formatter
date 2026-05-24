import type { ResumeData } from './types';
import { formatContactLine, formatDateRange, formatEducationLine, formatSkillsLine, normalizeBullets } from './rendering';

function hasText(value: string | undefined) {
  return (value ?? '').trim().length > 0;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function listItems(items: string[]) {
  return items.map((item) => `<li class="bullet-item"><span class="bullet"></span><span>${escapeHtml(item)}</span></li>`).join('');
}

export function buildResumePdfHtml(resume: ResumeData) {
  const contactLine = escapeHtml(formatContactLine(resume));
  const summary = escapeHtml(resume.summary);
  const skills = escapeHtml(formatSkillsLine(resume.skills));
  const sections: Array<{ title: string; content: string }> = [];

  if (
    hasText(resume.personalInfo.fullName) ||
    hasText(resume.personalInfo.headline) ||
    hasText(contactLine)
  ) {
    sections.push({
      title: 'header',
      content: `
        <header class="header">
          ${hasText(resume.personalInfo.fullName) ? `<div class="name">${escapeHtml(resume.personalInfo.fullName)}</div>` : ''}
          ${hasText(resume.personalInfo.headline) ? `<div class="headline">${escapeHtml(resume.personalInfo.headline)}</div>` : ''}
          ${hasText(contactLine) ? `<div class="contact">${contactLine}</div>` : ''}
        </header>
      `,
    });
  }

  if (hasText(summary)) {
    sections.push({
      title: 'summary',
      content: `
        <section class="section safe">
          <h2 class="section-title">Summary</h2>
          <div class="summary">${summary}</div>
        </section>
      `,
    });
  }

  const experience = resume.experience
    .filter(
      (entry) =>
        [entry.title, entry.company, entry.location, entry.startDate, entry.endDate].some(hasText) ||
        normalizeBullets(entry.bullets).length > 0
    )
    .map(
      (entry) => `
        <article class="section-block">
          <div class="row">
            <div>
              ${hasText(entry.title) ? `<div class="title">${escapeHtml(entry.title)}</div>` : '<div class="title">Job Title</div>'}
              ${hasText(entry.company) ? `<div class="subtitle">${escapeHtml(entry.company)}</div>` : ''}
            </div>
            ${hasText(formatDateRange(entry.startDate, entry.endDate)) ? `<div class="date">${escapeHtml(formatDateRange(entry.startDate, entry.endDate))}</div>` : ''}
          </div>
          ${hasText(entry.location) ? `<div class="location">${escapeHtml(entry.location)}</div>` : ''}
          ${normalizeBullets(entry.bullets).length > 0 ? `<ul class="bullet-list">${listItems(normalizeBullets(entry.bullets))}</ul>` : ''}
        </article>
      `
    )
    .join('');

  if (experience) {
    sections.push({
      title: 'experience',
      content: `
        <section class="section safe">
          <h2 class="section-title">Experience</h2>
          ${experience}
        </section>
      `,
    });
  }

  const education = resume.education
    .filter((entry) => [entry.degree, entry.institution, entry.location, entry.startDate, entry.endDate, entry.details].some(hasText))
    .map(
      (entry) => `
        <article class="section-block">
          ${hasText(entry.degree) ? `<div class="title">${escapeHtml(entry.degree)}</div>` : ''}
          ${hasText(entry.institution) ? `<div class="subtitle">${escapeHtml(entry.institution)}</div>` : ''}
          ${hasText(formatEducationLine(entry)) ? `<div class="meta">${escapeHtml(formatEducationLine(entry))}</div>` : ''}
          ${hasText(entry.details) ? `<div class="details">${escapeHtml(entry.details)}</div>` : ''}
        </article>
      `
    )
    .join('');

  if (education) {
    sections.push({
      title: 'education',
      content: `
        <section class="section safe">
          <h2 class="section-title">Education</h2>
          ${education}
        </section>
      `,
    });
  }

  const projects = resume.projects
    .filter((entry) => [entry.name, entry.role, entry.dateRange, entry.details].some(hasText))
    .map(
      (entry) => `
        <article class="section-block">
          ${hasText(entry.name) ? `<div class="title">${escapeHtml(entry.name)}</div>` : ''}
          ${hasText(entry.role) ? `<div class="subtitle">${escapeHtml(entry.role)}</div>` : ''}
          ${hasText(entry.dateRange) ? `<div class="meta">${escapeHtml(entry.dateRange)}</div>` : ''}
          ${hasText(entry.details) ? `<div class="details">${escapeHtml(entry.details)}</div>` : ''}
        </article>
      `
    )
    .join('');

  const certifications = resume.certifications
    .filter((entry) => [entry.name, entry.issuer, entry.date].some(hasText))
    .map(
      (entry) => `
        <article class="section-block">
          ${hasText(entry.name) ? `<div class="title">${escapeHtml(entry.name)}</div>` : ''}
          ${hasText(entry.issuer) ? `<div class="subtitle">${escapeHtml(entry.issuer)}</div>` : ''}
          ${hasText(entry.date) ? `<div class="meta">${escapeHtml(entry.date)}</div>` : ''}
        </article>
      `
    )
    .join('');

  const achievements = listItems(normalizeBullets(resume.achievements.map((entry) => entry.text)));

  const customSections = (resume.customSections || [])
    .filter((s) => hasText(s.label) || hasText(s.text) || ((s.files || []).length > 0))
    .map((s) => {
      if (s.type === 'text') {
        return `
          <article>
            <div class="title">${escapeHtml(s.label)}</div>
            <div class="details">${escapeHtml(s.text || '')}</div>
          </article>
        `;
      }

      if (s.type === 'image') {
        const imgs = (s.files || [])
          .map((f) => `<img src="${f.dataUrl}" alt="${escapeHtml(f.name)}" style="max-width:100%;height:auto;" />`)
          .join('');
        return `
          <article>
            <div class="title">${escapeHtml(s.label)}</div>
            <div class="details">${imgs}</div>
          </article>
        `;
      }

      // files
      if (s.type === 'files') {
        const links = (s.files || [])
          .map((f) => `<div><a href="${f.dataUrl}" download="${escapeHtml(f.name)}">${escapeHtml(f.name)}</a></div>`)
          .join('');
        return `
          <article>
            <div class="title">${escapeHtml(s.label)}</div>
            <div class="details">${links}</div>
          </article>
        `;
      }

      return '';
    })
    .join('');

  if (hasText(formatSkillsLine(resume.skills))) {
    sections.push({
      title: 'skills',
      content: `
        <section class="section safe">
          <h2 class="section-title">Skills</h2>
          <div class="skills">${skills}</div>
        </section>
      `,
    });
  }

  if (projects) {
    sections.push({
      title: 'projects',
      content: `
        <section class="section safe">
          <h2 class="section-title">Projects</h2>
          ${projects}
        </section>
      `,
    });
  }

  if (customSections) {
    sections.push({
      title: 'custom',
      content: `
        <section class="section safe">
          <h2 class="section-title">Additional</h2>
          ${customSections}
        </section>
      `,
    });
  }

  if (certifications) {
    sections.push({
      title: 'certifications',
      content: `
        <section class="section safe">
          <h2 class="section-title">Certifications</h2>
          ${certifications}
        </section>
      `,
    });
  }

  if (hasText(achievements)) {
    sections.push({
      title: 'achievements',
      content: `
        <section class="section safe">
          <h2 class="section-title">Achievements</h2>
          <ul class="bullet-list">${achievements}</ul>
        </section>
      `,
    });
  }

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(resume.personalInfo.fullName)} Resume</title>
        <style>
          @page { size: A4; margin: 9mm 10mm; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #fff; color: #000; }
          body { font-family: Georgia, 'Times New Roman', serif; font-size: 10.5px; line-height: 1.42; }
          .page { width: 100%; }
          .resume { border: 0; }
          .header { text-align: center; }
          .name { font-size: 25px; font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; }
          .headline { margin-top: 3px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(0,0,0,.72); }
          .contact { margin-top: 5px; font-size: 9px; color: rgba(0,0,0,.72); }
          .divider { height: 1px; margin: 10px 0 9px; background: rgba(0,0,0,.16); }
          .section { margin-top: 0; }
          .section-title { margin: 0 0 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; }
          .summary { font-size: 10.5px; }
          .section-block { margin-bottom: 8px; break-inside: avoid; page-break-inside: avoid; }
          .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
          .title { font-size: 11px; font-weight: 700; }
          .subtitle { font-style: italic; color: rgba(0,0,0,.75); }
          .date, .meta { font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(0,0,0,.7); text-align: right; }
          .location { margin-top: 1px; }
          .details { margin-top: 1px; white-space: pre-line; }
          .details img { display: block; margin-top: 6px; max-width: 100%; height: auto; }
          .bullet-list { list-style: none; margin: 4px 0 0; padding: 0; }
          .bullet-item { display: flex; gap: 5px; margin: 1px 0; }
          .bullet { width: 3px; height: 3px; border-radius: 999px; background: #000; flex: 0 0 auto; margin-top: 6px; }
          .section-stack { display: flex; flex-direction: column; gap: 10px; }
          .skills { font-size: 10.5px; white-space: pre-line; }
          .small-gap { margin-top: 6px; }
          .split { margin-top: 2px; }
          .safe { break-inside: avoid; page-break-inside: avoid; }
          .compact-gap { margin-top: 4px; }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="resume">
            ${sections
              .map((section, index) => `${section.content}${index < sections.length - 1 ? '<div class="divider"></div>' : ''}`)
              .join('')}
          </section>
        </main>
      </body>
    </html>
  `;
}
