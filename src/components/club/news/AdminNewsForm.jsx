import { useRef, useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  FaImage,
  FaTrash,
  FaPen,
} from "react-icons/fa6";

import { db } from "../../../firebase";

import { useAuth } from "../../account/AuthContext";

import { uploadToCloudinary } from "../../../utils/cloudinary";

export default function AdminNewsForm() {
  const { user } = useAuth();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "FiTrack News",
    coverImage: "",
    featured: false,
  });

  const [coverPreview, setCoverPreview] =
    useState("");

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const categories = [
    "FiTrack News",
    "Running",
    "Training",
    "Nutrition",
    "Gear",
    "Events",
  ];

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleImageSelect = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setCoverPreview(previewUrl);
    setUploadingImage(true);

    try {
      const uploadedUrl =
        await uploadToCloudinary(file, {
          folder: "recrun_news",
          public_id_prefix: "news",
          tags: ["FiTrack", "news"],
          returnType: "secure_url",
        });

      setForm((prev) => ({
        ...prev,
        coverImage: uploadedUrl,
      }));
    } catch (error) {
      console.error(
        "Failed to upload news cover:",
        error
      );

      setCoverPreview("");

      setForm((prev) => ({
        ...prev,
        coverImage: "",
      }));

      alert(
        "Failed to upload image. Please try again."
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setCoverPreview("");

    setForm((prev) => ({
      ...prev,
      coverImage: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.isAdmin) {
      return;
    }

    if (!form.title.trim()) {
      return;
    }

    if (!form.content.trim()) {
      return;
    }

    if (uploadingImage) {
      return;
    }

    try {
      setSaving(true);

      await addDoc(
        collection(db, "clubNews"),
        {
          title: form.title.trim(),

          slug: form.title
            .trim()
            .toLowerCase()
            .replace(
              /[^\p{L}\p{N}]+/gu,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              ""
            ),

          excerpt:
            form.excerpt.trim(),

          content:
            form.content.trim(),

          category:
            form.category,

          coverImage:
            form.coverImage,

          authorId:
            user.uid,

          authorName:
            user.username ||
            "FiTrack Team",

          published: true,

          featured:
            form.featured,

          views: 0,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      setForm({
        title: "",
        excerpt: "",
        content: "",
        category: "FiTrack News",
        coverImage: "",
        featured: false,
      });

      setCoverPreview("");
    } catch (error) {
      console.error(
        "Failed to create news:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-news-form">

      <div className="admin-news-form__header">

        <span className="club-section-label">
          ADMIN
        </span>

        <h2>Create news</h2>

        <p>
          Publish updates, running news
          and useful content for the
          FiTrack community.
        </p>

      </div>

      <form onSubmit={handleSubmit}>

        <div className="admin-news-form__field">

          <label htmlFor="news-title">
            Title
          </label>

          <input
            id="news-title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="News title"
            required
          />

        </div>

        <div className="admin-news-form__row">

          <div className="admin-news-form__field">

            <label htmlFor="news-category">
              Category
            </label>

            <select
              id="news-category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

        <div className="admin-news-form__field">

          <label>
            Cover image
          </label>

          {!coverPreview ? (
            <button
              type="button"
              className="admin-news-form__upload"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploadingImage}
            >
              <span className="admin-news-form__upload-icon">
                <FaImage />
              </span>

              <span className="admin-news-form__upload-content">
                <strong>
                  Add cover image
                </strong>

                <small>
                  Choose one image from
                  your device
                </small>
              </span>
            </button>
          ) : (
            <div className="admin-news-form__image-preview">

              <img
                src={coverPreview}
                alt="News cover preview"
              />

              {uploadingImage && (
                <div className="admin-news-form__image-loading">

                  <span className="admin-news-form__spinner" />

                  <span>
                    Uploading...
                  </span>

                </div>
              )}

              {!uploadingImage && (
                <div className="admin-news-form__image-actions">

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    title="Change image"
                  >
                    <FaPen />
                    <span>
                      Change
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleRemoveImage
                    }
                    title="Remove image"
                  >
                    <FaTrash />
                    <span>
                      Remove
                    </span>
                  </button>

                </div>
              )}

            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            hidden
          />

          <small className="admin-news-form__hint">
            JPG, PNG or WebP · one image ·
            max 20 MB
          </small>

        </div>

        <div className="admin-news-form__field">

          <label htmlFor="news-excerpt">
            Short description
          </label>

          <textarea
            id="news-excerpt"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            placeholder="Short description of the news..."
            rows="3"
          />

        </div>

        <div className="admin-news-form__field">

          <label htmlFor="news-content">
            Content
          </label>

          <textarea
            id="news-content"
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Write the full news content..."
            rows="10"
            required
          />

        </div>

       <div className="check-publish">
         <label className="admin-news-form__checkbox">

          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
          />

          <span>
            Featured news
          </span>

        </label>

        <button
          type="submit"
          disabled={
            saving ||
            uploadingImage
          }
          className="admin-news-form__submit"
        >
          {uploadingImage
            ? "Uploading image..."
            : saving
              ? "Publishing..."
              : "Publish news"}
        </button>
       </div>

      </form>

    </section>
  );
}