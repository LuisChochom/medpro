const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');

const updates = [
  { file: 'userRoutes.js', perm: 'usuarios.manage', both: true },
  { file: 'roleRoutes.js', perm: 'roles.manage', both: true },
  { file: 'permissionRoutes.js', perm: 'roles.manage', both: true },
  { file: 'pacienteRoutes.js', getPerm: 'pacientes.view', postPerm: 'pacientes.manage' },
  { file: 'medicoRoutes.js', getPerm: 'medicos.view', postPerm: 'medicos.manage' },
  { file: 'citaRoutes.js', getPerm: 'citas.view', postPerm: 'citas.manage' },
  { file: 'consultaRoutes.js', getPerm: 'consultas.view', postPerm: 'consultas.manage' },
];

updates.forEach(({ file, perm, both, getPerm, postPerm }) => {
  const filePath = path.join(routesDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add authorizePermission to imports
  if (!content.includes('authorizePermission')) {
    if (content.includes('authorizeRole')) {
      content = content.replace(/const \{ authorizeRole \} = require\('\.\.\/middlewares\/roleMiddleware'\);/, 'const { authorizeRole, authorizePermission } = require(\'../middlewares/roleMiddleware\');');
    } else {
      content = content.replace(/(const router = express\.Router\(\);)/, "const { authorizePermission } = require('../middlewares/roleMiddleware');\n$1");
    }
  }

  // Remove existing commented out or empty authorizes if any
  content = content.replace(/\/\/ router\.use\(authorizeRole.*\);\n/g, '');

  if (both) {
    // Apply globally to the router
    if (!content.includes(`router.use(authorizePermission('${perm}'))`)) {
       content = content.replace(/(router\.use\(protect\);)/, `$1\nrouter.use(authorizePermission('${perm}'));`);
    }
  } else {
    // Apply specifically to methods
    // We replace .get( with .get(authorizePermission(getPerm), 
    // and .post(, .put(, .delete( with authorizePermission(postPerm),
    
    // First remove any existing ones we might have added (idempotency)
    const regexRemove = /authorizePermission\('[^']+'\),\s*/g;
    content = content.replace(regexRemove, '');

    content = content.replace(/\.get\(/g, `.get(authorizePermission('${getPerm}'), `);
    content = content.replace(/\.post\(/g, `.post(authorizePermission('${postPerm}'), `);
    content = content.replace(/\.put\(/g, `.put(authorizePermission('${postPerm}'), `);
    content = content.replace(/\.delete\(/g, `.delete(authorizePermission('${postPerm}'), `);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
