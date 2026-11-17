import { GiPathDistance, GiRunningShoe } from "react-icons/gi";

import { MdSpeed, MdTimer } from "react-icons/md";

import { FaRunning, FaFire, FaRoad } from "react-icons/fa";

import { TbMedal, TbMountain } from "react-icons/tb";



export const ACHIEVEMENTS = [

  {

    key: "distance_1k",

    category: "distance",

    title: "First Kilometer",

    description: "Complete your first 1 km run",

    icon: GiPathDistance,

    requirement: 1,

    unit: "km",

    type: "single_run_distance",

  },



  {

    key: "distance_2k",

    category: "distance",

    title: "2K Runner",

    description: "Complete a 2 km run",

    icon: GiPathDistance,

    requirement: 2,

    unit: "km",

    type: "single_run_distance",

  },



  {

    key: "distance_5k",

    category: "distance",

    title: "5K Runner",

    description: "Complete a 5 km run",

    icon: GiPathDistance,

    requirement: 5,

    unit: "km",

    type: "single_run_distance",

  },



  {

    key: "distance_10k",

    category: "distance",

    title: "10K Runner",

    description: "Complete a 10 km run",

    icon: GiPathDistance,

    requirement: 10,

    unit: "km",

    type: "single_run_distance",

  },



  {

    key: "distance_20k",

    category: "distance",

    title: "20K Runner",

    description: "Complete a 20 km run",

    icon: GiPathDistance,

    requirement: 20,

    unit: "km",

    type: "single_run_distance",

  },



  {

    key: "distance_half_marathon",

    category: "distance",

    title: "Half Marathon",

    description: "Complete a 21.1 km run",

    icon: TbMountain,

    requirement: 21.1,

    unit: "km",

    type: "single_run_distance",

  },



  {

    key: "distance_marathon",

    category: "distance",

    title: "Marathon",

    description: "Complete a 42.195 km run",

    icon: TbMountain,

    requirement: 42.195,

    unit: "km",

    type: "single_run_distance",

  },



  {

    key: "total_distance_10",

    category: "total_distance",

    title: "10 KM Total",

    description: "Run 10 km in total",

    icon: FaRoad,

    requirement: 10,

    unit: "km",

    type: "total_distance",

  },



  {

    key: "total_distance_50",

    category: "total_distance",

    title: "50 KM Total",

    description: "Run 50 km in total",

    icon: FaRoad,

    requirement: 50,

    unit: "km",

    type: "total_distance",

  },



  {

    key: "total_distance_100",

    category: "total_distance",

    title: "100 KM Total",

    description: "Run 100 km in total",

    icon: FaRoad,

    requirement: 100,

    unit: "km",

    type: "total_distance",

  },



  {

    key: "total_distance_500",

    category: "total_distance",

    title: "500 KM Total",

    description: "Run 500 km in total",

    icon: FaRoad,

    requirement: 500,

    unit: "km",

    type: "total_distance",

  },



  {

    key: "total_distance_1000",

    category: "total_distance",

    title: "1000 KM Total",

    description: "Run 1000 km in total",

    icon: FaRoad,

    requirement: 1000,

    unit: "km",

    type: "total_distance",

  },



  {

    key: "runs_1",

    category: "runs",

    title: "First Run",

    description: "Complete your first run",

    icon: FaRunning,

    requirement: 1,

    unit: "runs",

    type: "run_count",

  },



  {

    key: "runs_5",

    category: "runs",

    title: "5 Runs",

    description: "Complete 5 runs",

    icon: FaRunning,

    requirement: 5,

    unit: "runs",

    type: "run_count",

  },



  {

    key: "runs_10",

    category: "runs",

    title: "10 Runs",

    description: "Complete 10 runs",

    icon: FaRunning,

    requirement: 10,

    unit: "runs",

    type: "run_count",

  },



  {

    key: "runs_25",

    category: "runs",

    title: "25 Runs",

    description: "Complete 25 runs",

    icon: FaRunning,

    requirement: 25,

    unit: "runs",

    type: "run_count",

  },



  {

    key: "runs_50",

    category: "runs",

    title: "50 Runs",

    description: "Complete 50 runs",

    icon: FaRunning,

    requirement: 50,

    unit: "runs",

    type: "run_count",

  },



  {

    key: "runs_100",

    category: "runs",

    title: "100 Runs",

    description: "Complete 100 runs",

    icon: FaRunning,

    requirement: 100,

    unit: "runs",

    type: "run_count",

  },



  {

    key: "pace_under_6",

    category: "pace",

    title: "Sub 6",

    description: "Complete a run with an average pace under 6:00 min/km",

    icon: MdSpeed,

    requirement: 6,

    unit: "min/km",

    type: "pace",

  },



  {

    key: "pace_under_5",

    category: "pace",

    title: "Sub 5",

    description: "Complete a run with an average pace under 5:00 min/km",

    icon: MdSpeed,

    requirement: 5,

    unit: "min/km",

    type: "pace",

  },



  {

    key: "pace_under_4_30",

    category: "pace",

    title: "Fast Runner",

    description: "Complete a run with an average pace under 4:30 min/km",

    icon: MdSpeed,

    requirement: 4.5,

    unit: "min/km",

    type: "pace",

  },



  {

    key: "pace_under_4",

    category: "pace",

    title: "Sub 4",

    description: "Complete a run with an average pace under 4:00 min/km",

    icon: MdSpeed,

    requirement: 4,

    unit: "min/km",

    type: "pace",

  },



  {

    key: "steps_1000",

    category: "steps",

    title: "1K Steps",

    description: "Complete a run with at least 1,000 steps",

    icon: GiRunningShoe,

    requirement: 1000,

    unit: "steps",

    type: "steps",

  },



  {

    key: "steps_5000",

    category: "steps",

    title: "5K Steps",

    description: "Complete a run with at least 5,000 steps",

    icon: GiRunningShoe,

    requirement: 5000,

    unit: "steps",

    type: "steps",

  },



  {

    key: "steps_10000",

    category: "steps",

    title: "10K Steps",

    description: "Complete a run with at least 10,000 steps",

    icon: GiRunningShoe,

    requirement: 10000,

    unit: "steps",

    type: "steps",

  },



  {

    key: "time_1h",

    category: "time",

    title: "One Hour Running",

    description: "Spend 1 hour running",

    icon: MdTimer,

    requirement: 60,

    unit: "minutes",

    type: "total_time",

  },



  {

    key: "time_10h",

    category: "time",

    title: "10 Hours Running",

    description: "Spend 10 hours running",

    icon: MdTimer,

    requirement: 600,

    unit: "minutes",

    type: "total_time",

  },



  {

    key: "time_50h",

    category: "time",

    title: "50 Hours Running",

    description: "Spend 50 hours running",

    icon: MdTimer,

    requirement: 3000,

    unit: "minutes",

    type: "total_time",

  },



  {

    key: "longest_10k",

    category: "longest",

    title: "Going Long",

    description: "Complete a run of at least 10 km",

    icon: TbMedal,

    requirement: 10,

    unit: "km",

    type: "longest_run",

  },



  {

    key: "longest_20k",

    category: "longest",

    title: "Long Distance",

    description: "Complete a run of at least 20 km",

    icon: TbMedal,

    requirement: 20,

    unit: "km",

    type: "longest_run",

  },



  {

    key: "longest_30k",

    category: "longest",

    title: "Ultra Training",

    description: "Complete a run of at least 30 km",

    icon: TbMedal,

    requirement: 30,

    unit: "km",

    type: "longest_run",

  },



  {

    key: "streak_3",

    category: "streak",

    title: "3 Day Streak",

    description: "Run for 3 consecutive days",

    icon: FaFire,

    requirement: 3,

    unit: "days",

    type: "streak",

  },



  {

    key: "streak_7",

    category: "streak",

    title: "7 Day Streak",

    description: "Run for 7 consecutive days",

    icon: FaFire,

    requirement: 7,

    unit: "days",

    type: "streak",

  },



  {

    key: "streak_14",

    category: "streak",

    title: "14 Day Streak",

    description: "Run for 14 consecutive days",

    icon: FaFire,

    requirement: 14,

    unit: "days",

    type: "streak",

  },



  {

    key: "streak_30",

    category: "streak",

    title: "30 Day Streak",

    description: "Run for 30 consecutive days",

    icon: FaFire,

    requirement: 30,

    unit: "days",

    type: "streak",

  },

];

