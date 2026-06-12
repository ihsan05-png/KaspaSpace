import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, X, ShoppingBag, Receipt, User, LayoutDashboard, LogOut } from 'lucide-react';
import Logo from '../../images/logo.png';
import CartDrawer from './CartDrawer';

// Palette dari logo: navy "KASPA" + sky-blue "SPACE"
const primaryBlue = '#1e6cbe';
const lightBlueBg = '#e8f4fd';
const blueBorder  = '#bfdbfe';
const onSurface   = '#191c1e';

const Navbar = () => {
  const { auth, cart: cartData, pendingOrder: serverPendingOrder } = usePage().props;
  const user = auth?.user;
  const cart = cartData || [];
  const cartItemCount = cart.length;
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pendingOrder = user ? serverPendingOrder : null;

  const handleProductsToggle = () => setIsProductsOpen((prev) => !prev);

  const linkBase = {
    fontFamily: "'Manrope', 'Plus Jakarta Sans', Inter, sans-serif",
    fontSize: '0.875rem',
    fontWeight: 500,
    color: onSurface,
    transition: 'color 0.15s',
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm"
      style={{ borderBottom: `1px solid ${blueBorder}`, fontFamily: "'Manrope', 'Plus Jakarta Sans', Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center focus:outline-none">
              <img className="h-12 w-auto" src={Logo} alt="Kaspa Space Logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/"
                className="px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
                style={linkBase}
                onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                onMouseLeave={e => e.currentTarget.style.color = onSurface}>
                Home
              </Link>

              {/* Products Dropdown */}
              <div className="relative">
                <button
                  onClick={handleProductsToggle}
                  className="px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200 focus:outline-none"
                  style={linkBase}
                  onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                  onMouseLeave={e => e.currentTarget.style.color = onSurface}>
                  Products
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg z-50"
                    style={{ border: `1px solid ${blueBorder}` }}>
                    <div className="py-1">
                      {[
                        { href: route('workspace', { category: 'coworking-space' }), label: 'Coworking Space' },
                        { href: route('jasa.profesional.section'), label: 'Dukungan Bisnis' },
                        { href: route('food.beverage'), label: 'Food & Beverage' },
                      ].map(({ href, label }) => (
                        <Link key={label} href={href}
                          className="block px-4 py-2 text-sm transition-colors duration-200"
                          style={{ color: '#45464d' }}
                          onMouseEnter={e => { e.currentTarget.style.background = lightBlueBg; e.currentTarget.style.color = primaryBlue; }}
                          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#45464d'; }}>
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href={route('media')}
                className="px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
                style={linkBase}
                onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                onMouseLeave={e => e.currentTarget.style.color = onSurface}>
                Media
              </Link>
              <Link href={route('contact')}
                className="px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
                style={linkBase}
                onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                onMouseLeave={e => e.currentTarget.style.color = onSurface}>
                Contact
              </Link>
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Pending Order Notification */}
            {pendingOrder && (
              <Link
                href={`/orders/${pendingOrder.id}/payment`}
                className="relative transition-colors duration-200 focus:outline-none"
                style={{ color: '#76777d' }}
                title="Pesanan Pending"
                onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                onMouseLeave={e => e.currentTarget.style.color = '#76777d'}>
                <Receipt className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse"
                  style={{ background: '#ba1a1a', fontSize: '0.6rem' }}>1</span>
              </Link>
            )}

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative transition-colors duration-200 focus:outline-none"
              style={{ color: '#76777d' }}
              type="button"
              onMouseEnter={e => e.currentTarget.style.color = onSurface}
              onMouseLeave={e => e.currentTarget.style.color = '#76777d'}>
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white rounded-full h-4 w-4 flex items-center justify-center font-semibold"
                  style={{ background: primaryBlue, fontSize: '0.6rem' }}>
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth / User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl transition-colors duration-200 focus:outline-none"
                  style={{ color: onSurface }}
                  onMouseEnter={e => { e.currentTarget.style.background = lightBlueBg; e.currentTarget.style.color = primaryBlue; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = onSurface; }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: lightBlueBg }}>
                    <User className="h-5 w-5" style={{ color: primaryBlue }} />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50"
                    style={{ border: `1px solid ${blueBorder}` }}>
                    <div className="px-4 py-2" style={{ borderBottom: `1px solid ${blueBorder}` }}>
                      <p className="text-sm font-semibold" style={{ color: onSurface }}>{user.name}</p>
                      <p className="text-xs" style={{ color: '#76777d' }}>{user.email}</p>
                    </div>

                    {[
                      { href: route('user.dashboard'), icon: <LayoutDashboard className="h-4 w-4 mr-3" />, label: 'Dashboard' },
                      { href: route('profile.edit'), icon: <User className="h-4 w-4 mr-3" />, label: 'Profil Saya' },
                    ].map(({ href, icon, label }) => (
                      <Link key={label} href={href}
                        className="flex items-center px-4 py-2 text-sm transition-colors duration-200"
                        style={{ color: '#45464d' }}
                        onMouseEnter={e => { e.currentTarget.style.background = lightBlueBg; e.currentTarget.style.color = primaryBlue; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#45464d'; }}>
                        {icon}{label}
                      </Link>
                    ))}

                    <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${blueBorder}` }}>
                      <Link method="post" href={route('logout')} as="button"
                        className="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200"
                        style={{ color: '#ba1a1a' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fde8e8'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href={route('login')}
                  className="px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200"
                  style={{ color: primaryBlue, border: `1.5px solid ${blueBorder}` }}
                  onMouseEnter={e => e.currentTarget.style.background = lightBlueBg}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  Login
                </Link>
                <Link href={route('register')}
                  className="px-5 py-2 rounded-full text-sm font-bold text-white transition-opacity duration-200"
                  style={{ background: primaryBlue }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="transition-colors duration-200 focus:outline-none"
              style={{ color: '#76777d' }}
              onMouseEnter={e => e.currentTarget.style.color = onSurface}
              onMouseLeave={e => e.currentTarget.style.color = '#76777d'}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3" style={{ borderTop: `1px solid ${blueBorder}` }}>
              <Link href="/"
                className="block px-3 py-2 text-base font-medium transition-colors duration-200"
                style={{ color: onSurface }}
                onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                onMouseLeave={e => e.currentTarget.style.color = onSurface}>
                Home
              </Link>

              <div className="relative">
                <button
                  onClick={handleProductsToggle}
                  className="block w-full text-left px-3 py-2 text-base font-medium transition-colors duration-200"
                  style={{ color: onSurface }}
                  onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                  onMouseLeave={e => e.currentTarget.style.color = onSurface}>
                  <div className="flex items-center justify-between">
                    Products
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isProductsOpen && (
                  <div className="pl-6 space-y-1">
                    {[
                      { href: route('workspace', { category: 'coworking-space' }), label: 'Coworking Space' },
                      { href: route('jasa.profesional.section'), label: 'Dukungan Bisnis' },
                      { href: route('food.beverage'), label: 'Food & Beverage' },
                    ].map(({ href, label }) => (
                      <Link key={label} href={href}
                        className="block px-3 py-2 text-sm transition-colors duration-200"
                        style={{ color: '#45464d' }}
                        onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                        onMouseLeave={e => e.currentTarget.style.color = '#45464d'}>
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href={route('media')}
                className="block px-3 py-2 text-base font-medium transition-colors duration-200"
                style={{ color: onSurface }}
                onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                onMouseLeave={e => e.currentTarget.style.color = onSurface}>
                Media
              </Link>
              <Link href={route('contact')}
                className="block px-3 py-2 text-base font-medium transition-colors duration-200"
                style={{ color: onSurface }}
                onMouseEnter={e => e.currentTarget.style.color = primaryBlue}
                onMouseLeave={e => e.currentTarget.style.color = onSurface}>
                Contact
              </Link>

              {/* Mobile right side */}
              <div className="pt-4 mt-4 space-y-3" style={{ borderTop: `1px solid ${blueBorder}` }}>
                <div className="flex items-center justify-end gap-4 px-3 py-2">
                  {pendingOrder && (
                    <Link href={`/orders/${pendingOrder.id}/payment`}
                      className="relative"
                      style={{ color: '#76777d' }}>
                      <Receipt className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse"
                        style={{ background: '#ba1a1a', fontSize: '0.6rem' }}>1</span>
                    </Link>
                  )}
                  <Link href={route('cart.index')} className="relative" style={{ color: '#76777d' }}>
                    <ShoppingBag className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-white rounded-full h-4 w-4 flex items-center justify-center font-semibold"
                        style={{ background: primaryBlue, fontSize: '0.6rem' }}>
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </div>

                {user ? (
                  <div className="space-y-2 px-3">
                    <div className="text-sm font-semibold" style={{ color: onSurface }}>{user.name}</div>
                    <Link href={route('profile.edit')}
                      className="block text-left text-sm font-medium"
                      style={{ color: primaryBlue }}>
                      Profil
                    </Link>
                    <Link method="post" href={route('logout')} as="button"
                      className="block w-full text-left text-sm"
                      style={{ color: '#ba1a1a' }}>
                      Logout
                    </Link>
                  </div>
                ) : (
                  <div className="px-3 space-y-2">
                    <Link href={route('login')}
                      className="block text-center w-full px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                      style={{ color: primaryBlue, border: `1.5px solid ${blueBorder}` }}
                      onMouseEnter={e => e.currentTarget.style.background = lightBlueBg}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      Login
                    </Link>
                    <Link href={route('register')}
                      className="block text-center w-full px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity duration-200"
                      style={{ background: primaryBlue }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isProductsOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsProductsOpen(false)} />
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navbar;
