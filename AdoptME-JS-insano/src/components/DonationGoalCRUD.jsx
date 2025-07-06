import { useEffect, useState } from "react";
import "../styles/DonationGoalCRUD.css";

function DonationGoalCRUD() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ monto: "", descripcion: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchGoals = () => {
    fetch("http://localhost:3000/api/donation-goal")
      .then((res) => res.json())
      .then((data) => {
  if (Array.isArray(data)) {
    setGoals(data);
  } else if (Array.isArray(data.goals)) {
    setGoals(data.goals);
  } else {
    console.error("❌ Formato inesperado en la respuesta:", data);
    setGoals([]);
  }
})
      .catch((err) => console.error("❌ Error al obtener metas:", err));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:3000/api/donation-goal/${editingId}`
      : "http://localhost:3000/api/donation-goal";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        fetchGoals();
        setForm({ monto: "", descripcion: "" });
        setEditingId(null);
      })
      .catch((err) => console.error("❌ Error al guardar meta:", err));
  };

  const handleEdit = (goal) => {
    setForm({ monto: goal.monto, descripcion: goal.descripcion });
    setEditingId(goal._id);
  };

  const handleDelete = (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta meta?")) return;

    fetch(`http://localhost:3000/api/donation-goal/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => fetchGoals())
      .catch((err) => console.error("❌ Error al eliminar meta:", err));
  };

  return (
    <div className="donation-goal-crud">
      <h2>🎯 Gestión de Metas de Donación</h2>

      <form onSubmit={handleSubmit} className="goal-form">
        <input
          type="number"
          name="monto"
          placeholder="Monto objetivo (USD)"
          value={form.monto}
          onChange={handleChange}
          required
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        <button type="submit">
          {editingId ? "Actualizar Meta" : "Crear Meta"}
        </button>
      </form>

      <ul className="goal-list">
        {goals.map((goal) => (
          <li key={goal._id}>
            <strong>{goal.monto} USD</strong> - {goal.descripcion}
            <div className="goal-actions">
              <button onClick={() => handleEdit(goal)}>✏️ Editar</button>
              <button onClick={() => handleDelete(goal._id)}>🗑️ Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DonationGoalCRUD;
