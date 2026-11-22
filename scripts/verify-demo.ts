import { verifyDemoMath } from "../src/features/student-mode/verifyDemo";

async function main() {
  const lines = await verifyDemoMath();
  for (const line of lines) {
    console.log("✓", line);
  }
  console.log("All demo checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
