const fs = require('fs');
const file = 'c:/Users/Victus/Tugas-ABP/frontend/src/pages/admin/AdminUsers.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace \` with `
content = content.replace(/\\`/g, '`');
// Replace \$ with $
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(file, content);
