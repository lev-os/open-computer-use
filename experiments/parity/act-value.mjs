// Parse only the fixture field's tree row, preserving all value characters.
// Kept self-contained so the identical function can run inside Codex's sandbox.
export function fixtureInputValue(text) {
  const line = text.split('\n').find(line => /^\s*\d+\s/.test(line) &&
    /(?:ID: fixture-input(?=,|$)|\) fixture-input$)/.test(line));
  if (!line) return undefined;
  const marker = line.indexOf('Value: ');
  if (marker < 0) return '';
  const value = line.slice(marker + 'Value: '.length);
  const suffix = value.indexOf(', ID: fixture-input');
  return suffix < 0 ? value : value.slice(0, suffix);
}
