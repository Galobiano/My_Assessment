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
    <div className = "ml-[200px]">
      <h1 className='text-right mr-[100px] mt-[20px]'>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <ProductTable  />
    </div>
  );
}

export default Dashboard;
