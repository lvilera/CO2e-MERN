import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import Header from './Home/Header';
import Footer2 from './Home/Footer2';
import { useTranslation } from 'react-i18next';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Slots = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [regions, setRegions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availability, setAvailability] = useState({});
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [acceptMessage, setAcceptMessage] = useState('');
  const [regionInput, setRegionInput] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDuration, setSubjectDuration] = useState('');
  const [message, setMessage] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const instructorId = localStorage.getItem('userId');
  const [assignedBookings, setAssignedBookings] = useState([]);


  // Get instructor email from localStorage (set on login)
  const email = localStorage.getItem('instructorEmail');

  const fetchPendingBookings = useCallback(async () => {
    if (!instructorId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings?notifiedInstructorId=${instructorId}&status=on-hold`);
      setPendingBookings(res.data || []);
    } catch {
      setPendingBookings([]);
    }
  }, [instructorId]);

  useEffect(() => {
    const isInstructor = localStorage.getItem('isInstructor') === 'true';
    if (!isInstructor) {
      navigate('/login');
    }
    // Try to get email from login form if not in localStorage
    if (!email) {
      setMessage('No instructor email found. Please log in again.');
      return;
    }
    fetchProfile();
    fetchBookings();
    fetchPendingBookings();
    const fetchAssignedBookings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/bookings/assigned/${instructorId}`);
        setAssignedBookings(res.data || []);
      } catch {
        setAssignedBookings([]);
      }
    };
    fetchAssignedBookings();
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [navigate, email, fetchPendingBookings, instructorId, i18n]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/instructors/profile/${email}`);
      setProfile(res.data);
      setRegions(res.data.regions || []);
      setSubjects(res.data.subjects || []);
      setAvailability(res.data.availability || {});
      setCity(res.data.city || '');
      setLocation(res.data.location || '');
    } catch (err) {
      setMessage('Failed to load profile.');
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/instructors/bookings/${email}`);
      setBookings(res.data);
    } catch (err) {
      setBookings([]);
    }
  };

  const handleAddRegion = async () => {
    if (!regionInput.trim()) return;
    const newRegions = [...regions, regionInput.trim()];
    await updateProfile({ regions: newRegions, subjects });
    setRegionInput('');
  };

  const handleAddSubject = async () => {
    if (!subjectName.trim() || !subjectDuration) return;
    const newSubjects = [...subjects, { name: subjectName.trim(), durationWeeks: Number(subjectDuration) }];
    await updateProfile({ regions, subjects: newSubjects });
    setSubjectName('');
    setSubjectDuration('');
  };

  const handleDeleteSubject = async (idx) => {
    const newSubjects = subjects.filter((_, i) => i !== idx);
    await updateProfile({ regions, subjects: newSubjects });
  };

  const updateProfile = async (data) => {
    try {
      await axios.put(`${API_BASE_URL}/api/instructors/profile/${email}`, data);
      fetchProfile();
      setMessage('Profile updated!');
    } catch {
      setMessage('Failed to update profile.');
    }
  };

  const handleAvailabilityChange = (day, idx, field, value) => {
    setAvailability((prev) => {
      const daySlots = prev[day] ? [...prev[day]] : [{}];
      daySlots[idx] = { ...daySlots[idx], [field]: value };
      return { ...prev, [day]: daySlots };
    });
  };

  const handleAddSlot = (day) => {
    setAvailability((prev) => {
      const daySlots = prev[day] ? [...prev[day], { start: '', end: '' }] : [{ start: '', end: '' }];
      return { ...prev, [day]: daySlots };
    });
  };

  const handleSaveAvailability = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/instructors/availability/${email}`, { availability });
      setMessage('Availability updated!');
      fetchProfile();
    } catch {
      setMessage('Failed to update availability.');
    }
  };

  const handleEditSlot = async (day, idx, start, end) => {
    // Debug log
    console.log('Edit slot params:', { email, day, idx, start, end });
    if (!email || !day || idx === undefined || start === undefined || end === undefined) {
      setMessage('Invalid slot parameters for editing.');
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/api/instructors/availability/${email}/${day}/${idx}`, { start, end });
      setMessage('Slot updated!');
      fetchProfile();
    } catch (err) {
      setMessage('Failed to update slot.');
      console.error('Edit slot error:', err);
    }
  };

  const handleDeleteSlot = async (day, idx) => {
    // Debug log
    console.log('Delete slot params:', { email, day, idx });
    if (!email || !day || idx === undefined) {
      setMessage('Invalid slot parameters for deletion.');
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/instructors/availability/${email}/${day}/${idx}`);
      setMessage('Slot deleted!');
      fetchProfile();
    } catch (err) {
      setMessage('Failed to delete slot.');
      console.error('Delete slot error:', err);
    }
  };

  const handleSaveCityLocation = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/instructors/profile/${email}`, { city, location });
      setMessage('City/Location updated!');
      fetchProfile();
    } catch {
      setMessage('Failed to update city/location.');
    }
  };

  const handleDeleteBooking = async (idx) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/instructors/booking/${email}/${idx}`);
      setMessage('Booking deleted!');
      fetchBookings();
    } catch {
      setMessage('Failed to delete booking.');
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    if (!instructorId) {
      setAcceptMessage('Instructor ID not found.');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/bookings/${bookingId}/accept`, { instructorId });
      setAcceptMessage(res.data.message || 'Booking accepted!');
      // Remove accepted booking from pending list
      setPendingBookings(prev => prev.filter(b => b._id !== bookingId));
      fetchBookings(); // Refresh confirmed bookings
    } catch (err) {
      setAcceptMessage(err.response?.data?.message || 'Failed to accept booking.');
    }
  };

  // Calculate free slots by subtracting bookings from availability
  const getFreeSlots = (day) => {
    const slots = (availability[day] || []).map(slot => ({ ...slot }));
    const todayBookings = bookings.filter(b => new Date(b.date).toLocaleDateString('en-US', { weekday: 'long' }) === day);
    todayBookings.forEach(bk => {
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (bk.start >= slot.start && bk.end <= slot.end) {
          // Split slot into before and after booking
          const before = bk.start > slot.start ? { start: slot.start, end: bk.start } : null;
          const after = bk.end < slot.end ? { start: bk.end, end: slot.end } : null;
          slots.splice(i, 1, ...(before && after ? [before, after] : before ? [before] : after ? [after] : []));
          break;
        }
      }
    });
    return slots;
  };

  return (
    <>
      <Header />
      <div style={{ 
        minHeight: '100vh', 
        background: '#91bf55',
        padding: '120px 20px 60px 20px'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}>
          
          {/* Header Section */}
          <div style={{

            padding: '40px 40px 30px 40px',
            color: 'white',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 10px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {t('slots.instructor_profile')}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              opacity: 0.9,
              margin: 0
            }}>
              Manage your availability, bookings, and profile information
            </p>
          </div>

          <div style={{ padding: '40px' }}>
            {/* Profile Section */}
            {profile && (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: '30px',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  color: '#2c3e50',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    background: '#91bf55',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '1rem'
                  }}>
                    👤
                  </span>
                  Profile Information
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '25px'
                }}>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '5px' }}>
                      {t('slots.full_name')}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50' }}>
                      {profile.firstName} {profile.lastName}
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '5px' }}>
                      {t('slots.email')}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50' }}>
                      {profile.email}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    color: '#2c3e50',
                    margin: '0 0 15px 0'
                  }}>
                    📍 Location Details
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#6c757d',
                        fontSize: '0.9rem',
                        marginBottom: '8px'
                      }}>
                        {t('slots.city')}
                      </label>
                                              <input
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder={t('slots.city')}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            transition: 'border-color 0.3s ease'
                          }}
                        />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#6c757d',
                        fontSize: '0.9rem',
                        marginBottom: '8px'
                      }}>
                        {t('slots.location')}
                      </label>
                                              <input
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder={t('slots.location')}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            transition: 'border-color 0.3s ease'
                          }}
                        />
                    </div>
                  </div>
                  <button
                    id="isave"
                    onClick={handleSaveCityLocation}
                    style={{
                      background: '#91bf55]',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(145, 191, 85, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(145, 191, 85, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(145, 191, 85, 0.3)';
                    }}
                  >
                    💾 {t('slots.save')}
                  </button>
                </div>
              </div>
            )}

            {/* Regions Section */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                color: '#2c3e50',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  background: '#3498db',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '1rem'
                }}>
                  🌍
                </span>
                {t('slots.assigned_regions')}
              </h3>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '20px'
              }}>
                {regions.map((r, i) => (
                  <span key={i} style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    border: '1px solid #bbdefb'
                  }}>
                    {r}
                  </span>
                ))}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <input
                  value={regionInput}
                  onChange={e => setRegionInput(e.target.value)}
                  placeholder={t('slots.add_region')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <button
                  id="isave"
                  onClick={handleAddRegion}
                  style={{
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ➕ {t('slots.add')}
                </button>
              </div>
            </div>

            {/* Subjects Section */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                color: '#2c3e50',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  background: '#9c27b0',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '1rem'
                }}>
                  📚
                </span>
                {t('slots.subjects_courses')}
              </h3>
              
              <div style={{
                display: 'grid',
                gap: '15px',
                marginBottom: '25px'
              }}>
                {subjects.map((s, i) => (
                  <div key={i} style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#2c3e50',
                        marginBottom: '5px'
                      }}>
                        {s.name}
                      </div>
                      <div style={{
                        color: '#6c757d',
                        fontSize: '0.9rem'
                      }}>
                        {t('slots.duration')}: {s.durationWeeks} {t('slots.weeks')}
                      </div>
                    </div>
                    <button
                      id="idel"
                      onClick={() => handleDeleteSubject(i)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🗑️ {t('slots.delete')}
                    </button>
                  </div>
                ))}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr auto',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <input
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  placeholder={t('slots.add_subject_course')}
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <input
                  type="number"
                  min={1}
                  value={subjectDuration}
                  onChange={e => setSubjectDuration(e.target.value)}
                  placeholder={t('slots.duration_weeks')}
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <button
                  id="isave"
                  onClick={handleAddSubject}
                  style={{
                    background: '#9c27b0',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ➕ {t('slots.add')}
                </button>
              </div>
            </div>

            {/* Availability Section */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                color: '#2c3e50',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  background: '#ff9800',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '1rem'
                }}>
                  ⏰
                </span>
                {t('slots.set_available_hours')}
              </h3>
              
              <div style={{
                display: 'grid',
                gap: '20px'
              }}>
                {DAYS.map(day => (
                  <div key={day} style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#2c3e50',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        background: '#ff9800',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}>
                        {t(`slots.days.${day.toLowerCase()}`)}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '15px'
                    }}>
                      {(availability[day] || []).map((slot, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}>
                          <input
                            type="time"
                            value={slot.start || ''}
                            onChange={e => handleAvailabilityChange(day, idx, 'start', e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #e9ecef',
                              borderRadius: '6px',
                              fontSize: '0.9rem'
                            }}
                          />
                          <span style={{ color: '#6c757d' }}>-</span>
                          <input
                            type="time"
                            value={slot.end || ''}
                            onChange={e => handleAvailabilityChange(day, idx, 'end', e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #e9ecef',
                              borderRadius: '6px',
                              fontSize: '0.9rem'
                            }}
                          />
                          <button
                            id="idel"
                            onClick={() => handleDeleteSlot(day, idx)}
                            style={{
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleAddSlot(day)}
                      style={{
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        marginBottom: '15px'
                      }}
                    >
                      ➕ {t('slots.add_slot')}
                    </button>
                    
                    <div style={{
                      background: '#e8f5e8',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #c8e6c9'
                    }}>
                      <div style={{
                        color: '#2e7d32',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        🆓 {t('slots.free_slots')}: {getFreeSlots(day).map((slot, i) => `${slot.start} - ${slot.end}`).join(', ') || t('slots.none')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleSaveAvailability}
                style={{
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '20px',
                  transition: 'all 0.3s ease'
                }}
              >
                💾 {t('slots.save_availability')}
              </button>
            </div>

            {/* Bookings Sections */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '30px'
            }}>
              {/* Confirmed Bookings */}
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#2c3e50',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    background: '#27ae60',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '1rem'
                  }}>
                    ✅
                  </span>
                  {t('slots.my_confirmed_bookings')}
                </h3>
                
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e9ecef'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{
                        background: '#27ae60',
                        color: 'white'
                      }}>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.date')}
                        </th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.time')}
                        </th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.location')}
                        </th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.course')}
                        </th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedBookings.map((b, i) => (
                        <tr id="dids" key={i} style={{
                          borderBottom: '1px solid #e9ecef',
                          background: i % 2 === 0 ? 'white' : '#f8f9fa'
                        }}>
                          <td style={{
                            padding: '16px 12px',
                            fontSize: '0.9rem',
                            color: '#2c3e50'
                          }}>
                            {b.date}
                          </td>
                          <td style={{
                            padding: '16px 12px',
                            fontSize: '0.9rem',
                            color: '#2c3e50'
                          }}>
                            {b.start || '-'} - {b.end || '-'}
                          </td>
                          <td style={{
                            padding: '16px 12px',
                            fontSize: '0.9rem',
                            color: '#2c3e50'
                          }}>
                            {b.city}, {b.area}
                          </td>
                          <td style={{
                            padding: '16px 12px',
                            fontSize: '0.9rem',
                            color: '#2c3e50'
                          }}>
                            {b.courseName}
                          </td>
                          <td style={{
                            padding: '16px 12px'
                          }}>
                            <button
                              id="dids"
                              onClick={async () => {
                                await axios.delete(`${API_BASE_URL}/api/bookings/${b._id}`);
                                setAssignedBookings(assignedBookings.filter(x => x._id !== b._id));
                              }}
                              style={{
                                background: '#e74c3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              🗑️ {t('slots.delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {assignedBookings.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#6c757d',
                            fontSize: '1rem'
                          }}>
                            📭 {t('slots.no_confirmed_bookings')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Bookings */}
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#2c3e50',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    background: '#f39c12',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '1rem'
                  }}>
                    ⏳
                  </span>
                  {t('slots.pending_bookings')}
                </h3>
                
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e9ecef'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{
                        background: '#f39c12',
                        color: 'white'
                      }}>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.date')}
                        </th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.time')}
                        </th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.location')}
                        </th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.course')}
                        </th>
                        <th style={{
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {t('slots.action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBookings.map((b, i) => (
                        <tr key={i} style={{
                          borderBottom: '1px solid #e9ecef',
                          background: i % 2 === 0 ? 'white' : '#f8f9fa'
                        }}>
                          <td style={{
                            padding: '16px 12px',
                            fontSize: '0.9rem',
                            color: '#2c3e50'
                          }}>
                            {b.date}
                          </td>
                          <td style={{
                            padding: '16px 12px',
                            fontSize: '0.9rem',
                            color: '#2c3e50'
                          }}>
                            {b.start || '-'} - {b.end || '-'}
                          </td>
                          <td style={{
                            padding: '16px 12px',
                            fontSize: '0.9rem',
                            color: '#2c3e50'
                          }}>
                            {b.city}, {b.area}
                          </td>
                          <td style={{
                            padding: '16px 12px',
                            fontSize: '0.9rem',
                            color: '#2c3e50'
                          }}>
                            {b.courseName}
                          </td>
                          <td style={{
                            padding: '16px 12px'
                          }}>
                            <button
                              onClick={async () => {
                                await handleAcceptBooking(b._id);
                                window.location.reload();
                              }}
                              style={{
                                background: '#27ae60',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              ✅ {t('slots.accept')}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pendingBookings.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#6c757d',
                            fontSize: '1rem'
                          }}>
                            📭 {t('slots.no_pending_bookings')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {acceptMessage && (
                  <div style={{
                    background: '#d4edda',
                    color: '#155724',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginTop: '15px',
                    border: '1px solid #c3e6cb',
                    fontSize: '0.9rem'
                  }}>
                    ✅ {acceptMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div style={{
                background: '#d4edda',
                color: '#155724',
                padding: '16px 20px',
                borderRadius: '12px',
                marginTop: '20px',
                border: '1px solid #c3e6cb',
                fontSize: '1rem',
                textAlign: 'center'
              }}>
                💚 {message}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
};

export default Slots; 