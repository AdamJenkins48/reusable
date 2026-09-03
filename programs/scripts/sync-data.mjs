import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  PROGRAM_BROWSE_DIRECTIONS,
  resolveProgramBrowseDirection,
} from "../../js/data/program-browse-direction.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageRoot, "..");
const sourcePath = path.resolve(
  process.argv[2] || path.join(repositoryRoot, "public/data/programs/index.json")
);
const dataDirectory = path.join(packageRoot, "data");

const source = JSON.parse(await readFile(sourcePath, "utf8"));

function compact(program) {
  const browseDirection = resolveProgramBrowseDirection(program);
  return {
    id: program.id,
    slug: program.slug,
    route: program.route,
    title: program.title,
    direction: program.direction,
    directionSlug: program.directionSlug,
    browseDirectionSlug: browseDirection.slug,
    browseDirectionTitle: browseDirection.title,
    programType: program.programType,
    programTypeLabel: program.programTypeLabel,
    hours: program.hours,
    educationLevels: program.educationLevels || [],
    ...(program.documentType ? { documentType: program.documentType } : {}),
  };
}

const exports = [
  ["professional-retraining", "professional-retraining.json"],
  ["advanced-training", "advanced-training.json"],
];

await mkdir(dataDirectory, { recursive: true });
for (const [programType, filename] of exports) {
  const programs = source.programs
    .filter((program) => program.status === "ready" && program.programType === programType)
    .map(compact);
  await writeFile(
    path.join(dataDirectory, filename),
    `${JSON.stringify({ schemaVersion: 1, programType, count: programs.length, programs }, null, 2)}\n`,
    "utf8"
  );
  console.log(`${filename}: ${programs.length}`);
}

const directions = PROGRAM_BROWSE_DIRECTIONS.map(({ slug, title }) => ({ slug, title }));
await writeFile(
  path.join(dataDirectory, "directions.json"),
  `${JSON.stringify({ schemaVersion: 1, directions }, null, 2)}\n`,
  "utf8"
);
