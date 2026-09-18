
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer';
import ProductUi from './components/ProductUi/ProductUi';
import NavbarLink from './components/Navbar/NavbarLink';
import NavNews from './components/Navbar/NavNews';

function App() {


  return (
    <>
      <div className=''>
        {/* <Navbar></Navbar>
        <div className='sticky top-0 z-50'>
        <NavbarLink></NavbarLink> */}
        {/* </div> */}
        
        {/* <NavNews></NavNews> */}
        <ProductUi></ProductUi>
        
        {/* <Footer></Footer> */}
      </div>
    </>
  )
}

export default App
