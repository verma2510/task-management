import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get('/api/tasks');
                setTasks(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    return (
        <div>
            <h1 className="mb-4">My Tasks</h1>
            {tasks.length === 0 && !loading ? (
                <div className="glass-panel p-4 text-center">No tasks assigned yet. Good job!</div>
            ) : (
                <div className="grid-2">
                    {tasks.map(task => (
                        <div key={task._id} className="card">
                            <h3>{task.title}</h3>
                            <p className="text-muted">{task.description}</p>
                            <div className="flex-between mt-4">
                                <span className={new Date(task.deadline) < new Date() ? 'text-danger' : 'text-success'}>
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                </span>
                                <Link to={`/task/${task._id}`} className="btn btn-primary">View & Submit</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
