import React from 'react';
import Navbar from './components/Navbar/Navbar';
import NavbarLink from './components/Navbar/NavbarLink';
import NavNews from './components/Navbar/NavNews';
import Footer from './components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import SideCart from './components/SideCart/SideCart';
import FooterTwo from './components/Footer/FooterTwo';

const Root = () => {
    return (
        <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#ffffff_45%,_#fffbeb)]'>
            <Navbar></Navbar>
           <div className='sticky top-0 z-50'>
        <NavbarLink></NavbarLink> 
        </div>
            <Outlet></Outlet>
        <div className='top-1/2 right-3 fixed z-70 '>
            <SideCart></SideCart>
        </div>
            <FooterTwo></FooterTwo>
            <Footer></Footer>
        </div>
    );
};

export default Root;