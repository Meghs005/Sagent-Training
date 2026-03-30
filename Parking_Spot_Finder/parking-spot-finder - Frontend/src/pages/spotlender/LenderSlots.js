import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect to MySpots which handles slot management inline
export default function LenderSlots() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/lender/my-spots', { replace: true }); }, []);
  return null;
}
