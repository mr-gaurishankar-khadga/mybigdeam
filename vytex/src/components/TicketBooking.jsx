import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Ticket, CreditCard, CheckCircle, AlertCircle, X, Sparkles, ChevronDown, ChevronUp, FileText, Shield } from 'lucide-react';
import cashfreePayment from '../utils/payment';
import './TicketBooking.css';

const TicketBooking = ({ ticket, isPreview = false, onBookingSuccess }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    special_requirements: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    refundPolicy: false,
    termsConditions: false
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format price for display
  const formatPrice = (price, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxAllowed = Math.min(
      ticket.available_tickets,
      ticket.max_tickets_per_person || ticket.available_tickets
    );
    if (newQuantity >= 1 && newQuantity <= maxAllowed) {
      setQuantity(newQuantity);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle expanded sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!customerDetails.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!customerDetails.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!customerDetails.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (quantity > ticket.available_tickets) {
      setError('Not enough tickets available');
      return false;
    }
    if (ticket.max_tickets_per_person && quantity > ticket.max_tickets_per_person) {
      setError(`Maximum ${ticket.max_tickets_per_person} tickets allowed per person`);
      return false;
    }
    // Check booking deadline
    if (ticket.booking_deadline) {
      const deadline = new Date(ticket.booking_deadline);
      const now = new Date();
      if (now > deadline) {
        setError('Booking deadline has passed');
        return false;
      }
    }
    return true;
  };

  // Handle ticket booking
  const handleBookTicket = async () => {
    if (!validateForm()) return;

    setIsBooking(true);
    setError(null);

    try {
      // Step 1: Create booking
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const bookingResponse = await fetch(`${backendUrl}/api/biolink/tickets/${ticket.ticket_id}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
          quantity: quantity,
          special_requirements: customerDetails.special_requirements
        })
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Failed to create booking');
      }

      setBookingData(bookingResult.booking);

      // Step 2: Create payment order
      const paymentResponse = await fetch(`${backendUrl}/api/biolink/tickets/${ticket.ticket_id}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingResult.booking.booking_id,
          customer_details: {
            name: customerDetails.name,
            email: customerDetails.email,
            phone: customerDetails.phone
          }
        })
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create payment');
      }

      // Step 3: Initialize Cashfree payment
      if (paymentResult.payment_data) {
        const paymentData = paymentResult.payment_data;
        
        // Initialize Cashfree
        const initialized = await cashfreePayment.initialize('sandbox'); // Change to 'production' for live
        
        if (initialized) {
          // Create payment session
          const paymentSession = await cashfreePayment.createPaymentSession(paymentData);
          
          // Redirect to payment page
          cashfreePayment.redirectToPayment(paymentSession.paymentSessionId);
        } else {
          throw new Error('Failed to initialize payment gateway');
        }
      } else {
        // Fallback: Show success message for preview mode
        setBookingStatus('success');
        setShowBookingModal(false);
        if (onBookingSuccess) {
          onBookingSuccess(bookingResult.booking);
        }
      }

    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  // Handle preview mode booking
  const handlePreviewBooking = () => {
    setBookingStatus('success');
    setBookingData({
      booking_id: `TKT${Date.now()}`,
      total_amount: ticket.price * quantity,
      currency: ticket.currency,
      quantity: quantity,
      customer_name: customerDetails.name,
      customer_email: customerDetails.email
    });
    setShowBookingModal(false);
  };

  // If ticket is sold out
  if (ticket.available_tickets <= 0) {
    return (
      <div className="ticket-booking-container">
        {ticket.poster_image ? (
          <img 
            src={ticket.poster_image.startsWith('http') ? ticket.poster_image : `${import.meta.env.VITE_BACKEND_URL}${ticket.poster_image}`}
            alt={ticket.title}
            className="ticket-poster"
          />
        ) : (
          <div className="ticket-poster-placeholder">
            {ticket.title}
          </div>
        )}
        
        <div className="ticket-content">
          <h2 className="ticket-title">{ticket.title}</h2>
          <p className="ticket-description">{ticket.description}</p>
          
          <div className="ticket-sold-out">
            <p className="ticket-sold-out-text">🎫 Sold Out!</p>
          </div>
        </div>
      </div>
    );
  }

  // If booking is successful
  if (bookingStatus === 'success' && bookingData) {
    return (
      <div className="ticket-booking-container">
        {ticket.poster_image ? (
          <img 
            src={ticket.poster_image.startsWith('http') ? ticket.poster_image : `${import.meta.env.VITE_BACKEND_URL}${ticket.poster_image}`}
            alt={ticket.title}
            className="ticket-poster"
          />
        ) : (
          <div className="ticket-poster-placeholder">
            {ticket.title}
          </div>
        )}
        
        <div className="ticket-content">
          <div className="ticket-success">
            <CheckCircle size={48} style={{ marginBottom: '16px', color: '#059669' }} />
            <h3 className="ticket-success-text">🎉 Booking Successful!</h3>
            <p style={{ marginTop: '8px', color: '#6b7280' }}>
              Booking ID: <strong>{bookingData.booking_id}</strong>
            </p>
            <p style={{ marginTop: '4px', color: '#6b7280' }}>
              Total Amount: <strong>{formatPrice(bookingData.total_amount, bookingData.currency)}</strong>
            </p>
            <p style={{ marginTop: '4px', color: '#6b7280' }}>
              Tickets: <strong>{bookingData.quantity}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="ticket-booking-container">
        {/* Poster Banner */}
        {ticket.poster_image ? (
          <img 
            src={ticket.poster_image.startsWith('http') ? ticket.poster_image : `${import.meta.env.VITE_BACKEND_URL}${ticket.poster_image}`}
            alt={ticket.title}
            className="ticket-poster"
          />
        ) : (
          <div className="ticket-poster-placeholder">
            {ticket.title}
          </div>
        )}

        {/* Content Section */}
        <div className="ticket-content">
          <h2 className="ticket-title">{ticket.title}</h2>
          <p className="ticket-description">{ticket.description}</p>
          
          {/* Event Details */}
          <div className="ticket-details">
            <h3 className="ticket-details-title">Event Details</h3>
            
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Date:</span>
              <span className="ticket-detail-value">{formatDate(ticket.event_date)}</span>
            </div>
            
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Time:</span>
              <span className="ticket-detail-value">
                {formatTime(ticket.event_time)}
                {ticket.event_end_time && ` - ${formatTime(ticket.event_end_time)}`}
              </span>
            </div>
            
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Location:</span>
              <span className="ticket-detail-value">{ticket.location || ticket.venue}</span>
            </div>
            
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Venue:</span>
              <span className="ticket-detail-value">{ticket.venue}</span>
            </div>
            
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Type:</span>
              <span className="ticket-detail-value">{ticket.event_type || 'Concert'}</span>
            </div>
            
            {ticket.age_restriction && ( 
              <div className="ticket-detail-item"> 
                <span className="ticket-detail-label">Age Restriction:</span> 
                <span className="ticket-detail-value">{ticket.age_restriction}</span> 
              </div> 
            )} 
            
            <div className="ticket-detail-item"> 
              <span className="ticket-detail-label">Price:</span> 
              <span className="ticket-detail-value price">{formatPrice(ticket.price, ticket.currency)}</span> 
            </div> 
            
            {ticket.max_tickets_per_person && ( 
              <div className="ticket-detail-item"> 
                <span className="ticket-detail-label">Max per Person:</span> 
                <span className="ticket-detail-value">{ticket.max_tickets_per_person} tickets</span> 
              </div> 
            )} 
          </div> 

          {/* Organizer Information */} 
          {ticket.organizer_name && ( 
            <div className="ticket-details"> 
              <h3 className="ticket-details-title">Organizer</h3> 
              <div className="ticket-detail-item">  
                <span className="ticket-detail-label">Organized by:</span> 
                <span className="ticket-detail-value">{ticket.organizer_name}</span> 
              </div> 
            </div> 
          )} 
 
          {/* Additional Information */} 
          {(ticket.dress_code || ticket.includes || ticket.special_instructions) && ( 
            <div className="ticket-details"> 
              <h3 className="ticket-details-title">Additional Information</h3> 
              
              {ticket.dress_code && ( 
                <div className="ticket-detail-item"> 
                  <span className="ticket-detail-label">Dress Code:</span> 
                  <span className="ticket-detail-value">{ticket.dress_code}</span>  
                </div> 
              )} 
              
              {ticket.includes && ( 
                <div className="ticket-detail-item"> 
                  <span className="ticket-detail-label">Includes:</span> 
                  <span className="ticket-detail-value">{ticket.includes}</span> 
                </div> 
              )} 
              
              {ticket.special_instructions && ( 
                <div className="ticket-detail-item"> 
                  <span className="ticket-detail-label">Special Instructions:</span> 
                  <span className="ticket-detail-value">{ticket.special_instructions}</span> 
                </div> 
              )}
            </div> 
          )} 


          {/* Contact Information */} 
          {(ticket.support_email || ticket.support_phone) && ( 
            <div className="ticket-details">  
              <h3 className="ticket-details-title">Contact & Support</h3> 
              
              {ticket.support_email && (
                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Support Email:</span> 
                  <span className="ticket-detail-value">{ticket.support_email}</span> 
                </div> 
              )} 
              
              {ticket.support_phone && (
                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Support Phone:</span>
                  <span className="ticket-detail-value">{ticket.support_phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Availability */}
          <div className="ticket-availability">
            <Users size={14} />
            <span className="ticket-availability-count">{ticket.available_tickets}</span> tickets remaining
          </div>

          {/* Book Now Button */}
          <button 
            className="ticket-book-btn"
            onClick={() => setShowBookingModal(true)}
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="ticket-booking-modal" onClick={() => setShowBookingModal(false)}>
          <div className="ticket-booking-form" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Book Your Tickets</h3>
              <button 
                onClick={() => setShowBookingModal(false)}
                style={{ 
                  background: 'var(--active-bg)', 
                  border: '1px solid var(--border-color)', 
                  cursor: 'pointer', 
                  padding: '8px', 
                  borderRadius: '8px',
                  color: 'var(--text-color)',
                  transition: 'var(--transition-normal)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--hover-bg)';
                  e.target.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--active-bg)';
                  e.target.style.color = 'var(--text-color)';
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Quantity Selector */}
            <div className="form-group">
              <label>Number of Tickets</label>
              <div className="quantity-selector">
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    className="quantity-input"
                    value={quantity}
                    readOnly
                    min="1"
                    max={Math.min(ticket.available_tickets, ticket.max_tickets_per_person || ticket.available_tickets)}
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= Math.min(ticket.available_tickets, ticket.max_tickets_per_person || ticket.available_tickets)}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Max: {Math.min(ticket.available_tickets, ticket.max_tickets_per_person || ticket.available_tickets)} tickets
                  {ticket.max_tickets_per_person && ticket.max_tickets_per_person < ticket.available_tickets && (
                    <span> (per person)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={customerDetails.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={customerDetails.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerDetails.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="special_requirements">Special Requirements (Optional)</label>
              <textarea
                id="special_requirements"
                name="special_requirements"
                value={customerDetails.special_requirements}
                onChange={handleInputChange}
                placeholder="Any special requirements or notes..."
                rows="3"
              />
            </div>

            {/* Total Price */}
            <div className="total-price">
              <div className="total-price-label">Total Amount</div>
              <div className="total-price-amount">
                {formatPrice(ticket.price * quantity, ticket.currency)}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="ticket-error">
                <AlertCircle size={16} style={{ marginRight: '8px' }} />
                <span className="ticket-error-text">{error}</span>
              </div>
            )}

            {/* Book Button */}
            <button 
              className="book-ticket-btn"
              onClick={isPreview ? handlePreviewBooking : handleBookTicket}
              disabled={isBooking || quantity > ticket.available_tickets}
            >
              {isBooking ? (
                <div className="ticket-loading">
                  <div className="ticket-loading-spinner"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <CreditCard size={20} />
                  Book {quantity} Ticket{quantity > 1 ? 's' : ''} - {formatPrice(ticket.price * quantity, ticket.currency)}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketBooking;