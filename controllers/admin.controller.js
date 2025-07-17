const User = require("../models/User");
const Asistencia = require("../models/Asistencia");
const bcrypt = require("bcrypt");
const ExcelJS = require("exceljs");
const Registro = require("../models/registro.model");
const { DateTime } = require("luxon");

// Ver todos los registros de asistencia

const obtenerAsistenciasPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query; // formato esperado: 'YYYY-MM-DD'

    // Definir zona horaria de tu país (ej. 'America/Caracas', 'America/Bogota', etc.)
    const zonaHoraria = "America/Caracas";

    // Crear rango con hora local
    const fechaInicio = DateTime.fromISO(fecha, { zone: zonaHoraria })
      .startOf("day")
      .toJSDate();
    const fechaFin = DateTime.fromISO(fecha, { zone: zonaHoraria })
      .endOf("day")
      .toJSDate();

    const asistencias = await Asistencia.find({
      fecha: { $gte: fechaInicio, $lte: fechaFin },
    }).populate("usuario", "nombre cedula");

    res.json(asistencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
};

const obtenerAsistencias = async (req, res) => {
  try {
    const registros = await Asistencia.find().populate(
      "usuario",
      "nombre cedula"
    );
    res.json(registros);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
};

// Crear usuario o admin
const crearUsuario = async (req, res) => {
  try {
    const { nombre, cedula, pin, rol } = req.body;

    const existe = await User.findOne({ cedula });
    if (existe) {
      return res.status(400).json({ message: "La cédula ya está registrada" });
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    const nuevoUsuario = new User({
      nombre,
      cedula,
      pin: hashedPin,
      rol: rol || "user",
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, pin } = req.body;

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (pin) updateData.pin = await bcrypt.hash(pin, 10); // encriptar nuevo PIN

    const usuario = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario actualizado", usuario });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByIdAndDelete(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({}, "-pin"); // excluye el campo pin
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const exportarAsistenciaExcel = async (req, res) => {
  try {
    const registros = await Registro.find().populate(
      "usuario",
      "nombre cedula"
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Asistencias");

    // Encabezados
    worksheet.columns = [
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "Cédula", key: "cedula", width: 20 },
      { header: "Fecha", key: "fecha", width: 20 },
      { header: "Hora", key: "hora", width: 20 },
    ];

    // Agregar filas
    registros.forEach((registro) => {
      worksheet.addRow({
        nombre: registro.usuario?.nombre || "N/A",
        cedula: registro.usuario?.cedula || "N/A",
        fecha: new Date(registro.fecha).toLocaleDateString(),
        hora: new Date(registro.fecha).toLocaleTimeString(),
      });
    });

    // Respuesta como archivo descargable
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=asistencias.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    res.status(500).json({ message: "Error al generar el archivo" });
  }
};

const eliminarAsistencia = async (req, res) => {
  const { id } = req.params;
  try {
    const asistencia = await Asistencia.findByIdAndDelete(id);
    if (!asistencia) {
      return res.status(404).json({ message: "Asistencia no encontrada" });
    }
    res.json({ message: "Asistencia eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar asistencia:", error);
    res.status(500).json({ message: "Error al eliminar la asistencia" });
  }
};

module.exports = {
  obtenerAsistencias,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerAsistenciasPorFecha,
  listarUsuarios,
  exportarAsistenciaExcel,
  eliminarAsistencia,
};
