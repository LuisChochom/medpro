const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que exista la carpeta de uploads
const uploadDir = path.join(__dirname, '../storage/app/expedientes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Generar nombre aleatorio para evitar colisiones y mantener privacidad
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

function checkFileType(file, cb) {
  // Tipos permitidos
  const filetypes = /pdf|jpeg|jpg|png/;
  // Verificar extensión
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Verificar mimetype
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Solo PDF, JPG y PNG.'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
