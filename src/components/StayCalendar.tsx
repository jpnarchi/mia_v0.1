import React from 'react';

interface StayCalendarProps {
  checkIn: string;
  checkOut: string;
}

export const StayCalendar: React.FC<StayCalendarProps> = ({ checkIn, checkOut }) => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const getMonthDays = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateInRange = (date: Date) => {
    return date >= startDate && date <= endDate;
  };

  const isCheckInDate = (date: Date) => {
    return date.toDateString() === startDate.toDateString();
  };

  const isCheckOutDate = (date: Date) => {
    return date.toDateString() === endDate.toDateString();
  };

  const renderMonth = (year: number, month: number) => {
    const totalDays = getMonthDays(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }