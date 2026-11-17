import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../../../firebase";

import { useAuth } from "../../account/AuthContext";

import CreateRaceModal from "./CreateRaceModal";

import { FaPlus } from "react-icons/fa";

const CreateRaceButton = () => {
  const { user } = useAuth();

  const [isPro, setIsPro] = useState(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPro = async () => {
      if (!user) {
        setIsPro(false);

        setLoading(false);

        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);

        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          console.log("USER PREMIUM:", data.premiumPackage);
          if (
            data?.premiumPackage?.active === true &&
            ["Advanced", "Pro"].includes(data?.premiumPackage?.title)
          ) {
            const expires = new Date(data.premiumPackage.expiresAt).getTime();

            if (expires > Date.now()) {
              setIsPro(true);
            }
          }
        }
      } catch (err) {
        console.error("Pro check error", err);
      } finally {
        setLoading(false);
      }
    };

    checkPro();
  }, [user]);

  if (loading || !isPro) {
    return null;
  }

  return (
    <>
    {!open && (
        <button
        className="btn btn-custome d-flex gap-1 align-items-center"
        onClick={() => setOpen(true)}
        >
        <FaPlus style={{fontSize: '12px'}} /> Create Race
        </button>
    )}

    {open && (
        <CreateRaceModal
        close={() => setOpen(false)}
        />
    )}
    </>
  );
};

export default CreateRaceButton;
