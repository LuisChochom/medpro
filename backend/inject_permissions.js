const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Permission = require('./models/Permission');
const Role = require('./models/Role');

dotenv.config();

const newPermissions = [
  { name: 'pacientes.view', description: 'Ver pacientes' },
  { name: 'pacientes.manage', description: 'Crear, editar, borrar pacientes' },
  { name: 'medicos.view', description: 'Ver medicos' },
  { name: 'medicos.manage', description: 'Crear, editar, borrar medicos' },
  { name: 'citas.view', description: 'Ver citas' },
  { name: 'citas.manage', description: 'Crear, editar, borrar citas' },
  { name: 'consultas.view', description: 'Ver consultas' },
  { name: 'consultas.manage', description: 'Crear, editar, borrar consultas' },
  { name: 'recetas.view', description: 'Ver recetas' },
  { name: 'recetas.manage', description: 'Crear, editar, borrar recetas' },
  { name: 'documentos.view', description: 'Ver documentos' },
  { name: 'documentos.manage', description: 'Crear, editar, borrar documentos' }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Create permissions if they don't exist
    for (let p of newPermissions) {
      const exists = await Permission.findOne({ name: p.name });
      if (!exists) {
        await Permission.create(p);
        console.log(`Created permission: ${p.name}`);
      }
    }

    // 2. Add all permissions to 'admin' role
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      const allPerms = await Permission.find();
      adminRole.permissions = allPerms.map(p => p._id);
      await adminRole.save();
      console.log('Assigned all permissions to admin role');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
