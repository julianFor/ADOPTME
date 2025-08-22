// routes/contactRoutes.js
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { nombre, celular, email, mensaje } = req.body;

  try {
    // Configurar el transporte de nodemailer
    let transporter = nodemailer.createTransport({
      service: "gmail", // puedes usar Outlook, Yahoo, etc.
      auth: {
        user: process.env.EMAIL_USER, // tu correo
        pass: process.env.EMAIL_PASS, // tu contraseña o App Password
      },
    });

    // Definir contenido del correo
    await transporter.sendMail({
      from: `"AdoptMe - Contacto" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO, // a dónde quieres recibir los correos
      subject: "Nuevo mensaje de contacto",
      text: `Has recibido un mensaje de contacto:
      
      Nombre: ${nombre}
      Celular: ${celular}
      Email: ${email}
      Mensaje: ${mensaje}
      `,
    });

    res.status(200).json({ message: "✅ Mensaje enviado correctamente" });
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    res.status(500).json({ message: "Error enviando correo" });
  }
});

export default router;
