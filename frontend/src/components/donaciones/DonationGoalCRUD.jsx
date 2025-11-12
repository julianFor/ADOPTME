// src/components/donaciones/DonationGoalCRUD.jsx
import { useEffect, useState } from "react";

// Base de la API desde el archivo .env (VITE_API_URL=http://<IP>:3000/api)
const API = import.meta.env.VITE_API_URL;

function DonationGoalCRUD() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ monto: "", descripcion: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API}/metas`, {
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"),
        },
      });

      if (!res.ok) throw new Error("No se pudieron obtener las metas");

      const data = await res.json();
      if (Array.isArray(data)) {
        setGoals(data);
      } else {
        console.warn("⚠️ Respuesta inesperada:", data);
        setGoals([]);
      }
    } catch (err) {
      console.error("❌ Error al obtener metas:", err.message);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/metas/${editingId}` : `${API}/metas`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar");

      fetchGoals();
      setForm({ monto: "", descripcion: "" });
      setEditingId(null);
    } catch (err) {
      console.error("❌ Error al guardar meta:", err.message);
    }
  };

  const handleEdit = (goal) => {
    setForm({ monto: goal.monto, descripcion: goal.descripcion });
    setEditingId(goal._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta meta?")) return;

    try {
      const res = await fetch(`${API}/metas/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token"),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al eliminar");

      fetchGoals();
    } catch (err) {
      console.error("❌ Error al eliminar meta:", err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">
        🎯 Gestión de Metas de Donación
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-50 p-4 rounded-md shadow-inner mb-6"
      >
        <input
          type="number"
          name="monto"
          placeholder="Monto objetivo (USD)"
          value={form.monto}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-purple-400"
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-md h-24 resize-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          type="submit"
          className="bg-purple-600 text-white font-semibold py-2 rounded hover:bg-purple-700 transition"
        >
          {editingId ? "Actualizar Meta" : "Crear Meta"}
        </button>
      </form>

      {goals.length === 0 ? (
        <p className="text-gray-500 text-center">No hay metas registradas aún.</p>
      ) : (
        <ul className="space-y-4">
          {goals.map((goal) => (
            <li
              key={goal._id}
              className="flex justify-between items-center p-4 bg-gray-100 rounded-md shadow-sm"
            >
              <div>
                <strong className="text-purple-700">{goal.monto} USD</strong>{" "}
                <span className="text-gray-600">– {goal.descripcion}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(goal)}
                  className="px-3 py-1 text-sm bg-purple-200 text-purple-800 rounded hover:bg-purple-300 transition"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(goal._id)}
                  className="px-3 py-1 text-sm bg-rose-200 text-rose-800 rounded hover:bg-rose-300 transition"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DonationGoalCRUD;
