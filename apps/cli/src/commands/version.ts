import { readFileSync } from 'fs';
import { join, dirname } from 'path';

interface ModuleInfo {
  name: string;
  version: string;
  description?: string;
}

// Get the directory of the current file (works in both ESM and CommonJS)
function getCurrentDir(): string {
  try {
    // For CommonJS
    return __dirname;
  } catch {
    // Fallback
    return process.cwd();
  }
}

function getPackageInfo(packageName: string): ModuleInfo | null {
  try {
    // Try to find package in node_modules
    const currentDir = getCurrentDir();
    const possiblePaths = [
      join(process.cwd(), 'node_modules', packageName, 'package.json'),
      join(currentDir, '..', '..', 'node_modules', packageName, 'package.json'),
      join(currentDir, '..', '..', '..', '..', 'node_modules', packageName, 'package.json'),
    ];

    for (const pkgPath of possiblePaths) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        return {
          name: pkg.name,
          version: pkg.version,
          description: pkg.description,
        };
      } catch {
        continue;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function getCLIPackageInfo(): ModuleInfo {
  try {
    const currentDir = getCurrentDir();
    const pkgPath = join(currentDir, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
    };
  } catch {
    return { name: '@narrative-os/cli', version: 'unknown' };
  }
}

export function versionCommand() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║           Narrative OS - Version Information           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // CLI Info
  const cli = getCLIPackageInfo();
  console.log('📦 CLI');
  console.log(`   Name:    ${cli.name}`);
  console.log(`   Version: ${cli.version}`);
  if (cli.description) {
    console.log(`   Desc:    ${cli.description}`);
  }
  console.log();

  // Engine Info
  const engine = getPackageInfo('@narrative-os/engine');;
  if (engine) {
    console.log('⚙️  Engine');
    console.log(`   Name:    ${engine.name}`);
    console.log(`   Version: ${engine.version}`);
    if (engine.description) {
      console.log(`   Desc:    ${engine.description}`);
    }
    console.log();
  } else {
    console.log('⚙️  Engine: Not installed\n');
  }

  // Future modules (check if installed)
  const futureModules = [
    '@narrative-os/skills',
    '@narrative-os/characters',
    '@narrative-os/worlds',
    '@narrative-os/plots',
  ];

  const installedModules = futureModules
    .map(name => getPackageInfo(name))
    .filter((info): info is ModuleInfo => info !== null);

  if (installedModules.length > 0) {
    console.log('🧩 Extension Modules');
    for (const mod of installedModules) {
      console.log(`   • ${mod.name}@${mod.version}`);
    }
    console.log();
  }

  // Check for local development mode
  const currentDir = getCurrentDir();
  const isLocalDev = currentDir.includes('apps/cli');
  if (isLocalDev) {
    console.log('🛠️  Development Mode: Local source\n');
  }

  console.log('─────────────────────────────────────────────────────────');
  console.log('For updates: npm install -g @narrative-os/cli@latest');
  console.log('─────────────────────────────────────────────────────────');
}
