'use client';

import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BrutalDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  dateFormat?: string;
  placeholderText?: string;
  className?: string;
  isClearable?: boolean;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  minDate?: Date | null;
  maxDate?: Date | null;
}

const BrutalInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void; placeholder?: string; className?: string }>(
  ({ value, onClick, placeholder, className }, ref) => (
    <input
      ref={ref}
      type="text"
      value={value}
      onClick={onClick}
      readOnly
      placeholder={placeholder}
      className={className}
    />
  ),
);
BrutalInput.displayName = 'BrutalInput';

export function BrutalDatePicker({
  selected,
  onChange,
  showTimeSelect = false,
  dateFormat,
  placeholderText = 'Select date',
  className = '',
  isClearable = false,
  selectsStart,
  selectsEnd,
  startDate,
  endDate,
  minDate,
  maxDate,
}: BrutalDatePickerProps) {
  const format = dateFormat ?? (showTimeSelect ? 'MMM d, yyyy h:mm aa' : 'MMM d, yyyy');

  return (
    <div className="brutal-datepicker-wrapper">
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeIntervals={15}
        dateFormat={format}
        placeholderText={placeholderText}
        isClearable={isClearable}
        customInput={<BrutalInput className={`brutal-input text-sm ${className}`} />}
        selectsStart={selectsStart}
        selectsEnd={selectsEnd}
        startDate={startDate ?? undefined}
        endDate={endDate ?? undefined}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        popperPlacement="bottom-start"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
    </div>
  );
}