// Additional running milestones; original achievement keys remain intact.
ACHIEVEMENTS.push(
  { key: 'running_extra_single_0_5', category: 'distance', title: '0.5 KM Run', description: 'Run 0.5 km in a single activity', icon: GiPathDistance, requirement: 0.5, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_single_3', category: 'distance', title: '3 KM Run', description: 'Run 3 km in a single activity', icon: GiPathDistance, requirement: 3, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_single_7', category: 'distance', title: '7 KM Run', description: 'Run 7 km in a single activity', icon: GiPathDistance, requirement: 7, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_single_15', category: 'distance', title: '15 KM Run', description: 'Run 15 km in a single activity', icon: GiPathDistance, requirement: 15, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_single_25', category: 'distance', title: '25 KM Run', description: 'Run 25 km in a single activity', icon: GiPathDistance, requirement: 25, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_single_30', category: 'distance', title: '30 KM Run', description: 'Run 30 km in a single activity', icon: GiPathDistance, requirement: 30, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_single_50', category: 'distance', title: '50 KM Run', description: 'Run 50 km in a single activity', icon: GiPathDistance, requirement: 50, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_single_75', category: 'distance', title: '75 KM Run', description: 'Run 75 km in a single activity', icon: GiPathDistance, requirement: 75, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_single_100', category: 'distance', title: '100 KM Run', description: 'Run 100 km in a single activity', icon: GiPathDistance, requirement: 100, unit: 'km', type: 'single_run_distance' },
  { key: 'running_extra_total_1', category: 'total_distance', title: '1 KM Total', description: 'Accumulate 1 km of running', icon: FaRoad, requirement: 1, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_5', category: 'total_distance', title: '5 KM Total', description: 'Accumulate 5 km of running', icon: FaRoad, requirement: 5, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_25', category: 'total_distance', title: '25 KM Total', description: 'Accumulate 25 km of running', icon: FaRoad, requirement: 25, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_75', category: 'total_distance', title: '75 KM Total', description: 'Accumulate 75 km of running', icon: FaRoad, requirement: 75, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_150', category: 'total_distance', title: '150 KM Total', description: 'Accumulate 150 km of running', icon: FaRoad, requirement: 150, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_250', category: 'total_distance', title: '250 KM Total', description: 'Accumulate 250 km of running', icon: FaRoad, requirement: 250, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_750', category: 'total_distance', title: '750 KM Total', description: 'Accumulate 750 km of running', icon: FaRoad, requirement: 750, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_1500', category: 'total_distance', title: '1500 KM Total', description: 'Accumulate 1500 km of running', icon: FaRoad, requirement: 1500, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_2500', category: 'total_distance', title: '2500 KM Total', description: 'Accumulate 2500 km of running', icon: FaRoad, requirement: 2500, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_5000', category: 'total_distance', title: '5000 KM Total', description: 'Accumulate 5000 km of running', icon: FaRoad, requirement: 5000, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_total_10000', category: 'total_distance', title: '10000 KM Total', description: 'Accumulate 10000 km of running', icon: FaRoad, requirement: 10000, unit: 'km', type: 'total_distance' },
  { key: 'running_extra_count_2', category: 'runs', title: '2 Runs', description: 'Complete 2 running sessions', icon: FaRunning, requirement: 2, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_3', category: 'runs', title: '3 Runs', description: 'Complete 3 running sessions', icon: FaRunning, requirement: 3, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_7', category: 'runs', title: '7 Runs', description: 'Complete 7 running sessions', icon: FaRunning, requirement: 7, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_15', category: 'runs', title: '15 Runs', description: 'Complete 15 running sessions', icon: FaRunning, requirement: 15, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_20', category: 'runs', title: '20 Runs', description: 'Complete 20 running sessions', icon: FaRunning, requirement: 20, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_75', category: 'runs', title: '75 Runs', description: 'Complete 75 running sessions', icon: FaRunning, requirement: 75, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_150', category: 'runs', title: '150 Runs', description: 'Complete 150 running sessions', icon: FaRunning, requirement: 150, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_200', category: 'runs', title: '200 Runs', description: 'Complete 200 running sessions', icon: FaRunning, requirement: 200, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_300', category: 'runs', title: '300 Runs', description: 'Complete 300 running sessions', icon: FaRunning, requirement: 300, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_count_500', category: 'runs', title: '500 Runs', description: 'Complete 500 running sessions', icon: FaRunning, requirement: 500, unit: 'runs', type: 'run_count' },
  { key: 'running_extra_steps_100', category: 'steps', title: '100 Steps', description: 'Record 100 steps in one run', icon: GiRunningShoe, requirement: 100, unit: 'steps', type: 'steps' },
  { key: 'running_extra_steps_250', category: 'steps', title: '250 Steps', description: 'Record 250 steps in one run', icon: GiRunningShoe, requirement: 250, unit: 'steps', type: 'steps' },
  { key: 'running_extra_steps_500', category: 'steps', title: '500 Steps', description: 'Record 500 steps in one run', icon: GiRunningShoe, requirement: 500, unit: 'steps', type: 'steps' },
  { key: 'running_extra_steps_2000', category: 'steps', title: '2,000 Steps', description: 'Record 2,000 steps in one run', icon: GiRunningShoe, requirement: 2000, unit: 'steps', type: 'steps' },
  { key: 'running_extra_steps_3000', category: 'steps', title: '3,000 Steps', description: 'Record 3,000 steps in one run', icon: GiRunningShoe, requirement: 3000, unit: 'steps', type: 'steps' },
  { key: 'running_extra_steps_7500', category: 'steps', title: '7,500 Steps', description: 'Record 7,500 steps in one run', icon: GiRunningShoe, requirement: 7500, unit: 'steps', type: 'steps' },
  { key: 'running_extra_steps_15000', category: 'steps', title: '15,000 Steps', description: 'Record 15,000 steps in one run', icon: GiRunningShoe, requirement: 15000, unit: 'steps', type: 'steps' },
  { key: 'running_extra_steps_20000', category: 'steps', title: '20,000 Steps', description: 'Record 20,000 steps in one run', icon: GiRunningShoe, requirement: 20000, unit: 'steps', type: 'steps' },
  { key: 'running_extra_steps_30000', category: 'steps', title: '30,000 Steps', description: 'Record 30,000 steps in one run', icon: GiRunningShoe, requirement: 30000, unit: 'steps', type: 'steps' },
  { key: 'running_extra_time_120', category: 'time', title: '120 Minutes Total', description: 'Accumulate 120 minutes of running', icon: MdTimer, requirement: 120, unit: 'minutes', type: 'total_time' },
  { key: 'running_extra_time_300', category: 'time', title: '300 Minutes Total', description: 'Accumulate 300 minutes of running', icon: MdTimer, requirement: 300, unit: 'minutes', type: 'total_time' },
  { key: 'running_extra_time_1200', category: 'time', title: '1200 Minutes Total', description: 'Accumulate 1200 minutes of running', icon: MdTimer, requirement: 1200, unit: 'minutes', type: 'total_time' },
  { key: 'running_extra_time_6000', category: 'time', title: '6000 Minutes Total', description: 'Accumulate 6000 minutes of running', icon: MdTimer, requirement: 6000, unit: 'minutes', type: 'total_time' },
  { key: 'running_extra_time_12000', category: 'time', title: '12000 Minutes Total', description: 'Accumulate 12000 minutes of running', icon: MdTimer, requirement: 12000, unit: 'minutes', type: 'total_time' },
  { key: 'running_extra_time_30000', category: 'time', title: '30000 Minutes Total', description: 'Accumulate 30000 minutes of running', icon: MdTimer, requirement: 30000, unit: 'minutes', type: 'total_time' },
  { key: 'running_extra_streak_2', category: 'streak', title: '2-Day Running Streak', description: 'Run on 2 consecutive days', icon: FaFire, requirement: 2, unit: 'days', type: 'streak' },
  { key: 'running_extra_streak_5', category: 'streak', title: '5-Day Running Streak', description: 'Run on 5 consecutive days', icon: FaFire, requirement: 5, unit: 'days', type: 'streak' },
  { key: 'running_extra_streak_10', category: 'streak', title: '10-Day Running Streak', description: 'Run on 10 consecutive days', icon: FaFire, requirement: 10, unit: 'days', type: 'streak' },
  { key: 'running_extra_streak_21', category: 'streak', title: '21-Day Running Streak', description: 'Run on 21 consecutive days', icon: FaFire, requirement: 21, unit: 'days', type: 'streak' },
  { key: 'running_extra_streak_60', category: 'streak', title: '60-Day Running Streak', description: 'Run on 60 consecutive days', icon: FaFire, requirement: 60, unit: 'days', type: 'streak' },
  { key: 'running_extra_streak_90', category: 'streak', title: '90-Day Running Streak', description: 'Run on 90 consecutive days', icon: FaFire, requirement: 90, unit: 'days', type: 'streak' },
  { key: 'running_extra_streak_100', category: 'streak', title: '100-Day Running Streak', description: 'Run on 100 consecutive days', icon: FaFire, requirement: 100, unit: 'days', type: 'streak' },
  { key: 'running_extra_pace_7', category: 'pace', title: 'Sub 7 Pace', description: 'Average pace at most 7 min/km in one run', icon: MdSpeed, requirement: 7, unit: 'min/km', type: 'pace' },
  { key: 'running_extra_pace_5_5', category: 'pace', title: 'Sub 5.5 Pace', description: 'Average pace at most 5.5 min/km in one run', icon: MdSpeed, requirement: 5.5, unit: 'min/km', type: 'pace' },
  { key: 'running_extra_pace_4_75', category: 'pace', title: 'Sub 4.75 Pace', description: 'Average pace at most 4.75 min/km in one run', icon: MdSpeed, requirement: 4.75, unit: 'min/km', type: 'pace' },
  { key: 'running_extra_pace_3_5', category: 'pace', title: 'Sub 3.5 Pace', description: 'Average pace at most 3.5 min/km in one run', icon: MdSpeed, requirement: 3.5, unit: 'min/km', type: 'pace' }
);
