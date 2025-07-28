import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Galaxy from "./components/Galaxy";
import LightRays from "./components/Galaxy";
// import Galaxy from "./components/Galaxy";

const api = axios.create({
  baseURL: 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' }
});

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [img, setImg] = useState(null);
  const [editId, setEditId] = useState(null);

  // ✅ Load tasks
  useEffect(() => {
    api.get('/tasks').then(res => setTasks(res.data));
  }, []);

  // ✅ Add or Edit Task
  const saveTask = async () => {
    if (!name && !img) return alert("Enter name or select image");

    const formData = new FormData();
    formData.append("name", name);
    if (img) formData.append("img", img);

    if (editId) {
      const res = await api.put(`/tasks/${editId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setTasks(tasks.map(t => (Number(t.id) === Number(editId) ? res.data : t)));
    } else {
      const res = await api.post('/tasks', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setTasks([...tasks, res.data]);
    }
    resetForm();
  };

  // ✅ Start Edit
  const startEdit = (task) => {
    setEditId(task.id);
    setName(task.name);
    setImg(null);
  };

  // ✅ Delete Task
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    setTasks(tasks.filter(t => Number(t.id) !== Number(id)));
    if (editId === id) resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setImg(null);
  };

  return (
    <div className="todo-main-container" style={{ position: "relative", minHeight: "100vh" }}>

<div style={{ width: '100%',height: "100vh", position: 'absolute' }}>
  <LightRays
    raysOrigin="top-center"
    raysColor="#00ffff"
    raysSpeed={1.9}
    lightSpread={1.0}
    rayLength={1.8}
    followMouse={true}
    mouseInfluence={0.4}
    noiseAmount={0.1}
    distortion={0.02}
    className="custom-rays"
  />
</div>
      <div className="app-container" style={{ position: "relative", zIndex: 1 }}>
        <h1 className="todo-title">Task Master</h1>
  
        <div className="form-container">
          <input
            type="text"
            placeholder="Enter task name..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="task-input"
          />
          <label className="file-upload-label">
            Attach Image
            <input
              type="file"
              onChange={e => setImg(e.target.files[0])}
              className="file-upload-input"
            />
          </label>
          <button onClick={saveTask} className={`btn ${editId ? 'btn-update' : 'btn-primary'}`}>
            {editId ? 'Update Task' : 'Add Task'}
          </button>
          {editId && (
            <button onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
  
        <div className="tasks-container">
          {tasks.length === 0 ? (
            <div className="empty-state">No tasks yet. Add one above!</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="task-item">
                {task.img && (
                  <img
                    src={`http://localhost:4000${task.img}`}
                    alt={task.name}
                    className="task-image"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <span className={`task-name ${task.img ? 'has-image' : 'no-image'}`}>
                  {task.name}
                </span>
                <button onClick={() => startEdit(task)} className="btn-edit">Edit</button>
                <button onClick={() => deleteTask(task.id)} className="btn-delete">Delete</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
  
}
