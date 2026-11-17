import { useState } from "react";

import {
  FaSearch,
  FaRunning,
  FaFireAlt,
  FaUsers,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "./racefilters.scss";

const RaceFilters = ({ races, setFiltered }) => {
  const [filters, setFilters] = useState({
    search: "",
    distance: "",
    difficulty: "",
    gender: "",
    location: "",
  });

  const changeFilter = (e) => {
    const updated = {
      ...filters,
      [e.target.name]: e.target.value,
    };

    setFilters(updated);

    applyFilters(updated);
  };

  const applyFilters = (data) => {
    let result = [...races];

    if (data.search) {
      result = result.filter((race) =>
        race.title
          ?.toLowerCase()
          .includes(data.search.toLowerCase()),
      );
    }

    if (data.distance) {
      result = result.filter(
        (race) => String(race.distance) === data.distance,
      );
    }

    if (data.difficulty) {
      result = result.filter(
        (race) => race.difficulty === data.difficulty,
      );
    }

    if (data.gender) {
      result = result.filter(
        (race) => race.gender === data.gender,
      );
    }

    if (data.location) {
      result = result.filter((race) =>
        race.location
          ?.toLowerCase()
          .includes(data.location.toLowerCase()),
      );
    }

    setFiltered(result);
  };

  return (
    <div className="race-filters">

      <div className="race-filters-header">
        <div className="race-filters-header-icon">
          <FaSearch />
        </div>

        <div>
          <h3>Find your race</h3>
          <span>
            Search and filter available races
          </span>
        </div>
      </div>

      <div className="race-filters-grid">

        {/* SEARCH */}

        <div className="race-filter-field race-filter-search">
          <label htmlFor="race-search">
            Race
          </label>

          <div className="race-filter-input-wrapper">
            <FaSearch />

            <input
              id="race-search"
              type="text"
              placeholder="Search race..."
              name="search"
              value={filters.search}
              onChange={changeFilter}
            />
          </div>
        </div>

        {/* DISTANCE */}

        <div className="race-filter-field">
          <label htmlFor="race-distance">
            Distance
          </label>

          <div className="race-filter-input-wrapper">
            <FaRunning />

            <select
              id="race-distance"
              name="distance"
              value={filters.distance}
              onChange={changeFilter}
            >
              <option value="">
                All distances
              </option>

              <option value="5 km">
                5 km
              </option>

              <option value="10 km">
                10 km
              </option>

              <option value="21 km">
                Half Marathon
              </option>

              <option value="42 km">
                Marathon
              </option>
            </select>
          </div>
        </div>

        {/* DIFFICULTY */}

        <div className="race-filter-field">
          <label htmlFor="race-difficulty">
            Difficulty
          </label>

          <div className="race-filter-input-wrapper">
            <FaFireAlt />

            <select
              id="race-difficulty"
              name="difficulty"
              value={filters.difficulty}
              onChange={changeFilter}
            >
              <option value="">
                All levels
              </option>

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>
            </select>
          </div>
        </div>

        {/* GENDER */}

        <div className="race-filter-field">
          <label htmlFor="race-gender">
            Gender
          </label>

          <div className="race-filter-input-wrapper">
            <FaUsers />

            <select
              id="race-gender"
              name="gender"
              value={filters.gender}
              onChange={changeFilter}
            >
              <option value="">
                All participants
              </option>

              <option value="All">
                All
              </option>

              <option value="Men">
                Men
              </option>

              <option value="Women">
                Women
              </option>
            </select>
          </div>
        </div>

        {/* LOCATION */}

        <div className="race-filter-field">
          <label htmlFor="race-location">
            Location
          </label>

          <div className="race-filter-input-wrapper">
            <FaMapMarkerAlt />

            <input
              id="race-location"
              type="text"
              placeholder="City or location..."
              name="location"
              value={filters.location}
              onChange={changeFilter}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default RaceFilters;