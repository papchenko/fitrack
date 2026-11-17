import RacePage from "./RacePage";

import CreateRaceButton from "./CreateRaceButton";

import './races.scss'

const Races = () => {
  return (
    <div className="races-wrapper">
      <div className="container py-4">
        <div
          className="
            d-flex
            justify-content-center
            align-items-center
            mb-3
            ">
          <CreateRaceButton />
        </div>
        <RacePage />
      </div>
    </div>
  );
};

export default Races;