import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";

import RunCelebration from "./RunCelebration";
import {
  FaFaceFrown,
  FaFaceGrin,
  FaFaceGrinStars,
} from "react-icons/fa6";

import "./runfeedback.scss";

export default function RunFeedbackModal({
  isOpen,
  runId,
  onClose,
}) {
  const [saving, setSaving] = useState(false);
  const [animation, setAnimation] = useState(null);

  if (!isOpen && !animation) return null;

if (animation) {
  return (
    <RunCelebration
      emoji={animation}
      onComplete={() => {
        setAnimation(null);
        setSaving(false);
        onClose();
      }}
    />
  );
}

const handleSelect = async (feedback) => {
  if (saving) return;

  setSaving(true);

  try {
    await addDoc(collection(db, "runFeedback"), {
        uid: auth.currentUser?.uid || null,
        runId: runId || null,

        feedback: feedback.value,
        emoji: feedback.emojiName,
        title: feedback.title,

        createdAt: serverTimestamp(),
        });

        setAnimation(feedback.emoji);

    setAnimation(feedback.emoji);
  } catch (error) {
    console.error("Failed to save run feedback:", error);
    setSaving(false);
  }
};

const options = [
  {
    value: "bad",
    emoji: FaFaceFrown,
    emojiName: "FaFaceFrown",
    title: "Bad",
  },
  {
    value: "good",
    emoji: FaFaceGrin,
    emojiName: "FaFaceGrin",
    title: "Good",
  },
  {
    value: "great",
    emoji: FaFaceGrinStars,
    emojiName: "FaFaceGrinStars",
    title: "Great",
  },
];

  return (
    <div className="run-feedback-overlay">
      <div className="run-feedback-modal">
        <h2>How was the race?</h2>

        <p>
          Share your impressions
        </p>

        <div className="run-feedback-options">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              disabled={saving}
              className="run-feedback-option"
            >
            <span className="run-feedback-emoji">
            <option.emoji />
            </span>

              <span>
                {option.title}
              </span>
            </button>
          ))}
        </div>
        <button
        className="run-feedback-skip"
        onClick={() => setAnimation("🎉")}
        disabled={saving}
        >
        Skip
        </button>
      </div>
    </div>
  );
}