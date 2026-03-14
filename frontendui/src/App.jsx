import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DefaultLayout from './components/DefaultLayout';
import GuestLayout from './components/GuestLayout';
import AdminLayout from './components/AdminLayout';

// Client imports
import Home from './views/client/Home';
import Login from './views/client/Login';
import Register from './views/client/Signup';
import Menu from './views/client/Menu';
import ClientOrders from './views/client/Orders';
import About from './views/client/About';
import Contact from './views/client/Contact';
// Admin imports
import Dashboard from './views/admin/Dashboard';
import Products from './views/admin/Products';
import ProductForm from './views/admin/ProductForm';
import AdminOrders from './views/admin/Orders';
import Users from './views/admin/Users';
import Cart from './views/client/Cart';
import Settings from './views/admin/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (Navbar + Footer) */}
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
          <Route path='/menu' element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path='/orders' element={<ClientOrders />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
        </Route>

        {/* GUEST ROUTES (Centered Box) */}
        <Route path="/" element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
        </Route>

        {/* ADMIN ROUTES (Sidebar) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<Users />} />
          <Route path="customer" element={<Users />} />
          <Route path='setting' element={<Settings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;