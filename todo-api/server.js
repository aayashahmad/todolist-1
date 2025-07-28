const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// ✅ Allow CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173', // adjust if using different port
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// ✅ Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ In-memory tasks
let tasks = [];


app.post('/tasks', upload.single('img'), (req, res) => {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file); // ✅ Check if file is received
  
    const newTask = {
      id: Date.now(),
      name: req.body.name,
      img: req.file ? `/uploads/${req.file.filename}` : ""
    };
    tasks.push(newTask);
    res.json(newTask);
  });
  
// ✅ GET all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// ✅ POST - Add Task
app.post('/tasks', upload.single('img'), (req, res) => {
  const newTask = {
    id: Date.now(),
    name: req.body.name,
    img: req.file ? `/uploads/${req.file.filename}` : ""
  };
  tasks.push(newTask);
  res.json(newTask);
});

// ✅ PUT - Edit Task
app.put('/tasks/:id', upload.single('img'), (req, res) => {
  const id = Number(req.params.id);
  let updatedTask = null;

  tasks = tasks.map(task => {
    if (task.id === id) {
      if (req.file && task.img) {
        const oldPath = path.join(__dirname, task.img.startsWith('/') ? task.img.slice(1) : task.img);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updatedTask = {
        ...task,
        name: req.body.name || task.name,
        img: req.file ? `/uploads/${req.file.filename}` : task.img
      };
      return updatedTask;
    }
    return task;
  });

  if (!updatedTask) return res.status(404).json({ error: "Task not found" });
  res.json(updatedTask);
});

// ✅ DELETE - Remove Task
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskToDelete = tasks.find(t => t.id === id);
  if (!taskToDelete) return res.status(404).json({ error: "Task not found" });

  if (taskToDelete.img) {
    const imgPath = path.join(__dirname, taskToDelete.img.startsWith('/') ? taskToDelete.img.slice(1) : taskToDelete.img);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  tasks = tasks.filter(t => t.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
