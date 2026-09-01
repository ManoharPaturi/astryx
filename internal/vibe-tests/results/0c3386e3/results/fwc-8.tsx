import {useState} from 'react';

export default function HotelBookingDatePicker() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 500}}>
      <h2 style={{margin: 0, fontSize: 24, fontWeight: 700}}>Book Your Stay</h2>
      <p style={{color: '#666', margin: 0}}>Select your check-in and check-out dates</p>

      <div style={{display: 'flex', gap: 16}}>
        <div style={{flex: 1}}>
          <label htmlFor="checkin" style={{display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14}}>
            Check-in
          </label>
          <input
            id="checkin"
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            style={{width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, boxSizing: 'border-box'}}
          />
        </div>
        <div style={{flex: 1}}>
          <label htmlFor="checkout" style={{display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14}}>
            Check-out
          </label>
          <input
            id="checkout"
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            style={{width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, boxSizing: 'border-box'}}
          />
        </div>
      </div>
    </div>
  );
}
