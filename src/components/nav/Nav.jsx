import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";

import logoImg from "../../assets/logo.png";

import AuthModal from "../account/AuthModal";
import { useAuth } from "../account/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import RecordButton from "./RecordButton";
import { canAccessRunningPlans } from "../account/premiumAccess";
import { canAccessConquer } from "../account/premiumAccess";

import { MdAdminPanelSettings } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaConfluence } from "react-icons/fa";
import { FaAngleDown, FaBarsStaggered } from "react-icons/fa6";

import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import NotificationsBell from "../notification/NotificationsBell";

import "./nav.scss";

function Nav() {
  const navigate = useNavigate();
    const [premiumNow, setPremiumNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setPremiumNow(Date.now());
        }, 15000);

        return () => clearInterval(timer);
    }, []);
  /* =========================================================
     GENERAL NAV STATE
  ========================================================= */

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isRunsOpen, setIsRunsOpen] = useState(false);

  /*
    null       = main menu
    "runs"     = Runs submenu
    "services" = Services submenu
  */
  const [mobileMenuPage, setMobileMenuPage] = useState(null);

  /* =========================================================
     CART
  ========================================================= */

  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.length;

  const [hasUnseenCart, setHasUnseenCart] = useState(cartCount > 0);

  useEffect(() => {
    if (cartCount > 0) {
      setHasUnseenCart(true);
    } else {
      setHasUnseenCart(false);
    }
  }, [cartCount]);

  /* =========================================================
     MOBILE MENU
  ========================================================= */

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const next = !prev;

      if (!next) {
        setMobileMenuPage(null);
      }

      return next;
    });

    setHasUnseenCart(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setMobileMenuPage(null);
    setIsServicesOpen(false);
    setIsRunsOpen(false);
  };

  const openMobilePage = (page) => {
    setMobileMenuPage(page);
  };

  const backToMainMenu = () => {
    setMobileMenuPage(null);
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);

      setSearchQuery("");
    }
  };

  /* =========================================================
     AUTH
  ========================================================= */

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  const [navUserData, setNavUserData] = useState({
    avatarUrl: "",
    username: "",
    premiumPackage: null,
  });

  useEffect(() => {
    if (!user?.uid) {
      setNavUserData({
        avatarUrl: "",
        username: "",
        premiumPackage: null,
      });

      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setNavUserData({
          avatarUrl: data.avatarUrl || "",
          username: data.username || "",
          premiumPackage: data.premiumPackage || null,
        });
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const avatarUrl = navUserData.avatarUrl;

  const avatarFallback = Array.from(
    navUserData.username || user?.username || user?.email || "?",
  )[0];


  /* =========================================================
     ADMIN
  ========================================================= */

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      setIsAdmin(snap.exists() && snap.data().isAdmin);
    };

    check();
  }, [user]);

  /* =========================================================
     SCROLL
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20 || isMenuOpen) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);


  /* =========================================================
     UNREAD MESSAGES
  ========================================================= */

  const [unreadCount, setUnreadCount] = useState({
    chats: {},
    total: 0,
  });

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount({
        chats: {},
        total: 0,
      });

      return;
    }

    let unsubscribes = [];

    const loadFriendsAndListen = async () => {
      const friendsDoc = await getDoc(doc(db, "friends", user.uid));

      const data = friendsDoc.data();
      const friends = data?.friends || [];

      friends.forEach((fid) => {
        const chatId =
          user.uid < fid ? `${user.uid}_${fid}` : `${fid}_${user.uid}`;

        const messagesRef = collection(db, "messages", chatId, "messages");

        const q = query(
          messagesRef,
          where("receiverId", "==", user.uid),
          where("seen", "==", false),
        );

        const unsub = onSnapshot(q, (snap) => {
          const unreadForThisChat = snap.size;

          setUnreadCount((prev) => {
            const updatedChats = {
              ...prev.chats,
              [chatId]: unreadForThisChat,
            };

            const total = Object.values(updatedChats).reduce(
              (sum, n) => sum + n,
              0,
            );

            return {
              chats: updatedChats,
              total,
            };
          });
        });

        unsubscribes.push(unsub);
      });
    };

    loadFriendsAndListen();

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [user]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <nav
        className={`text-white p-0 navbar navbar-expand-lg flex-column ${
          isScrolled ? "scrolled" : ""
        }`}>
        {/* =====================================================
            TOP HEADER
        ===================================================== */}

        <div className="container d-flex align-items-center justify-content-center">
          <div className="row-nav row w-100 py-3">
            <div className="col-lg-12">
              <div className="w-100 top-header d-flex align-items-center justify-content-between">
                {/* =================================================
                    DESKTOP LEFT
                ================================================= */}

                <div className="call d-none d-lg-flex align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <RecordButton />

                    <Link to="/lens" className="text-white fs-5">
                      <FaConfluence
                        style={{
                          color: "#db3206",
                          transform: "rotate(-45deg)",
                        }}
                      />
                    </Link>
                  </div>
                </div>

                {/* =================================================
                    LOGO
                ================================================= */}

                <a href="/" className="navbar-logo">
                  <img src={logoImg} alt="FiTrack" className="logo-img" />
                </a>

                {/* =================================================
                    DESKTOP RIGHT
                ================================================= */}

                <div className="top-header-right d-none d-lg-flex align-items-center gap-4">
                  {isAdmin && (
                    <a href="/admin-announcements">
                      <MdAdminPanelSettings className="admin-pc" />
                    </a>
                  )}

                  {user && (
                    <div className="fs-5">
                      <NotificationsBell />
                    </div>
                  )}

                  <a
                    href="/cart"
                    className="cartpage-cart-link position-relative">
                    <i className="bi bi-bag text-white fs-5"></i>

                    <span className="cart-count" style={{ color: "#017b6e" }}>
                      {cartCount}
                    </span>
                  </a>

                  <ProfileDropdown
                    user={user}
                    avatarUrl={avatarUrl}
                    avatarFallback={avatarFallback}
                    premiumPackage={navUserData.premiumPackage}
                    unreadCount={unreadCount.total}
                    onSignIn={() => setAuthModalOpen(true)}
                    onSignOut={signOut}
                  />
                </div>

                {/* =================================================
                    MOBILE TOP
                ================================================= */}

                <div className="mobile-top d-lg-none">
                  {user && (
                    <RecordButton compact />
                  )}

                  <ProfileDropdown
                    user={user}
                    avatarUrl={avatarUrl}
                    avatarFallback={avatarFallback}
                    premiumPackage={navUserData.premiumPackage}
                    unreadCount={unreadCount.total}
                    onSignIn={() => setAuthModalOpen(true)}
                    onSignOut={signOut}
                  />

                  {/* MOBILE HAMBURGER */}

                  <button
                    className={`navbar-toggler nav-toggle ${
                      isMenuOpen ? "is-open" : ""
                    }`}
                    type="button"
                    onClick={toggleMenu}
                    aria-label={
                      isMenuOpen ? "Close navigation" : "Open navigation"
                    }
                    aria-expanded={isMenuOpen}>
                    <span className="hamburger-icon">
                      {/* <span></span>
                      <span></span>
                      <span></span> */}
                      <FaBarsStaggered className="text-white fs-2" />
                    </span>

                    {hasUnseenCart && !isMenuOpen && (
                      <span className="cart-notification-dot"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            NAV + SEARCH
        ===================================================== */}

        <div className="container">
          <div className="row py-0 py-lg-4 w-100 d-flex align-items-center">
            <div className="col-lg-9">
              {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

              <div
                className={`collapse navbar-collapse d-none d-lg-flex ${
                  isMenuOpen ? "show" : ""
                }`}
                id="navtoggle">
                <ul className="nav-menu list-unstyled p-3 m-0 d-flex flex-column flex-lg-row align-items-end align-items-lg-center gap-3 gap-lg-4">

                  {/* HOME */}

                  <li className="nav-items position-relative">
                    <Link
                      to="/"
                      className="nav-link"
                      onClick={closeMenu}>
                      Home
                    </Link>
                  </li>

                  {/* RUNS */}

                  <li
                    className={`nav-items position-relative services-dropdown ${
                      isRunsOpen ? "services-open" : ""
                    }`}>
                    <button
                      type="button"
                      className="nav-link services-toggle"
                      onClick={() => {
                        setIsRunsOpen((prev) => !prev);
                        setIsServicesOpen(false);
                      }}
                      aria-expanded={isRunsOpen}>
                      Activity

                      <span className="services-arrow">
                        <FaAngleDown />
                      </span>
                    </button>

                    <div className="services-menu">
                      <Link
                        to="/races"
                        className="services-item"
                        onClick={closeMenu}>
                        Team Races
                      </Link>
                      <Link
                        to="/weight-control"
                        className="services-item"
                        onClick={closeMenu}>
                        Weight Control
                      </Link>
                      {canAccessRunningPlans(navUserData?.premiumPackage) && (
                          <Link to="/running-plans" className="services-item"
                              onClick={closeMenu}>
                              Running Plans
                          </Link>
                      )}      
                      {canAccessConquer(navUserData?.premiumPackage, premiumNow) && (
                                              <Link
                        to="/conquer"
                        className="services-item"
                        onClick={closeMenu}>
                        FiTreck Conquer
                      </Link>
                      )}
                    </div>
                  </li>

                  {/* SERVICES */}

                  <li
                    className={`nav-items position-relative services-dropdown ${
                      isServicesOpen ? "services-open" : ""
                    }`}>
                    <button
                      type="button"
                      className="nav-link services-toggle"
                      onClick={() => {
                        setIsServicesOpen((prev) => !prev);
                        setIsRunsOpen(false);
                      }}
                      aria-expanded={isServicesOpen}>
                      Services

                      <span className="services-arrow">
                        <FaAngleDown />
                      </span>
                    </button>

                    <div className="services-menu">
                                         <Link
                      to="/club"
                      className="services-item"
                      onClick={closeMenu}>
                      FiTrack Club
                    </Link>
                        <Link
                      to="/shop"
                      className="services-item"
                      onClick={closeMenu}>
                      Our Shop
                    </Link>
                    </div>
                  </li>

                  {/* FiTrack CLUB */}

                  <li className="nav-items position-relative">
                       <Link
                      to="/premium"
                      className="nav-link"
                      onClick={closeMenu}>
                      Premium
                    </Link>
                  </li>

                  {/* PREMIUM */}

                  {/* <li className="nav-items position-relative">
                    <Link
                      to="/premium"
                      className="nav-link"
                      onClick={closeMenu}>
                      Premium
                    </Link>
                  </li> */}
                </ul>
              </div>
              {/* =================================================
                  MOBILE MENU OVERLAY
              ================================================= */}

              <div
                className={`mobile-menu-overlay ${isMenuOpen ? "is-open" : ""}`}
                onClick={closeMenu}
              />

              {/* =================================================
                  MOBILE MENU
              ================================================= */}

              <aside
                className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}
                aria-hidden={!isMenuOpen}>
                {/* =================================================
                    MENU HEADER
                ================================================= */}

                <div className="mobile-menu-header">
                  {mobileMenuPage ? (
                    <button
                      type="button"
                      className="mobile-menu-header-back"
                      onClick={backToMainMenu}
                      aria-label="Back to main menu">
                      <span className="mobile-menu-header-back-icon">
                        <span></span>
                        <span></span>
                      </span>

                      {/* <span>Back</span> */}
                    </button>
                  ) : (
                    <span className="mobile-menu-header-title">
                      {/* Menu */}
                    </span>
                  )}

                  <button
                    type="button"
                    className="mobile-menu-close"
                    onClick={closeMenu}
                    aria-label="Close menu">
                    <span></span>
                    <span></span>
                  </button>
                </div>

                {/* =================================================
                    MENU CONTENT
                ================================================= */}

                <div
                  className={`mobile-menu-content ${
                    mobileMenuPage ? "subpage-open" : ""
                  }`}>
                  {/* =================================================
                      MAIN MENU
                  ================================================= */}

                  <nav
                    className={`mobile-menu-panel mobile-menu-main ${
                      mobileMenuPage ? "panel-hidden" : ""
                    }`}>
                    <Link
                      to="/"
                      className="mobile-menu-link"
                      onClick={closeMenu}>
                      <span>Home</span>
                    </Link>

                    <button
                      type="button"
                      className="mobile-menu-link mobile-menu-link-button"
                      onClick={() => openMobilePage("runs")}>
                      <span>Activity</span>

                      <span className="mobile-menu-arrow">→</span>
                    </button>

                    <button
                      type="button"
                      className="mobile-menu-link mobile-menu-link-button"
                      onClick={() => openMobilePage("services")}>
                      <span>Services</span>

                      <span className="mobile-menu-arrow">→</span>
                    </button>

                    <Link
                      to="/premium"
                      className="mobile-menu-link"
                      onClick={closeMenu}>
                      <span>Premium</span>
                    </Link>
                  </nav>

                  {/* =================================================
                      RUNS
                  ================================================= */}

                  <nav
                    className={`mobile-menu-panel mobile-menu-subpanel ${
                      mobileMenuPage === "runs" ? "panel-active" : ""
                    }`}>
                    {/* <div className="mobile-submenu-intro">

                      <span className="mobile-submenu-eyebrow">
                        Runs
                      </span>

                      <h2>
                        Your running
                      </h2>

                    </div> */}

                    <div className="mobile-submenu-items">
                      <Link
                        to="/races"
                        className="mobile-submenu-item"
                        onClick={closeMenu}>
                        <span>Team Races</span>

                        {/* <span className="mobile-submenu-item-arrow">
                          →
                        </span> */}
                      </Link>
                        <Link
                        to="/weight-control"
                        className="mobile-submenu-item"
                        onClick={closeMenu}>
                        <span>Weight Control</span>

                        {/* <span className="mobile-submenu-item-arrow">
                          →
                        </span> */}
                      </Link>
                      {canAccessRunningPlans(navUserData?.premiumPackage) && (
                      <Link
                        to="/running-plans"
                        className="mobile-submenu-item"
                        onClick={closeMenu}>
                        <span>Running Plans</span>

                        {/* <span className="mobile-submenu-item-arrow">
                          →
                        </span> */}
                      </Link>
                      )}
                      {canAccessConquer(navUserData?.premiumPackage, premiumNow) && (
                      <Link
                        to="/conquer"
                        className="mobile-submenu-item"
                        onClick={closeMenu}>
                        <span>FiTreck Conquer</span>

                        {/* <span className="mobile-submenu-item-arrow">
                          →
                        </span> */}
                      </Link>
                      )}
                    </div>
                  </nav>
                  <AuthModal
                        isOpen={authModalOpen}
                        onClose={() => setAuthModalOpen(false)}
                    />
                  {/* =================================================
                      SERVICES
                  ================================================= */}

                  <nav
                    className={`mobile-menu-panel mobile-menu-subpanel ${
                      mobileMenuPage === "services" ? "panel-active" : ""
                    }`}>
                    {/* <div className="mobile-submenu-intro">

                      <span className="mobile-submenu-eyebrow">
                        Services
                      </span>

                      <h2>
                        Improve your running
                      </h2>

                    </div> */}

                    <div className="mobile-submenu-items">
                    <Link
                      to="/club"
                      className="mobile-submenu-item"
                      onClick={closeMenu}>
                      <span>FiTrack Club</span>
                    </Link>
                                        <Link
                      to="/shop"
                      className="mobile-submenu-item"
                      onClick={closeMenu}>
                      <span>Our Shop</span>
                    </Link>
                    </div>
                  </nav>
                </div>

                {/* =================================================
                    MENU FOOTER
                ================================================= */}

                <div className="mobile-menu-footer">
                  <Link
                    to="/cart"
                    className="mobile-menu-footer-item"
                    onClick={closeMenu}>
                    <span>
                      <i className="bi bi-bag"></i>
                      Cart
                    </span>

                    {cartCount > 0 && <small>{cartCount}</small>}
                  </Link>

                  {isAdmin && (
                    <a
                      href="/admin-announcements"
                      className="mobile-menu-footer-item"
                      onClick={closeMenu}>
                      <span>
                        <MdAdminPanelSettings />
                        Admin
                      </span>
                    </a>
                  )}
                </div>
              </aside>
            </div>

            {/* =================================================
                DESKTOP SEARCH
            ================================================= */}

            <div className="col-lg-3">
              <div className="nav-input-box w-100 d-none d-lg-flex align-items-center justify-content-start gap-2">
                <i className="bi bi-search"></i>

                <input
                  type="text"
                  className="form-control form-control-sm w-100"
                  placeholder="username, lens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MOBILE SEARCH
      ========================================================= */}

      <div className="search-mobile nav-bottom d-block d-lg-none">
        <div className="mobile-bottom d-flex gap-3 justify-content-between align-items-center">
          <div className="col-lg-3">
            <div className="nav-input-box d-flex align-items-center justify-content-start gap-2">
              <i className="search-mobile bi bi-search fs-5"></i>

              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="username, lens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* =====================================================
              MOBILE BOTTOM ICONS
          ===================================================== */}

          <div className="mobile-section d-flex d-lg-none justify-content-end gap-3">
            {user && (
              <div className="notification-icon-mobile align-items-center d-flex">
                <i className="text-white fs-2">
                  <NotificationsBell />
                </i>

                <Link to="/lens" className="text-white fs-2">
                  <FaConfluence
                    style={{
                      color: "#db3206",
                      transform: "rotate(-45deg)",
                    }}
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Nav;
