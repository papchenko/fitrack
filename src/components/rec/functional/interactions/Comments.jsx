import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { db, auth } from "../../../../firebase";

import { doc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";

import { FaRegComments, FaPaperPlane } from "react-icons/fa";
import { IoChatbubbles } from "react-icons/io5";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

import "./comments.scss";

export default function Comments({ routeId, usersData, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

const openUserProfile = (uid) => {
    if (!uid) return;

    closePopup();
    navigate(`/profile/${encodeURIComponent(uid)}`);
};

  /* =====================================================
     COMMENTS REALTIME
  ===================================================== */

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "routes", routeId), (snap) => {
      if (snap.exists()) {
        setComments(snap.data().comments || []);
      }
    });

    return () => unsub();
  }, [routeId]);

  /* =====================================================
     LOCK PAGE SCROLL WHEN POPUP IS OPEN
  ===================================================== */

  useEffect(() => {
    if (!showPopup) {
      return;
    }

    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousHtmlOverflow = html.style.overflow;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      html.style.overflow = previousHtmlOverflow;
    };
  }, [showPopup]);

  /* =====================================================
     ADD COMMENT
  ===================================================== */

  const addComment = async () => {
    const text = newComment.trim();

    if (!text) {
      return;
    }

    const user = currentUser || auth.currentUser;

    if (!user?.uid) {
      console.warn("User not logged in");

      return;
    }

    const userData = usersData?.[user.uid] || {};

    const userComment = {
      uid: user.uid,

      username:
        userData.username ||
        user.displayName ||
        user.email?.split("@")[0] ||
        "Anonymous",

      avatarUrl: userData.avatarUrl || user.photoURL || "",

      text,

      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, "routes", routeId);

      await updateDoc(docRef, {
        comments: arrayUnion(userComment),
      });

      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  /* =====================================================
     CLOSE
  ===================================================== */

  const closePopup = () => {
    setShowPopup(false);
  };

  /* =====================================================
     ESCAPE
  ===================================================== */

  useEffect(() => {
    if (!showPopup) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showPopup]);

  return (
    <div className="comments-wrapper">
      {/* =================================================
          COMMENT BUTTON
      ================================================= */}

      <button
        type="button"
        className="comment-btn"
        onClick={() => setShowPopup(true)}
        aria-label="Open comments">
        {/* <FaRegComments /> */}
        <IoChatbubbles />

        <span>{comments.length}</span>
      </button>

      {/* =================================================
          POPUP
      ================================================= */}

      {showPopup &&
        createPortal(
          <div
            className="comments-popup"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closePopup();
              }
            }}>
            <div className="comments-modal">
              {/* HEADER */}

              <div className="comments-modal-header">
                <div>
                  <h4>Comments</h4>
                </div>

                <button
                  type="button"
                  className="comments-close"
                  onClick={closePopup}
                  aria-label="Close comments">
                  &times;
                </button>
              </div>

              {/* SUMMARY */}

              <div className="comments-summary">
                <FaRegComments />

                <span>
                  {comments.length === 0
                    ? "No comments yet"
                    : `${comments.length} ${
                        comments.length === 1 ? "comment" : "comments"
                      }`}
                </span>
              </div>

              {/* COMMENTS */}

              <div className="comments-list">
                {comments.length === 0 && (
                  <div className="comments-empty">
                    <div className="comments-empty-icon">
                      <FaRegComments />
                    </div>

                    <h5>No comments yet</h5>

                    <p>Be the first to share something about this run.</p>
                  </div>
                )}

                {comments.map((comment, index) => {
                  const latestUser = usersData?.[comment.uid] || {};

                  const username =
                    latestUser.username || comment.username || "Anonymous";

                  const avatar = latestUser.avatarUrl || "";

                  const avatarFallback = Array.from(username || "?")[0] || "?";

                  const isPro =
                    latestUser?.premiumPackage?.active &&
                    latestUser.premiumPackage?.title === "Pro";

                  return (
                    <div
                      key={`${comment.uid || "comment"}-${index}`}
                      className="comment-item">
 
<button
    type="button"
    className="comment-avatar-wrapper comment-profile-link"
    onClick={() => openUserProfile(comment.uid)}
    disabled={!comment.uid}
    aria-label={`View ${username}'s profile`}
>
    {avatar ? (
        <img
            src={avatar}
            alt=""
            className="comment-avatar"
        />
    ) : (
        <span className="comment-avatar-placeholder">
            {avatarFallback}
        </span>
    )}

    {isPro && (
        <RiVerifiedBadgeFill
            className="comment-premium-icon"
            aria-hidden="true"
        />
    )}
</button>

<div className="comment-body">
    <button
        type="button"
        className="comment-author comment-author-link"
        onClick={() => openUserProfile(comment.uid)}
        disabled={!comment.uid}
    >
        {username}
    </button>

    <p>{comment.text}</p>
</div>
                    </div>
                  );
                })}
              </div>

              {/* INPUT */}

              <div className="comment-input-wrapper">
                <div className="comment-input">
                  <input
                    type="text"
                    value={newComment}
                    placeholder="Write a comment..."
                    maxLength={500}
                    onChange={(event) => setNewComment(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        addComment();
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    aria-label="Send comment">
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          </div>,

          document.body,
        )}
    </div>
  );
}
