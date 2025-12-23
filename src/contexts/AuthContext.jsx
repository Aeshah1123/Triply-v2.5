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
    
    // تحويل arrivalDate و departureDate إلى ISO format
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      try {
        // إذا كان التاريخ بصيغة MM/DD/YYYY أو DD/MM/YYYY
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // افترض MM/DD/YYYY
          const month = parseInt(parts[0]) - 1;
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          return new Date(year, month, day).toISOString();
        }
        // محاولة تحليل التاريخ مباشرة
        return new Date(dateStr).toISOString();
      } catch (e) {
        console.error('Error parsing date:', dateStr, e);
        return null;
      }
    };
    
    const checkInDate = booking.checkIn || parseDate(booking.arrivalDate) || new Date().toISOString();
    const checkOutDate = booking.checkOut || parseDate(booking.departureDate) || new Date(Date.now() + (booking.days || 7) * 24 * 60 * 60 * 1000).toISOString();
    
    const bookingWithId = {
      ...booking,
      id: Date.now().toString(),
      userId: user.id,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests: booking.numberOfGuests || booking.guests || 1,
      totalAmount: booking.totalAmount || booking.totalCost || 0,
      // الاحتفاظ بالحقول الأصلية أيضاً
      destination: booking.destination || { name: 'Unknown' }
    };

    console.log('✅ Booking after processing:', bookingWithId);
    console.log('📅 CheckIn:', checkInDate, '| CheckOut:', checkOutDate);

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
    if (!user?.bookings) {
      console.log('📋 No bookings found for user');
      return [];
    }
    
    const now = new Date();
    const upcoming = user.bookings.filter(booking => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const isActive = checkOutDate >= now; // الحجز نشط إذا لم ينتهِ بعد
      const isNotCancelled = booking.status !== 'cancelled';
      
      console.log('🔍 Checking booking:', {
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        checkInDate,
        checkOutDate,
        now,
        isActive,
        isNotCancelled,
        willShow: isActive && isNotCancelled
      });
      
      return isActive && isNotCancelled;
    }).sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
    
    console.log('⏰ Upcoming bookings count:', upcoming.length);
    return upcoming;
  };

  const getPastBookings = () => {
    if (!user?.bookings) {
      console.log('📋 No bookings found for user');
      return [];
    }
    
    const now = new Date();
    const past = user.bookings.filter(booking => {
      const checkOutDate = new Date(booking.checkOut);
      return checkOutDate < now || booking.status === 'cancelled';
    }).sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut));
    
    console.log('📅 Past bookings count:', past.length);
    return past;
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



