import React, { useEffect, useState } from 'react';
import { courseAPI } from '../services/api';
import './Dashboard.css';
import './CoursesManage.css';

const CoursesManage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ course_type: '', duration: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    courseAPI.getAll().then((r) => setCourses(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await courseAPI.update(editId, form);
        setMsg('Course updated.');
      } else {
        await courseAPI.create(form);
        setMsg('Course added.');
      }
      setForm({ course_type: '', duration: '' });
      setEditId(null);
      load();
    } catch {
      setMsg('Error saving course.');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const startEdit = (c) => {
    setEditId(c.course_id);
    setForm({ course_type: c.course_type, duration: c.duration });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await courseAPI.delete(id);
    load();
  };

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Manage Courses</h1>
      <p className="page-subtitle">Add or edit the available courses for student selection</p>

      <div className="courses-layout">
        <div className="card course-form-card">
          <h3 className="section-head">{editId ? 'Edit Course' : 'Add New Course'}</h3>
          {msg && <div className="alert alert-success">{msg}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Course Name</label>
              <input value={form.course_type} onChange={(e) => setForm({ ...form, course_type: e.target.value })} required placeholder="e.g. B.Tech Computer Science" />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required placeholder="e.g. 4 Years" />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add Course'}</button>
              {editId && (
                <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setForm({ course_type: '', duration: '' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="section-head">All Courses</h3>
          {loading ? <div className="spinner"></div> : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course Name</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.course_id}>
                    <td>{c.course_id}</td>
                    <td>{c.course_type}</td>
                    <td>{c.duration}</td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary btn-sm" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn-danger btn-sm" onClick={() => remove(c.course_id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesManage;
