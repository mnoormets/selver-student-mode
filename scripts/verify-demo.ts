import { verifyDemoMath } from "../src/features/student-mode/verifyDemo";

for (const line of verifyDemoMath()) {
  console.log("✓", line);
}
console.log("All demo checks passed.");
