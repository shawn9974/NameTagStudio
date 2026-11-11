# Name Tag Studio

Design and print name tags for events, conferences and meetings. Type a guest list, style the tags, and download a print-ready PDF.

Everything runs locally in your browser. No account, server, API key or internet connection is needed.

## Quick start

1. Download [Name Tag Studio.html](Name%20Tag%20Studio.html) (on GitHub: open the file, then **Download raw file**).
2. Double-click it to open it in your browser (Chrome or Edge recommended).
3. Enter your guests, adjust the design, and click **Download PDF**.

The HTML file is fully self-contained, so you can copy it to any computer or share it as a single file.

## Guest list

One tag per line, in the format `Name, Subtitle`:

```
John Doe, Speaker
张伟, 主讲嘉宾
Jane Smith
, Staff
,
```

- The subtitle (role, company, etc.) is optional.
- `, Staff` makes a tag with a subtitle but no name; `,` makes a completely blank tag.
- An empty guest list gives one full page of blank tags, for writing names by hand.
- Chinese, Japanese, Korean and other non-Latin text is supported.

## Features

**Names tab**
- Event title shown in the banner
- Corner logo: upload an image, adjust size and opacity
- Background image: upload an image, adjust size, opacity and vertical position

**Style tab**
- Font: Helvetica, Times New Roman or Courier
- Banner at the top, at the bottom, or none; banner and text colors
- Font sizes for the banner, name and subtitle, and the gap between name and subtitle

**Sheet tab**
- Layouts: 8, 10 or 18 tags per page, or a custom grid
- Tag width and height (mm) and the gap between tags
- A4 or Letter paper

The default banner color is brand navy `#002B60`; the default name color is black.

## Printing notes

- **Colors:** the navy banner (`#002B60`) is written to the PDF as CMYK 100/60/0/60 for print. Other colors, text and images are RGB. CMYK colors can look slightly different on screen; check a printed proof. For an exact Pantone (P108-16C) spot color, ask your printer.
- **Non-Latin text:** Chinese, Japanese and Korean text is drawn with the fonts installed on the computer doing the export and embedded as a 600 DPI image. It prints sharply but can't be selected or searched in the PDF, and the font may differ slightly between computers.
- **Settings are not saved:** reloading the page resets the design to its defaults.

## For developers

Requires [Node.js](https://nodejs.org/). Built with React, TypeScript, Vite, Tailwind CSS and jsPDF.

```
npm install
npm run dev
```

The dev server runs at http://localhost:3000.

### Rebuild the single HTML file

After changing the code, regenerate `Name Tag Studio.html`:

```
npm run build:standalone
```

Then copy `standalone/index.html` to `Name Tag Studio.html` in the project root.

### Project layout

| Path | Contents |
|---|---|
| `App.tsx` | Editor panel and sheet preview |
| `components/TagPreview.tsx` | On-screen rendering of one tag |
| `services/pdfService.ts` | PDF generation |
| `constants.tsx` | Defaults, color presets, fonts, layouts |
| `types.ts` | Settings types |
| `vite.standalone.config.ts` | Build config for the single HTML file |
