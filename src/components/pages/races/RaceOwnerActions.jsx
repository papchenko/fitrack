import { useState } from "react";

import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import { useAuth } from "../../account/AuthContext";

import { toast } from "react-toastify";

import EditRaceModal from "./EditRaceModal";
import UploadRaceImages from "./UploadRaceImages";
import RaceQRScanner from "./RaceQRScanner";

const RaceOwnerActions = ({ race }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [confirmTitle, setConfirmTitle] = useState("");

  if (!user || user.uid !== race.organizerId) {
    return null;
  }

  const deleteRace = async () => {
    try {
      setLoading(true);

      await deleteDoc(doc(db, "races", race.id));

      toast.success("Race deleted");

      setDeleteOpen(false);
      setConfirmTitle("");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setConfirmTitle("");
  };

  const isMatch = confirmTitle.trim() === race.title;

  return (
    <>
      <div className="mt-3 d-flex gap-2 flex-wrap p-3">
        <button className="btn btn-custome" onClick={() => setEditOpen(true)}>
          Edit Race
        </button>

        <button
          className="btn btn-danger"
          disabled={loading}
          onClick={() => setDeleteOpen(true)}>
          Delete Race
        </button>

        <button
          className="btn btn-outline-light"
          onClick={() => setShowUploader((prev) => !prev)}>
          {showUploader ? "Hide Images" : "Upload Images"}
        </button>
        <button
          className="btn btn-success"
          onClick={() => setScannerOpen(true)}>
          QR Scanner
        </button>
      </div>

      {showUploader && <UploadRaceImages race={race} />}

      {editOpen && (
        <EditRaceModal race={race} close={() => setEditOpen(false)} />
      )}
      {scannerOpen && (
        <RaceQRScanner race={race} close={() => setScannerOpen(false)} />
      )}

      {deleteOpen && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,.6)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark text-white">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title">Delete Race</h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeDeleteModal}
                  />
                </div>

                <div className="modal-body">
                  <p>This action cannot be undone.</p>

                  <p className="mb-3">
                    To confirm deletion, type the race name:
                  </p>

                  <div className="alert alert-secondary">
                    <strong>{race.title}</strong>
                  </div>

                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="Type race name..."
                    value={confirmTitle}
                    onChange={(e) => setConfirmTitle(e.target.value)}
                  />

                  {!isMatch && confirmTitle.length > 0 && (
                    <small className="text-danger mt-2 d-block">
                      Race name does not match.
                    </small>
                  )}
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    className="btn btn-secondary"
                    disabled={loading}
                    onClick={closeDeleteModal}>
                    Cancel
                  </button>

                  <button
                    className="btn btn-danger"
                    disabled={loading || !isMatch}
                    onClick={deleteRace}>
                    {loading ? "Deleting..." : "Delete Race"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default RaceOwnerActions;