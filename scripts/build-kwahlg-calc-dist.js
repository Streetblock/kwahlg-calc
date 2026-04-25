const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const libRoot = path.join(projectRoot, 'lib', 'kwahlg-calc');
const srcRoot = path.join(libRoot, 'src');
const distRoot = path.join(libRoot, 'dist');
const distFile = path.join(distRoot, 'kwahlg-calc.umd.js');

const sourceFiles = [
    path.join(srcRoot, 'Allocators.js'),
    path.join(srcRoot, 'NrwCalculator.js'),
    path.join(srcRoot, 'CommitteeCalculator.js')
];

const bundleHeader = `/*!
 * kwahlg-calc browser bundle
 * Generated file. Do not edit directly.
 */
`;

const bundleFooter = `
(function exposeKwahlgCalcLibrary(globalScope) {
    const REQUIRED_EXPORTS = [
        'SainteLagueAllocator',
        'DHondtAllocator',
        'HareNiemeyerAllocator',
        'NrwKWahlGCalculator',
        'CommitteeCalculator'
    ];

    function createPublicApi(source, environmentLabel) {
        const api = {};
        const missingExports = [];

        REQUIRED_EXPORTS.forEach((exportName) => {
            if (typeof source[exportName] === 'function') {
                api[exportName] = source[exportName];
            } else {
                missingExports.push(exportName);
            }
        });

        if (missingExports.length > 0) {
            throw new Error(
                'KWahlGCalcLib could not initialize in ' + environmentLabel + '. ' +
                'Missing exports: ' + missingExports.join(', ') + '.'
            );
        }

        return api;
    }

    const api = createPublicApi({
        SainteLagueAllocator: typeof SainteLagueAllocator === 'function' ? SainteLagueAllocator : globalScope.SainteLagueAllocator,
        DHondtAllocator: typeof DHondtAllocator === 'function' ? DHondtAllocator : globalScope.DHondtAllocator,
        HareNiemeyerAllocator: typeof HareNiemeyerAllocator === 'function' ? HareNiemeyerAllocator : globalScope.HareNiemeyerAllocator,
        NrwKWahlGCalculator: typeof NrwKWahlGCalculator === 'function' ? NrwKWahlGCalculator : globalScope.NrwKWahlGCalculator,
        CommitteeCalculator: typeof CommitteeCalculator === 'function' ? CommitteeCalculator : globalScope.CommitteeCalculator
    }, 'browser bundle');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    globalScope.KWahlGCalcLib = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
`;

const bundleBody = sourceFiles
    .map((filePath) => fs.readFileSync(filePath, 'utf8'))
    .join('\n\n');

fs.mkdirSync(distRoot, { recursive: true });
fs.writeFileSync(distFile, `${bundleHeader}\n${bundleBody}\n${bundleFooter}`);
console.log(`Built ${path.relative(projectRoot, distFile)}`);
