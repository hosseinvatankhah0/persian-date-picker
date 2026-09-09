const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const jasmineCore = require('jasmine-core');

async function run() {
  const root = path.resolve(__dirname, '..');
  const outDir = path.join(root, '.angular', 'regression');
  fs.mkdirSync(outDir, {recursive: true});
  const specs = [
    'month-calendar/navigation.regression.spec.ts',
    'common/range.regression.spec.ts',
    'persian-date-picker/locale-output.regression.spec.ts'
  ];
  await esbuild.build({
    absWorkingDir: root,
    entryPoints: specs,
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outdir: outDir,
    outbase: '.',
    outExtension: {'.js': '.mjs'},
    tsconfig: 'tsconfig.lib.json'
  });
  await import('@angular/compiler');
  const jasmine = jasmineCore.core(jasmineCore);
  const environment = jasmine.getEnv();
  Object.assign(globalThis, jasmineCore.interface(jasmine, environment));
  environment.addReporter({
    specDone(result) {
      console.log(`${result.status}: ${result.fullName}`);
      for (const failure of result.failedExpectations) console.error(failure.message);
    },
    jasmineDone(result) {
      process.exitCode = result.overallStatus === 'passed' ? 0 : 1;
    }
  });
  for (const spec of specs) {
    const bundled = path.join(outDir, spec.replace(/\.ts$/, '.mjs'));
    await import(pathToFileURL(bundled).href);
  }
  await environment.execute();
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
