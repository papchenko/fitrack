import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import { toast } from "react-toastify";
import { FaTimes, FaTrash, FaPlus } from "react-icons/fa";

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function EditActivityModal({ activity, currentUser, onClose }) {
  const [title, setTitle] = useState(activity.title || "");
  const [notes, setNotes] = useState(activity.notes || "");
  const [photos, setPhotos] = useState(Array.isArray(activity.photos) ? activity.photos : []);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);
  const previews = newFiles.map((file) => ({ file, url: URL.createObjectURL(file) }));

  useEffect(() => {
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [newFiles]);

  const addFiles = (event) => {
    const incoming = Array.from(event.target.files || []);
    event.target.value = "";
    if (incoming.some((file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE)) {
      toast.error("Only images up to 10 MB are allowed.");
      return;
    }
    if (photos.length + newFiles.length + incoming.length > MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos.`);
      return;
    }
    setNewFiles((prev) => [...prev, ...incoming]);
  };

  const save = async (event) => {
    event.preventDefault();
    if (saving || !currentUser?.uid || currentUser.uid !== activity.uid) return;
    if (!title.trim()) return toast.error("Title is required.");
    setSaving(true);
    try {
      const ref = doc(db, "routes", activity.id);
      const before = await getDoc(ref);
      if (!before.exists() || before.data().uid !== currentUser.uid) {
        throw new Error("You can only edit your own activities.");
      }
      const uploaded = await Promise.all(newFiles.map((file) => uploadToCloudinary(file, {
        folder: "recrun_photos",
        public_id_prefix: "activity_edit",
        tags: ["recrun", "activity"],
        returnType: "secure_url",
      })));
      const uploadedUrls = uploaded.map((result) => {
        if (typeof result === "string") return result;
        return result?.secure_url || result?.url;
      });
      if (uploadedUrls.some((url) => !url || typeof url !== "string")) {
        throw new Error("Photo upload returned an invalid URL.");
      }
      const nextPhotos = [...photos, ...uploadedUrls];
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (!snap.exists() || snap.data().uid !== currentUser.uid) {
          throw new Error("You can only edit your own activities.");
        }
        const current = snap.data();
        const patch = {
          title: title.trim(),
          notes: notes.trim(),
          photos: nextPhotos,
          editedAt: serverTimestamp(),
        };
        // Preserve a generated workout stats image reference only if it is still in the gallery.
        if (current.workoutImage && !nextPhotos.includes(current.workoutImage)) {
          patch.workoutImage = null;
        }
        transaction.update(ref, patch);
      });
      toast.success("Activity updated.");
      onClose();
    } catch (error) {
      console.error("Edit activity failed:", error);
      toast.error(error.message || "Could not update activity.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="stepslist-edit-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose();
    }}>
      <form className="stepslist-edit-modal" onSubmit={save}>
        <div className="stepslist-edit-head">
          <h3>Edit activity</h3>
          <button type="button" aria-label="Close" onClick={onClose} disabled={saving}><FaTimes /></button>
        </div>
        <label>Title
          <input value={title} maxLength={120} required onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>Description
          <textarea rows={4} maxLength={3000} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <div className="stepslist-edit-photo-heading">Photos ({photos.length + newFiles.length}/{MAX_PHOTOS})</div>
        <div className="stepslist-edit-photos">
          {photos.map((url, index) => (
            <div className="stepslist-edit-photo" key={`${url}-${index}`}>
              <img src={url} alt={`Photo ${index + 1}`} />
              <button type="button" aria-label="Remove photo" disabled={saving} onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}><FaTrash /></button>
            </div>
          ))}
          {previews.map(({ url }, index) => (
            <div className="stepslist-edit-photo" key={`new-${index}`}>
              <img src={url} alt={`New photo ${index + 1}`} />
              <button type="button" aria-label="Remove new photo" disabled={saving} onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== index))}><FaTrash /></button>
            </div>
          ))}
          {photos.length + newFiles.length < MAX_PHOTOS && (
            <button type="button" className="stepslist-edit-add" disabled={saving} onClick={() => fileInput.current?.click()}><FaPlus /> Add photos</button>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={addFiles} />
        <div className="stepslist-edit-actions">
          <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" disabled={saving || !title.trim()}>{saving ? "Saving..." : "Save changes"}</button>
        </div>
      </form>
    </div>, document.body,
  );
}
