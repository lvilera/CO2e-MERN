import React from 'react';
import Header from '../Home/Header';
import Header2 from '../Home/Header2';

const DynamicHeader = () => {
  // Check if user is admin from localStorage
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  // Return Header2 for admin users, Header for regular users
  return isAdmin ? <Header2 /> : <Header />;
};

export default DynamicHeader; 