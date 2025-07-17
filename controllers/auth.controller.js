const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Asistencia = require("../models/Asistencia"); // importar modelo

const register = async (req, res) => {
  try {
    const { nombre, cedula, pin, rol } = req.body;

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ cedula });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar el PIN
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    const newUser = new User({
      nombre,
      cedula,
      pin: hashedPin,
      rol: rol || "user", // Por defecto usuario normal
    });

    await newUser.save();

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

const login = async (req, res) => {
  try {
    const { cedula, pin } = req.body;

    const user = await User.findOne({ cedula });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) return res.status(401).json({ message: "PIN incorrecto" });

    // Solo registrar asistencia si es usuario normal
    if (user.rol === "user") {
      // Verificar si ya tiene asistencia hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // inicio del día

      const yaRegistrado = await Asistencia.findOne({
        usuario: user._id,
        fecha: { $gte: hoy },
      });

      if (!yaRegistrado) {
        await Asistencia.create({ usuario: user._id });
      }
    }

    const token = jwt.sign(
      { id: user._id, cedula: user.cedula, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      rol: user.rol,
      nombre: user.nombre,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el login" });
  }
};

module.exports = {
  register,
  login,
};
