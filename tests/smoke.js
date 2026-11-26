const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const erros = [];
  p.on('console', m => { if (['error','warning'].includes(m.type())) erros.push(m.type()+': '+m.text()); });
  p.on('pageerror', e => erros.push('PAGEERROR: ' + e.message));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(800);
  await p.screenshot({ path: '/tmp/claude-0/shots/menu.png' });
  await p.click('text=Novo jogo');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/claude-0/shots/jogo1.png' });
  console.log(erros.join('\n') || 'sem erros');
  await b.close();
})();
