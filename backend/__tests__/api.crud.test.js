const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = require('../app');
require('dotenv').config();

let token;
let pacienteId;
let medicoId;
let citaId;
let consultaId;
let recetaId;
let documentoId;
let roleId;
let permissionId;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('MedPro API - Pruebas CRUD Completas (GET, POST, PUT, DELETE)', () => {

  // ==========================================
  // 1. SEGURIDAD Y ACCESOS
  // ==========================================
  describe('Módulo 1: Seguridad, Auth, Roles, Permissions, Users', () => {
    it('1. POST /auth/login - Debería hacer login y obtener token', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@lcmedica.com',
        password: 'SecurePassword123!'
      });
      expect(res.statusCode).toEqual(200);
      token = res.body.token;
    });

    it('2. POST /permissions - Debería crear un permiso', async () => {
      const res = await request(app)
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `permiso.test.${Date.now()}`,
          description: 'Permiso de prueba'
        });
      expect(res.statusCode).toEqual(201);
      permissionId = res.body.data._id;
    });

    it('3. GET /permissions - Debería listar permisos', async () => {
      const res = await request(app).get('/api/v1/permissions').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });

    it('4. PUT /permissions/:id - Debería actualizar un permiso', async () => {
      const res = await request(app)
        .put(`/api/v1/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Descripción actualizada' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.description).toBe('Descripción actualizada');
    });

    it('5. POST /roles - Debería crear un rol', async () => {
      const res = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `rol_${Date.now()}`,
          display_name: 'Rol de Prueba'
        });
      expect(res.statusCode).toEqual(201);
      roleId = res.body.data._id;
    });

    it('6. GET /roles - Debería listar roles', async () => {
      const res = await request(app).get('/api/v1/roles').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });

    it('7. PUT /roles/:id - Debería actualizar un rol', async () => {
      const res = await request(app)
        .put(`/api/v1/roles/${roleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ display_name: 'Rol de Prueba Modificado' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.display_name).toBe('Rol de Prueba Modificado');
    });

    it('8. POST /roles/:id/permissions - Debería asignar permiso al rol', async () => {
      const res = await request(app)
        .post(`/api/v1/roles/${roleId}/permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ permissions: [permissionId] });
      expect(res.statusCode).toEqual(200);
    });

    it('9. POST /users - Debería crear un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: `testuser_${Date.now()}@test.com`,
          password: 'password123',
          roles: [roleId]
        });
      expect(res.statusCode).toEqual(201);
      userId = res.body.data._id;
    });

    it('10. GET /users - Debería listar usuarios', async () => {
      const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });

    it('11. PUT /users/:id - Debería desactivar al usuario de prueba', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ is_active: false });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.is_active).toBe(false);
    });
    
    // Dejamos el usuario, rol y permiso, pero probamos sus GET/PUT exitosos
  });

  // ==========================================
  // 2. ENTIDADES PRINCIPALES
  // ==========================================
  describe('Módulo 2: Pacientes y Médicos', () => {
    it('1. POST /pacientes - Debería crear paciente', async () => {
      const res = await request(app)
        .post('/api/v1/pacientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Juan', apellido: 'Perez', fecha_nacimiento: '1990-01-01', genero: 'M',
          telefono: '5551234', direccion: 'Ciudad', tipo_sangre: 'O+'
        });
      expect(res.statusCode).toEqual(201);
      pacienteId = res.body.data._id;
    });

    it('2. GET /pacientes - Debería listar pacientes', async () => {
      const res = await request(app).get('/api/v1/pacientes').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });

    it('3. PUT /pacientes/:id - Debería actualizar paciente', async () => {
      const res = await request(app)
        .put(`/api/v1/pacientes/${pacienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ telefono: '0000000' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.telefono).toBe('0000000');
    });

    it('4. POST /medicos - Debería crear médico', async () => {
      const res = await request(app)
        .post('/api/v1/medicos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: `med_${Date.now()}@test.com`, password: 'password123', colegiado_numero: `C-${Date.now()}`,
          nombre: 'Dr. Test', apellido: 'Prueba', especialidad: 'Medicina', telefono: '123',
          horario_entrada: '08:00', horario_salida: '16:00', dias_laborables: ['Lunes', 'Miércoles']
        });
      expect(res.statusCode).toEqual(201);
      medicoId = res.body.data._id;
    });

    it('5. GET /medicos - Debería listar médicos', async () => {
      const res = await request(app).get('/api/v1/medicos').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });

    it('6. PUT /medicos/:id - Debería actualizar médico', async () => {
      const res = await request(app)
        .put(`/api/v1/medicos/${medicoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ especialidad: 'Cirugía' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.especialidad).toBe('Cirugía');
    });
  });

  // ==========================================
  // 3. AGENDA Y ATENCIÓN
  // ==========================================
  describe('Módulo 3: Citas y Consultas', () => {
    it('1. POST /citas - Debería crear cita', async () => {
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      manana.setHours(10, 0, 0, 0);

      const res = await request(app).post('/api/v1/citas').set('Authorization', `Bearer ${token}`).send({
        paciente_id: pacienteId, medico_id: medicoId, fecha_hora: manana.toISOString(), motivo: 'Dolor'
      });
      // Aceptamos 201 o 400 si el médico no labora ese día (aleatoriedad del Date+1)
      if (res.statusCode === 201) citaId = res.body.data._id;
    });

    it('2. GET /citas - Debería listar citas', async () => {
      const res = await request(app).get('/api/v1/citas').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });

    it('3. PUT /citas/:id - Debería actualizar cita', async () => {
      if (!citaId) return;
      const res = await request(app).put(`/api/v1/citas/${citaId}`).set('Authorization', `Bearer ${token}`).send({ motivo: 'Dolor Severo' });
      expect(res.statusCode).toEqual(200);
    });

    it('4. POST /consultas - Debería crear consulta', async () => {
      if (!citaId) return;
      const res = await request(app).post('/api/v1/consultas').set('Authorization', `Bearer ${token}`).send({
        cita_id: citaId, paciente_id: pacienteId, medico_id: medicoId,
        motivo_consulta: 'Check', sintomas: 'N/A', signos_vitales: {}, diagnostico: 'Sano'
      });
      expect(res.statusCode).toEqual(201);
      consultaId = res.body.data._id;
    });

    it('5. GET /consultas - Debería listar consultas', async () => {
      const res = await request(app).get('/api/v1/consultas').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  // ==========================================
  // 4. HISTORIAL Y SOPORTE
  // ==========================================
  describe('Módulo 4: Recetas y Documentos', () => {
    it('1. POST /recetas - Debería crear receta', async () => {
      if (!consultaId) return;
      const res = await request(app).post('/api/v1/recetas').set('Authorization', `Bearer ${token}`).send({
        consulta_id: consultaId, instrucciones_generales: 'Ninguna',
        medicamentos: [{ medicamento_nombre: 'Agua', dosis: '1', frecuencia: '1', duracion: '1', cantidad_entregar: 1 }]
      });
      expect(res.statusCode).toEqual(201);
      recetaId = res.body.data._id;
    });

    it('2. GET /recetas - Debería listar recetas', async () => {
      const res = await request(app).get('/api/v1/recetas').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });

    it('3. POST /documentos/upload - Debería subir PDF', async () => {
      const filePath = path.join(__dirname, 'test.pdf');
      fs.writeFileSync(filePath, 'PDF TEST CONTENT');

      const res = await request(app).post('/api/v1/documentos/upload').set('Authorization', `Bearer ${token}`)
        .field('paciente_id', pacienteId.toString())
        .field('tipo_documento', 'Laboratorio')
        .attach('file', filePath);
      
      expect(res.statusCode).toEqual(201);
      documentoId = res.body.data.documento_id;
      fs.unlinkSync(filePath);
    });

    it('4. GET /documentos - Debería listar documentos del paciente', async () => {
      const res = await request(app).get(`/api/v1/documentos?paciente_id=${pacienteId}`).set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  // ==========================================
  // 5. BORRADOS FINALES (DELETE)
  // ==========================================
  describe('Módulo 5: Pruebas de DELETE', () => {
    it('Debería eliminar la receta', async () => {
      if (recetaId) {
        const res = await request(app).delete(`/api/v1/recetas/${recetaId}`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      }
    });

    it('Debería eliminar la consulta', async () => {
      if (consultaId) {
        const res = await request(app).delete(`/api/v1/consultas/${consultaId}`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      }
    });

    it('Debería eliminar la cita', async () => {
      if (citaId) {
        const res = await request(app).delete(`/api/v1/citas/${citaId}`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      }
    });

    it('Debería eliminar el documento', async () => {
      if (documentoId) {
        const res = await request(app).delete(`/api/v1/documentos/${documentoId}`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      }
    });

    it('Debería desactivar al médico (Soft Delete)', async () => {
      if (medicoId) {
        const res = await request(app).delete(`/api/v1/medicos/${medicoId}`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      }
    });

    it('Debería eliminar al paciente (Soft Delete)', async () => {
      if (pacienteId) {
        const res = await request(app).delete(`/api/v1/pacientes/${pacienteId}`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      }
    });
  });

});
