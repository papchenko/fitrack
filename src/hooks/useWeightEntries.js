
import { useEffect, useState } from "react";
import { subscribeEntries } from "../api/weight.service";

export const useWeightEntries = (weekId) => {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        if (!weekId) {
            setEntries([]);
            return;
        }

        setEntries([]);

        const unsubscribe = subscribeEntries(
            weekId,
            setEntries
        );

        return () => unsubscribe();
    }, [weekId]);

    return entries;
};
