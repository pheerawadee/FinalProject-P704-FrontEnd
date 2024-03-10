import React, { useState, useEffect, Fragment } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

interface SpeedData {
  id: String;
  datetime: string;
  speed: number;
  date: any;
}

const Heatmap: React.FC = () => {
  const [speedData, setSpeedData] = useState<SpeedData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // Initialize with current month
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Initialize with current year
  const [selectedWeek, setSelectedWeek] = useState<number>(1); // Initialize with first week
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours()); // Current hour
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number } | null>(null);

  useEffect(() => {
    // Fetch data from Firestore
    const fetchData = async () => {
      try {
        const snapshot = await db.collection('slot')
          .where('datetime', '>=', new Date(selectedYear, selectedMonth, selectedWeek * 7 - 6)) // Filter by start of selected week
          .where('datetime', '<=', new Date(selectedYear, selectedMonth, selectedWeek * 7)) // Filter by end of selected week
          .onSnapshot(snapshot => {
            const data: SpeedData[] = [];
            snapshot.forEach(doc => {
              const docId = doc.id; // Get document ID
              const datetime = new Date(doc.data().datetime.toDate()); // Convert timestamp to Date
              datetime.setHours(datetime.getHours() - 7); // Adjust to GMT+7
              const day = datetime.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(); // Get day
              const hour = datetime.getHours(); // Get hour
              data.push({ id: docId, datetime: `${day}-${hour}`, speed: doc.data().speed, date: datetime }); // Combine day and hour
            })
            setSpeedData(data);
          });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    

    fetchData();

    // Unsubscribe from snapshot listener when component unmounts
    return () => {
      fetchData();
    };
  }, [selectedMonth, selectedYear, selectedWeek]); // Update when selected month, year, or week changes

  useEffect(() => {
    // Initial setup: fetch data and set today's date
    handleTodayClick();

    // Update current hour every minute
    const intervalId = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Run only once on component mount

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 08.00-22.00

  const handleMonthChange = (increment: number) => {
    setSelectedMonth(prevMonth => (prevMonth + increment + 12) % 12); // Ensure it loops around to 0 when going before January
    setSelectedYear(prevYear => selectedMonth === 11 && increment === 1 ? prevYear + 1 : selectedMonth === 0 && increment === -1 ? prevYear - 1 : prevYear); // Increment/decrement year accordingly
    setSelectedWeek(1); // Reset week to first week of the month
  };

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };

  const handleTodayClick = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentWeek = Math.ceil((currentDate.getDate() + new Date(currentYear, currentMonth, 1).getDay()) / 7);

    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSelectedWeek(currentWeek);
  };

  const isCurrentHour = (dayIndex: number, hour: number) => {
    const currentDateTime = new Date();
    return (
      currentDateTime.getDay() === dayIndex &&
      currentDateTime.getHours() === hour &&
      currentDateTime.getMonth() === selectedMonth &&
      currentDateTime.getFullYear() === selectedYear &&
      Math.ceil((currentDateTime.getDate() + new Date(selectedYear, selectedMonth, 1).getDay()) / 7) === selectedWeek
    );
  };

  const handleCellHover = (day: string, hour: number) => {
    setHoveredCell({ day, hour });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  const getSemester = () => {
    const yearStartMonth = 7; // July
    const yearEndMonth = 6; // June
  
    const adjustedMonth = (selectedMonth + 12 - yearStartMonth) % 12;
  
    if (adjustedMonth >= 0 && adjustedMonth <= 3) {
      return `1st Semester (July - October)`;
    } else if (adjustedMonth >= 4 && adjustedMonth <= 7) {
      return `2nd Semester (November - March)`;
    } else {
      return `Summer Semester (April - June)`;
    }
  };
  
  

  return (
    <div className="relative flex justify-center items-center">
      <div className="w-full max-w-4xl">
        {/* Semester information */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">{getSemester()}</h2>
        </div>

        {/* Month and year selection */}
        <div className="flex justify-center items-center mb-5 sm:mb-10">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-1" onClick={() => handleMonthChange(-1)}>{`⊲`}</button>
          <h2 className="mx-2 text-lg sm:text-xl">{new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={() => handleMonthChange(1)}>{`⊳`}</button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleTodayClick}>Today</button>
        </div>

        {/* Week selection */}
        <div className="flex justify-center items-center">
          {[...Array(5)].map((_, weekIndex) => (
            <button
              key={weekIndex}
              className={`bg-blue-500 text-white  py-1 px-2 rounded mr-2 btn ${selectedWeek === weekIndex + 1 ? 'bg-green-700' :''}`}
              onClick={() => handleWeekChange(weekIndex + 1)}
            >
              {`Week ${weekIndex + 1}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-8 gap-1 m-5 content-center">
          {/* Empty cell for alignment */}
          <div></div>
          {/* Render day labels */}
          {days.map((day, index) => (
            <div key={index} className="text-center bg-gray-200 ">
              {day}
            </div>
          ))}

          {/* Render heatmap */}
          {hours.map(hour => (
            <Fragment key={hour}>
              {/* Render hour range label */}
              <div className="text-center text-xs bg-gray-200 p-2">{`${hour.toString().padStart(2, '0')}.01-${(hour + 1).toString().padStart(2, '0')}.00`}</div>
              {/* Render heatmap cells for each day */}
              {days.map((day, dayIndex) => {
                const speedRecord = speedData.find(record => record.datetime === `${day}-${hour}`);
                let bgColor = 'bg-gray-200'; // Default color
                if (speedRecord) {
                  // Determine background color based on speed
                  if (speedRecord.speed >= 12) {
                    bgColor = 'bg-green-500';
                  } else if (speedRecord.speed >= 7) {
                    bgColor = 'bg-yellow-500';
                  } else {
                    bgColor = 'bg-red-500';
                  }
                }
                const cellClasses = `text-center text-white text-sm p-1 ${bgColor} aspect-w-1 aspect-h-1 ${isCurrentHour(dayIndex, hour) ? 'border border-blue-500' : ''}`;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={cellClasses}
                    onMouseEnter={() => handleCellHover(day, hour)}
                    onMouseLeave={handleCellLeave}
                  >
                    {/* Render speed data or any other content */}
                    {hoveredCell?.day === day && hoveredCell?.hour === hour && speedRecord && (
                      <div className="absolute z-10 rounded rounded-lg bg-blue-700 p-2 text-white text-left shadow-md">
                        {/* <div>ID: {(speedRecord.id)}</div> */}
                        <div>Date: {new Date(speedRecord.date).toLocaleDateString('en-GB')}</div>
                        {/* <div>Time: {(speedRecord.datetime)}</div> */}
                        <div>Speed: {speedRecord.speed.toFixed(2)} km/hr</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
