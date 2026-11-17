import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase";

const articles = [
  // =========================================================
  // BEGINNERS
  // =========================================================

  {
    slug: "how-to-start-running-beginners-guide",

    title: "How to Start Running: A Beginner's Guide",

    excerpt:
      "A practical, evidence-based guide to starting running gradually, building consistency and avoiding the mistake of doing too much too soon.",

    category: "Beginners",

    content: `Starting to run does not mean that you need to run several kilometres from your first session.

For many beginners, one of the most useful approaches is to combine short periods of easy running with walking. This allows you to gradually become comfortable with the physical demands of running without making every session exhausting.

The NHS Couch to 5K programme is a good example of a gradual approach. It uses three running sessions per week, with rest days between them, and progressively increases the amount of running over nine weeks.

A beginner session can start with around five minutes of comfortable walking. You can then alternate easy running with walking according to your current fitness level.

Your first goal should not be running fast.

Your first goal should be becoming comfortable with running regularly.

### Start with manageable sessions

A useful beginner structure is:

- Begin with a walking warm-up.
- Use short periods of comfortable running.
- Walk between running intervals when needed.
- Finish with easy walking.
- Leave recovery days between harder sessions.

You do not need to complete a particular distance during your first workout.

For a new runner, the ability to repeat training consistently is often more valuable than completing one difficult session.

### Progress gradually

As your fitness improves, you can gradually increase the amount of continuous running.

You do not have to increase distance every week.

Your progression can come from running for slightly longer, walking for slightly less time, or simply becoming more comfortable at the same workload.

Avoid making several large changes at the same time.

For example, increasing distance, speed and number of training days simultaneously can make the total training load rise quickly.

### Do not worry about pace

Many beginners make the mistake of comparing their pace with other runners.

Your appropriate pace depends on your current fitness, experience, terrain, weather and recovery.

During early training, focus on controlled effort rather than trying to achieve a particular kilometre pace.

### Recovery is part of training

Rest days are not wasted days.

Your body needs time to recover and adapt to the training stimulus.

The NHS Couch to 5K programme specifically recommends rest days between running sessions.

### A simple beginner checklist

Before increasing your training, ask yourself:

- Can I complete my current sessions comfortably?
- Am I recovering between workouts?
- Is my energy level generally good?
- Am I increasing the workload gradually?
- Am I experiencing persistent or worsening pain?

If the answer to these questions is generally positive, gradual progression is usually more sensible than suddenly adding a large amount of training.

If you experience significant pain, unusual symptoms or have concerns about whether vigorous exercise is appropriate for you, consider speaking with a qualified healthcare professional before starting a new training programme.`,

    source: "NHS Couch to 5K; WHO Physical Activity Guidelines",
  },

  {
    slug: "why-easy-running-is-best-place-to-start",

    title: "Why Easy Running Is the Best Place to Start",

    excerpt:
      "Beginners often try to run too fast. Learn why controlled running can make training more sustainable and consistent.",

    category: "Beginners",

    content: `One of the most common mistakes new runners make is trying to run every session as fast as possible.

Running should not always feel like a race.

Easy running allows you to accumulate training without turning every workout into a maximal effort.

### What does easy running feel like?

There is no single easy pace that works for every runner.

A pace that feels easy for an experienced runner may be difficult for a beginner.

Instead of focusing only on the number displayed on your watch, pay attention to how controlled the effort feels.

You should feel that you are working, but you should not feel like you are racing.

Your breathing, terrain, weather, fitness and fatigue can all change the pace that feels easy on a particular day.

### Why beginners benefit from controlled effort

When you are starting to run, your body needs time to adapt to repeated impact and the cardiovascular demands of exercise.

Running every session hard can make recovery more difficult.

It can also make consistency harder because the next workout may feel unnecessarily difficult.

A controlled session gives you the opportunity to practise running while keeping the overall training stress manageable.

### Pace is individual

Two runners can run the same route at completely different speeds while both are training appropriately.

Your pace depends on:

- Current fitness
- Running experience
- Terrain
- Weather
- Sleep
- Recovery
- Training history
- Individual physiology

This is why copying another runner's pace is rarely useful for a beginner.

### When should you run faster?

Faster training can have a place in a structured programme.

However, beginners usually benefit from first developing the ability to run consistently.

Once regular running becomes comfortable, faster sessions can be introduced according to your goals and experience.

The important point is that harder running should be a deliberate part of training rather than the default intensity of every run.

### A simple rule

When in doubt, slow down.

If you finish an easy session feeling that you could have done a little more, that can be a much better starting point than finishing completely exhausted.

Build the habit first.

Speed can come later.`,

    source: "NHS Couch to 5K; WHO Physical Activity Guidelines",
  },

  {
    slug: "running-motivation-how-to-stay-consistent",

    title: "How to Stay Motivated to Run Consistently",

    excerpt:
      "Motivation comes and goes. Learn how to build a running routine that does not depend on feeling motivated every day.",

    category: "Beginners",

    content: `Many people start running with a lot of motivation and then stop a few weeks later.

The problem is often not a lack of discipline.

The training routine may simply be too difficult to maintain.

Consistency becomes easier when running fits naturally into your schedule.

### Make the goal smaller

Instead of thinking about running for months, focus on the next session.

A goal such as "I will run three times this week" is easier to act on than a vague goal such as "I need to become a good runner."

Small successful sessions build confidence.

### Create a routine

Try to run at approximately the same time on specific days.

For example:

- Tuesday morning
- Thursday evening
- Saturday morning

The exact schedule does not matter as much as having a predictable routine.

### Do not make every run difficult

If every session feels exhausting, motivation will eventually decrease.

Easy running makes it easier to finish a session feeling positive rather than completely drained.

### Track progress

Progress is not only a faster pace.

You can also improve by:

- Running longer
- Walking less
- Recovering faster
- Feeling more comfortable
- Training more consistently
- Completing sessions you previously found difficult

Look at the bigger picture.

### Expect bad days

Some runs will feel great.

Others will feel slow and uncomfortable.

That does not mean your fitness disappeared.

Sleep, stress, weather, nutrition and workload can all influence how a particular run feels.

### Build a habit

The strongest running routine is one you can repeat.

You do not need to feel motivated before every session.

You need a realistic plan that makes the next session easy enough to start.`,

    source: "WHO Physical Activity Guidelines; NHS Couch to 5K",
  },

  {
    slug: "run-walk-method-for-beginners",

    title: "The Run-Walk Method: A Simple Way to Start",

    excerpt:
      "Alternating running and walking can be an effective and approachable way to begin building running fitness.",

    category: "Beginners",

    content: `Running continuously is not the only way to start running.

The run-walk method alternates periods of easy running with periods of walking.

This approach can make the first weeks of training more manageable.

### Why use run-walk intervals?

Running places more mechanical demand on the body than walking.

Alternating running and walking allows you to accumulate running time while controlling the overall effort.

It can also make the session feel less intimidating for someone who has not exercised regularly.

### A simple example

A beginner might try:

- Five minutes of walking
- One minute of easy running
- Two minutes of walking
- Repeat several times
- Finish with easy walking

The exact intervals should match your current ability.

There is no requirement to use a specific ratio.

### Progress slowly

Over time, you can gradually increase the running intervals or reduce the walking intervals.

For example, you might eventually move from:

- 1 minute running / 2 minutes walking

to:

- 2 minutes running / 2 minutes walking

and later:

- 5 minutes running / 2 minutes walking

Progress should be comfortable rather than forced.

### When should you move to continuous running?

There is no deadline.

If run-walk sessions are working well, you can continue using them.

Eventually, many runners naturally become comfortable running for longer periods.

### The important principle

The goal is not to prove that you can run continuously as quickly as possible.

The goal is to develop a sustainable relationship with running.

Run-walk training can be a useful bridge between inactivity and regular running.`,

    source: "NHS Couch to 5K",
  },

  {
    slug: "common-running-mistakes-beginners",

    title: "10 Common Running Mistakes Beginners Make",

    excerpt:
      "Avoid the most common beginner errors, from running too fast to increasing training too quickly.",

    category: "Beginners",

    content: `Starting running is exciting, but beginners often make the same mistakes.

Understanding these mistakes can make your training more sustainable.

### 1. Running too fast

A beginner run should not feel like a race.

Controlled effort makes it easier to recover and repeat training.

### 2. Increasing everything at once

Increasing distance, speed and frequency simultaneously can increase total training stress quickly.

Change one variable at a time when possible.

### 3. Ignoring recovery

Rest days are part of many successful training programmes.

Recovery allows the body to adapt.

### 4. Comparing yourself with other runners

Every runner has a different training history.

Your pace does not need to match someone else's.

### 5. Training through persistent pain

Normal training discomfort and persistent pain are not the same thing.

Pain that continues or worsens deserves attention.

### 6. Focusing only on distance

A longer run is not automatically a better run.

Duration, effort, consistency and recovery also matter.

### 7. Changing shoes too often

Finding a comfortable pair matters more than constantly searching for the newest model.

### 8. Making the plan too complicated

Beginners rarely need dozens of metrics and multiple complicated workouts.

Simple training can be highly effective.

### 9. Expecting immediate results

Fitness develops over time.

Several weeks of consistent training are more meaningful than one excellent workout.

### 10. Forgetting to enjoy running

Training should have a purpose, but it should also be sustainable.

Find routes, people and routines that make you want to continue.

The best beginner programme is usually the one you can repeat.`,

    source: "NHS Couch to 5K; WHO Physical Activity Guidelines",
  },

  {
    slug: "how-to-breathe-while-running",

    title: "How to Breathe While Running",

    excerpt:
      "Breathing changes naturally as running gets harder. Learn how to use breathing as a simple guide to running effort.",

    category: "Beginners",

    content: `Breathing usually becomes faster and deeper when you run.

This is a normal response to increased physical demand.

Beginners sometimes worry that they need to learn a special breathing technique.

For most easy running, the most useful approach is to keep the effort controlled.

### Let your effort guide your breathing

When the pace increases, breathing generally becomes more demanding.

If you are struggling to control your breathing during an easy run, the pace may simply be too fast for the intended effort.

Slowing down can make the session more manageable.

### The talk test

A simple way to judge moderate effort is whether you can still speak in short sentences.

As intensity increases, conversation becomes more difficult.

This can be more useful for beginners than trying to control every breath mathematically.

### Nose breathing is not a requirement

Some runners prefer nasal breathing during easy running.

Others naturally use both the nose and mouth.

There is no need to force a particular breathing pattern if it makes the workout uncomfortable.

### Breathing gets easier with fitness

As your fitness improves, the same running pace may feel easier.

Your breathing response is influenced by intensity, fitness, weather, stress and other factors.

### When breathing feels unusually difficult

Normal breathlessness during exercise is different from unexpected or severe breathing difficulty.

If you experience unusual symptoms, chest pain, fainting or severe difficulty breathing, stop exercising and seek appropriate medical attention.

For normal training, the simplest strategy is usually:

Start easy, control the effort and allow your breathing to respond naturally.`,

    source: "WHO Physical Activity Guidelines",
  },

  // =========================================================
  // TRAINING
  // =========================================================

  {
    slug: "how-much-running-do-you-actually-need",

    title: "How Much Running Do You Actually Need?",

    excerpt:
      "You do not need to run every day to improve your health. Learn how running fits into broader physical activity recommendations.",

    category: "Training",

    content: `There is no single number of kilometres that every runner needs to complete each week.

The amount of running that makes sense depends on your experience, goals, schedule, recovery and other physical activities.

### General health recommendations

For adults, the World Health Organization recommends at least 150 to 300 minutes of moderate-intensity aerobic physical activity per week, or 75 to 150 minutes of vigorous-intensity aerobic activity, or an equivalent combination.

Adults should also perform muscle-strengthening activities involving all major muscle groups on two or more days per week.

These are general health recommendations rather than a requirement to run a particular distance.

Running can be one part of meeting these recommendations.

Walking, cycling, swimming and other aerobic activities can also contribute to overall physical activity.

### You do not need to run every day

Running every day is not necessary for beginners.

A beginner may start with a few manageable running sessions per week.

The NHS Couch to 5K programme, for example, uses three running sessions per week with rest days between them.

This structure allows a new runner to build consistency while giving the body time to recover.

### Think about total training load

Your running mileage is only one part of your physical workload.

If you also participate in:

- Strength training
- Cycling
- Football
- Tennis
- Hiking
- Group fitness
- Physically demanding work

your total workload is higher than your running distance alone suggests.

This matters when deciding how much additional running to add.

### Progress gradually

If you currently run three easy sessions per week, you do not need to suddenly double your workload.

Instead, progress gradually.

You might eventually increase:

- Running duration
- Weekly frequency
- Distance
- Training intensity

But increasing everything simultaneously is unnecessary.

### More is not automatically better

Additional training can provide additional benefits, but only when your body can recover from it.

The best training volume is not necessarily the highest volume you can tolerate for a short period.

It is the amount you can perform consistently while maintaining recovery and avoiding persistent problems.

Think long term.

A sustainable routine performed for months is usually more valuable than an aggressive programme that lasts only a few weeks.`,

    source:
      "WHO Physical Activity Guidelines; CDC Adult Physical Activity Guidelines",
  },

  {
    slug: "how-to-build-weekly-running-schedule",

    title: "How to Build a Simple Weekly Running Schedule",

    excerpt:
      "A simple weekly structure can help you balance running, recovery and other forms of training.",

    category: "Training",

    content: `A running schedule does not need to be complicated.

For many recreational runners, a simple structure is easier to follow than a plan filled with different workouts.

### Start with your available time

Before choosing workouts, look at your actual week.

Consider:

- Work
- Sleep
- Family commitments
- Strength training
- Other sports
- Recovery

Your running plan should fit your life.

### A simple three-run week

A beginner or recreational runner might use:

Monday: Rest or easy movement

Tuesday: Easy run

Wednesday: Rest

Thursday: Easy run

Friday: Rest

Saturday: Easy longer run

Sunday: Rest or easy movement

This is only an example.

The exact days are less important than having enough recovery between demanding sessions.

### Add intensity carefully

Once you have built consistency, one session can eventually become more structured.

For example:

- Easy running
- Controlled intervals
- Longer easy running

You do not need multiple hard sessions every week.

### Consider your other training

If you also lift weights, cycle or play sports, those activities contribute to your total workload.

A running schedule should account for the entire week, not just running.

### Keep the plan flexible

Missing one workout does not ruin your training.

Trying to compensate by doubling the next workout can create unnecessary fatigue.

If life becomes busy, reduce the workload and return to the normal routine when possible.

Consistency over months is more important than achieving a perfect week.`,

    source: "WHO Physical Activity Guidelines; NHS Couch to 5K",
  },

  {
    slug: "easy-run-vs-hard-run",

    title: "Easy Runs vs Hard Runs: What's the Difference?",

    excerpt:
      "Not every training session should have the same intensity. Learn why easy and hard running serve different purposes.",

    category: "Training",

    content: `Running intensity is one of the most important parts of training.

Two runs can cover the same distance but create very different training demands.

### Easy running

Easy running is controlled.

The goal is to accumulate training without excessive fatigue.

Easy runs can support consistency and provide aerobic work while leaving more recovery capacity for other sessions.

### Hard running

Hard sessions intentionally create a higher training stimulus.

They may include intervals, hills, tempo efforts or other structured work.

Because they are more demanding, they usually require more recovery.

### Why not run hard every day?

Running hard every session can make total training stress difficult to manage.

You may feel tired before the next workout.

Your performance can decline.

The risk of accumulating excessive fatigue can also increase.

### A balanced approach

Many runners use a mixture of easier and harder sessions.

The exact balance depends on:

- Experience
- Goals
- Training history
- Weekly volume
- Recovery
- Other physical activities

Beginners generally have more to gain from consistency than from complicated high-intensity training.

### The important question

Before every run, ask:

"What is the purpose of this session?"

If it is an easy run, keep it easy.

If it is a hard workout, make the hard parts intentional.

This makes training more organised and easier to recover from.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "how-to-increase-running-distance-safely",

    title: "How to Increase Your Running Distance",

    excerpt:
      "Learn how to progress your running volume without turning every week into a major jump in training stress.",

    category: "Training",

    content: `Increasing distance is a natural part of running progression.

The challenge is increasing your workload while allowing enough time for your body to adapt.

### Do not chase a fixed percentage

You may hear rules suggesting that weekly mileage should increase by exactly a certain percentage.

There is no universal percentage that works for every runner.

Your progression should consider your current training, experience and recovery.

### Change one thing at a time

If you want to run farther, avoid simultaneously adding much more speed and frequency.

For example, you could keep your normal number of running days while gradually extending one easy session.

### Use easy running

Additional distance is usually easier to manage when the intensity remains controlled.

Trying to make every longer run fast can turn a volume increase into a much larger training stress increase.

### Watch recovery

After increasing your workload, pay attention to:

- Persistent fatigue
- Sleep quality
- Muscle soreness
- Motivation
- Performance
- Persistent pain

If recovery deteriorates, the increase may have been too aggressive.

### Think in months

Running fitness is a long-term process.

There is no need to increase distance every single week.

Some weeks can be stable.

Others can be lighter.

A sustainable progression is more useful than constantly chasing a bigger number.`,

    source: "WHO Physical Activity Guidelines; NHS Couch to 5K",
  },

  {
    slug: "strength-training-for-runners",

    title: "Why Strength Training Can Help Runners",

    excerpt:
      "Running is not the only form of training that matters. Learn how strength work can fit into a balanced running routine.",

    category: "Training",

    content: `Running is an endurance activity, but runners can also benefit from strength training.

Strength work can help develop general physical capacity and supports the broader physical activity recommendations for adults.

### What can strength training include?

A basic programme can include movements such as:

- Squats
- Lunges
- Hip hinges
- Calf raises
- Rows
- Pressing movements
- Core exercises

The exact exercises should match your experience and goals.

### Do you need to lift extremely heavy?

No.

Strength training can use bodyweight, resistance bands, dumbbells, machines or barbells.

The important factor is progressive and appropriate resistance rather than a particular piece of equipment.

### How often?

General health guidelines recommend muscle-strengthening activities involving major muscle groups on at least two days per week.

Runners can adjust this depending on their running volume and recovery.

### Balance matters

If you are adding strength training to a running programme, remember that it contributes to total workload.

A hard leg session immediately before an important running workout may affect performance.

### Start simple

You do not need a bodybuilding programme.

A few well-selected exercises performed consistently can provide a useful foundation.

Running and strength training can complement each other when the total workload remains manageable.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "running-in-hot-weather",

    title: "How to Run Safely in Hot Weather",

    excerpt:
      "Heat changes the demands of running. Learn how to adjust pace, timing, hydration and expectations when temperatures rise.",

    category: "Training",

    content: `Running in hot weather can feel much harder than running the same pace in cool conditions.

Heat places additional stress on the body, so your normal pace may no longer represent the same effort.

### Slow down

One of the simplest adjustments is reducing intensity.

Do not feel that you have to maintain your normal pace when conditions are significantly hotter.

### Choose better times

If possible, consider running during cooler parts of the day.

Early morning or later evening can be more comfortable than the hottest part of the afternoon.

### Consider the route

Shade can make a meaningful difference.

A route with trees or less direct sunlight may be more comfortable than a fully exposed route.

### Hydration

Fluid needs can increase when you sweat more.

Consider the duration of the run, temperature, humidity and your individual sweat rate.

Longer sessions may require more deliberate hydration planning.

### Clothing

Lightweight, breathable clothing can help you manage heat.

A hat and appropriate sun protection may also be useful depending on conditions.

### Know when to stop

Heat-related symptoms should not be ignored.

If you become confused, faint, severely weak or develop other concerning symptoms, stop exercising and seek appropriate medical attention.

The key principle is simple:

When conditions become harder, adjust the workout rather than trying to prove that you can maintain your normal pace.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "running-in-cold-weather",

    title: "How to Run in Cold Weather",

    excerpt:
      "Cold temperatures do not automatically mean you have to stop running. Learn how to adapt clothing, warm-up and expectations.",

    category: "Training",

    content: `Cold weather can make the beginning of a run feel uncomfortable, but many runners continue training throughout winter.

The key is adapting to the conditions.

### Dress appropriately

Avoid dressing only according to the temperature.

Wind, rain and humidity can significantly change how cold a run feels.

Layering can make it easier to adjust during the session.

### Warm up gradually

Starting slowly gives your body time to adapt to the conditions.

A longer easy warm-up can be useful when muscles feel stiff in cold weather.

### Watch the surface

Ice, snow and wet surfaces can change traction.

When conditions are slippery, reduce speed and choose safer routes.

### Do not chase normal pace

Your pace can change because of:

- Clothing
- Wind
- Surface conditions
- Temperature
- Fatigue

The purpose of the workout matters more than maintaining a specific number.

### Know when indoor training makes sense

Extreme weather can make outdoor running impractical.

A treadmill, indoor track or another form of aerobic exercise can be a reasonable alternative.

The goal is to maintain training safely rather than forcing every session outdoors.`,

    source: "WHO Physical Activity Guidelines",
  },

  // =========================================================
  // NUTRITION
  // =========================================================

  {
    slug: "what-to-eat-before-and-after-a-run",

    title: "What to Eat Before and After a Run",

    excerpt:
      "A practical guide to fuelling before and recovering after running without turning nutrition into a complicated formula.",

    category: "Nutrition",

    content: `There is no single meal that every runner needs before or after training.

Your nutrition should depend on the duration and intensity of the session, your normal eating pattern and your individual goals.

### Before a short easy run

For shorter and easier runs, many people can train comfortably without a special pre-run meal if they have eaten normally during the day.

You do not necessarily need to eat immediately before every run.

If you are hungry, a small familiar snack may be more comfortable than running while very hungry.

Examples can include fruit, yoghurt, toast or another carbohydrate-containing food that you tolerate well.

### Before longer or harder sessions

Longer or harder training sessions place greater demands on energy availability.

Carbohydrates are an important fuel source for exercise.

Common carbohydrate-containing foods include:

- Oats
- Rice
- Potatoes
- Bread
- Pasta
- Fruit
- Cereals

The amount and timing should depend on the individual and the planned session.

There is no need to experiment with unfamiliar foods immediately before an important workout or race.

### After running

After training, a normal balanced meal can provide carbohydrate to help replenish energy and protein to support normal muscle repair and adaptation.

Useful protein sources include:

- Eggs
- Dairy products
- Fish
- Poultry
- Legumes
- Soy products
- Other protein-rich foods

A practical recovery meal can combine carbohydrates, protein, vegetables or fruit and fluids.

### Do runners need supplements?

Not necessarily.

A solid nutrition routine can be built around normal foods.

Supplements may have specific uses in particular circumstances, but they should not replace a balanced diet.

### Nutrition should match the training

A person doing three short recreational runs per week has different nutritional demands from an athlete preparing for a marathon.

The longer and more demanding the training becomes, the more important appropriate energy and carbohydrate availability can become.

### A simple foundation

For most recreational runners, focus on:

- Regular meals
- Enough total energy
- A varied diet
- Carbohydrate-rich foods around demanding training when useful
- Adequate protein
- Appropriate hydration

If you have a medical condition, dietary restriction or competitive nutrition goal, individual advice from a qualified dietitian can be more appropriate than general recommendations.`,

    source: "IOC Sports Nutrition resources; WHO Healthy Diet guidance",
  },

  {
    slug: "hydration-for-runners-basics",

    title: "Hydration for Runners: The Basics",

    excerpt:
      "Understand hydration before, during and after running without following a one-size-fits-all drinking rule.",

    category: "Nutrition",

    content: `Hydration needs are individual.

There is no single amount of fluid that every runner should drink during every workout.

Your fluid requirements can be influenced by:

- Exercise duration
- Exercise intensity
- Temperature
- Humidity
- Clothing
- Sweat rate
- Individual physiology

### Short easy runs

For a short, easy run in comfortable conditions, carrying a large amount of fluid may not be necessary for everyone.

Starting the workout normally hydrated is a useful foundation.

You do not need to force yourself to drink large quantities simply because you are exercising.

### Longer sessions

As exercise duration increases, fluid losses become more relevant.

Longer sessions, hot environments and heavy sweating require more attention to hydration.

During prolonged exercise, drinking according to your individual needs can help manage fluid losses.

### After training

After exercise, continue normal fluid intake as part of your recovery.

If you have lost a significant amount of fluid through sweating, replacing those fluids becomes more important.

Very long or particularly sweaty sessions can also involve electrolyte losses.

In those situations, an appropriate electrolyte strategy may be useful depending on the duration, conditions and individual needs.

### Avoid extremes

More water is not automatically better.

Trying to consume excessive amounts of fluid can also be problematic.

The goal is to maintain appropriate hydration rather than treating hydration as a competition.

### Test your strategy in training

If you are preparing for a long race, do not wait until race day to discover that a particular drink or hydration strategy does not work for you.

Practise your nutrition and hydration strategy during training.

Pay attention to:

- Weather
- Duration
- Sweat
- Thirst
- Energy levels
- How your stomach responds

### Keep it simple

For everyday recreational running, you usually do not need a complicated hydration protocol.

Start normally hydrated, consider the conditions and duration of the session, and adjust your strategy as your training becomes longer or more demanding.

For unusually long endurance events, extreme heat or individual medical considerations, personalised advice can be appropriate.`,

    source: "IOC Sports Nutrition resources",
  },

  {
    slug: "carbohydrates-for-runners",

    title: "Carbohydrates for Runners: Why They Matter",

    excerpt:
      "Carbohydrates are an important fuel source for exercise. Learn how to include them in a practical running diet.",

    category: "Nutrition",

    content: `Carbohydrates are an important source of energy for exercise.

That does not mean every runner needs a special high-carbohydrate diet.

The appropriate amount depends on training volume, intensity, goals and overall energy needs.

### Everyday carbohydrate sources

Common foods include:

- Potatoes
- Rice
- Oats
- Bread
- Pasta
- Fruit
- Beans
- Cereals

These foods can easily fit into a balanced diet.

### Before training

Carbohydrates can be useful before longer or harder sessions.

The best choice is usually a familiar food that you know you tolerate well.

Large meals immediately before running can be uncomfortable for some people.

### After training

Carbohydrates can help restore energy stores after demanding exercise.

Combining carbohydrate with protein can provide a practical recovery meal.

### Do you need sports products?

Not necessarily.

For short recreational runs, ordinary foods are often sufficient.

Sports drinks, gels and other products become more relevant as training duration and intensity increase.

### Match nutrition to training

A person running for 20 minutes has different nutritional needs from someone preparing for a long-distance race.

The goal is not to consume as many carbohydrates as possible.

The goal is to provide appropriate fuel for the work you are actually doing.`,

    source: "IOC Sports Nutrition resources",
  },

  {
    slug: "protein-for-runners",

    title: "Protein for Runners: What You Need to Know",

    excerpt:
      "Protein supports normal muscle repair and adaptation. Learn how runners can include enough protein through everyday foods.",

    category: "Nutrition",

    content: `Protein is important for everyone, including runners.

It provides amino acids that the body uses for many functions, including normal muscle repair and adaptation after exercise.

### Good protein sources

A varied diet can provide protein through foods such as:

- Eggs
- Milk and yoghurt
- Fish
- Poultry
- Meat
- Beans
- Lentils
- Soy
- Nuts and seeds

### Spread protein across meals

Instead of thinking only about one large protein meal after training, it can be practical to include protein regularly throughout the day.

For example:

Breakfast: yoghurt and oats

Lunch: rice with chicken or beans

Snack: milk or yoghurt with fruit

Dinner: potatoes with fish or legumes

### More is not always better

Increasing protein indefinitely does not automatically improve running performance.

Overall energy intake, carbohydrate availability, sleep and training quality also matter.

### After running

A meal or snack containing protein after demanding training can support the normal recovery process.

It does not need to be a complicated supplement.

### Supplements

Protein powders can be convenient, but convenience is different from necessity.

Many runners can meet their nutritional needs through ordinary foods.

If you have specific dietary restrictions or performance goals, personalised nutrition advice can be useful.`,

    source: "IOC Sports Nutrition resources",
  },

  {
    slug: "nutrition-for-long-runs",

    title: "Nutrition for Long Runs",

    excerpt:
      "Longer runs require more planning. Learn the basic nutrition principles that become increasingly important as running duration increases.",

    category: "Nutrition",

    content: `Nutrition becomes more important as running sessions become longer.

A short easy run usually requires less preparation than a long endurance session.

### Before a long run

A familiar carbohydrate-containing meal or snack can help provide energy.

Avoid experimenting with unfamiliar foods immediately before a key session.

### During the run

For sufficiently long sessions, runners may need to consider carbohydrate intake during exercise.

The exact strategy depends on duration, intensity, individual tolerance and goals.

### Practise before race day

If you plan to use gels, sports drinks or other products during a race, test them during training.

Your digestive system also needs to become familiar with the strategy.

### Hydration matters

Long runs can result in significant fluid losses, particularly in hot conditions.

Consider the weather, duration and your individual sweat response.

### After the run

Recovery nutrition should include carbohydrate, protein and fluids.

A normal balanced meal can often provide what you need.

### Keep the plan individual

There is no single nutrition strategy that works for every runner.

A recreational 60-minute run and a multi-hour endurance event have very different requirements.

As your running gets longer, nutrition should become more deliberate rather than more complicated.`,

    source: "IOC Sports Nutrition resources",
  },

  // =========================================================
  // RECOVERY
  // =========================================================

  {
    slug: "why-rest-days-matter-for-runners",

    title: "Why Rest Days Matter for Runners",

    excerpt:
      "Training creates stress. Recovery gives your body the opportunity to adapt and prepare for the next session.",

    category: "Recovery",

    content: `Training is only one part of getting fitter.

Recovery is the other part.

When you run, your body experiences mechanical and physiological stress. Your muscles, connective tissues and cardiovascular system need time to recover and adapt.

This is why rest days are an important part of many running programmes.

### Rest is not the opposite of training

A rest day does not necessarily mean that you have to remain completely inactive.

Easy walking and normal daily movement can still be part of an active lifestyle.

The important distinction is between easy activity and another demanding workout.

If your body is still recovering from a hard session, adding another hard session may provide more stress without giving you enough time to adapt.

### What does a rest day help with?

Recovery gives your body time to:

- Restore energy
- Recover from training stress
- Adapt to repeated exercise
- Prepare for future sessions

The NHS Couch to 5K programme includes rest days between runs.

This is particularly useful for beginners who are still adapting to regular running.

### Watch for persistent fatigue

Occasional tiredness after training is normal.

However, repeatedly feeling exhausted can be a sign that your overall workload is too high for your current recovery capacity.

Pay attention to things such as:

- Persistent fatigue
- Declining performance
- Poor recovery
- Unusual heaviness
- Persistent pain
- Reduced motivation
- Difficulty completing normal sessions

One difficult workout does not automatically mean that you are overtraining.

The bigger concern is a pattern of inadequate recovery.

### Recovery depends on more than rest days

Your recovery is also influenced by:

- Sleep
- Nutrition
- Hydration
- Stress
- Total physical workload
- Training intensity

A runner who trains three times per week but also performs several hard strength sessions and sports activities may need to account for that additional workload.

### The goal

The goal is not to make every training session difficult.

The goal is to create a training stimulus that you can recover from and repeat consistently over time.

Training hard is useful.

Recovering from training is essential.`,

    source: "NHS Couch to 5K; WHO Physical Activity Guidelines",
  },

  {
    slug: "how-to-recover-after-a-hard-run",

    title: "How to Recover After a Hard Run",

    excerpt:
      "Recovery is more than stretching. Learn the basic habits that help you return to training ready for the next session.",

    category: "Recovery",

    content: `A hard running session is useful only if you can recover from it.

Recovery starts immediately after training, but it continues throughout the following hours and days.

### Cool down gradually

After a demanding workout, gradually reduce your effort.

An easy walk can be a simple way to transition from running back to normal daily activity.

You do not need to turn your cool-down into another workout.

### Eat a balanced meal

Nutrition is an important part of recovery.

Carbohydrates help replenish energy stores, while protein provides amino acids needed for normal muscle repair and adaptation.

A practical recovery meal can combine:

- A carbohydrate source
- A protein source
- Fruit or vegetables
- Fluids

You do not need a complicated supplement routine to recover from an ordinary training session.

### Rehydrate

Continue normal fluid intake after training.

If the session was long, performed in hot conditions or resulted in substantial sweating, paying additional attention to fluid replacement may be appropriate.

### Sleep matters

Sleep is one of the most important parts of recovery.

A consistent sleep routine supports physical and mental recovery and helps you handle future training.

Adding more training while consistently sleeping poorly can make recovery more difficult.

### Look at the next workout

The next training session should partly depend on how well you recovered from the previous one.

If you feel normal and ready, you can continue your planned training.

If you are unusually fatigued, your performance is declining or pain persists, reducing the training load may be more appropriate than forcing another hard workout.

### Recovery is not laziness

Taking an easier day does not mean that you are losing fitness.

Training adaptation happens over time as your body responds to repeated training and recovery.

The goal is not to win every training session.

The goal is to keep training consistently over months and years.`,

    source: "WHO Physical Activity Guidelines; IOC Sports Nutrition resources",
  },

  {
    slug: "sleep-and-running-recovery",

    title: "Sleep and Running: Why Recovery Starts at Night",

    excerpt:
      "Training creates a demand for recovery. Sleep is one of the most important foundations for handling that workload.",

    category: "Recovery",

    content: `Running places stress on the body.

Recovery is how the body responds to that stress, and sleep is an important part of the recovery process.

### Why sleep matters

Poor sleep can make training feel harder.

It can also affect mood, concentration and your ability to handle normal daily activities.

If poor sleep becomes a consistent pattern, it can make a training programme harder to sustain.

### More training is not always the answer

If you feel tired because you are sleeping poorly, adding another hard workout is unlikely to solve the problem.

Sometimes the better decision is to reduce training intensity and prioritise recovery.

### Create a consistent routine

Useful habits can include:

- Keeping a regular sleep schedule
- Allowing enough time for sleep
- Creating a comfortable sleep environment
- Avoiding unnecessary stimulation before bed
- Keeping caffeine intake appropriate for your routine

### Listen to your body

One poor night does not mean you must cancel every workout.

Look at the pattern.

If several nights of poor sleep are combined with fatigue and declining performance, consider reducing training load.

### Recovery is a system

Sleep works together with nutrition, hydration, stress management and appropriate training.

There is no single recovery trick.

A consistent lifestyle is usually more valuable than a complicated recovery routine.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "active-recovery-for-runners",

    title: "Active Recovery: What Should You Do on Rest Days?",

    excerpt:
      "Rest does not always mean sitting still. Learn how easy movement can fit into recovery between running sessions.",

    category: "Recovery",

    content: `A rest day can look different for different runners.

Some people prefer complete rest.

Others feel better with light movement.

### What is active recovery?

Active recovery means low-intensity movement performed without creating significant additional training stress.

Examples can include:

- Easy walking
- Gentle cycling
- Light mobility work
- Normal daily movement

The key is intensity.

A hard workout is not active recovery simply because it uses a different exercise.

### How should it feel?

Active recovery should feel easy.

You should finish feeling better or at least no more fatigued than when you started.

If a recovery session leaves you exhausted, it has probably become another training session.

### When is complete rest better?

Complete rest may make more sense when:

- You are very fatigued
- You have significant soreness
- You have persistent pain
- Your workload has been unusually high
- You simply need a break

### Recovery is individual

One runner may enjoy a walk on a rest day.

Another may prefer to do nothing.

There is no requirement to fill every day with exercise.

The purpose of recovery is to allow you to return to training ready for the next session.`,

    source: "WHO Physical Activity Guidelines; NHS Couch to 5K",
  },

  {
    slug: "signs-you-need-more-recovery",

    title: "Signs That You May Need More Recovery",

    excerpt:
      "Learn how to recognise patterns that can suggest your current training load is higher than your ability to recover from it.",

    category: "Recovery",

    content: `Training should create a challenge that your body can recover from.

Sometimes the workload becomes too high relative to recovery.

One difficult workout is not necessarily a problem.

Patterns are more important.

### Possible warning signs

Pay attention to combinations of:

- Persistent fatigue
- Declining performance
- Poor sleep
- Increased irritability
- Unusual heaviness
- Persistent muscle soreness
- Loss of motivation
- Difficulty completing normal sessions
- Persistent pain

These signs can have many causes, so they should not automatically be interpreted as overtraining.

### Look at the whole week

Consider everything you are doing:

- Running
- Strength training
- Cycling
- Sports
- Physical work
- Walking
- Stress
- Sleep

Your body responds to total load, not only running mileage.

### What can you do?

If recovery is poor, consider temporarily reducing:

- Running duration
- Running intensity
- Number of demanding sessions
- Additional hard activities

Keep easy movement if it feels comfortable.

### When to seek help

Persistent pain, unusual symptoms or a significant decline in health should not simply be trained through.

A qualified healthcare professional can help determine what is causing the problem.

The goal is not to train as much as possible.

The goal is to train at a level that you can recover from consistently.`,

    source: "WHO Physical Activity Guidelines",
  },

  // =========================================================
  // GEAR
  // =========================================================

  {
    slug: "warm-up-and-cool-down-for-runners",

    title: "Warm-Up and Cool-Down: What Runners Should Know",

    excerpt:
      "Learn how a simple warm-up and cool-down can help you transition into and out of a running session.",

    category: "Recovery",

    content: `A running session does not have to begin the moment you start running.

A short warm-up gives you time to transition gradually from rest to exercise.

### Start with walking

For beginners, a few minutes of brisk or comfortable walking can be a practical starting point.

The NHS Couch to 5K programme uses a five-minute walking warm-up before running.

This gives you time to gradually increase your activity level before the running portion begins.

### Add easy movement

After walking, you can begin with easy running rather than immediately trying to reach your target pace.

The first minutes of the workout should feel controlled.

There is no benefit in turning your warm-up into another hard workout.

### Dynamic movement

Some runners also use dynamic mobility movements before training.

Examples can include controlled leg swings, walking lunges or other movements that are appropriate for the individual.

The purpose is preparation rather than fatigue.

### Cool down after running

The NHS Couch to 5K programme also includes a five-minute walking cool-down.

After the running portion, gradually reducing your pace can be a simple way to transition back toward normal activity.

### Do you need a long stretching routine?

Not necessarily.

A warm-up does not need to be a long stretching session.

Likewise, a cool-down does not need to become another workout.

The most important goal is to prepare appropriately for the session and finish it gradually.`,

    source: "NHS Couch to 5K; NHS Running Guidance",
  },

  {
    slug: "how-to-choose-your-first-running-shoes",

    title: "How to Choose Your First Running Shoes",

    excerpt:
      "Your first pair of running shoes does not need to be the most expensive model. Start with comfort, fit and the type of running you actually do.",

    category: "Gear",

    content: `Choosing running shoes can feel complicated because there are many brands, models, technologies and marketing claims.

For a beginner, the most important starting point is usually finding a shoe that feels comfortable and fits appropriately.

### Fit matters

Your foot should have enough room to avoid uncomfortable pressure.

At the same time, the shoe should feel secure enough that your foot does not move excessively inside it.

Try running shoes with the socks you normally use for running.

If possible, walk and jog in the shoes before buying them.

### Comfort matters

Different runners can prefer different levels of:

- Cushioning
- Flexibility
- Firmness
- Stability
- Heel-to-toe drop
- Weight

There is no single running shoe that is perfect for everyone.

A shoe that feels comfortable to one runner may feel uncomfortable to another.

### Do not buy only because of marketing

A more expensive shoe is not automatically a better shoe for you.

Marketing terms and advanced materials can be useful, but they do not replace personal fit and comfort.

Your training progression, recovery, running surface and total workload also influence how comfortable running feels.

### Consider where you run

Road running, trail running and track running can place different demands on footwear.

If you mostly run on roads and pavements, a road-running shoe may make more sense than a technical trail shoe.

If you regularly run on uneven trails, grip and protection can become more important.

### When should you replace shoes?

There is no universal mileage number that guarantees every pair needs to be replaced.

Pay attention to how the shoes feel and their physical condition.

Signs that it may be time to consider a replacement can include significant wear, loss of comfort or changes in how the shoe feels during running.

### The simplest rule

Do not choose your first running shoes only because they look good or are expensive.

Choose a pair that fits comfortably, feels secure and suits the type of running you actually do.

If you are dealing with persistent foot or leg problems, a qualified clinician or running specialist can help assess your individual situation.`,

    source: "NHS Running Guidance",
  },

  {
    slug: "do-you-really-need-a-running-watch",

    title: "Do You Really Need a Running Watch?",

    excerpt:
      "GPS watches can be useful, but you can become a better runner without buying one.",

    category: "Gear",

    content: `A running watch can be useful, but it is not a requirement for becoming fitter.

Many modern running watches can track information such as:

- Distance
- Pace
- Duration
- Heart rate
- Elevation
- GPS route
- Training sessions

This information can help runners understand their training and monitor progress over time.

### Numbers are tools

One of the biggest mistakes with running technology is treating every number as a target.

A pace that is appropriate on one day may be inappropriate on another because of:

- Weather
- Terrain
- Sleep
- Fatigue
- Stress
- Training load

A slower run is not automatically a worse run.

### Beginners do not need complicated metrics

For a beginner, learning to run consistently can be more important than monitoring dozens of statistics.

You can improve your running with very simple information:

- How long you ran
- How you felt
- How often you trained
- Whether you recovered well

A smartphone can already provide many basic tracking functions.

### When a watch becomes useful

A running watch becomes particularly useful when you want to:

- Track routes
- Follow structured workouts
- Monitor training volume
- Compare previous sessions
- Record heart-rate data
- Review long-term progress

Technology can make training more organised.

But it should support your training rather than control it.`,

    source:
      "WHO Physical Activity Guidelines; CDC Adult Physical Activity Guidelines",
  },

  {
    slug: "road-vs-trail-running-shoes",

    title: "Road vs Trail Running Shoes: Which Do You Need?",

    excerpt:
      "Road and trail shoes are designed for different surfaces. Learn what to consider before choosing your next pair.",

    category: "Gear",

    content: `The best running shoe depends partly on where you run.

Road and trail shoes are designed around different environments.

### Road-running shoes

Road shoes are generally designed for relatively smooth surfaces such as:

- Pavements
- Roads
- Sidewalks
- Running tracks

They often prioritise a comfortable ride and efficient movement on predictable surfaces.

### Trail-running shoes

Trail shoes are designed for less predictable terrain.

Depending on the model, they may provide:

- More aggressive outsole grip
- Additional protection
- More secure construction
- Features intended for uneven surfaces

### What if you run on both?

You do not necessarily need two pairs.

If most of your training is on roads with occasional light trails, a versatile road shoe may be enough.

If you regularly run technical trails, dedicated trail footwear may be more appropriate.

### Weather matters

Mud, rain, snow and loose surfaces can change the demands placed on your shoes.

A shoe that works well in dry conditions may not provide enough traction in deep mud.

### Choose based on your actual training

Do not choose shoes because they are marketed as the "best" model.

Think about:

- Where you run
- How often you run there
- Surface conditions
- Comfort
- Fit
- Your preferences

The best shoe is the one that suits the running you actually do.`,

    source: "NHS Running Guidance",
  },

  {
    slug: "running-clothes-how-to-dress-for-training",

    title: "How to Dress for Running in Different Weather",

    excerpt:
      "The right running clothes can make training more comfortable. Learn how to think about temperature, wind, rain and layering.",

    category: "Gear",

    content: `Running clothing does not need to be expensive or complicated.

The goal is to stay comfortable while allowing enough freedom of movement.

### Think about conditions

Temperature is only one factor.

Also consider:

- Wind
- Rain
- Humidity
- Sun
- Duration of the run
- Running intensity

A windy day can feel significantly colder than the thermometer suggests.

### Layering

In colder conditions, multiple lighter layers can be more practical than one very heavy layer.

You can adjust layers depending on how the temperature feels during the run.

### Avoid excessive clothing

Running creates body heat.

If you dress as though you are going to stand outside rather than exercise, you may become uncomfortably hot.

### Rain

A lightweight water-resistant layer can be useful in wet conditions.

However, no jacket can make heavy rain feel exactly like dry weather.

### Hot weather

Lightweight and breathable clothing can help with heat management.

A hat and sun protection may also be useful.

### Visibility

If you run in darkness or low-light conditions, visibility becomes an important safety consideration.

Reflective elements and appropriate lighting can help other road users see you.

The best running clothing is not necessarily the most expensive.

It is clothing that matches the conditions and allows you to run comfortably.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "running-headphones-and-safety",

    title: "Running With Headphones: What to Consider",

    excerpt:
      "Music can make running more enjoyable, but awareness of your surroundings should remain a priority.",

    category: "Gear",

    content: `Many runners use headphones during training.

Music and podcasts can make easy runs more enjoyable, but they can also reduce awareness of the environment.

### Consider your route

A quiet running path is different from a busy road.

If you are running near traffic, cyclists or other pedestrians, being aware of what is happening around you is important.

### Keep enough awareness

Depending on your environment, consider:

- Lowering the volume
- Using a transparency or awareness mode
- Using one earbud
- Removing headphones in complex areas

The best choice depends on the route.

### Running at night

Awareness becomes even more important in low-light conditions.

Combine appropriate visibility with attention to your surroundings.

### Music is not a requirement

If headphones make you less aware of the environment, there is nothing wrong with running without them.

Some runners prefer to listen to their breathing, footsteps and surroundings.

### Make the technology work for you

Headphones should improve your experience without creating unnecessary risk.

The goal is to enjoy your run while remaining aware of what is happening around you.`,

    source: "NHS Running Guidance",
  },

  // =========================================================
  // EXTRA TRAINING / LIFESTYLE
  // =========================================================

  {
    slug: "running-and-strength-training-together",

    title: "How to Combine Running and Strength Training",

    excerpt:
      "You can build endurance and strength at the same time. The key is managing total workload and recovery.",

    category: "Training",

    content: `Running and strength training can complement each other.

The challenge is managing total training stress.

### Start with priorities

Decide what matters most.

If running performance is your main goal, running sessions should receive appropriate priority.

If strength is your main goal, your strength sessions may take priority.

### Avoid stacking too many hard sessions

A week containing several hard runs plus several demanding leg workouts can create a large recovery requirement.

Try to avoid turning every training day into a maximum-effort day.

### Example structure

A simple week might look like:

Monday: Strength

Tuesday: Easy run

Wednesday: Rest

Thursday: Strength

Friday: Easy run

Saturday: Longer easy run

Sunday: Rest

This is only an example and should be adjusted to the individual.

### Watch total workload

Running, lifting, sports and physical work all contribute to total stress.

If recovery begins to deteriorate, the solution may be reducing workload rather than adding more recovery products.

### Keep the long-term goal in mind

You do not need to maximise every quality at the same time.

Consistent moderate training across months can produce meaningful progress.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "how-to-use-heart-rate-while-running",

    title: "How to Use Heart Rate When Running",

    excerpt:
      "Heart rate can provide useful information, but it should be treated as a training tool rather than an absolute score.",

    category: "Training",

    content: `Heart rate can help runners understand exercise intensity.

However, it is only one piece of information.

### What affects heart rate?

Heart rate can change because of:

- Running intensity
- Temperature
- Hydration
- Stress
- Sleep
- Caffeine
- Fitness
- Illness
- Terrain

The same pace can therefore produce different heart rates on different days.

### Use trends rather than one number

A single heart-rate reading is not necessarily meaningful.

Looking at repeated sessions under similar conditions can provide more useful information.

### Combine heart rate with effort

Do not ignore how you feel.

Heart rate, pace and perceived effort should be considered together.

For an easy run, if your heart rate is unusually high and the effort feels harder than normal, slowing down may be sensible.

### Wrist sensors vs chest straps

Wrist-based optical sensors can be convenient.

Chest straps can provide more direct measurement of the electrical activity associated with each heartbeat and may be useful when accurate heart-rate data matters.

### Do not chase a number

Heart rate should help you understand training.

It should not turn every run into a test.

Use it as information, not as a score that determines whether a workout was successful.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "running-by-effort-instead-of-pace",

    title: "Why Running by Effort Can Be Better Than Running by Pace",

    excerpt:
      "Pace changes with weather, terrain and fatigue. Learn why effort can sometimes be a more useful guide.",

    category: "Training",

    content: `Pace is easy to measure.

But pace does not tell the whole story.

A pace that feels easy on a cool flat morning may feel difficult on a hot windy day.

### Effort accounts for conditions

Perceived effort naturally changes with:

- Temperature
- Hills
- Wind
- Sleep
- Fatigue
- Stress
- Training load

This makes effort useful when conditions change.

### Easy effort

For easy running, you should generally feel controlled.

You should be able to maintain the effort without feeling like you are racing.

### Hard effort

Hard sessions can intentionally push your effort higher.

However, the hard part should have a purpose.

### Why beginners can benefit

Beginners often become frustrated when their pace is slower than expected.

Running by effort removes some of that pressure.

The goal becomes completing the intended workout rather than hitting an arbitrary number.

### Use both

You do not have to choose between pace and effort.

Use pace when conditions are stable and pace is relevant to the workout.

Use effort when conditions or recovery make pace less reliable.

The most useful metric is the one that helps you make better training decisions.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "how-to-prepare-for-your-first-5k",

    title: "How to Prepare for Your First 5K",

    excerpt:
      "A first 5K does not need to be intimidating. Learn how to build consistency and arrive at race day prepared.",

    category: "Beginners",

    content: `A 5K is a popular first running goal.

The distance is challenging enough to feel meaningful while remaining accessible to many beginners with appropriate preparation.

### Build consistency first

Before worrying about race pace, focus on running regularly.

A gradual beginner programme can help build the ability to run for longer periods.

### Do not race every training session

Most training should not feel like a competition.

Easy running gives you the opportunity to build fitness while managing fatigue.

### Practise the distance

Before race day, it can be useful to become comfortable with the approximate duration or distance you expect to cover.

You do not need to run a full 5K at race effort every week.

### Prepare your equipment

Use familiar shoes and clothing.

Do not test brand-new equipment on race morning.

### Plan the race

Know:

- Where the start is
- How you will get there
- Where you can warm up
- What you will wear
- What you will eat beforehand
- What pace or effort feels realistic

### Race day

Start conservatively.

Many beginners make the mistake of starting too fast because of the excitement.

A controlled first kilometre can leave you in a much better position later in the race.

Your first 5K is about completing the experience and learning from it.

The next race can always be faster.`,

    source: "NHS Couch to 5K; WHO Physical Activity Guidelines",
  },

  {
    slug: "how-to-choose-a-running-route",

    title: "How to Choose a Good Running Route",

    excerpt:
      "The right route can make running safer, more enjoyable and easier to repeat consistently.",

    category: "Beginners",

    content: `A good running route is more than a line on a map.

The surface, traffic, elevation and environment can all affect your experience.

### Start simple

For beginners, a route that is easy to understand can reduce unnecessary stress.

A loop close to home can be particularly convenient.

### Consider the surface

Roads, pavements, tracks and trails all feel different.

Choose a surface that suits your training and footwear.

### Think about traffic

If you run near roads, choose routes that allow you to maintain awareness of traffic.

Crossing busy roads repeatedly can interrupt your workout.

### Consider hills

Hills can make a route significantly harder.

If the goal is an easy run, a flatter route may make it easier to control effort.

### Water and facilities

For longer runs, consider whether there are places where you can access water or take a short break if needed.

### Enjoyment matters

A beautiful or interesting route can make it easier to stay consistent.

You do not need the perfect training route.

You need a route that is safe, practical and enjoyable enough to use regularly.`,

    source: "WHO Physical Activity Guidelines",
  },

  {
    slug: "running-progress-what-to-track",

    title: "What Running Progress Should You Track?",

    excerpt:
      "Distance and pace are useful, but they are not the only signs that your running is improving.",

    category: "Training",

    content: `Running progress is often reduced to one number: pace.

But improvement can happen in many different ways.

### Useful metrics

Depending on your goals, you can track:

- Distance
- Duration
- Pace
- Heart rate
- Training frequency
- Elevation
- Perceived effort
- Recovery

### Look for trends

One workout is not enough to determine progress.

Compare similar sessions over several weeks.

For example, if the same easy route feels easier or your recovery improves, that is meaningful progress even if your pace has not changed dramatically.

### Consistency is progress

If you previously ran once a week and now run consistently three times a week, that is a major improvement.

Training frequency can be more important than chasing a personal best every session.

### Recovery is also a metric

If you can complete a similar workload while feeling less fatigued afterwards, your ability to handle training may be improving.

### Avoid metric overload

Tracking everything can make running stressful.

Choose a few metrics that actually help you make decisions.

Technology should simplify training, not make it more complicated.`,

    source: "WHO Physical Activity Guidelines",
  },
];

export async function seedArticles() {
  const articlesRef = collection(db, "articles");

  let created = 0;
  let skipped = 0;

  for (const article of articles) {
    const articleRef = doc(articlesRef, article.slug);

    const existingArticle = await getDoc(articleRef);

    if (existingArticle.exists()) {
      skipped++;
      continue;
    }

    await setDoc(articleRef, {
      ...article,

      authorId: "FiTrack-team",
      authorName: "FiTrack Team",

      coverImage: "",

      published: true,

      views: 0,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    created++;
  }

  console.log(
    `Articles seed completed. Created: ${created}, skipped: ${skipped}`,
  );

  return {
    created,
    skipped,
  };
}
