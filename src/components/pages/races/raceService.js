import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  increment,
} from "firebase/firestore";

import { db } from "../../../firebase";

export const registerForRace = async ({ race, user, category }) => {
  const raceRef = doc(db, "races", race.id);

  const raceSnap = await getDoc(raceRef);

  if (!raceSnap.exists()) {
    throw new Error("Race not found");
  }

  const raceData = raceSnap.data();

  const existingQuery = query(
    collection(db, "raceTickets"),
    where("raceId", "==", race.id),
    where("userId", "==", user.uid),
  );

  const existing = await getDocs(existingQuery);

  if (!existing.empty) {
    throw new Error("You already joined this race.");
  }

  if (
    raceData.maxParticipants &&
    (raceData.participantsCount || 0) >= raceData.maxParticipants
  ) {
    throw new Error("Race is full.");
  }

  const qrToken = crypto.randomUUID();

  await addDoc(collection(db, "raceTickets"), {
    raceId: race.id,

    raceTitle: race.title,

    organizerId: race.organizerId,

    userId: user.uid,

    username: user.displayName || user.email,

    // avatar: user.photoURL || "",

    email: user.email,

    category,

    qrToken,

    checkedIn: false,

    checkedInAt: null,

    registeredAt: serverTimestamp(),
  });

  await updateDoc(raceRef, {
    participantsCount: increment(1),
  });

  return true;
};

export const getMyTickets = async (userId) => {
  const q = query(collection(db, "raceTickets"), where("userId", "==", userId));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getRaceParticipants = async (raceId) => {
  const q = query(
    collection(db, "raceTickets"),
    where("raceId", "==", raceId),
  );

  const snap = await getDocs(q);

  const participants = await Promise.all(
    snap.docs.map(async (ticketDoc) => {
      const ticket = ticketDoc.data();

      let username = ticket.username || "";
      let avatar = "";
      let premiumPackage = null;

      try {
        const userSnap = await getDoc(
          doc(db, "users", ticket.userId),
        );

        if (userSnap.exists()) {
          const user = userSnap.data();

          username = user.username || username;
          avatar = user.avatarUrl || "";
          premiumPackage = user.premiumPackage || null;
        }
      } catch (err) {
        console.error(err);
      }

      return {
        id: ticketDoc.id,
        ...ticket,
        username,
        avatar,
        premiumPackage,
      };
    }),
  );

  return participants;
};

export const getTicketByQR = async (qrToken) => {
  const q = query(
    collection(db, "raceTickets"),
    where("qrToken", "==", qrToken),
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Ticket not found");
  }

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  };
};

export const checkInTicket = async (ticketId) => {
  await updateDoc(doc(db, "raceTickets", ticketId), {
    checkedIn: true,
    checkedInAt: serverTimestamp(),
    status: "checked",
  });
};
