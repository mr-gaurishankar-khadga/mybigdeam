import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const paymentStatus = searchParams.get('payment_status');
    const paymentId = searchParams.get('payment_id');

    if (paymentStatus === 'SUCCESS' && orderId) {
      // Fetch booking details
      fetchBookingDetails(orderId);
    } else {
      setError('Payment was not successful');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchBookingDetails = async (orderId) => {
    try {
      // Extract booking ID from order ID (assuming format: CF_timestamp_random)
      const bookingId = orderId.replace('CF_', 'TKT');
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/biolink/tickets/booking/${bookingId}`);
      const data = await response.json();

      if (data.booking) {
        setBookingData(data.booking);
      } else {
        setError('Booking details not found');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  const formatPrice = (price, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const downloadTicket = () => {
    // Create a simple ticket PDF or image
    const ticketData = {
      bookingId: bookingData.booking_id,
      eventTitle: bookingData.ticket_id.title,
      eventDate: formatDate(bookingData.ticket_id.event_date),
      eventTime: formatTime(bookingData.ticket_id.event_time),
      location: bookingData.ticket_id.location,
      venue: bookingData.ticket_id.venue,
      customerName: bookingData.customer_name,
      quantity: bookingData.quantity,
      totalAmount: bookingData.total_amount,
      currency: bookingData.currency,
      qrCode: bookingData.qr_code
    };

    // For now, just show an alert with ticket details
    alert(`Ticket Details:\n\nBooking ID: ${ticketData.bookingId}\nEvent: ${ticketData.eventTitle}\nDate: ${ticketData.eventDate}\nTime: ${ticketData.eventTime}\nLocation: ${ticketData.location}\nVenue: ${ticketData.venue}\nCustomer: ${ticketData.customerName}\nQuantity: ${ticketData.quantity}\nTotal: ${formatPrice(ticketData.totalAmount, ticketData.currency)}\nQR Code: ${ticketData.qrCode}`);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading your ticket...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px' }}>❌</div>
        <h2 style={{ color: '#e74c3c' }}>Payment Failed</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>❓</div>
        <h2>Booking Not Found</h2>
        <p>We couldn't find your booking details.</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <CheckCircle size={64} style={{ color: '#4ade80', marginBottom: '16px' }} />
          <h1 style={{ 
            color: '#1f2937', 
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700'
          }}>
            🎉 Payment Successful!
          </h1>
          <p style={{ 
            color: '#6b7280', 
            margin: '0',
            fontSize: '16px'
          }}>
            Your tickets have been booked successfully
          </p>
        </div>

        {/* Booking Details */}
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            color: '#1f2937', 
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Booking Details
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Ticket size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '500' }}>Booking ID:</span>
              <span style={{ fontFamily: 'monospace', background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px' }}>
                {bookingData.booking_id}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '500' }}>Event:</span>
              <span>{bookingData.ticket_id.title}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '500' }}>Date:</span>
              <span>{formatDate(bookingData.ticket_id.event_date)}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '500' }}>Time:</span>
              <span>{formatTime(bookingData.ticket_id.event_time)}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '500' }}>Location:</span>
              <span>{bookingData.ticket_id.location}</span>
            </div>
            
            {bookingData.ticket_id.venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={20} style={{ color: '#6b7280' }} />
                <span style={{ fontWeight: '500' }}>Venue:</span>
                <span>{bookingData.ticket_id.venue}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '500' }}>Customer:</span>
              <span>{bookingData.customer_name}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '500' }}>Tickets:</span>
              <span>{bookingData.quantity}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '500' }}>Total Amount:</span>
              <span style={{ fontWeight: '600', color: '#059669' }}>
                {formatPrice(bookingData.total_amount, bookingData.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        {bookingData.qr_code && (
          <div style={{
            background: '#f9fafb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              color: '#1f2937', 
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Entry QR Code
            </h4>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              display: 'inline-block',
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#374151'
            }}>
              {bookingData.qr_code}
            </div>
            <p style={{ 
              color: '#6b7280', 
              margin: '12px 0 0 0',
              fontSize: '14px'
            }}>
              Show this QR code at the venue for entry
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={downloadTicket}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            <Download size={20} />
            Download Ticket
          </button>
          
          <button
            onClick={() => window.close()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Close
          </button>
        </div>

        {/* Additional Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #f59e0b'
        }}>
          <p style={{ 
            margin: '0',
            color: '#92400e',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            📧 A confirmation email has been sent to {bookingData.customer_email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
