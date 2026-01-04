"use client"
import React, { useState, useEffect } from 'react';

interface MealItem {
  id: string;
  label: string;
  category: string;
}

interface WorkoutExercise {
  id: string;
  label: string;
}

interface OptionalItem {
  id: string;
  label: string;
}

interface DayData {
  meals: Record<string, boolean>;
  workouts: Record<string, boolean>;
  optional: Record<string, boolean>;
  skincare: Record<string, boolean>;
}

interface StorageData {
  [date: string]: DayData;
}

const MealWorkoutTracker: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<StorageData>({});
  const [activeTab, setActiveTab] = useState<'meals' | 'workout' | 'skincare'>('meals');

  // Update date at midnight
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
    };

    // Check every minute if date has changed
    const interval = setInterval(() => {
      updateDate();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('mealWorkoutData');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mealWorkoutData', JSON.stringify(data));
  }, [data]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';
    
    return `${day}${suffix} ${month}`;
  };

  const getDayOfWeek = (): number => {
    const date = new Date(currentDate + 'T00:00:00');
    return date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  const getWorkoutDayNumber = (): number | null => {
    const dayOfWeek = getDayOfWeek();
    // Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = skip, Friday = 4, Saturday = 5, Sunday = skip
    const mapping: Record<number, number | null> = {
      0: null, // Sunday - no workout
      1: 1,    // Monday - Day 1
      2: 2,    // Tuesday - Day 2
      3: 3,    // Wednesday - Day 3
      4: null, // Thursday - no workout
      5: 4,    // Friday - Day 4
      6: 5,    // Saturday - Day 5
    };
    return mapping[dayOfWeek];
  };

  const getTodayData = (): DayData => {
    return data[currentDate] || {
      meals: {},
      workouts: {},
      optional: {},
      skincare: {}
    };
  };

  const toggleItem = (category: keyof DayData, item: string): void => {
    const newData = { ...data };
    if (!newData[currentDate]) {
      newData[currentDate] = { meals: {}, workouts: {}, optional: {}, skincare: {} };
    }
    newData[currentDate][category][item] = !newData[currentDate][category][item];
    setData(newData);
  };

  const getProgress = (category: keyof DayData): number => {
    const todayData = getTodayData();
    const items = todayData[category];
    
    let total = 0;
    if (category === 'meals') {
      total = meals.length;
    } else if (category === 'workouts') {
      total = currentWorkout ? currentWorkout.length : 0;
    } else if (category === 'optional') {
      total = optional.length;
    } else if (category === 'skincare') {
      const morningRoutine = skincareMorning.length;
      const nightRoutine = skincareNight.length;
      const weeklyRoutine = getDayOfWeek() === 0 ? skincareWeekly.length : 0;
      total = morningRoutine + nightRoutine + weeklyRoutine;
    }
    
    const completed = Object.values(items).filter(Boolean).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const meals: MealItem[] = [
    { id: 'breakfast_eggs', label: '3 whole eggs OR 2 eggs + 100g paneer bhurji', category: 'Breakfast' },
    { id: 'breakfast_fruit', label: '1 fruit', category: 'Breakfast' },
    { id: 'breakfast_drink', label: 'Black coffee or tea', category: 'Breakfast' },
    { id: 'lunch_protein', label: '120-150g chicken/fish OR paneer + dal', category: 'Lunch' },
    { id: 'lunch_carbs', label: '1 cup rice OR 2 rotis', category: 'Lunch' },
    { id: 'lunch_veggies', label: 'Big bowl of vegetables', category: 'Lunch' },
    { id: 'lunch_dairy', label: 'Curd or buttermilk', category: 'Lunch' },
    { id: 'snack_fruit', label: 'Banana or apple', category: 'Snack' },
    { id: 'snack_protein', label: 'Roasted chana/peanuts OR milk + almonds', category: 'Snack' },
    { id: 'dinner_protein', label: 'Paneer, eggs, or fish', category: 'Dinner' },
    { id: 'dinner_veggies', label: 'Stir-fried vegetables', category: 'Dinner' },
  ];

  const workoutPlans: Record<number, WorkoutExercise[]> = {
    1: [
      { id: 'bench_press', label: 'Bench press' },
      { id: 'overhead_press', label: 'Overhead press' },
      { id: 'incline_db', label: 'Incline dumbbell press' },
      { id: 'triceps_dips', label: 'Triceps dips' },
      { id: 'plank', label: 'Plank 3×45s' }
    ],
    2: [
      { id: 'squats', label: 'Squats' },
      { id: 'rdl', label: 'Romanian deadlifts' },
      { id: 'lunges', label: 'Lunges' },
      { id: 'calf_raises', label: 'Calf raises' },
      { id: 'leg_raises', label: 'Hanging leg raises' }
    ],
    3: [
      { id: 'pullups', label: 'Pull-ups / lat pulldown' },
      { id: 'barbell_rows', label: 'Barbell rows' },
      { id: 'face_pulls', label: 'Face pulls' },
      { id: 'biceps', label: 'Biceps curls' },
      { id: 'cable_crunch', label: 'Cable crunches' }
    ],
    4: [
      { id: 'kb_swings', label: 'Kettlebell swings' },
      { id: 'box_jumps', label: 'Box jumps / step-ups' },
      { id: 'battle_ropes', label: 'Battle ropes' },
      { id: 'farmers_walk', label: 'Farmer\'s walk' },
      { id: 'ab_circuit', label: 'Ab circuit (15 mins)' }
    ],
    5: [
      { id: 'deadlift', label: 'Deadlift (moderate)' },
      { id: 'pushups', label: 'Push-ups' },
      { id: 'pullups_fb', label: 'Pull-ups' },
      { id: 'shoulder_raises', label: 'Shoulder raises' },
      { id: 'planks_wheel', label: 'Planks + ab wheel' }
    ]
  };

  const optional: OptionalItem[] = [
    { id: 'water', label: '2.5–3L water' },
    { id: 'workout', label: 'Workout completed' },
    { id: 'sleep', label: '7–8 hours sleep' }
  ];

  const skincareMorning: MealItem[] = [
    { id: 'morning_brush', label: 'Brush teeth (2 minutes)', category: 'Morning' },
    { id: 'morning_rinse', label: 'Rinse face with water', category: 'Morning' },
    { id: 'morning_cleanse', label: 'Cleanse with Gabit facewash (20–30 seconds)', category: 'Morning' },
    { id: 'morning_moisturizer', label: 'Apply Gabit moisturizer (1–2 pumps on damp skin)', category: 'Morning' },
    { id: 'morning_sunscreen', label: 'Apply clay sunscreen (two-finger amount for face + neck)', category: 'Morning' },
    { id: 'morning_water', label: 'Drink 1–2 glasses of water', category: 'Morning' },
  ];

  const skincareNight: MealItem[] = [
    { id: 'night_brush', label: 'Brush teeth (2 minutes)', category: 'Night' },
    { id: 'night_cleanse', label: 'Cleanse with Gabit facewash', category: 'Night' },
    { id: 'night_moisturizer', label: 'Apply Gabit moisturizer (slightly thicker layer)', category: 'Night' },
    { id: 'night_wash_hands', label: 'Wash hands before sleep', category: 'Night' },
    { id: 'night_sleep', label: 'Sleep before midnight (ideal)', category: 'Night' },
  ];

  const skincareWeekly: MealItem[] = [
    { id: 'weekly_scrub', label: 'Clay scrub (once per week only)', category: 'Weekly' },
    { id: 'weekly_extra_moisturizer', label: 'Extra moisturizer after scrub', category: 'Weekly' },
  ];

  const workoutTitles: Record<number, string> = {
    1: 'Upper Push',
    2: 'Lower Body',
    3: 'Pull',
    4: 'Athletic + Core',
    5: 'Full Body'
  };

  const todayData = getTodayData();
  const dayNumber = getWorkoutDayNumber();
  const currentWorkout = dayNumber ? workoutPlans[dayNumber] : null;
  const mealProgress = getProgress('meals');
  const workoutProgress = getProgress('workouts');
  const skincareProgress = getProgress('skincare');
  const isSunday = getDayOfWeek() === 0;

  const getDayName = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[getDayOfWeek()];
  };

  let lastCategory = '';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-lg font-medium text-gray-900">{formatDate(currentDate)}</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('meals')}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === 'meals'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Meals {mealProgress > 0 && `· ${mealProgress}%`}
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === 'workout'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Workout {workoutProgress > 0 && `· ${workoutProgress}%`}
            </button>
            <button
              onClick={() => setActiveTab('skincare')}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === 'skincare'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Skincare {skincareProgress > 0 && `· ${skincareProgress}%`}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'meals' ? (
            <div className="space-y-1">
              {meals.map((meal) => {
                const showCategory = meal.category !== lastCategory;
                lastCategory = meal.category;
                return (
                  <div key={meal.id}>
                    {showCategory && (
                      <h3 className="text-xs font-medium text-gray-500 mt-6 mb-2 uppercase tracking-wide">
                        {meal.category}
                      </h3>
                    )}
                    <label className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={todayData.meals[meal.id] || false}
                        onChange={() => toggleItem('meals', meal.id)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-1 focus:ring-gray-900"
                      />
                      <span className={`flex-1 text-sm ${todayData.meals[meal.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {meal.label}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'skincare' ? (
            <div className="space-y-6">
              {/* Morning Routine */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                  Daily Morning Routine
                </h3>
                <div className="space-y-1">
                  {skincareMorning.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={todayData.skincare[item.id] || false}
                        onChange={() => toggleItem('skincare', item.id)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-1 focus:ring-gray-900"
                      />
                      <span className={`flex-1 text-sm ${todayData.skincare[item.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Night Routine */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                  Daily Night Routine
                </h3>
                <div className="space-y-1">
                  {skincareNight.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={todayData.skincare[item.id] || false}
                        onChange={() => toggleItem('skincare', item.id)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-1 focus:ring-gray-900"
                      />
                      <span className={`flex-1 text-sm ${todayData.skincare[item.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weekly Routine - Only on Sundays */}
              {isSunday && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                    Weekly Care (Night Only)
                  </h3>
                  <div className="space-y-1">
                    {skincareWeekly.map((item) => (
                      <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={todayData.skincare[item.id] || false}
                          onChange={() => toggleItem('skincare', item.id)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-1 focus:ring-gray-900"
                        />
                        <span className={`flex-1 text-sm ${todayData.skincare[item.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {dayNumber ? (
                <>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide">
                      {getDayName()} · Day {dayNumber} · {workoutTitles[dayNumber]}
                    </h3>

                    <div className="space-y-1">
                      {currentWorkout?.map((exercise) => (
                        <label key={exercise.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={todayData.workouts[exercise.id] || false}
                            onChange={() => toggleItem('workouts', exercise.id)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-1 focus:ring-gray-900"
                          />
                          <span className={`flex-1 text-sm ${todayData.workouts[exercise.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {exercise.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                      Daily Habits
                    </h3>
                    <div className="space-y-1">
                      {optional.map((item) => (
                        <label key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={todayData.optional[item.id] || false}
                            onChange={() => toggleItem('optional', item.id)}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-1 focus:ring-gray-900"
                          />
                          <span className={`flex-1 text-sm ${todayData.optional[item.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">Rest day - {getDayName()}</p>
                  <p className="text-gray-400 text-xs mt-2">No workout scheduled for today</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealWorkoutTracker;
