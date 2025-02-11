import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import ProductTable from './ProductTable'

function Dashboard() {
  const nanigate = useNavigate();
  

  const handleLogout = () => {
    logout();
    nanigate('/login');
  };

  return (
    <div className = "">
      <h1 className='text-center bg-blue'>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <ProductTable  />
    </div>
  );
}

export default Dashboard;
