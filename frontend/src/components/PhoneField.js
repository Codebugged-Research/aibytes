import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES } from '../utils/countries';

// Real flag images (cross-platform, unlike emoji flags which don't render everywhere).
export const flagUrl = (iso) => `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;

// intl-tel-input style field: collapsed shows the flag + chevron, the dropdown
// lists flag + country name + dial code with a search box.
export const PhoneField = ({ countryIso, onCountry, phone, onPhone, placeholder = 'Phone number' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef(null);

  const country = COUNTRIES.find((c) => c.iso === countryIso) || COUNTRIES[0];
  const q = query.trim().toLowerCase();
  const list = q
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.dial.includes(q))
    : COUNTRIES;

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const pick = (iso) => { onCountry(iso); setOpen(false); setQuery(''); };

  return (
    <div className="relative" ref={boxRef}>
      <div className="flex items-stretch bg-white border border-slate-200 rounded-2xl focus-within:border-[#6248FF] transition-colors overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-testid="country-code"
          aria-label={`Country code ${country.dial}`}
          className="flex items-center gap-1.5 pl-3.5 pr-2.5 border-r border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <img src={flagUrl(country.iso)} alt={country.name} className="w-6 h-4 object-cover rounded-[2px] shadow-sm" />
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <input
          data-testid="phone-input"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => onPhone(e.target.value.replace(/[^\d\s]/g, ''))}
          placeholder={placeholder}
          className="flex-1 min-w-0 py-3 px-3 text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />
      </div>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                data-testid="country-search"
                placeholder="Search country"
                className="w-full bg-transparent py-2 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {list.map((c) => (
              <button
                key={c.iso}
                type="button"
                data-testid={`country-opt-${c.iso}`}
                onClick={() => pick(c.iso)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-slate-50 ${c.iso === countryIso ? 'bg-violet-50' : ''}`}
              >
                <img src={flagUrl(c.iso)} alt="" className="w-6 h-4 object-cover rounded-[2px] shadow-sm flex-shrink-0" />
                <span className="flex-1 min-w-0 truncate text-sm font-semibold text-slate-800">{c.name}</span>
                <span className="text-sm font-medium text-slate-400">{c.dial}</span>
              </button>
            ))}
            {list.length === 0 && (
              <div className="px-3 py-5 text-center text-sm text-slate-400">No country found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
