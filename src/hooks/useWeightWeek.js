
import { useEffect, useState } from "react";
import { subscribeWeek } from "../api/weight.service";

export const useWeightWeek = (uid) => {
    const [week, setWeek] = useState(null);

    useEffect(() => {
        if (!uid) {
            setWeek(null);
            return;
        }

        setWeek(null);

        const unsubscribe = subscribeWeek(uid, setWeek);

        return () => unsubscribe();
    }, [uid]);

    return week;
};
