import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SyllabusManager from '../components/SyllabusManager';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create Task Form State
    const [formData, setFormData] = useState({ title: '', description: '', deadline: '', assignedStudents: '' });
    // Note: For simplicity, assignedStudents is textual or we fetch users.
    // To make it robust, we should fetch students to select from.
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchTasks();
        fetchStudents(); // Need a route for this? Admin only.
    }, []);

    // Placeholder: Need a route to get all students. 
    // We didn't build it yet! 
    // I'll add a quick fetch in the component if the route existed, or just input IDs/Emails if not.
    // Let's assume we create a route or hack it. 
    // Actually, let's use a text input for Email for now to assign single student, 
    // OR just fetch users if I add the route. 
    // Adding route is better.

    const fetchTasks = async () => {
        try {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/users/students');
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        // Look up student by email or ID. 
        // Realistically, we need a list.
        // For MVP, Admin enters Student ID manually? No that's bad UX.
        // I will assume I can create the route.

        try {
            await axios.post('/api/tasks', {
                ...formData,
                deadline: new Date(formData.deadline), // Convert to proper date object (handling timezone)
                assignedStudents: [formData.assignedStudents]
            });
            setShowCreate(false);
            fetchTasks();
        } catch (err) {
            alert('Failed to create task');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await axios.delete(`/api/tasks/${id}`);
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete task');
        }
    };

    return (
        <div>
            <div className="flex-between mb-4">
                <h1>Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-light'}`}
                        onClick={() => setActiveTab('tasks')}
                        style={{ opacity: activeTab === 'tasks' ? 1 : 0.7 }}
                    >
                        Tasks
                    </button>
                    <button
                        className={`btn ${activeTab === 'syllabus' ? 'btn-primary' : 'btn-light'}`}
                        onClick={() => setActiveTab('syllabus')}
                        style={{ opacity: activeTab === 'syllabus' ? 1 : 0.7 }}
                    >
                        Syllabus
                    </button>
                </div>
            </div>

            {activeTab === 'tasks' ? (
                <>
                    <div className="flex-end mb-4">
                        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                            {showCreate ? 'Cancel' : 'Create New Task'}
                        </button>
                    </div>

                    {showCreate && (
                        <div className="glass-panel mb-4" style={{ padding: '2rem' }}>
                            <h3>Create Task</h3>
                            <form onSubmit={handleCreate}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Deadline</label>
                                    <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Assign To (Student)</label>
                                    <select
                                        className="form-control"
                                        value={formData.assignedStudents}
                                        onChange={e => setFormData({ ...formData, assignedStudents: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a student</option>
                                        {students.map(student => (
                                            <option key={student._id} value={student._id}>
                                                {student.username} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button className="btn btn-primary">Publish Task</button>
                            </form>
                        </div>
                    )}

                    <div className="grid-2">
                        {tasks.map(task => (
                            <div key={task._id} className="card">
                                <h3>{task.title}</h3>
                                <p className="text-muted">{task.description}</p>
                                <div className="flex-between mt-4">
                                    <small>Deadline: {new Date(task.deadline).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link to={`/task/${task._id}`} className="btn btn-primary">View</Link>
                                        <button onClick={() => handleDelete(task._id)} className="btn btn-danger">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <SyllabusManager />
            )}
        </div>
    );
};

export default AdminDashboard;
