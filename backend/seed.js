const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Conectado');

    // Crear Permisos Básicos
    const permissions = await Permission.insertMany([
      { name: 'usuarios.manage', description: 'Administrar usuarios' },
      { name: 'roles.manage', description: 'Administrar roles' },
      { name: 'citas.create', description: 'Crear citas' },
      { name: 'consultas.view', description: 'Ver consultas' }
    ]);

    // Crear Rol Administrador
    const adminRole = await Role.create({
      name: 'admin',
      display_name: 'Administrador General',
      permissions: permissions.map(p => p._id)
    });

    // Crear Usuario Administrador
    const adminUser = await User.create({
      email: 'admin@lcmedica.com',
      password: 'SecurePassword123!',
      is_active: true,
      roles: [adminRole._id]
    });

    console.log('Usuario administrador creado exitosamente:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: SecurePassword123!`);

    process.exit();
  } catch (error) {
    console.error('Error al crear el administrador:', error);
    process.exit(1);
  }
};

seedAdmin();
