import { Stitch, StitchToolClient } from "@google/stitch-sdk";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.STITCH_API_KEY || "AQ.Ab8RN6IhJSqbrU6xIKGqlywVthghFWAWfaZlGy1xPC43AB8BTA";
const OUTPUT_DIR = join(__dirname, "..", "public", "stitch");

const sections = [
  {
    name: "hero",
    prompt:
      "A premium SaaS hero section for a UAE PRO services company called YABS. Dark navy (#0f1d3a) background with a bold headline 'One Platform for All Your PRO Services', red (#ef4444) and gold (#d4a843) accent colors, CTA buttons 'Get Started' and 'Watch Demo', a floating dashboard mockup on the right side showing company stats and a mini data table, trust badges at bottom showing '500+ companies trust us'. Modern, clean, premium feel.",
  },
  {
    name: "services",
    prompt:
      "A 6-card services grid section for a UAE PRO services company. Light gray (#f8fafc) background. Section title 'PRO Services Across UAE' with red subtitle. Cards: Trade License (blue icon), Visa Services (green icon), Business Setup (purple icon), Document Services (orange icon), Accounting & VAT (teal icon), ADNOC & ICV (navy icon). Each card has a gradient-colored icon in a rounded square, bold title, short description, and a 'Learn more' link. Cards have white background, subtle border, hover shadow effect. 'View All Services' button below.",
  },
  {
    name: "features",
    prompt:
      "An interactive feature showcase section with a left sidebar of 6 tabs and a right content panel. White background. Section title 'A Platform That Puts You in Full Control' with red 'Platform' subtitle. Left sidebar tabs (vertical, with icons): Real-time Dashboard, Document Management, Smart Notifications, Employee Tracking, Expiry Calendar, Secure Client Portal. The active tab has a red left border and red icon. Right panel shows a mock analytics dashboard with stat cards, a bar chart, and a mini data table. Clean, professional SaaS style.",
  },
  {
    name: "pricing",
    prompt:
      "3-tier pricing cards for a UAE PRO services company. White background. Section title 'Monthly PRO Service Packages' with red 'Pricing' subtitle. Cards: Starter (AED 1,500/mo, 5 features, gray border), Professional (AED 3,500/mo, 6 features, red border, 'Most Popular' badge, slightly scaled up), Enterprise (Custom Pricing, 7 features, gray border). Each card has: plan name, subtitle, price, feature list with green checkmarks, and a CTA button. Professional card button is red gradient, others have gray outline buttons.",
  },
  {
    name: "quote-form",
    prompt:
      "A quote request form section on dark navy (#0f1d3a) background. Title 'Get a Free Quote in 60 Seconds' in white. Subtitle in gray. 2-column form layout with glassmorphic frosted inputs (white/10 background, white/20 border). Fields: Company Name, Emirate dropdown, Number of Employees dropdown, Service selection chips/tags (Trade License, Visa, Business Setup, etc.), Contact Name, Email, Phone, Message textarea. Full-width red gradient submit button 'Get Your Free Quote' with arrow icon. Clean, modern, dark theme.",
  },
];

async function downloadFile(url, filepath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(filepath, buffer);
}

async function main() {
  console.log("=== Google Stitch Design Generator ===\n");

  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Initializing Stitch client...");
  const client = new StitchToolClient({ apiKey: API_KEY });
  const sdk = new Stitch(client);

  console.log("Creating project 'YABS PRO Homepage'...");
  const project = await sdk.createProject("YABS PRO Homepage");
  console.log(`Project created: ${project.id}\n`);

  const results = [];

  for (const section of sections) {
    console.log(`Generating: ${section.name}...`);
    try {
      const screen = await project.generate(
        section.prompt,
        "DESKTOP",
        "GEMINI_3_PRO"
      );
      console.log(`  Screen ID: ${screen.id}`);

      const htmlUrl = await screen.getHtml();
      const imageUrl = await screen.getImage();

      console.log(`  HTML URL: ${htmlUrl}`);
      console.log(`  Image URL: ${imageUrl}`);

      const htmlFile = join(OUTPUT_DIR, `${section.name}.html`);
      const imageFile = join(OUTPUT_DIR, `${section.name}.png`);

      if (htmlUrl) {
        await downloadFile(htmlUrl, htmlFile);
        console.log(`  Saved HTML: public/stitch/${section.name}.html`);
      }

      if (imageUrl) {
        await downloadFile(imageUrl, imageFile);
        console.log(`  Saved Image: public/stitch/${section.name}.png`);
      }

      results.push({ name: section.name, htmlFile, imageFile });
      console.log(`  Done!\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ERROR generating ${section.name}: ${message}\n`);
    }
  }

  console.log("\n=== Generation Summary ===");
  console.log("| Section      | HTML                          | Screenshot                    |");
  console.log("|--------------|-------------------------------|-------------------------------|");
  for (const r of results) {
    console.log(`| ${r.name.padEnd(12)} | public/stitch/${r.name}.html | public/stitch/${r.name}.png |`);
  }

  console.log(`\nTotal: ${results.length}/${sections.length} sections generated.`);
  console.log("Open the HTML files in your browser to preview the designs.");

  await client.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
