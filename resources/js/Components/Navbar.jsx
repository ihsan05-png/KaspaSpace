import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, X, ShoppingBag, Receipt, User, LayoutDashboard, LogOut } from 'lucide-react';
import axios from 'axios';
import Logo from '../../images/logo.png';
import CartDrawer from './CartDrawer';
 

const Navbar = () => {
  const user = usePage().props?.auth?.user;
  const cart = usePage().props?.cart || [];
  const cartItemCount = cart.length;
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  // Auto-cancel expired order in database
  const cancelExpiredOrder = async (orderId) => {
    try {
      await axios.post(`/orders/${orderId}/cancel`);
      console.log('Expired order auto-cancelled:', orderId);
    } catch (error) {
      console.error('Error auto-cancelling expired order:', error);
    }
  };

  // Check for pending order
  useEffect(() => {
    const checkPendingOrder = async () => {
      const savedOrder = localStorage.getItem('pendingOrder');
      if (savedOrder) {
        try {
          const order = JSON.parse(savedOrder);
          const createdAt = new Date(order.created_at);
          const now = new Date();
          const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
          
          if (hoursDiff >= 24) {
            // Order expired - cancel in database and remove from localStorage
            await cancelExpiredOrder(order.id);
            localStorage.removeItem('pendingOrder');
            setPendingOrder(null);
          } else if (order.payment_status === 'unpaid') {
            setPendingOrder(order);
          } else {
            localStorage.removeItem('pendingOrder');
            setPendingOrder(null);
          }
        } catch (e) {
          localStorage.removeItem('pendingOrder');
          setPendingOrder(null);
        }
      }
    };

    checkPendingOrder();

    // Check every minute for expiry
    const interval = setInterval(checkPendingOrder, 60000);

    // Listen for storage changes
    const handleStorageChange = () => {
      checkPendingOrder();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleProductsToggle = () => {
    setIsProductsOpen((prev) => !prev);
  };

  
  return (
  <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-200 focus-visible:rounded-md"
            >
              <img
                className="h-12 w-auto"
                src= {Logo}
                alt="Kaspa Space Logo"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                href="/" 
                className="text-gray-900 hover:text-blue-500 px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
              >
                Home
              </Link>
              
              {/* Products Dropdown */}
              <div className="relative">
                <button
                  onClick={handleProductsToggle}
                  className="text-gray-900 hover:text-blue-500 px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200 focus:outline-none focus-visible:outline-none"
                >
                  Products
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <Link 
                        href={route('workspace', { category: 'coworking-space' })} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-500 transition-colors duration-200"
                      >
                        Coworking Space
                      </Link>
                      <Link 
                        href={route('jasa.profesional.section')} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-500 transition-colors duration-200"
                      >
                        Dukungan Bisnis
                      </Link>
                      <Link 
                        href={route('workspace', { category: 'open-library' })} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-500 transition-colors duration-200"
                      >
                        E-Library
                      </Link>
                      <Link 
                        href={route('food.beverage')} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-500 transition-colors duration-200"
                      >
                        Food & Beverage
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                href={route('media')} 
                className="text-gray-900 hover:text-blue-500 px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
              >
                Media
              </Link>
              <Link 
                href={route('contact')} 
                className="text-gray-900 hover:text-blue-500 px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Pending Order Notification */}
            {pendingOrder && (
              <a
                href={`/order/${pendingOrder.id}/payment`}
                className="relative text-gray-500 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus-visible:outline-none"
                title="Pesanan Pending"
              >
                <Receipt className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  1
                </span>
              </a>
            )}

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus-visible:outline-none"
              type="button"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            {/* Auth / User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link 
                      href={route('user.dashboard')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-3" />
                      Dashboard
                    </Link>
                    
                    <Link 
                      href={route('profile.edit')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profil Saya
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link 
                        method="post"
                        href={route('logout')}
                        as="button"
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href={route('login')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  href={route('register')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link 
                href="/" 
                className="text-gray-900 hover:text-blue-500 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Home
              </Link>
              
              <div className="relative">
                <button
                  onClick={handleProductsToggle}
                  className="text-gray-900 hover:text-blue-500 block w-full text-left px-3 py-2 text-base font-medium transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    Products
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {isProductsOpen && (
                  <div className="pl-6 space-y-1">
                  <Link 
                    href={route('workspace', { category: 'coworking-space' })} 
                    className="text-gray-600 hover:text-blue-500 block px-3 py-2 text-sm transition-colors duration-200"
                  >
                    Coworking Space
                  </Link>
                  <Link 
                    href={route('jasa.profesional.section')} 
                    className="text-gray-600 hover:text-blue-500 block px-3 py-2 text-sm transition-colors duration-200"
                  >
                    Dukungan Bisnis
                  </Link>
                  <Link 
                    href={route('workspace', { category: 'open-library' })} 
                    className="text-gray-600 hover:text-blue-500 block px-3 py-2 text-sm transition-colors duration-200"
                  >
                    E-Library
                  </Link>
                  <Link 
                    href={route('food.beverage')} 
                    className="text-gray-600 hover:text-blue-500 block px-3 py-2 text-sm transition-colors duration-200"
                  >
                    Food & Beverage
                  </Link>
                  </div>
                )}
              </div>
              
              <Link 
                href={route('media')} 
                className="text-gray-900 hover:text-blue-500 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Media
              </Link>
              <Link 
                href={route('contact')} 
                className="text-gray-900 hover:text-blue-500 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Contact
              </Link>
              
              {/* Mobile right side items */}
              <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
                <div className="flex items-center justify-end gap-4 px-3 py-2">
                  {/* Pending Order for Mobile */}
                  {pendingOrder && (
                    <a
                      href={`/order/${pendingOrder.id}/payment`}
                      className="relative text-gray-500 hover:text-blue-600"
                    >
                      <Receipt className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                        1
                      </span>
                    </a>
                  )}
                  
                  <Link
                    href={route('cart.index')}
                    className="relative text-gray-500 hover:text-gray-700"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </div>

                {user ? (
                  <div className="space-y-2 px-3">
                    <div className="text-sm text-gray-700 font-medium">
                      {user.name}
                    </div>
                    <Link 
                      href={route('profile.edit')}
                      className="block text-left text-sm text-blue-600 hover:text-blue-700"
                    >
                      Profil
                    </Link>
                    <Link 
                      method="post"
                      href={route('logout')}
                      as="button"
                      className="block w-full text-left text-sm text-red-600 hover:text-red-700"
                    >
                      Logout
                    </Link>
                  </div>
                ) : (
                  <div className="px-3 space-y-2">
                    <Link 
                      href={route('login')}
                      className="block text-center w-full border border-blue-200 text-blue-600 px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link 
                      href={route('register')}
                      className="block text-center w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay untuk menutup dropdown ketika klik di luar */}
      {isProductsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProductsOpen(false)}
        ></div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
