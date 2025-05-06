// src/components/layout/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBar from './TopBar';
import { GlobalCallNotification } from '../../contexts/CallContext';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <TopBar />
      <main className="flex-grow">
        <Outlet />
      </main>
     
      <Footer />
    </div>
  );
};

export default MainLayout;