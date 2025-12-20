/**
 * AuthContext - إدارة حالة المصادقة والمستخدمين
 * يوفر:
 * - تسجيل الدخول والتسجيل والخروج
 * - حفظ بيانات المستخدم في localStorage
 * - إدارة الحجوزات لكل مستخدم
 */

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('triply_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('triply_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('triply_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('triply_user');
    }
  }, [user]);

  const register = async (userData) => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('triply_users') || '[]');
      
      // Check if email already exists
      if (users.some(u => u.email === userData.email)) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
        bookings: [],
        loyaltyPoints: 0
      };

      // Save to users list
      users.push(newUser);
      localStorage.setItem('triply_users', JSON.stringify(users));

      // Set as current user (without password)
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('triply_users') || '[]');
      const foundUser = users.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('triply_user');
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Update in users list
    const users = JSON.parse(localStorage.getItem('triply_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('triply_users', JSON.stringify(users));
    }
  };

  const addBooking = (booking) => {
    console.log('📝 Adding booking - Original data:', booking);
    
    // التحقق من عدم وجود نفس الحجز مسبقاً (باستخدام bookingNumber أو invoiceId)
    const existingBooking = user.bookings?.find(b => 
      (booking.bookingNumber && b.bookingNumber === booking.bookingNumber) ||
      (booking.invoiceId && b.invoiceId === booking.invoiceId)
    );
    
    if (existingBooking) {
      console.warn('⚠️ Booking already exists! Skipping duplicate:', existingBooking);
      return existingBooking;
    }
    
    const bookingWithId = {
      ...booking,
      id: Date.now().toString(),
      userId: user.id,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      // تأكد من وجود checkIn و checkOut (استخدم arrivalDate و departureDate كبديل)
      checkIn: booking.checkIn || booking.arrivalDate || new Date().toISOString(),
      checkOut: booking.checkOut || booking.departureDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      numberOfGuests: booking.numberOfGuests || booking.guests || 1,
      totalAmount: booking.totalAmount || booking.totalCost || 0
    };

    console.log('✅ Booking after processing:', bookingWithId);

    const updatedUser = {
      ...user,
      bookings: [...(user.bookings || []), bookingWithId],
      loyaltyPoints: (user.loyaltyPoints || 0) + Math.floor((booking.totalAmount || booking.totalCost || 0) / 100)
    };

    console.log('👤 Updated user with bookings:', updatedUser);

    setUser(updatedUser);

    // Update in users list
    const users = JSON.parse(localStorage.getItem('triply_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('triply_users', JSON.stringify(users));
    }

    return bookingWithId;
  };

  const getUpcomingBookings = () => {
    if (!user?.bookings) return [];
    const now = new Date();
    return user.bookings
      .filter(booking => new Date(booking.checkIn) >= now && booking.status !== 'cancelled')
      .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
  };

  const getPastBookings = () => {
    if (!user?.bookings) return [];
    const now = new Date();
    return user.bookings
      .filter(booking => new Date(booking.checkOut) < now || booking.status === 'cancelled')
      .sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut));
  };

  const cancelBooking = (bookingId) => {
    const updatedBookings = user.bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
        : booking
    );

    const updatedUser = { ...user, bookings: updatedBookings };
    setUser(updatedUser);

    // Update in users list
    const users = JSON.parse(localStorage.getItem('triply_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('triply_users', JSON.stringify(users));
    }
  };

  const removeDuplicateBookings = () => {
    if (!user?.bookings) return;

    console.log('🔍 Checking for duplicate bookings...');
    const seen = new Set();
    const uniqueBookings = [];

    user.bookings.forEach(booking => {
      const key = `${booking.bookingNumber}-${booking.invoiceId}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBookings.push(booking);
      } else {
        console.log('🗑️ Removing duplicate:', booking);
      }
    });

    if (uniqueBookings.length < user.bookings.length) {
      const updatedUser = { ...user, bookings: uniqueBookings };
      setUser(updatedUser);

      // Update in users list
      const users = JSON.parse(localStorage.getItem('triply_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('triply_users', JSON.stringify(users));
      }

      console.log(`✅ Removed ${user.bookings.length - uniqueBookings.length} duplicate bookings`);
      return user.bookings.length - uniqueBookings.length;
    }

    console.log('✅ No duplicates found');
    return 0;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    addBooking,
    getUpcomingBookings,
    getPastBookings,
    cancelBooking,
    removeDuplicateBookings
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



