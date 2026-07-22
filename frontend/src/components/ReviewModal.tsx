import { FormEvent, useState } from 'react';
import { Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { Spinner } from './ui';

interface Props {
  hotelId: string;
  hotelName: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function ReviewModal({ hotelId, hotelName, onClose, onSaved }: Props) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reviews', { hotelId, rating, title, comment });
      toast.success('Thanks for your review!');
      onSaved();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Review {hotelName}</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                >
                  <Star className={`h-7 w-7 ${i <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Great stay!" />
          </div>
          <div>
            <label className="label">Your review</label>
            <textarea required className="input" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Spinner className="h-5 w-5" /> : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
