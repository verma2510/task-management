import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SyllabusView = ({ syllabus: propSyllabus }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [fetchedSyllabus, setFetchedSyllabus] = useState(null);
    const [loading, setLoading] = useState(false);

    // Determine the syllabus to display: Prop > Navigation State > Fetched
    const syllabusToDisplay = propSyllabus || location.state?.syllabus || fetchedSyllabus;

    useEffect(() => {
        // If we don't have a syllabus from Props or Navigation State, and we are a Student, fetch it.
        if (!propSyllabus && !location.state?.syllabus && user?.role === 'student') {
            const fetchStudentSyllabus = async () => {
                setLoading(true);
                try {
                    // Assuming we have an endpoint that gets the logged-in student's syllabus 
                    // or we use the ID from the user object if the API requires ID.
                    // The API created earlier was router.get('/:studentId'), allowing access to own ID.
                    const res = await axios.get(`/api/syllabus/${user.userId || user._id}`);
                    setFetchedSyllabus(res.data);
                } catch (err) {
                    console.error("Failed to fetch syllabus", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchStudentSyllabus();
        }
    }, [propSyllabus, location.state, user]);

    if (loading) {
        return <div className="p-4 text-center">Loading syllabus...</div>;
    }

    if (!syllabusToDisplay || !syllabusToDisplay.subjects || syllabusToDisplay.subjects.length === 0) {
        return (
            <div className="glass-panel p-4 text-center text-muted fade-in">
                <button
                    className="btn btn-secondary mb-3"
                    onClick={() => navigate(-1)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <span>&larr;</span> Back
                </button>
                <p className="m-0">No syllabus content available to display.</p>
            </div>
        );
    }

    return (
        <div className="syllabus-view fade-in">
            <button
                className="btn btn-secondary mb-4"
                onClick={() => navigate(-1)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <span>&larr;</span> Back
            </button>

            <div className="glass-panel p-4 mb-4" style={{ background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(30, 41, 59, 0.2) 100%)' }}>
                <h3 className="mb-2">Syllabus Preview</h3>
                <p className="text-muted mb-0">Overview of subjects and lessons.</p>
            </div>

            {syllabusToDisplay.subjects.map((subject, index) => (
                <div key={index} className="glass-panel p-4 mb-4" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <h3 className="mb-3" style={{ color: 'var(--text-main)', fontSize: '1.4rem' }}>{subject.name}</h3>
                    <div className="pl-4">
                        {subject.lessons.length > 0 ? (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {subject.lessons.map((lesson, lIndex) => (
                                    <div key={lIndex} className="p-2" style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '6px'
                                    }}>
                                        <span className="text-muted" style={{ fontWeight: 'bold', minWidth: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '2px 0' }}>
                                            #{lesson.number}
                                        </span>
                                        <span style={{ fontSize: '1.05rem' }}>{lesson.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted font-italic">No lessons scheduled.</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SyllabusView;
