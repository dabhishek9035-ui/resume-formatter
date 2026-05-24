# Resume Builder (Next.js + TypeScript)

A small Next.js TypeScript app for generating resumes and PDF exports from editable templates.

**Key features**

- Resume editing UI components under `src/components/resume`
- Serverless PDF route at `src/app/api/resume/pdf/route.ts`
- Resume rendering and PDF utilities in `src/lib/resume`
- TailwindCSS for styling

## Getting Started

Prerequisites

- Node.js 18+ (recommended)
- npm or yarn

Install

```bash
npm install
# or
# yarn
```

Run locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment

Create a `.env.local` at the project root for any environment variables the app requires (none are mandatory in the repo by default). Example:

```
# Example environment variables
# NEXT_PUBLIC_SOME_KEY=your_value
```

## Project Structure

- `src/app` — Next.js app routes and pages
  - `api/resume/pdf/route.ts` — server route that generates PDFs
- `src/components/resume` — resume editor and template components
- `src/lib/resume` — default data, rendering, PDF helpers, and types
- `src/lib/utils.ts` — utility helpers

## Development Notes

- The PDF generation is implemented server-side; check `src/app/api/resume/pdf/route.ts` and `src/lib/resume/pdf.ts` for the core logic.
- Templates live in `src/components/resume/resume-template.tsx` and are composed by the editor `resume-editor.tsx`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start the production server (after build)

## Contributing

Feel free to open issues or submit pull requests. Keep changes focused and include tests where appropriate.

## License

Add a LICENSE file if you intend to publish this project under an open-source license.
