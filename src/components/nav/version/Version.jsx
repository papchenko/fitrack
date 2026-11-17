// import av from '../../../assets/author.svg';
import av from "../../../assets/author.svg";

/* Swiper */
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import "./version.scss";

const team = [
  // {
  //   id: 2,
  //   description:
  //     'Make running more enjoyable and accessible for everyone. Record every workout, track your progress, manage your fitness journey, and easily register for upcoming races while connecting with runners who share your passion.',
  //   role: 'Team',
  // },
  // {
  //   id: 1,
  //   description:
  //     'Every feature of this platform is designed to help you become a better runner. Log your activities, monitor your health and weight, join races, and celebrate every milestone with a community that shares your passion for running.',
  //   role: 'Team',
  // },
  {
    id: 3,
    name: "Mykola",
    role: "Creator",
    img: av,
    description:
      "I'm an active sports and running person myself. Recording my runs, creating team competitions, and a weight control system is a really useful platform.",
  },
];

const Team = () => {
  return (
    <section className="testimonial-container section">
      <div className="team__container container pb-3">
        <div className="row text-center mb-2">
          <div className="section-title pt-4">
            <p>Our Team</p>
            {/* <h2>Those who work on the project</h2> */}
          </div>
        </div>

        <div className="container">
          <div className="author-wrapper">
            <Swiper
              className="tst-swiper"
              modules={[Pagination]}
              loop
              spaceBetween={20}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}>
              {team.map((item) => (
                <SwiperSlide key={item.id}>
                  <div className="tst-item">
                    <p className="author-description fs-5 mb-4">
                      {item.description}
                    </p>

                    {(item.name || item.img) && (
                      <div className="tst-user d-flex align-items-center gap-2 pb-3">
                        {item.img && (
                          <img
                            src={item.img}
                            alt={item.name || "Author"}
                            className="img-fluid rounded-circle border-white"
                            width={40}
                            height={40}
                          />
                        )}

                        {item.name && (
                          <p className="mb-0 mx-2 text-white fs-5">
                            {item.name}
                          </p>
                        )}
                      </div>
                    )}

                    {item.role && (
                      <div className="tst-footer d-flex align-items-center justify-content-between">
                        <p className="mb-0" style={{ color: "#fd5200" }}>
                          {item.role}
                        </p>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <div className="version-wrapper">
        <div className="">
          {/* <div className="version-content col-md-6"> */}
          <div className="tst-banner rounded-5 overflow-hidden position-relative">
            <h4>Stable Version 18.0.0</h4>
            <span className="fs-5" style={{ color: "#fd5200" }}>
              Release 90_9316
            </span>
            <div className="list-updates pt-1">
              <p className="fs-6 m-0">3.0.0 Release project.</p>
              <p className="fs-6 m-0">
                3.1.0 Global and personal record viewing is now available.
              </p>
              <p className="fs-6 m-0">
                3.2.0 Added ability to change your avatar, as well as change
                your username.
              </p>
              <p className="fs-6 m-0">3.3.0 Added Achievements.</p>
              <p claыssName="fs-6 m-0">
                3.4.0 Release Likes, Comments, Share on Lens.
              </p>
              <p className="fs-6 m-0">
                3.5.0 User and Lens search implemented.
              </p>
              <p className="fs-6 m-0">
                3.6.0 Ability to add friends, send personal messages.
              </p>
              <p className="fs-6 m-0">3.7.0 Added notification for users.</p>
              <p className="fs-6 m-0">
                3.8.0 Shop is now available for orders.
              </p>
              <p className="fs-6 m-0">
                3.9.3 Premium is now available for orders.
              </p>
              <p className="fs-6 m-0">4.0.1 Fix bugs & Design changes.</p>
              <p className="fs-6 m-0">5.0.5 Weight Control Pro v 1.0</p>
              <p className="fs-6 m-0">
                5.5.1 Completely updated interface Rec. New features added
                Notes, GPS Signal
              </p>
              <p className="fs-6 m-0">
                6.7.0 FiTrack Races released with race creation, registration, QR
                tickets and Premium access.
              </p>
              <p className="fs-6 m-0">7.0.0 Running Plans v 2.0</p>
              <p className="fs-6 m-0">6.0.0 New system of achieved</p>
              <p className="fs-6 m-0">7.0.0 New system of Team Race 2.0</p>
              <p className="fs-6 m-0">7.3.0 Running Plans v 3.0</p>
              <p className="fs-6 m-0">
                8.6.3 Major improvements to the run recording system: map,
                locations, recording while the screen is off, and many other
                enhancements.
              </p>
              <p className="fs-6 m-0">9.7.0 Release FiTrack Club v 1.6</p>
              <p className="fs-6 m-0">10.0.0 Complete project redesign.</p>

              <p className="fs-6 m-0">
                11.0.0 Cycling Mode — Introducing a dedicated cycling activity
                system with GPS route tracking, distance, duration, average
                speed, maximum speed and cycling-specific statistics.
              </p>

              <p className="fs-6 m-0">
                12.0.0 Workout Mode — Introducing workout activity recording
                with training types, intensity levels, duration, estimated
                calories, body weight, exercises and sets.
              </p>

              <p className="fs-6 m-0">
                13.0.0 FiTrack Share Studio — A redesigned activity sharing
                system with five creative sharing modes, customizable layouts
                and support for Running, Cycling and Workout statistics.
              </p>

              <p className="fs-6 m-0">
                14.0.0 Activity Management — Users can now edit and delete their
                published activities, update activity details and manage their
                records.
              </p>

              <p className="fs-6 m-0">
                14.4.0 Multi-Activity Experience — Improved activity feed,
                search and detail pages with dedicated statistics and visual
                presentation for Running, Cycling and Workout.
              </p>
              <p className="fs-6 m-0">
                15.0.0 Expanded Achievements System — Introducing dedicated
                achievements for Cycling and Workout. Users can now unlock
                activity-specific badges, reach new milestones and track their
                achievements across Running, Cycling and Workout.
              </p>

              <p className="fs-6 m-0">
                16.0.0 Next-Generation Mapping System — Completely rebuilt the
                mapping experience introducing
                modern vector maps, smoother GPS route visualization, improved
                map performance and four customizable map styles: Standard,
                Dark, Outdoor and Satellite.
              </p>

              <p className="fs-6 m-0">
                17.0.0 New Activity Modes — Introducing three new dedicated
                activity tracking modes: Hiking, Kayaking and Tennis. Expanded
                FiTrack's multi-sport experience with activity-specific
                recording, statistics and performance tracking.
              </p>

              <p className="fs-6 m-0">
                18.0.0 FiTrack Share Studio 2.0 — A major upgrade to the activity
                sharing experience with improved layouts, enhanced image
                rendering, optimized avatar presentation and expanded support
                for Running, Cycling, Hiking, Kayaking, Workout and Tennis
                activities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
