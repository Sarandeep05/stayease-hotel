import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface Props {
  initial?: { destination?: string; checkIn?: string; checkOut?: string; guests?: number };
}

export default function SearchBar({ initial }: Props) {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const [destination, setDestination] = useState(initial?.destination ?? '');
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? today);
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? tomorrow);
  const [guests, setGuests] = useState(initial?.guests ?? 2);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-lg sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="lg:col-span-2">
        <label className="label flex items-center gap-1">
          <MapPin className="h-4 w-4 text-brand-600" /> Destination
        </label>
        <input
          className="input"
          placeholder="City, hotel or country"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>
      <div>
        <label className="label flex items-center gap-1">
          <Calendar className="h-4 w-4 text-brand-600" /> Check-in
        </label>
        <input type="date" className="input" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </div>
      <div>
        <label className="label flex items-center gap-1">
          <Calendar className="h-4 w-4 text-brand-600" /> Check-out
        </label>
        <input type="date" className="input" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      </div>
      <div className="flex flex-col">
        <label className="label flex items-center gap-1">
          <Users className="h-4 w-4 text-brand-600" /> Guests
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            className="input"
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
          />
          <button type="submit" className="btn-primary shrink-0">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
