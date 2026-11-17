import { v4 as uuid } from "uuid";

export const generatePlan = (goal, level, daysPerWeek, raceDate) => {
  const workouts = [];

  const templates = {
    Beginner: {
      easy: "Easy Run",
      interval: "Intervals",
      long: "Long Run",
    },

    Intermediate: {
      easy: "Tempo Run",
      interval: "Intervals",
      long: "Long Run",
    },

    Advanced: {
      easy: "Tempo Run",
      interval: "VO2 Max",
      long: "Long Run",
    },
  };

  const workoutDetails = {
    "Easy Run": {
      trainingGoal: "Build aerobic endurance",

      description:
        "An easy-paced run designed to improve your aerobic base and recovery capacity.",

      recommendation:
        "Keep the effort comfortable. You should be able to maintain a conversation while running.",

      expectedPace: "Comfortable / conversational pace",

      intensity: "Low",
    },

    "Tempo Run": {
      trainingGoal: "Improve lactate threshold",

      description:
        "A controlled sustained effort designed to improve your ability to maintain a faster pace for longer.",

      recommendation:
        "Run at a controlled hard effort. You should feel challenged but still remain in control.",

      expectedPace: "Comfortably hard pace",

      intensity: "Moderate–High",
    },

    Intervals: {
      trainingGoal: "Improve speed and running efficiency",

      description:
        "High-intensity repetitions designed to improve speed, running economy and cardiovascular capacity.",

      recommendation:
        "Complete each interval with strong but controlled effort and allow enough recovery between repetitions.",

      expectedPace: "Fast / high-intensity effort",

      intensity: "High",
    },

    "VO2 Max": {
      trainingGoal: "Improve VO2 max",

      description:
        "A high-intensity workout designed to improve your maximal aerobic capacity.",

      recommendation:
        "Run the repetitions at a strong controlled effort. Avoid starting too fast.",

      expectedPace: "Very hard controlled effort",

      intensity: "Very High",
    },

    "Long Run": {
      trainingGoal: "Build endurance",

      description:
        "A longer aerobic run designed to improve endurance and prepare your body for longer distances.",

      recommendation:
        "Start conservatively and maintain a sustainable pace throughout the workout.",

      expectedPace: "Easy / conversational pace",

      intensity: "Low–Moderate",
    },
  };

  const days = {
    2: ["Tuesday", "Sunday"],
    3: ["Monday", "Wednesday", "Sunday"],
    4: ["Monday", "Wednesday", "Friday", "Sunday"],
    5: ["Monday", "Tuesday", "Thursday", "Friday", "Sunday"],
    6: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday", "Sunday"],
  };

  const longDistance = {
    "5K": 8,
    "10K": 14,
    "Half Marathon": 24,
    Marathon: 36,
  };

  const race = new Date(raceDate);

  const weeks = Math.max(
    4,
    Math.ceil((race - new Date()) / (1000 * 60 * 60 * 24 * 7)),
  );

  for (let week = 1; week <= weeks; week++) {
    const weekWorkouts = [];

    const currentLong = Math.round((longDistance[goal] / weeks) * week);

    days[daysPerWeek].forEach((day, index) => {
      let type = templates[level].easy;

      let distance = "5 km";
      let targetDistanceKm = 5;

      if (index === days[daysPerWeek].length - 1) {
        type = templates[level].long;

        distance = `${currentLong} km`;
        targetDistanceKm = currentLong;
      } else if (index === 1) {
        type = templates[level].interval;

        distance = "6 × 400m";
        targetDistanceKm = 2.4;
      }

      const details = workoutDetails[type];

      weekWorkouts.push({
        id: uuid(),

        day,

        dayIndex: index,

        type,

        distance,

        targetDistanceKm,

        completed: false,

        completedAt: null,

        history: [],

        trainingGoal: details?.trainingGoal || "General training",

        description:
          details?.description ||
          "Complete this workout according to your training plan.",

        recommendation:
          details?.recommendation ||
          "Keep the effort controlled and listen to your body.",

        expectedPace: details?.expectedPace || "Controlled pace",

        targetPace: null,

        intensity: details?.intensity || "Moderate",
      });
    });

    workouts.push({
      week,
      workouts: weekWorkouts,
    });
  }

  return workouts;
};
