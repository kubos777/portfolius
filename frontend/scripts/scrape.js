import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrapes horror films for a specific year from Wikipedia
 * @param {number} year - The release year (e.g. 2000 - 2026)
 * @returns {Promise<Array>} Array of film objects
 */
export async function scrapeYear(year) {
  const url = `https://en.wikipedia.org/wiki/List_of_horror_films_of_${year}`;
  console.log(`[Scraper] Fetching horror films for year ${year} from ${url}...`);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PortfoliusHorrorScraper/1.0",
      },
    });

    if (!res.ok) {
      console.warn(`[Scraper] HTTP ${res.status} for year ${year}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const films = [];

    $("table.wikitable").each((_, table) => {
      const $table = $(table);
      const headers = [];

      // Find the first row that actually contains <th> elements
      const $headerRow = $table.find("tr").filter((_, tr) => $(tr).find("th").length > 0).first();
      $headerRow.find("th").each((_, th) => {
        headers.push($(th).text().trim().toLowerCase());
      });

      const titleIdx = headers.findIndex((h) => h.includes("title"));
      const dirIdx = headers.findIndex((h) => h.includes("director"));
      const castIdx = headers.findIndex((h) => h.includes("cast"));
      const countryIdx = headers.findIndex((h) => h.includes("country"));
      const genreIdx = headers.findIndex(
        (h) => h.includes("subgenre") || h.includes("notes") || h.includes("genre")
      );

      // We only care about tables listing films with details
      if (titleIdx === -1 || (dirIdx === -1 && castIdx === -1 && countryIdx === -1)) {
        return;
      }

      // Process subsequent rows
      $headerRow.nextAll("tr").each((_, tr) => {
        const cells = [];
        $(tr).find("th, td").each((_, cell) => {
          $(cell).find("sup.reference").remove();
          cells.push({
            text: $(cell).text().trim(),
            link: $(cell).find("a").first().attr("href") || "",
          });
        });

        if (cells.length < 2) return;

        const titleCell = cells[titleIdx];
        const rawTitle = titleCell?.text || "";
        const title = rawTitle.replace(/\s+/g, " ").trim();
        if (!title || title.toLowerCase() === "title") return;

        const director = dirIdx >= 0 ? (cells[dirIdx]?.text || "").replace(/\s+/g, " ").trim() : "";
        const cast = castIdx >= 0 ? (cells[castIdx]?.text || "").replace(/\s+/g, " ").trim() : "";
        const country = countryIdx >= 0 ? (cells[countryIdx]?.text || "").replace(/\s+/g, " ").trim() : "";
        let subgenre = genreIdx >= 0 ? (cells[genreIdx]?.text || "").replace(/\[citation needed\]/gi, "").replace(/\s+/g, " ").trim() : "";
        if (!subgenre || subgenre === "-") subgenre = "Horror";
        const wikiUrl = titleCell?.link
          ? titleCell.link.startsWith("http")
            ? titleCell.link
            : `https://en.wikipedia.org${titleCell.link}`
          : "";

        films.push({
          id: `${year}-${films.length + 1}`,
          title,
          year,
          director: director || "Desconocido",
          cast: cast || "N/A",
          country: country || "Desconocido",
          subgenre: subgenre || "Horror",
          wikiUrl,
        });
      });
    });

    console.log(`[Scraper] Year ${year}: found ${films.length} horror films`);
    return films;
  } catch (err) {
    console.error(`[Scraper] Error scraping year ${year}:`, err.message);
    return [];
  }
}

/**
 * Scrapes horror films for all years within a range
 * @param {number} startYear
 * @param {number} endYear
 */
export async function scrapeRange(startYear = 2000, endYear = 2026) {
  console.log(`=== Starting Scraping from ${startYear} to ${endYear} (last ${endYear - startYear + 1} years) ===`);
  const allFilms = [];
  const yearsSummary = {};

  for (let y = startYear; y <= endYear; y++) {
    const films = await scrapeYear(y);
    allFilms.push(...films);
    yearsSummary[y] = films.length;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`\n=== Finished Scraping! Total films collected: ${allFilms.length} ===`);

  const outputData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: "Wikipedia (List of horror films by year)",
      yearsCovered: { start: startYear, end: endYear, totalYears: endYear - startYear + 1 },
      totalFilms: allFilms.length,
      filmsByYear: yearsSummary,
    },
    films: allFilms,
  };

  const frontendDataDir = path.resolve(__dirname, "../src/data");
  if (!fs.existsSync(frontendDataDir)) {
    fs.mkdirSync(frontendDataDir, { recursive: true });
  }
  const frontendFilePath = path.join(frontendDataDir, "horror_movies.json");
  fs.writeFileSync(frontendFilePath, JSON.stringify(outputData, null, 2), "utf-8");
  console.log(`Saved horror movies dataset to: ${frontendFilePath}`);

  return outputData;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  scrapeRange(2000, 2026).catch((err) => {
    console.error("Fatal scraper error:", err);
    process.exit(1);
  });
}
