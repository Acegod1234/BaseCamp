// Serve the last successful production build; rebuild edits in a separate folder.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'node_modules/next/dist/bin/next');
const stateFile = path.join(root, '.cache/preview-state.json');
const outputs = ['.next-preview', '.next-preview-a', '.next-preview-b'];
let current = '.next-preview';
try { const saved = JSON.parse(fs.readFileSync(stateFile, 'utf8')); if (outputs.includes(saved.dist)) current = saved.dist; } catch {}
let server;
let building = false;
let pending = false;
let timer;
let stopping = false;
const run = (command, dist, extra = []) => spawn(process.execPath, [cli, command, ...extra], {
  cwd: root, windowsHide: true, stdio: 'inherit', env: { ...process.env, BCA_NEXT_DIST_DIR: dist },
});
function start() {
  if (stopping) return;
  server = run('start', current, ['--port', '3000']);
  server.once('exit', () => { if (!stopping && !building) setTimeout(start, 3000); });
}
async function rebuild() {
  if (building) { pending = true; return; }
  building = true;
  const next = current === '.next-preview-a' ? '.next-preview-b' : '.next-preview-a';
  console.log('[preview] Building updated pages; current site stays available.');
  const build = run('build', next, ['--webpack']);
  const code = await new Promise(resolve => { build.once('exit', resolve); build.once('error', () => resolve(1)); });
  if (code === 0) {
    if (server && server.exitCode === null) {
      await new Promise(resolve => { server.once('exit', resolve); server.kill(); });
    }
    current = next;
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    fs.writeFileSync(stateFile, JSON.stringify({ dist: current }));
    start();
    console.log('[preview] Updated site is ready.');
  } else console.error('[preview] Build failed; keeping the previous working site.');
  building = false;
  if (pending) { pending = false; void rebuild(); }
}
function schedule() { clearTimeout(timer); timer = setTimeout(() => void rebuild(), 1500); }
for (const directory of ['src', 'public']) fs.watch(path.join(root, directory), { recursive: true }, schedule);
fs.watch(root, (_event, file) => { if (['next.config.ts', 'package.json', 'package-lock.json'].includes(String(file))) schedule(); });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { stopping = true; server?.kill(); process.exit(0); });
if (fs.existsSync(path.join(root, current, 'BUILD_ID'))) start();
else void rebuild();
