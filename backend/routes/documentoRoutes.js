const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizePermission } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  uploadDocumento,
  getDocumentos,
  streamDocumento,
  updateDocumento,
  deleteDocumento
} = require('../controllers/DocumentoController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizePermission('documentos.view'), getDocumentos);

router.post('/upload', authorizePermission('documentos.manage'), upload.array('files', 10), uploadDocumento);

router.route('/:id')
  .put(authorizePermission('documentos.manage'), updateDocumento)
  .delete(authorizePermission('documentos.manage'), deleteDocumento);

router.get('/stream/:id/:fileIndex', authorizePermission('documentos.view'), streamDocumento);

module.exports = router;
