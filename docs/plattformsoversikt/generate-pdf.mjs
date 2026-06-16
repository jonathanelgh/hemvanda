import { fileURLToPath } from "node:url";
import path from "node:path";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "plattformsoversikt.html");
const outputPath = path.join(__dirname, "HemVanda-Plattformsoversikt.pdf");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  await page.emulateMediaType("print");

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  console.log(`PDF skapad: ${outputPath}`);
} finally {
  await browser.close();
}
