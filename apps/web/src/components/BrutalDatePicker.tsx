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
  wrapperClassName?: string;
  isClearable?: boolean;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  startDate?: Date;
  endDate?: Date;
  minDate?: Date;
  maxDate?: Date;
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
  className = '',
  wrapperClassName = '',
  dateFormat,
  showTimeSelect = false,
  selected,
  onChange,
  ...rest
}: BrutalDatePickerProps) {
  const format = dateFormat ?? (showTimeSelect ? 'MMM d, yyyy h:mm aa' : 'MMM d, yyyy');

  return (
    <div className={`brutal-datepicker-wrapper ${wrapperClassName}`}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeIntervals={15}
        dateFormat={format}
        customInput={<BrutalInput className={`brutal-input text-sm ${className}`} />}
        popperPlacement="bottom-start"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        {...rest}
      />
    </div>
  );
}
