import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync("src/App.jsx", "utf8")
  .replace('import { useEffect, useMemo, useState } from "react";\n\n', "")
  .replace("export default function ClientSocialMediaPostingTrackerInterface()", "function ClientSocialMediaPostingTrackerInterface()");

const browserEntry = `const { useEffect, useMemo, useState } = React;\n\n${source}\n\nReactDOM.createRoot(document.getElementById("root")).render(<ClientSocialMediaPostingTrackerInterface />);\n`;

writeFileSync("src/browser-app.jsx", browserEntry);
