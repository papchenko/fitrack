import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../account/AuthContext";
import { toast } from "react-toastify";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import {
  FaArrowRight,
  FaCrown,
  FaFlagCheckered,
  FaChartLine,
  FaRunning,
} from "react-icons/fa";

import "swiper/css";
import "./hero.scss";

const Hero = () => {
  const [progress, setProgress] = useState(0);

  const swiperRef = useRef(null);

  const navigate = useNavigate();

  const { user } = useAuth();

  const handleProtectedNavigate = (path) => {
    if (!user) {
      toast.info("Please sign in to continue.");
      return;
    }

    navigate(path);
  };

  return (
    <section className="hero-header">

      <Swiper
        ref={swiperRef}
        modules={[Autoplay]}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 15000,
          disableOnInteraction: false,
        }}
        onAutoplayTimeLeft={(swiper, time, percentage) =>
          setProgress(1 - percentage)
        }
      >

        {/* =====================================================
            SLIDE 1 — TEAM RACES
        ===================================================== */}

        <SwiperSlide>
          <div
            className="hero-slide hero-slide--races"
            style={{
              backgroundImage:
                "url('/path-to-your-image1.jpg')",
            }}
          >

            <div className="hero-slide__overlay"></div>

            <div className="hero-slide__grid"></div>

            <div className="hero-content container">

              <div className="hero-content__inner">

                <div className="hero-eyebrow">
                  <span className="hero-eyebrow__icon">
                    <FaFlagCheckered />
                  </span>

                  <span>TEAM RACES</span>
                </div>

                <h1 className="hero-title">
                  Run together.
                  <span> Compete together.</span>
                </h1>

                <p className="hero-description">
                  Join team-based competitions, track results
                  in real time and fight for the top positions
                  together with your team.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="hero-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProtectedNavigate("/races");
                    }}
                  >
                    <span>Join a Race</span>
                    <FaArrowRight />
                  </button>

                  <div className="hero-stat">
                    {/* <strong>01</strong> */}
                    <span>TEAM RACES</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </SwiperSlide>


        {/* =====================================================
            SLIDE 2 — PREMIUM
        ===================================================== */}

        <SwiperSlide>
          <div
            className="hero-slide hero-slide--premium"
            style={{
              backgroundImage:
                "url('/path-to-your-image2.jpg')",
            }}
          >

            <div className="hero-slide__overlay"></div>

            <div className="hero-slide__grid"></div>

            <div className="hero-content container">

              <div className="hero-content__inner">

                <div className="hero-eyebrow">
                  <span className="hero-eyebrow__icon">
                    <FaCrown />
                  </span>

                  <span>FiTrack PREMIUM</span>
                </div>

                <h1 className="hero-title">
                  Unlock your
                  <span> full potential.</span>
                </h1>

                <p className="hero-description">
                  Get access to premium features, advanced
                  analytics and powerful tools designed to
                  help you become a better runner.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="hero-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProtectedNavigate("/premium");
                    }}
                  >
                    <span>Explore Premium</span>
                    <FaArrowRight />
                  </button>

                  <div className="hero-stat">
                    {/* <strong>02</strong> */}
                    <span>FiTrack PREMIUM</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </SwiperSlide>


        {/* =====================================================
            SLIDE 3 — WEIGHT CONTROL
        ===================================================== */}

        <SwiperSlide>
          <div
            className="hero-slide hero-slide--weight"
            style={{
              backgroundImage:
                "url('/path-to-your-image3.jpg')",
            }}
          >

            <div className="hero-slide__overlay"></div>

            <div className="hero-slide__grid"></div>

            <div className="hero-content container">

              <div className="hero-content__inner">

                <div className="hero-eyebrow">
                  <span className="hero-eyebrow__icon">
                    <FaChartLine />
                  </span>

                  <span>WEIGHT CONTROL</span>
                </div>

                <h1 className="hero-title">
                  Track.
                  <span> Improve. Repeat.</span>
                </h1>

                <p className="hero-description">
                  Track your daily weight, monitor your progress,
                  understand your habits and build a consistent
                  routine around your goals.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="hero-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProtectedNavigate("/weight-control");
                    }}
                  >
                    <span>Track Progress</span>
                    <FaArrowRight />
                  </button>

                  <div className="hero-stat">
                    {/* <strong>03</strong> */}
                    <span>WEIGHT CONTROL</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </SwiperSlide>


        {/* =====================================================
            SLIDE 4 — RUNNING PLANS
        ===================================================== */}

        <SwiperSlide>
          <div
            className="hero-slide hero-slide--plans"
            style={{
              backgroundImage:
                "url('/path-to-your-image3.jpg')",
            }}
          >

            <div className="hero-slide__overlay"></div>

            <div className="hero-slide__grid"></div>

            <div className="hero-content container">

              <div className="hero-content__inner">

                <div className="hero-eyebrow">
                  <span className="hero-eyebrow__icon">
                    <FaRunning />
                  </span>

                  <span>RUNNING PLANS</span>
                </div>

                <h1 className="hero-title">
                  Your training.
                  <span> Your next goal.</span>
                </h1>

                <p className="hero-description">
                  Create a personalized training plan, follow
                  your weekly workouts and connect your training
                  schedule with your recorded runs.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="hero-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProtectedNavigate("/running-plans");
                    }}
                  >
                    <span>Build Your Plan</span>
                    <FaArrowRight />
                  </button>

                  <div className="hero-stat">
                    {/* <strong>04</strong> */}
                    <span>RUNNING PLANS</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </SwiperSlide>

      </Swiper>


      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <div className="hero-progress">

        <div className="hero-progress__track">
          <div
            className="hero-progress__fill"
            style={{
              transform: `scaleY(${progress})`,
            }}
          />
        </div>

        <div className="hero-progress__label">
          {/* <span>04</span> */}
        </div>

      </div>


      {/* =====================================================
          BOTTOM INDICATOR
      ===================================================== */}

      {/* <div className="hero-bottom">

        <div className="hero-bottom__line"></div>

        <div className="hero-bottom__text">
          <span>FiTrack</span>
          <span>RUN • TRACK • COMPETE</span>
        </div>

      </div> */}

    </section>
  );
};

export default Hero;