import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TaskDetails from './pages/TaskDetails';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />; // Redirect if wrong role
    return children;
};

// Layout wrapper to include Navbar
const Layout = ({ children }) => (
    <>
        <Navbar />
        <div className="container">
            {children}
        </div>
    </>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout>
                                <RoleBasedRedirect />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <ProtectedRoute role="admin">
                            <Layout>
                                <AdminDashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/student" element={
                        <ProtectedRoute role="student">
                            <Layout>
                                <StudentDashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/task/:id" element={
                        <ProtectedRoute>
                            <Layout>
                                <TaskDetails />
                            </Layout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

const RoleBasedRedirect = () => {
    const { user } = useAuth();
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/student" />;
};

export default App;
