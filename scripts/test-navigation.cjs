const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const jasmineCore = require('jasmine-core');

async function run() {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, '.angular', 'navigation-regression.mjs');
  fs.mkdirSync(path.dirname(output), {recursive: true});
  await esbuild.build({
    absWorkingDir: root,
    entryPoints: ['month-calendar/navigation.regression.spec.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: output,
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
  await import(pathToFileURL(output).href);
  await environment.execute();
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
