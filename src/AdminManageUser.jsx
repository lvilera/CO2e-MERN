import React, { useState, useEffect } from 'react';
import DynamicHeader from './components/DynamicHeader';
import { API_BASE_URL } from './config';
import axios from 'axios';

const AdminManageUser = () => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', city: '', country: '', state: '' });
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editUserId, setEditUserId] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/users`);
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            if (editUserId) {
                await axios.put(`${API_BASE_URL}/api/users/${editUserId}`, form);
                setMessage('User updated successfully!');
                setEditUserId(null);
            } else {
                await axios.post(`${API_BASE_URL}/api/users`, form);
                setMessage('User added successfully!');
            }
            setForm({ firstName: '', lastName: '', email: '', password: '', city: '', country: '', state: '' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/users/${id}`);
            setMessage('User deleted successfully!');
            fetchUsers();
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    const handleEdit = (user) => {
        setMessage("");
        setError("");
        if (user._id === editUserId) {
            setEditUserId(null);
            setForm({ firstName: '', lastName: '', email: '', password: '', city: '', country: '', state: '' });
        } else {
            setEditUserId(user._id);
            setForm({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: "",
                city: user.city || "",
                country: user.country || "",
                state: user.state || ""
            })
        }
    };

    return (
        <div>
            <DynamicHeader />
            <div id="TTw" style={{ maxWidth: 500, margin: '10rem auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
                <h2>{editUserId ? "Edit" : "Add"} User</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 10 }}>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: 8, marginBottom: 8 }}
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: 8, marginBottom: 8 }}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: 8, marginBottom: 8 }}
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            style={{ width: '100%', padding: 8, marginBottom: 8 }}
                        />
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={form.country}
                            onChange={handleChange}
                            style={{ width: '100%', padding: 8, marginBottom: 8 }}
                        />
                        <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={form.state}
                            onChange={handleChange}
                            style={{ width: '100%', padding: 8, marginBottom: 8 }}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required={editUserId ? false : true}
                            style={{ width: '100%', padding: 8, marginBottom: 8 }}
                        />
                    </div>
                    <button id="insb" type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>
                        {loading ? (editUserId ? "Updating..." : 'Adding...') : (editUserId ? "Update User" : 'Add User')}
                    </button>
                </form>
                {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
                {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
            </div>
            <div style={{ maxWidth: 700, margin: '2rem auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
                <h3>Users List</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Name</th>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Email</th>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Package</th>
                            <th style={{ padding: 8, border: '1px solid #ddd' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((inst) => (
                            <tr key={inst._id}>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>{inst.firstName} {inst.lastName}</td>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>{inst.email}</td>
                                <td style={{ padding: 8, border: '1px solid #ddd' }}>{inst.package ? inst.package : "N/A"}</td>
                                <td style={{ padding: 8, border: '1px solid #ddd', display: "flex", gap: "8px" }}>
                                    <button onClick={() => handleEdit(inst)} style={{ background: editUserId === inst._id ? "#6c757d" : '#ffc107', color: editUserId === inst._id ? "#fff" : '#000', border: 'none', borderRadius: 4, padding: '6px 18px' }}>{editUserId === inst._id ? "Cancel" : "Edit"}</button>
                                    <button onClick={() => handleDelete(inst._id)} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminManageUser;