import {
  FaConfluence,
  FaHiking,
  FaInfo,
  FaMapMarkedAlt,
  FaRegDotCircle,
  FaSearch,
  FaSkiing,
  FaSwimmer,
  FaTh,
  FaWalking,
} from "react-icons/fa";
import { IoBag } from "react-icons/io5";
import { RiVerifiedBadgeFill } from "react-icons/ri";

import { useAuth } from "../../account/AuthContext";
import SupportChat from "../../support/SupportChat";
import { FiHeadphones } from "react-icons/fi";

import {
  FaStopwatch,
  FaLocationCrosshairs,
  FaMedal,
  FaTriangleExclamation,
  FaMobileScreenButton,
  FaBarsStaggered,
  FaLocationArrow,
  FaRotate,
  FaBolt,
  FaRegComments,
  FaShare,
  FaRegBell,
} from "react-icons/fa6";
import { FaRunning, FaDumbbell } from "react-icons/fa";
import { IoMdBicycle } from "react-icons/io";

import logoImg from "../../../assets/logo.png";

import "./help.scss";
import { TbBallTennis, TbKayak } from "react-icons/tb";

export default function HelpPage() {
    const { user } = useAuth();
  return (
    <main className="help-page">
      <section className="help-hero">
        <div className="help-hero__content">
          <img src={logoImg} alt="Image" className="logo-img-help" />

          <h1>
            FiTrack <span>GUIDE</span>
          </h1>

          <p>
            Everything you need to know about running, tracking your activity,
            achievements, races and the main features of FiTrack.
          </p>

          {/* <a href="#getting-started" className="help-hero__button">
            Get started
            <FaArrowRotateRight />
          </a> */}
        </div>
      </section>

      <div className="help-container">
        {/* NAVIGATION */}

        <section className="help-section" id="getting-started">
          <div className="help-section__heading">
            <span>01</span>
            <div>
              <h2>Getting started</h2>
              <p>Everything begins with your next run.</p>
            </div>
          </div>



<div className="help-card">
    <h3>What is FiTrack?</h3>

    <p>
        FiTrack is a multi-sport fitness platform designed
        to help you record, track, manage, and share your
        physical activities. Whether you're exploring the
        outdoors, training at the gym, or practicing your
        favorite sport, FiTrack brings your fitness journey
        together in one place.
    </p>

    <p>
        The platform supports nine activity categories:
        <strong> Running</strong>,
        <strong> Walking</strong>,
        <strong> Cycling</strong>,
        <strong> Hiking</strong>,
        <strong> Kayaking</strong>,
        <strong> Swimming</strong>,
        <strong> Tennis</strong>,
        <strong> Winter Sports</strong>, and
        <strong> Workout</strong>.
    </p>

    <p>
        Track GPS routes, distance, speed, pace, duration,
        and workout statistics depending on your activity.
        Save your sessions, monitor your progress, explore
        your activity history, and share achievements with
        the FiTrack community.
    </p>

    <div className="help-grid help-grid--three help-activity-grid">
        <HelpCard
            icon={<FaRunning />}
            title="Running"
            text="Track outdoor runs with GPS routes, distance, duration, average pace, and running statistics."
        />

        <HelpCard
            icon={<FaWalking />}
            title="Walking"
            text="Record daily walks, explore your routes, and monitor distance, duration, pace, and walking progress."
        />

        <HelpCard
            icon={<IoMdBicycle />}
            title="Cycling"
            text="Record bike rides with GPS tracking, distance, average speed, maximum speed, and route statistics."
        />

        <HelpCard
            icon={<FaHiking />}
            title="Hiking"
            text="Explore trails and record hiking adventures with GPS routes, distance, duration, and outdoor activity statistics."
        />

        <HelpCard
            icon={<TbKayak />}
            title="Kayaking"
            text="Track kayaking sessions on the water with GPS routes, distance, duration, average speed, and maximum speed."
        />

        <HelpCard
            icon={<FaSwimmer />}
            title="Swimming"
            text="Log swimming sessions, track training duration, distance, and relevant swimming performance statistics."
        />

        <HelpCard
            icon={<TbBallTennis />}
            title="Tennis"
            text="Record tennis practice and matches, including session duration, training intensity, and estimated calories burned."
        />

        <HelpCard
            icon={<FaSkiing />}
            title="Winter Sports"
            text="Keep a record of winter activities, including skiing and snowboarding, with relevant session and performance statistics."
        />

        <HelpCard
            icon={<FaDumbbell />}
            title="Workout"
            text="Log strength training, CrossFit, functional workouts, and other gym sessions with duration, intensity, and estimated calories."
        />
    </div>
</div>


        </section>

        {/* NAVIGATION */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>02</span>
            <div>
              <h2>Navigation</h2>
              <p>Everything you need is organized around your activity.</p>
            </div>
          </div>

          <div className="help-grid">
            <HelpCard
              icon={<FaBarsStaggered className="fs-2" />}
              title="menu"
              text="Mobile menu"
            />

            <HelpCard
              icon={<FaRegDotCircle className="fs-2" />}
              title="Rec"
              text="Recording your run"
            />

            <HelpCard
              icon={
                <FaConfluence
                  className="fs-2"
                  style={{ transform: "rotate(-45deg)" }}
                />
              }
              title="Runs"
              text="Your running activity, saved workouts and running history."
            />

            <HelpCard
              icon={<FaRegBell className="fs-2" />}
              title="Message"
              text="Messages from our resource. We send you all important information."
            />

            <HelpCard
              icon={<FaSearch className="fs-2" />}
              title="Search"
              text="The field with the search icon is a site search."
            />

            <HelpCard
              icon={<IoBag className="fs-2" />}
              title="Cart"
              text="Your shopping cart and premium checkout."
            />

            <HelpCard
              icon={<FaBolt className="fs-2" />}
              title="REC-Power"
              text="In the race feed, you can give REC-Power to someone and also receive REC-Power."
            />

            <HelpCard
              icon={<FaRegComments className="fs-2" />}
              title="Comments"
              text="You can comment on other people's races as well as your own."
            />

            <HelpCard
              // icon={<FaShare color="#db3206" />}
              icon={<FaShare className="fs-2" />}
              title="Share"
              text="Share your runs and events with others!"
            />
          </div>
        </section>

        {/* GPS */}
        <section className="help-section">
          <div className="help-section__heading">
            <span>03</span>

            <div>
              <h2>Map & GPS</h2>
              <p>How the map works during your run</p>
            </div>
          </div>

          <div className="help-card">
            <div className="help-card__icon">{/* <FaMapMarkedAlt /> */}</div>

            <h3>Your route is tracked automatically</h3>

            <p>
              During a run, FiTrack uses your device's GPS to determine your
              current location and build your route on the map.
            </p>

            <p>
              As you move, new GPS points are added to the route and your
              distance is updated automatically.
            </p>

            <div className="help-highlight">
              <FaLocationArrow />
              <span>
                Make sure location access is enabled for FiTrack before starting
                a run.
              </span>
            </div>
          </div>

          <div className="help-grid help-grid--two">
            <div className="help-feature-card">
              {/* <div className="help-feature-card__icon">
        <FaMap />
      </div> */}

              <h3>Move around the map</h3>

              <p>
                You can drag the map and zoom in or out at any time to inspect
                your current route.
              </p>
            </div>

            <div className="help-feature-card">
              {/* <div className="help-feature-card__icon">
        <FaRoute />
      </div> */}

              <h3>Your route</h3>

              <p>
                The line on the map represents the route recorded during your
                current run.
              </p>
            </div>
          </div>

          <div className="help-section__heading" style={{ marginTop: "55px" }}>
            <span>03.1</span>

            <div>
              <h2>Reset map position</h2>
              <p>Use the reset button whenever you need it</p>
            </div>
          </div>

          <div className="help-warning">
            <div className="help-warning__icon">
              <FaRotate color="#db3206" />
            </div>

            <div>
              <h3>Reset does not reset your run</h3>

              <p>
                The <strong>Reset</strong> button is located in the top-right
                corner of the map. You can use it at any time while recording a
                run.
              </p>

              <p>
                It only returns the map view to your current GPS position. Your
                distance, duration, steps and recorded route are not reset.
              </p>

              <p>
                For example, if you moved the map away from your location and
                want to quickly return to yourself, simply press the reset
                button.
              </p>
            </div>
          </div>

          <div className="help-important" style={{ marginTop: "18px" }}>
            <div className="help-important__item">
              {/* <FaLocationCrosshairs /> */}

              <div>
                <strong>GPS position looks wrong</strong>

                <p>
                  If your position appears far away from your actual location or
                  the map suddenly jumps to another place, the GPS signal may
                  not have initialized correctly.
                </p>
              </div>
            </div>

            <div className="help-important__item">
              {/* <FaRotate /> */}

              <div>
                <strong>When to restart the run</strong>

                <p>
                  If FiTrack immediately shows an incorrect position or starts
                  adding an unrealistic distance, restart the recording before
                  continuing your run.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="help-section">
          <div className="help-section__heading">
            <span>04</span>
            <div>
              <h2>GPS & location</h2>
              <p>
                Accurate GPS data is essential for accurate running statistics.
              </p>
            </div>
          </div>

          <div className="help-warning">
            {/* <div className="help-warning__icon">
              <FaTriangleExclamation />
            </div> */}

            <div>
              <h3>Important after starting a run</h3>

              <p>
                Sometimes your device may initially provide an incorrect GPS
                position. This can happen especially when the GPS signal has not
                stabilized yet.
              </p>

              <p>
                If immediately after starting the recording you see that FiTrack
                has placed you in the wrong location or the distance starts
                increasing incorrectly, <strong>restart the run.</strong>
              </p>

              <p>
                Stop the current recording and start a new one after the GPS
                position has stabilized.
              </p>
            </div>
          </div>

          <div className="help-grid help-grid--two">
            <HelpCard
              icon={<FaTriangleExclamation />}
              title="Correct location"
              text="Your current position should appear where you actually are."
            />

            <HelpCard
              icon={<FaTriangleExclamation />}
              title="Correct distance"
              text="Distance should begin increasing only as you actually move."
            />
          </div>
        </section>

        {/* DURING RUN */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>05.0</span>
            <div>
              <h2>During your run</h2>
              <p>FiTrack tracks the important information about your workout.</p>
            </div>
          </div>

          <div className="help-stats">
            <div className="help-stat">
              <strong>Distance</strong>
              <span>Total distance covered during the run.</span>
            </div>

            <div className="help-stat">
              <strong>Duration</strong>
              <span>How long your workout has been active.</span>
            </div>

            <div className="help-stat">
              <strong>Pace</strong>
              <span>Your running pace based on time and distance.</span>
            </div>

            <div className="help-stat">
              <strong>Route</strong>
              <span>Your GPS route recorded on the map.</span>
            </div>

            <div className="help-stat">
              <strong>Steps</strong>
              <span>Your activity can also be represented through steps.</span>
            </div>
          </div>
        </section>

{/* CYCLING */}

<section className="help-section" id="cycling">
  <div className="help-section__heading">
    <span>05.1</span>

    <div>
      <h2>Cycling</h2>
      <p>
        Track your rides, explore routes and monitor
        your cycling performance.
      </p>
    </div>
  </div>

  <div className="help-card">
    <h3>How Cycling works</h3>

    <p>
      Cycling is a dedicated activity mode in FiTrack
      designed for recording bicycle rides and reviewing
      cycling-specific performance data.
    </p>

    <p>
      When recording a ride, FiTrack uses GPS location
      information to track your movement, calculate
      distance and build your route.
    </p>

    <p>
      Unlike running, where pace is an important metric,
      cycling focuses on speed and distance.
    </p>

    <div className="help-highlight">
      <IoMdBicycle />

      <span>
        Cycling activities are saved as rides and
        displayed separately from running and workout
        sessions through their activity type.
      </span>
    </div>
  </div>

  <div className="help-section__heading" style={{ marginTop: "45px" }}>
    <span>05.2</span>

    <div>
      <h2>Cycling statistics</h2>
      <p>
        Understand the information recorded during your ride.
      </p>
    </div>
  </div>

  <div className="help-grid help-grid--two">
    <HelpCard
      icon={<IoMdBicycle />}
      title="Distance"
      text="The total distance covered during your cycling activity, displayed in kilometers."
    />

    <HelpCard
      icon={<FaStopwatch />}
      title="Duration"
      text="The total recorded time of your cycling session."
    />

    <HelpCard
      icon={<FaInfo />}
      title="Average speed"
      text="Your average cycling speed during the recorded activity, displayed in km/h."
    />

    <HelpCard
      icon={<FaInfo />}
      title="Maximum speed"
      text="The highest recorded cycling speed during your ride, displayed in km/h."
    />

    <HelpCard
      icon={<FaMapMarkedAlt />}
      title="GPS route"
      text="Your recorded cycling route, built from available GPS location points."
    />

    <HelpCard
      icon={<FaLocationArrow />}
      title="Location"
      text="Location information associated with your cycling activity."
    />
  </div>

  <div className="help-card" style={{ marginTop: "18px" }}>
    <h3>After your ride</h3>

    <p>
      Once your cycling activity has been saved,
      it becomes part of your FiTrack activity history.
    </p>

    <p>
      You can open the activity details to review
      your cycling statistics, photos and other
      saved information.
    </p>

    <p>
      Cycling activities can also be presented and
      shared through FiTrack's activity sharing features.
    </p>
  </div>

  <div className="help-important" style={{ marginTop: "18px" }}>
    <div className="help-important__item">
      <FaLocationCrosshairs />

      <div>
        <strong>Check GPS before riding</strong>

        <p>
          Make sure your device has a reliable location
          signal before starting a cycling activity.
        </p>
      </div>
    </div>

    <div className="help-important__item">
      <FaTriangleExclamation />

      <div>
        <strong>Speed depends on GPS accuracy</strong>

        <p>
          Weak GPS reception or unexpected location
          jumps may affect recorded speed and distance.
        </p>
      </div>
    </div>
  </div>
</section>

{/* WORKOUT */}

<section className="help-section" id="workout">
  <div className="help-section__heading">
    <span>05.3</span>

    <div>
      <h2>Workout</h2>

      <p>
        Record training sessions beyond running and cycling.
      </p>
    </div>
  </div>

  <div className="help-card">
    <h3>How Workout works</h3>

    <p>
      Workout is a dedicated activity type for recording
      fitness sessions that do not require a running
      or cycling route.
    </p>

    <p>
      It is suitable for strength training, gym sessions,
      bodyweight exercises and other types of physical
      workouts.
    </p>

    <p>
      Workout activities focus on training information
      such as duration, workout type, intensity and
      estimated energy expenditure.
    </p>

    <div className="help-highlight">
      <FaDumbbell />

      <span>
        Workout sessions use training-specific statistics
        instead of running pace or cycling speed.
      </span>
    </div>
  </div>

  <div className="help-section__heading" style={{ marginTop: "45px" }}>
    <span>05.4</span>

    <div>
      <h2>Workout statistics</h2>

      <p>
        Understand the information displayed in
        your saved workout.
      </p>
    </div>
  </div>

  <div className="help-grid help-grid--two">
    <HelpCard
      icon={<FaStopwatch />}
      title="Duration"
      text="The total duration of your training session."
    />

    <HelpCard
      icon={<FaDumbbell />}
      title="Workout type"
      text="The category or type of training associated with your workout session."
    />

    <HelpCard
      icon={<FaBolt />}
      title="Intensity"
      text="The recorded intensity level of your workout."
    />

    <HelpCard
      icon={<FaBolt />}
      title="Estimated calories"
      text="An estimated amount of energy expended during your training session. This is an approximation, not a medical measurement."
    />

    <HelpCard
      icon={<FaDumbbell />}
      title="Body weight"
      text="Your body weight in kilograms, when provided as part of the workout information."
    />

    <HelpCard
      icon={<FaStopwatch />}
      title="Date"
      text="The date and time associated with your saved training session."
    />
  </div>

  <div className="help-card" style={{ marginTop: "18px" }}>
    <h3>Saving your workout</h3>

    <p>
      After completing a training session, your workout
      can be saved as a separate activity in FiTrack.
    </p>

    <p>
      Saved workouts can include a title, notes,
      photos and workout-specific statistics.
    </p>

    <p>
      You can open your workout details later to
      review the recorded information and share
      your training activity.
    </p>
  </div>

  <div className="help-important" style={{ marginTop: "18px" }}>
    <div className="help-important__item">
      <FaDumbbell />

      <div>
        <strong>No GPS route required</strong>

        <p>
          Workout sessions are designed around training
          information and do not require a running
          or cycling route.
        </p>
      </div>
    </div>

    <div className="help-important__item">
      <FaBolt />

      <div>
        <strong>Calories are estimates</strong>

        <p>
          Estimated calorie values may differ from
          your actual energy expenditure.
        </p>
      </div>
    </div>
  </div>
</section>


        {/* FINISH */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>06</span>
            <div>
              <h2>Finishing a run</h2>
              <p>
                FiTrack uses a deliberate action to prevent accidental stops.
              </p>
            </div>
          </div>

          <div className="help-finish">
            <div className="help-finish__icon">
              <FaStopwatch />
            </div>

            <div>
              <h3>Hold the Stop button for 1.2 seconds</h3>

              <p>
                To finish your recording, press and continuously hold the
                <strong> Stop </strong>
                button for approximately <strong>1.2 seconds</strong>.
              </p>

              <p>
                This prevents accidental termination of a run if the Stop button
                is touched while you are running.
              </p>

              <div className="help-finish__steps">
                <span>01</span>
                <span>Press Stop</span>
                <span>02</span>
                <span>Keep holding</span>
                <span>03</span>
                <span>Release after 1.2 seconds</span>
              </div>
              <p className="pt-3 text-white fs-6">
                If you save a running record and add several photos, you may
                need to wait a while for it to be saved.
              </p>
            </div>
          </div>
        </section>

        {/* RESULTS */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>07</span>
            <div>
              <h2>After your run</h2>
              <p>Your workout becomes part of your FiTrack history.</p>
            </div>
          </div>

          <div className="help-card">
            <h3>Run summary</h3>

            <p>
              After finishing your run, FiTrack processes the workout and
              provides a summary of your activity.
            </p>

            <p>
              You can review your distance, duration, pace and route and keep
              the workout as part of your running history.
            </p>

            <p>
              Completed activity can also contribute toward achievements and
              your overall progress.
            </p>
          </div>
        </section>

        {/* RUNS */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>08</span>
            <div>
              <h2>Runs</h2>
              <p>Your activity history in one place.</p>
            </div>
          </div>

<div className="help-card">
  <h3>Your activity history</h3>

  <p>
    The activity feed brings together your recorded
    Running, Cycling and Workout sessions.
  </p>

  <p>
    Each activity has its own type, allowing you to
    distinguish running records, bicycle rides
    and training sessions.
  </p>

  <p>
    Open an activity to view its details, statistics,
    photos and available interactions.
  </p>

  <p>
    FiTrack displays statistics relevant to each activity:
    pace and distance for running, speed and distance
    for cycling, and training-specific metrics
    for workouts.
  </p>
</div>

        </section>

        {/* RUN LENS */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>09</span>
            <div>
              <h2>Run Lens</h2>
              <p>Turn your running data into something worth sharing.</p>
            </div>
          </div>

          <div className="help-card">
            <h3>Visualize your run</h3>

            <p>
              Run Lens is designed around the visual presentation of your
              running activity.
            </p>

            <p>
              It works with your recorded run data and allows your workout to be
              presented in a more visual and memorable format.
            </p>
          </div>
        </section>

        {/* ACHIEVEMENTS */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>10</span>
            <div>
              <h2>Achievements</h2>
              <p>Every run can move you closer to another milestone.</p>
            </div>
          </div>

          <div className="help-card">
            <h3>Collect achievements</h3>

            <p>
              FiTrack includes an achievement system that rewards running
              progress and completed milestones.
            </p>

            <p>
              As you run and complete workouts, your activity can unlock new
              achievements.
            </p>

            <div className="help-highlight">
              <FaMedal color="#db3206" />
              <span>
                Keep running, reach new milestones and build your collection.
              </span>
            </div>
          </div>
        </section>

        {/* STEPS */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>11</span>
            <div>
              <h2>Steps</h2>
              <p>Track your movement beyond individual runs.</p>
            </div>
          </div>

          <div className="help-card">
            <h3>Step tracking</h3>

            <p>
              The Steps area provides a dedicated experience for step-based
              activity.
            </p>

            <p>
              FiTrack can use your activity data to represent movement through
              steps and connect that activity with your broader progress.
            </p>
          </div>
        </section>

        {/* RACES */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>12</span>
            <div>
              <h2>Races</h2>
              <p>Turn running into competition.</p>
            </div>
          </div>

          <div className="help-card">
            <h3>Running races</h3>

            <p>
              FiTrack includes a race system where users can participate in
              running challenges and competitions.
            </p>

            <p>
              Races provide another way to use your running activity and compete
              around measurable running results.
            </p>
          </div>
        </section>

        {/* PRO */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>13</span>
            <div>
              <h2>FiTrack Pro</h2>
              <p>Additional functionality for advanced users.</p>
            </div>
          </div>

          <div className="help-pro">
            <div className="help-pro__icon">
              <RiVerifiedBadgeFill color="#db3206" />
            </div>

            <div>
              <h3>Pro membership</h3>

              <p>
                FiTrack Pro provides additional functionality, including the
                ability to create races.
              </p>

              <p>
                Pro users can currently create up to{" "}
                <strong>3 races per month</strong>.
              </p>

              <p>
                Race creation is subject to the active Pro subscription and its
                monthly creation limit.
              </p>
            </div>
          </div>
        </section>

        {/* IMPORTANT */}

        <section className="help-section">
          <div className="help-section__heading">
            <span>14</span>
            <div>
              <h2>Important tips</h2>
              <p>A few things to remember before every run.</p>
            </div>
          </div>

          <div className="help-important">
            <div className="help-important__item">
              <FaLocationCrosshairs />
              <div>
                <strong>Check your GPS</strong>
                <p>
                  Make sure your location is correct before you start moving.
                </p>
              </div>
            </div>

            <div className="help-important__item">
              <FaTriangleExclamation />
              <div>
                <strong>Wrong location or instant distance?</strong>
                <p>
                  Restart the recording. Do not continue a run if the initial
                  GPS position or distance is clearly incorrect.
                </p>
              </div>
            </div>

            <div className="help-important__item">
              <FaStopwatch />
              <div>
                <strong>Stopping the run</strong>
                <p>
                  Hold the Stop button for 1.2 seconds to finish the recording.
                </p>
              </div>
            </div>

            <div className="help-important__item">
              <FaMobileScreenButton />
              <div>
                <strong>Keep your device ready</strong>
                <p>
                  GPS tracking depends on your device and browser location
                  services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}

        <section className="help-section help-section--last">
          <div className="help-section__heading">
            <span>15</span>
            <div>
              <h2>FAQ</h2>
              <p>Quick answers to common questions.</p>
            </div>
          </div>

          <div className="help-faq">
            <details>
              <summary>Why did my run start in the wrong location?</summary>

              <p>
                Your device may not have obtained an accurate GPS position yet.
                If the location is clearly wrong immediately after starting,
                stop the recording and start a new run after the GPS stabilizes.
              </p>
            </details>

            <details>
              <summary>Why did distance start increasing immediately?</summary>

              <p>
                This can happen because of an inaccurate initial GPS position.
                If the distance begins increasing while you are not actually
                moving, restart the recording.
              </p>
            </details>

            <details>
              <summary>Why do I need to hold Stop?</summary>

              <p>
                The 1.2 second hold is a safety mechanism designed to prevent an
                accidental touch from ending your run.
              </p>
            </details>

            <details>
              <summary>Where can I see my previous runs?</summary>

              <p>
                Completed running activity is available in the Runs Lens icon.
              </p>
            </details>

            <details>
              <summary>How do I unlock achievements?</summary>

              <p>
                Achievements are connected to your running activity and
                milestones. Continue completing runs and reaching new goals.
              </p>
            </details>

            <details>
              <summary>Who can create races?</summary>

              <p>
                Race creation is available to users with an active FiTrack Pro
                membership, subject to the monthly race creation limit.
              </p>
            </details>
            <details>
              <summary>What does the reset button on the map do?</summary>
              <p>
                The reset button returns the map view to your current GPS
                position. It does not reset your run, distance, duration, steps,
                or recorded route.
              </p>
            </details>

            <details>
              <summary>Can I press reset while I am running?</summary>

              <p>
                Yes. You can press the reset button at any time during an active
                run. It is safe to use whenever you want to return the map to
                your current position.
              </p>
            </details>

            <details>
              <summary>
                What should I do if the GPS shows the wrong location?
              </summary>

              <p>
                First, make sure location access is enabled and try resetting
                the map position. If FiTrack shows a completely incorrect
                location or immediately starts adding a large amount of
                distance, stop and restart the recording before continuing.
              </p>
            </details>

            <details>
              <summary>Does resetting the map delete my route?</summary>

              <p>
                No. Resetting only changes the map view. Your recorded route,
                distance, duration and steps remain unchanged.
              </p>
            </details>

<details>
  <summary>What activity types does FiTrack support?</summary>

  <p>
    FiTrack supports Running, Cycling and Workout.
    Each activity type has its own relevant statistics
    and activity details.
  </p>
</details>

<details>
  <summary>What is the difference between Running and Cycling?</summary>

  <p>
    Running focuses on pace, distance and duration.
    Cycling focuses on distance, average speed,
    maximum speed and ride duration.
    Both can use GPS to record routes.
  </p>
</details>

<details>
  <summary>Does Workout require GPS?</summary>

  <p>
    No. Workout is designed for training sessions
    that do not require GPS route tracking.
  </p>
</details>

<details>
  <summary>What information is saved for a workout?</summary>

  <p>
    Workout details may include duration, workout type,
    intensity, estimated calories, body weight,
    notes and photos, depending on the recorded data.
  </p>
</details>

<details>
  <summary>Can I share cycling and workout activities?</summary>

  <p>
    Yes. FiTrack supports sharing different activity
    types, including running, cycling and workouts,
    using their relevant statistics.
  </p>
</details>

<details>
  <summary>Do cycling and workout activities unlock running achievements?</summary>

  <p>
    Running achievements are associated with running
    activity. Cycling and Workout have their own
    activity statistics and do not automatically
    count toward running-specific achievements.
  </p>
</details>

          </div>
        </section>

<section
    className="help-section ft-support-section"
    id="live-support"
>
    <div className="help-section__heading">
        <span>16</span>

        <div>
            <h2>Support Center</h2>
            <p>
                Need additional help? Contact the FiTrack team directly.
            </p>
        </div>
    </div>

    <div className="ft-support-section__intro">
        <div className="ft-support-section__icon">
            <FiHeadphones />
        </div>

        <div>
            <h3>We're here to help</h3>
            <p>
                Have a question, found a bug, or need assistance
                with your account? Send us a private message.
            </p>
        </div>
    </div>

    {user ? (
        <SupportChat user={user} />
    ) : (
        <div className="ft-support-login">
            <FiLock size={24} />
            <h3>Sign in to contact support</h3>
            <p>
                You need a FiTrack account to start a
                private support conversation.
            </p>
            <a href="/login">Sign in</a>
        </div>
    )}
</section>

      </div>
    </main>
  );
}

function HelpCard({ icon, title, text }) {
  return (
    <div className="help-feature-card">
      <div className="help-feature-card__icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}
