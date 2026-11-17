import { useState } from "react";
import Likes from "./Likes";
import Comments from "./Comments";
import { FaShare } from "react-icons/fa";

import RunShareModal from "./share/RunShareModal";

import "./interactions.scss";

export default function Interactions({
  routeId,
  routeUid,
  usersData,
  currentUser,
  photos,
  route,
  distance,
  pace,
  steps,
  duration,
  timestamp,
  locationName,
  username,
  avatarUrl,
  title,
  premiumPackage,
  activityType = "running",
  winterDiscipline,
  calories,
  averageSpeed,
  maxSpeed,
  exercises,
  sets,
  tennisTypeLabel,
  met,
}) {
  const [showStory, setShowStory] = useState(false);

  const isOwnRun =
    currentUser?.uid &&
    routeUid &&
    currentUser.uid === routeUid;

  return (
    <div className="interactions">
      <Likes
        routeId={routeId}
        usersData={usersData}
        currentUser={currentUser}
      />

      <Comments
        routeId={routeId}
        usersData={usersData}
        currentUser={currentUser}
      />

      {isOwnRun && (
        <>
          <button
            type="button"
            className="share-btn"
            onClick={() => setShowStory(true)}
            aria-label="Share activity"
            title="Share activity"
          >
            <FaShare color="white" size={22} />
          </button>

          {showStory && (
            <RunShareModal
              onClose={() => setShowStory(false)}
              routeId={routeId}
              title={title}
              username={username}
              avatarUrl={avatarUrl}
              premiumPackage={premiumPackage}
              photos={photos}
              route={route}
              distance={distance}
              pace={pace}
              steps={steps}
              duration={duration}
              timestamp={timestamp}
              locationName={locationName}
activityType={activityType}
winterDiscipline={winterDiscipline}
calories={calories}
averageSpeed={averageSpeed}
maxSpeed={maxSpeed}
exercises={exercises}
sets={sets}
tennisTypeLabel={tennisTypeLabel}
met={met}
            />
          )}
        </>
      )}
    </div>
  );
}