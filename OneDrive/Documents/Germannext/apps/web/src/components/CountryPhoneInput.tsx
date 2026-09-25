import React, { useState, useEffect, useRef, useMemo } from 'react';
import { all, type CountryData } from 'country-codes-list';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface CountryPhoneInputProps {
  value: string;
  onChange: (fullPhoneNumber: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
}

const PRIMARY_CALLING_CODES: Record<string, string> = {
  '1': 'US',
  '44': 'GB',
  '61': 'AU',
  '7': 'RU',
  '358': 'FI',
  '47': 'NO',
};

// Pre-sorted list of countries for lookup and display
const ALL_COUNTRIES: CountryData[] = all().sort((a, b) =>
  a.countryNameEn.localeCompare(b.countryNameEn)
);

// Sorted by calling code length descending for greedy prefix parsing
const COUNTRIES_BY_CALLING_CODE_LEN: CountryData[] = [...ALL_COUNTRIES].sort((a, b) => {
  if (b.countryCallingCode.length !== a.countryCallingCode.length) {
    return b.countryCallingCode.length - a.countryCallingCode.length;
  }
  const aPrimary = PRIMARY_CALLING_CODES[a.countryCallingCode] === a.countryCode;
  const bPrimary = PRIMARY_CALLING_CODES[b.countryCallingCode] === b.countryCode;
  if (aPrimary && !bPrimary) return -1;
  if (!aPrimary && bPrimary) return 1;
  return a.countryNameEn.localeCompare(b.countryNameEn);
});

const DEFAULT_COUNTRY = ALL_COUNTRIES.find((c) => c.countryCode === 'IN') || {
  countryCode: 'IN',
  countryNameEn: 'India',
  countryCallingCode: '91',
  flag: '🇮🇳',
} as CountryData;

function parsePhone(value: string): { country: CountryData; nationalNumber: string } | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('+')) return null;

  const rawDigits = trimmed.substring(1).replace(/\s+/g, ' ');
  for (const c of COUNTRIES_BY_CALLING_CODE_LEN) {
    if (rawDigits.startsWith(c.countryCallingCode)) {
      const rest = rawDigits.substring(c.countryCallingCode.length).trim();
      return { country: c, nationalNumber: rest };
    }
  }
  return null;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = '98765 43210',
  id,
  name,
  className = '',
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    const parsed = parsePhone(value);
    return parsed?.country || DEFAULT_COUNTRY;
  });

  const [nationalNumber, setNationalNumber] = useState<string>(() => {
    const parsed = parsePhone(value);
    if (parsed) return parsed.nationalNumber;
    return value.replace(/^\+\d+\s*/, '');
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Sync state if external value changes drastically (e.g. initial profile load or reset)
  useEffect(() => {
    const parsed = parsePhone(value);
    if (parsed) {
      if (parsed.country.countryCode !== selectedCountry.countryCode) {
        setSelectedCountry(parsed.country);
      }
      if (parsed.nationalNumber !== nationalNumber) {
        setNationalNumber(parsed.nationalNumber);
      }
    } else if (!value) {
      setNationalNumber('');
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
        selectedItemRef.current?.scrollIntoView({ block: 'nearest' });
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter countries based on search query (by country name, calling code, ISO code, or acronym)
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES;

    const cleanCodeQ = q.startsWith('+') ? q.slice(1) : q;

    const matched = ALL_COUNTRIES.filter((c) => {
      const nameMatch = c.countryNameEn.toLowerCase().includes(q);
      const codeMatch =
        c.countryCallingCode === cleanCodeQ || c.countryCallingCode.startsWith(cleanCodeQ);
      const isoMatch =
        c.countryCode.toLowerCase() === q ||
        (c.countryCodeAlpha3 && c.countryCodeAlpha3.toLowerCase() === q);
      const altMatch = c.altCodes && c.altCodes.some((a) => a.toLowerCase() === q);
      const acronym = c.countryNameEn
        .split(/\s+/)
        .filter((w) => !['of', 'and', 'the'].includes(w.toLowerCase()))
        .map((w) => w[0])
        .join('')
        .toLowerCase();
      const acronymMatch = acronym === q;

      return nameMatch || codeMatch || isoMatch || altMatch || acronymMatch;
    });

    return matched.sort((a, b) => {
      // Prioritize exact name
      const aExactName = a.countryNameEn.toLowerCase() === q;
      const bExactName = b.countryNameEn.toLowerCase() === q;
      if (aExactName && !bExactName) return -1;
      if (!aExactName && bExactName) return 1;

      // Prioritize exact ISO / alt code (e.g. 'UK' -> GB, 'US' -> USA)
      const aExactIso =
        a.countryCode.toLowerCase() === q ||
        Boolean(a.altCodes?.some((x) => x.toLowerCase() === q));
      const bExactIso =
        b.countryCode.toLowerCase() === q ||
        Boolean(b.altCodes?.some((x) => x.toLowerCase() === q));
      if (aExactIso && !bExactIso) return -1;
      if (!aExactIso && bExactIso) return 1;

      // Prioritize primary country for shared calling codes (e.g. +44 -> UK, +1 -> US)
      const aPrimary = PRIMARY_CALLING_CODES[a.countryCallingCode] === a.countryCode;
      const bPrimary = PRIMARY_CALLING_CODES[b.countryCallingCode] === b.countryCode;
      if (aPrimary && !bPrimary) return -1;
      if (!aPrimary && bPrimary) return 1;

      return a.countryNameEn.localeCompare(b.countryNameEn);
    });
  }, [searchQuery]);

  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    setIsOpen(false);

    // Prefix calling code onto stored phone value
    const trimmedNational = nationalNumber.trim();
    const updatedFullPhone = trimmedNational
      ? `+${country.countryCallingCode} ${trimmedNational}`
      : `+${country.countryCallingCode}`;

    onChange(updatedFullPhone);

    // Focus input for fast entry
    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 50);
  };

  const handleNationalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // Check if the user pasted an international number starting with '+'
    if (rawInput.trim().startsWith('+')) {
      const parsed = parsePhone(rawInput);
      if (parsed) {
        setSelectedCountry(parsed.country);
        setNationalNumber(parsed.nationalNumber);
        onChange(rawInput.trim());
        return;
      }
    }

    // Standard national digits input
    setNationalNumber(rawInput);
    const trimmed = rawInput.trim();
    const fullPhone = trimmed ? `+${selectedCountry.countryCallingCode} ${trimmed}` : '';
    onChange(fullPhone);
  };

  return (
    <div ref={containerRef} className={`relative flex items-center gap-2 ${className}`}>
      {/* Country Code Dropdown Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-10 px-3 rounded-xl border border-[#DCE2DC] bg-[#F5F5EF] text-xs sm:text-sm text-[#344653] font-medium hover:border-[#718C9B] hover:bg-[#E8ECE5] focus:outline-none focus:ring-1 focus:ring-[#718C9B] transition-all flex items-center gap-1.5 shrink-0 select-none shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`${selectedCountry.countryNameEn} (+${selectedCountry.countryCallingCode})`}
      >
        <span className="text-base leading-none" role="img" aria-label={selectedCountry.countryNameEn}>
          {selectedCountry.flag}
        </span>
        <span className="font-semibold text-[#344653]">+{selectedCountry.countryCallingCode}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#718C9B] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* National Phone Number Input */}
      <input
        ref={phoneInputRef}
        type="tel"
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        value={nationalNumber}
        onChange={handleNationalNumberChange}
        placeholder={placeholder}
        className="flex-1 h-10 px-4 rounded-xl border border-[#DCE2DC] bg-[#F5F5EF] text-xs sm:text-sm text-[#344653] placeholder-[#71808A] focus:outline-none focus:ring-1 focus:ring-[#718C9B] transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
      />

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 bg-[#F5F5EF] border border-[#DCE2DC] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          {/* Search Header */}
          <div className="p-2.5 border-b border-[#DCE2DC] bg-[#EEF1EB] relative">
            <Search className="w-3.5 h-3.5 text-[#718C9B] absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code (e.g. India, +49)..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#F5F5EF] border border-[#DCE2DC] rounded-lg text-xs text-[#344653] placeholder-[#71808A] focus:outline-none focus:ring-1 focus:ring-[#718C9B] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#71808A] hover:text-[#344653]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#DCE2DC]/40" role="listbox">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.countryCode === selectedCountry.countryCode;
                return (
                  <button
                    key={country.countryCode}
                    ref={isSelected ? selectedItemRef : null}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#E5EDF0] text-[#344653] font-semibold'
                        : 'text-[#344653] hover:bg-[#E8ECE5]'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-base leading-none shrink-0" role="img" aria-label={country.countryNameEn}>
                        {country.flag}
                      </span>
                      <span className="truncate">{country.countryNameEn}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[#71808A] font-medium text-[11px]">
                        +{country.countryCallingCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#5F7D8B]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#71808A]">
                No country found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
