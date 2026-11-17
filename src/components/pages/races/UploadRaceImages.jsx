import { useRef, useState } from "react";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import { toast } from "react-toastify";

import {
  RiImageAddLine,
  RiDeleteBin6Line,
  RiUploadCloud2Line,
  RiCloseCircleLine,
} from "react-icons/ri";

import "./uploadRaceImages.scss";

const CLOUD_NAME = "dggvnbw4a";
const UPLOAD_PRESET = "recrun_lens";

const MAX_FILES = 3;

const UploadRaceImages = ({ race }) => {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);

  const [loading, setLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  const [progress, setProgress] = useState(0);

  const openPicker = () => {
    inputRef.current.click();
  };

  const addFiles = (selectedFiles) => {
    const images = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (images.length !== selectedFiles.length) {
      toast.warning("Some files are not images.");
    }

    const merged = [...files, ...images];

    if (merged.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} images.`);
      return;
    }

    setFiles(merged);

    setPreview([
      ...preview,
      ...images.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      })),
    ]);
  };

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);

    addFiles(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    const dropped = Array.from(e.dataTransfer.files);

    addFiles(dropped);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(preview[index].url);

    const newPreview = [...preview];
    newPreview.splice(index, 1);

    const newFiles = [...files];
    newFiles.splice(index, 1);

    setPreview(newPreview);
    setFiles(newFiles);
  };

  const uploadImages = async () => {
    if (!files.length) {
      toast.error("Select images first.");
      return;
    }

    try {
      setLoading(true);

      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const form = new FormData();

        form.append("file", files[i]);
        form.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: form,
          },
        );

        const result = await response.json();

        if (!result.secure_url) {
          throw new Error("Cloudinary upload failed.");
        }

        uploadedUrls.push(result.secure_url);

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      await updateDoc(doc(db, "races", race.id), {
        imageUrls: [...(race.imageUrls || []), ...uploadedUrls],
      });

      toast.success("Images uploaded successfully.");

      preview.forEach((img) => URL.revokeObjectURL(img.url));

      setFiles([]);
      setPreview([]);
      setProgress(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);

      toast.error("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-race-images mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="text-white mb-1">Race Gallery</h5>

          <small className="text-secondary">
            {files.length} / {MAX_FILES} selected
          </small>
        </div>

        {files.length > 0 && (
          <button
            className="btn btn-sm btn-outline-danger"
            disabled={loading}
            onClick={() => {
              preview.forEach((img) => URL.revokeObjectURL(img.url));

              setFiles([]);
              setPreview([]);

              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}>
            <RiDeleteBin6Line className="me-2" />
            Clear
          </button>
        )}
      </div>

      <div
        className={`upload-drop-zone ${dragActive ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => {
          setDragActive(false);
        }}
        onDrop={handleDrop}>
        <RiImageAddLine size={52} className="mb-3" />

        <h5 className="mb-2">Drag & Drop images here</h5>

        <p className="text-secondary mb-3">or</p>

        <button
          type="button"
          className="btn btn-custome"
          disabled={loading}
          onClick={openPicker}>
          Choose Images
        </button>

        <input
          ref={inputRef}
          hidden
          multiple
          accept="image/*"
          type="file"
          onChange={handleChange}
        />
      </div>

      {preview.length > 0 && (
        <div className="row g-3 mt-2">
          {preview.map((image, index) => (
            <div className="col-lg-3 col-md-4 col-6" key={index}>
              <div className="upload-preview-card">
                <img src={image.url} alt="" className="img-fluid rounded" />

                <button
                  className="remove-image"
                  onClick={() => removeImage(index)}
                  disabled={loading}>
                  <RiCloseCircleLine />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="mt-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-white">Uploading...</span>

            <span className="text-white">{progress}%</span>
          </div>

          <div
            className="progress"
            style={{
              height: "10px",
              background: "#2a2a2a",
            }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${progress}%`,
                transition: "0.3s",
              }}
            />
          </div>
        </div>
      )}

      <div className="d-flex gap-3 mt-4 flex-wrap">
        <button
          className="btn btn-custome"
          disabled={loading || files.length === 0}
          onClick={uploadImages}>
          <RiUploadCloud2Line className="me-2" />

          {loading ? "Uploading..." : `Upload ${files.length || ""} Images`}
        </button>

        <button
          className="btn btn-outline-light"
          disabled={loading}
          onClick={openPicker}>
          Add More
        </button>
      </div>
    </div>
  );
};

export default UploadRaceImages;
