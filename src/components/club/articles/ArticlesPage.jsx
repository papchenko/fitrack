import { useEffect, useState } from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../firebase";

import { useAuth } from "../../account/AuthContext";

import ArticleCard from "./ArticleCard";
import { seedArticles } from "./seedArticles";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ArticlesPage() {
  const { user } = useAuth();

  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const categories = [
    "All",
    "Beginners",
    "Training",
    "Nutrition",
    "Recovery",
    "Gear",
  ];

  // Check admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Failed to check admin:", error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    }

    checkAdmin();
  }, [user]);

  // Load articles
  const loadArticles = async () => {
    try {
      setLoading(true);

      const articlesRef = collection(db, "articles");

      const articlesQuery = query(
        articlesRef,
        where("published", "==", true),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(articlesQuery);

      const articlesData = snapshot.docs.map((articleDoc) => ({
        id: articleDoc.id,
        ...articleDoc.data(),
      }));

      setArticles(articlesData);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Restore articles
  const handleRestoreArticles = async () => {
    if (!isAdmin || seeding) {
      return;
    }

    setSeeding(true);

    try {
      const result = await seedArticles();

      await loadArticles();

      if (result.created === 0) {
        toast.info("All articles are already in the database.");
      } else {
        toast.success(
          `Articles restored: ${result.created}. Already existed: ${result.skipped}.`,
        );
      }
    } catch (error) {
      console.error("Failed to restore articles:", error);

      toast.error("Failed to restore articles.");
    } finally {
      setSeeding(false);
    }
  };

  const filteredArticles =
    activeCategory === "All"
      ? articles
      : articles.filter(
          (article) => article.category === activeCategory,
        );

  return (
    <main className="articles-page">
      <div className="articles-page__container">

        {/* ADMIN PANEL */}

        {isAdmin && !adminLoading && (
          <section className="articles-page__admin">
            <div className="articles-page__admin-content">
              <span className="articles-page__admin-label">
                ADMIN
              </span>

              <h3>Articles Management</h3>

              <p>
                Restore missing FiTrack articles without changing
                existing articles or their views.
              </p>
            </div>

            <button
              type="button"
              className="articles-page__admin-button"
              onClick={handleRestoreArticles}
              disabled={seeding}
            >
              {seeding ? "Restoring..." : "Restore Articles"}
            </button>
          </section>
        )}

        {/* CATEGORIES */}

        <div className="articles-page__categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "articles-page__category active"
                  : "articles-page__category"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="articles-page__loading">
            Loading articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="articles-page__empty">
            <h3>No articles found</h3>

            <p>
              There are no published articles in this category yet.
            </p>
          </div>
        ) : (
          <div className="articles-page__grid">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}