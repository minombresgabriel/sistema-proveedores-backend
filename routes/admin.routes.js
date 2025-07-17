// admin.routes.js
const express = require("express");
const router = express.Router();
const {
  obtenerAsistencias,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerAsistenciasPorFecha,
  listarUsuarios,
  exportarAsistenciaExcel,
  eliminarAsistencia,
} = require("../controllers/admin.controller");

const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

// Obtener TODAS las asistencias
router.get("/asistencias", verifyToken, isAdmin, obtenerAsistencias);

// Obtener asistencias por fecha (requiere query ?fecha=yyyy-mm-dd)
router.get(
  "/asistencias/por-fecha",
  verifyToken,
  isAdmin,
  obtenerAsistenciasPorFecha
);

// Usuarios
router.get("/usuarios", verifyToken, isAdmin, listarUsuarios);
router.post("/crear-usuario", verifyToken, isAdmin, crearUsuario);
router.put("/actualizar-usuario/:id", verifyToken, isAdmin, actualizarUsuario);
router.delete("/eliminar-usuario/:id", verifyToken, isAdmin, eliminarUsuario);
router.delete(
  "/eliminar-asistencia/:id",
  verifyToken,
  isAdmin,
  eliminarAsistencia
);

// Exportar a Excel
router.get("/exportar-excel", verifyToken, isAdmin, exportarAsistenciaExcel);

module.exports = router;
