import { useEffect, useState } from "react";

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import { db } from "../../../firebase";

import RaceCard from "./RaceCard";
import RaceFilters from "./RaceFilters";

const RacePage = () => {
  const [races, setRaces] = useState([]);

  const [filteredRaces, setFilteredRaces] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const racesRef = collection(db, "races");

    const q = query(racesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRaces(data);

        setFilteredRaces(data);

        setLoading(false);
      },
      (error) => {
        console.error("Loading races error:", error);

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="race-page main-wrapper text-white">
      <div className="container">
        <div className="d-flex justify-content-center align-items-center mb-4">
          <RaceFilters races={races} setFiltered={setFilteredRaces} />
        </div>

        {loading ? (
          <p>Loading races...</p>
        ) : filteredRaces.length === 0 ? (
          <p>No races available yet.</p>
        ) : (
          <div className="row g-4">
            {filteredRaces.map((race) => (
              <div className="col-lg-6" key={race.id}>
                <RaceCard race={race} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RacePage;