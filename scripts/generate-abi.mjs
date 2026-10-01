import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';

const names = ['PTLCChannel', 'InsuranceVault', 'L1Validator', 'DisputeTribunal', 'ZKVerifier'];
const root = process.env.POPRS_CORE_CONTRACTS ?? path.resolve('abi-sources');
const sources = Object.fromEntries(names.map(name => [`${name}.sol`, { content: fs.readFileSync(path.join(root, `${name}.sol`), 'utf8') }]));
const input = { language: 'Solidity', sources, settings: { outputSelection: { '*': { '*': ['abi'] } } } };
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors?.filter(item => item.severity === 'error') ?? [];
if (errors.length) throw new Error(errors.map(item => item.formattedMessage).join('\n'));
fs.mkdirSync('src/abi', { recursive: true });
for (const name of names) {
  const abi = output.contracts[`${name}.sol`][name].abi;
  fs.writeFileSync(`src/abi/${name}.ts`, `// Generated from PoPRS/contracts/${name}.sol with solc ${solc.version()}; do not edit.\nexport const ${name}Abi = ${JSON.stringify(abi, null, 2)} as const;\n`);
}
fs.writeFileSync('src/abi/index.ts', names.map(name => `export { ${name}Abi } from './${name}.js';`).join('\n') + '\n');
