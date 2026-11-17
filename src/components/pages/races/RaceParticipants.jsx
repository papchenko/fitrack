import { useEffect, useState } from "react";

import { getRaceParticipants } from "./raceService";

import { RiVerifiedBadgeFill } from "react-icons/ri";



const RaceParticipants = ({ race, onCountChange }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, [race.id]);

  const loadParticipants = async () => {
    try {
      setLoading(true);

      const data = await getRaceParticipants(race.id);

      setParticipants(data);

      onCountChange?.(data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 p-3">
      <button className="btn btn-outline-light" onClick={() => setOpen(!open)}>
        {open
          ? "Hide participants"
          : `Participants (${participants.length || race.participantsCount || 0})`}
      </button>

      {open && (
        <div className="mt-3 p-3 border rounded">
          <h5 className="text-white">Registered runners</h5>

          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-light" role="status" />
            </div>
          )}

          {!loading && participants.length === 0 && (
            <p className="text-secondary">No participants yet</p>
          )}

          {!loading && participants.length > 0 && (
            <ul className="list-unstyled">
              {participants.map((runner) => (
                <li
                  key={runner.id}
                  className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <div
                    style={{
                      position: "relative",
                      width: 46,
                      height: 46,
                      flexShrink: 0,
                    }}>
                    {runner.avatar ? (
                      <img
                        src={runner.avatar}
                        alt={runner.username || "Runner"}
                        className="race-participant-avatar"
                      />
                    ) : (
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#fff",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          overflow: "hidden",
                        }}>
                        {Array.from(runner.username || "?")[0] || "?"}
                      </div>
                    )}

                    {runner.premiumPackage?.active &&
                      runner.premiumPackage?.title === "Pro" && (
                        <RiVerifiedBadgeFill
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            color: "#ffd700",
                            fontSize: "1.25rem",
                            zIndex: 5,
                            filter:
                              "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))",
                          }}
                        />
                      )}
                  </div>

                  <div className="flex-grow-1">
                    <strong className="text-white">{runner.username}</strong>

                    <div className="text-secondary">{runner.category}</div>

                    <div className="small text-secondary">
                      Registered:{" "}
                      {runner.registeredAt?.seconds
                        ? new Date(
                            runner.registeredAt.seconds * 1000,
                          ).toLocaleString()
                        : "-"}
                    </div>
                  </div>

                  <div>
                    {runner.checkedIn ? (
                      <span className="badge bg-success">Checked In</span>
                    ) : (
                      <span className="badge bg-warning text-dark">
                        Waiting
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default RaceParticipants;
