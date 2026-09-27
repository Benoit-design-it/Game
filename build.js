// Assemble src/ en un seul fichier autonome : index.html (à la racine).
// Usage : node build.js
const fs = require('fs');
const path = require('path');

const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
let html = src('index.html');

html = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${src('style.css')}</style>`);
html = html.replace(/<script src="([\w./-]+\.js)"><\/script>/g, (_, file) => {
  const js = src(file);
  if (js.includes('</script')) throw new Error(`${file} contient « </script » : impossible de l'insérer tel quel.`);
  return `<script>\n${js}</script>`;
});
if (/(href|src)="(?!https?:)[^"]+\.(css|js)"/.test(html)) throw new Error('Une ressource locale n\'a pas été intégrée.');

const banner = '<!-- Fichier généré par build.js à partir de src/. Modifier src/, puis lancer : node build.js -->\n';
fs.writeFileSync(path.join(__dirname, 'index.html'), html.replace('<!doctype html>\n', `<!doctype html>\n${banner}`));
console.log(`index.html : ${(Buffer.byteLength(html) / 1024).toFixed(0)} Ko`);
