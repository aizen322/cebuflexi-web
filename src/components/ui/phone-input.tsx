import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { countries, defaultCountry, getCountryByCode, validatePhoneNumber, stripPhonePrefix, type Country } from '@/lib/countries';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string, countryCode: string) => void;
  countryCode?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

export function PhoneInput({
  value,
  onChange,
  countryCode = defaultCountry.code,
  disabled = false,
  required = false,
  placeholder,
  className,
  id,
  name
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    getCountryByCode(countryCode) || defaultCountry
  );
  const [phoneNumber, setPhoneNumber] = useState(stripPhonePrefix(value, selectedCountry));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.phonePrefix.includes(searchQuery)
  );

  // Update phone number when value prop changes
  useEffect(() => {
    setPhoneNumber(stripPhonePrefix(value, selectedCountry));
  }, [value, selectedCountry]);

  // Update selected country when countryCode prop changes
  useEffect(() => {
    const country = getCountryByCode(countryCode);
    if (country) {
      setSelectedCountry(country);
      // Also update phone number to strip prefix when country changes
      setPhoneNumber(stripPhonePrefix(value, country));
    }
  }, [countryCode, value]);

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow digits and limit to country max length
    const digitsOnly = inputValue.replace(/[^\d]/g, '').slice(0, selectedCountry.phoneLength.max);
    setPhoneNumber(digitsOnly);
    
    // Call onChange with full phone number (prefix + digits) and country code
    const fullPhone = `${selectedCountry.phonePrefix}${digitsOnly}`;
    onChange(fullPhone, selectedCountry.code);
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // Keep only digits and limit to new country's max length
    const digitsOnly = phoneNumber.replace(/[^\d]/g, '').slice(0, country.phoneLength.max);
    setPhoneNumber(digitsOnly);
    
    // Call onChange with full phone number (prefix + digits)
    const fullPhone = `${country.phonePrefix}${digitsOnly}`;
    onChange(fullPhone, country.code);
    
    // Focus back to phone input
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setSearchQuery('');
    }
  };

  const fullPhone = `${selectedCountry.phonePrefix}${phoneNumber}`;
  const isInvalid = required && phoneNumber && !validatePhoneNumber(fullPhone, selectedCountry);

  return (
    <div className={cn("relative", className)}>
      <div className="flex">
        {/* Country Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-3 py-2 h-10 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              "hover:bg-gray-100 transition-colors",
              isInvalid && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
            aria-label="Select country"
          >
            <span className="text-lg font-emoji">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.phonePrefix}</span>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-500 transition-transform",
              isDropdownOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 z-50 w-64 bg-white border border-gray-300 rounded-md shadow-lg mt-1">
              {/* Search Input */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Country List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 transition-colors",
                      selectedCountry.code === country.code && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <span className="text-lg font-emoji">{country.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.phonePrefix}</div>
                    </div>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No countries found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="tel"
            id={id}
            name={name}
            value={phoneNumber}
            onChange={handlePhoneChange}
            disabled={disabled}
            required={required}
            maxLength={selectedCountry.phoneLength.max}
            placeholder={placeholder || `Enter ${selectedCountry.phoneLength.max} digit number`}
            className={cn(
              "w-full h-10 pl-10 pr-3 py-2 border border-gray-300 rounded-r-md",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              "placeholder:text-gray-400",
              isInvalid && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
          />
        </div>
      </div>

      {/* Error Message */}
      {isInvalid && (
        <p className="mt-1 text-sm text-red-600">
          Please enter a valid {selectedCountry.name} phone number
        </p>
      )}
    </div>
  );
}
