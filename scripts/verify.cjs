// Runs identically on Windows and Linux, without Gradle or deployment configuration.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const cloud = fs.existsSync(path.join(root, 'libraries/storage'));
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run this command through npm run verify.');
if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Node 22 or newer is required.');
const compiler = path.join(root, 'node_modules/typescript/bin/tsc');
assert.equal(require(path.join(root, 'node_modules/typescript/package.json')).version, '5.9.3');
function run(args, cwd = root, capture = false) {
    const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Command failed (${result.status}): ${args.join(' ')}\n${result.stdout || ''}\n${result.stderr || ''}`);
    return result.stdout;
}
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
function resetGenerated(dir) {
    const resolved = path.resolve(dir);
    if (!resolved.startsWith(root + path.sep) || !resolved.split(path.sep).some(p => ['build','dist','node_modules'].includes(p))) {
        throw new Error(`Refusing to reset unexpected path: ${resolved}`);
    }
    fs.rmSync(resolved, { recursive: true, force: true });
    fs.mkdirSync(resolved, { recursive: true });
}
const groups = cloud ? ['libraries','aws','azure','scripts'] : ['base','aws','azure','google-cloud'];
const packages = groups.flatMap(group => fs.readdirSync(path.join(root,group), {withFileTypes:true})
    .filter(e => e.isDirectory() && fs.existsSync(path.join(root,group,e.name,'package.json')))
    .map(e => {
        const dir = path.join(root,group,e.name);
        return {dir, group, manifest:readJson(path.join(dir,'package.json')), output:path.join(dir,cloud?'build/staging':'dist')};
    }));
const byName = new Map(packages.map(p => [p.manifest.name,p]));
const built = new Set();
const building = new Set();
function localDependencies(pkg) {
    const names = Object.keys({...pkg.manifest.dependencies,...pkg.manifest.devDependencies,...pkg.manifest.peerDependencies});
    // The application build injects @local libraries from Gradle rather than package.json.
    if (cloud) {
        function scan(dir) {
            if (!fs.existsSync(dir)) return;
            for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
                const file = path.join(dir,e.name);
                if(e.isDirectory()) scan(file);
                else if(e.name.endsWith('.ts')) {
                    for(const m of fs.readFileSync(file,'utf8').matchAll(/["'](@local\/[^"']+)["']/g)) names.push(m[1]);
                }
            }
        }
        scan(path.join(pkg.dir,'src'));
    }
    return [...new Set(names)].filter(n => byName.has(n) && n !== pkg.manifest.name).map(n => byName.get(n));
}
function copyBuiltPackage(dep, destination) {
    resetGenerated(destination);
    if (cloud) {
        fs.cpSync(dep.output,destination,{recursive:true});
        // Local tarball dependencies may not exist in the application's own lockfile.
        // Keep their already-installed, locked dependency trees with the package.
        fs.cpSync(path.join(dep.dir,'node_modules'),path.join(destination,'node_modules'),{
            recursive:true,
            // Local libraries must have one shared identity in the consuming app.
            filter: source => !source.includes(`${path.sep}node_modules${path.sep}@local`)
        });
    }
    else fs.cpSync(dep.output,path.join(destination,'dist'),{recursive:true});
    fs.copyFileSync(path.join(dep.dir,'package.json'),path.join(destination,'package.json'));
}
function build(pkg) {
    if(built.has(pkg)) return;
    if(building.has(pkg)) throw new Error(`Local dependency cycle at ${pkg.manifest.name}`);
    building.add(pkg);
    const deps=localDependencies(pkg);
    deps.forEach(build);
    console.log(`\nVerifying ${path.relative(root,pkg.dir)}`);
    run([npm,'ci','--no-audit','--no-fund'],pkg.dir);
    // Preserve locked external dependencies; replace only local package output.
    const injected = new Set();
    function inject(dep) {
        if (injected.has(dep)) return;
        injected.add(dep);
        localDependencies(dep).forEach(inject);
        copyBuiltPackage(dep,path.join(pkg.dir,'node_modules',dep.manifest.name));
    }
    if (cloud) deps.forEach(inject);
    else for (const dep of deps) copyBuiltPackage(dep,path.join(pkg.dir,'node_modules',dep.manifest.name));
    resetGenerated(pkg.output);
    run([compiler,'-p','tsconfig.json'],pkg.dir);
    if(cloud && pkg.group === 'libraries') fs.copyFileSync(path.join(pkg.dir,'package.json'),path.join(pkg.output,'package.json'));
    if ((!cloud && ['@mcma/core','@mcma/aws-logger'].includes(pkg.manifest.name)) || (cloud && pkg.manifest.name==='@local/storage')) {
        resetGenerated(path.join(pkg.dir,'build/test'));
        run([npm,'test'],pkg.dir);
    }
    building.delete(pkg);
    built.add(pkg);
}
const packageOnly = process.argv.includes('--package-only');
if (packageOnly && cloud) throw new Error('--package-only is for the MCMA core package smoke check.');
if (!packageOnly) packages.forEach(build);
if(!cloud) {
    const core=byName.get('@mcma/core');
    const fixture=path.join(root,'build/package-smoke');
    resetGenerated(fixture);
    // Start with the exact locked dependency tree, then install the actual npm tarball.
    fs.cpSync(path.join(core.dir,'node_modules'),path.join(fixture,'node_modules'),{recursive:true});
    const lockedVersions = dependencies => Object.fromEntries(Object.keys(dependencies || {}).map(name =>
        [name, readJson(path.join(core.dir,'node_modules',name,'package.json')).version]));
    fs.writeFileSync(path.join(fixture,'package.json'),JSON.stringify({
        private:true,
        dependencies:lockedVersions(core.manifest.dependencies),
        devDependencies:lockedVersions(core.manifest.devDependencies)
    }));
    const packed=JSON.parse(run([npm,'pack','--json','--pack-destination',fixture],core.dir,true));
    assert.ok(packed[0].files.some(f=>f.path==='dist/index.js'));
    assert.ok(!packed[0].files.some(f=>f.path.startsWith('build/') || f.path.startsWith('test/')));
    run([npm,'install','--offline','--ignore-scripts','--no-save','--package-lock=false','--no-audit','--no-fund',path.join(fixture,packed[0].filename)],fixture);
    run(['-e',"const assert=require('node:assert/strict'); const {ConsoleLogger,LogEvent}=require('@mcma/core'); assert.equal(typeof ConsoleLogger,'function'); assert.equal(typeof LogEvent,'function');"],fixture);
    fs.writeFileSync(path.join(fixture,'consumer.ts'),'import { ConsoleLogger, LogEvent } from "@mcma/core";\nconst logger = new ConsoleLogger("consumer");\nlogger.info({ jobId: "job-1" });\nconst event: LogEvent = new LogEvent("INFO", 400, "consumer", "request", new Date(), "hello");\n');
    run([compiler,'--noEmit','--module','commonjs','--moduleResolution','node','--target','ES2022','--strict','consumer.ts'],fixture);
    console.log('Packed core runtime and declaration checks passed.');
} else {
    for(const pkg of packages.filter(p=>p.group==='aws')) {
        assert.ok(fs.existsSync(path.join(pkg.output,'index.js')),`Missing AWS entry point: ${pkg.dir}`);
        run(['--check',path.join(pkg.output,'index.js')]);
    }
    const azure=packages.find(p=>p.dir.endsWith(path.join('azure','function-app')));
    assert.ok(fs.existsSync(path.join(azure.output,azure.manifest.main)),'Missing Azure main entry point');
    run(['--check',path.join(azure.output,azure.manifest.main)]);
    for(const pkg of packages.filter(p=>['aws','azure'].includes(p.group))) {
        for(const dep of localDependencies(pkg)) assert.ok(fs.existsSync(path.join(pkg.dir,'node_modules',dep.manifest.name,dep.manifest.main)),`Missing local dependency ${dep.manifest.name}`);
    }
    console.log('Application staging checks passed (no cloud handlers invoked).');
}
if (!packageOnly) console.log(`Verified ${built.size} packages on Node ${process.versions.node} / ${process.platform}.`);
