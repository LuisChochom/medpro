const mongoose = require('mongoose');

const fixIsActive = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/medpro');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = ['users','roles','permissions','citas','consultas','documentos','medicos','pacientes','recetas'];
    
    for (let col of collections) {
      const result = await db.collection(col).updateMany(
        { is_active: { $exists: false } },
        { $set: { is_active: true } }
      );
      console.log(`Updated ${result.modifiedCount} documents in ${col}`);
    }
    
    console.log('All collections fixed.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixIsActive();
