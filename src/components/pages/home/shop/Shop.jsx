// import { useContext, useEffect, useState } from "react";
// import tourData from "../../../../data/Shop.json";
// import { CartContext } from "../../../../context/CartContext";
// import { toast } from "react-toastify";

// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../../../firebase";
// import { useAuth } from "../../../account/AuthContext";

// import { IoResize } from "react-icons/io5";
// import { FaShoppingBag, FaStar } from "react-icons/fa";

// /* Swiper */
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Navigation } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/navigation";

// import "./shop.scss";
// import { FaGift } from "react-icons/fa6";

// const Shop = () => {
//   const [tours, setTours] = useState([]);
//   const [hasCompletedOrder, setHasCompletedOrder] = useState(false);

//   const { cartItems, addToCart } = useContext(CartContext);
//   const { user } = useAuth();

//   useEffect(() => {
//     setTours(tourData);
//   }, []);

//   useEffect(() => {
//     const checkCompletedOrder = async () => {
//       if (!user?.uid) {
//         setHasCompletedOrder(false);
//         return;
//       }

//       try {
//         const ordersRef = collection(db, "users", user.uid, "orders");
//         const ordersSnapshot = await getDocs(ordersRef);

//         setHasCompletedOrder(!ordersSnapshot.empty);
//       } catch (error) {
//         console.error("Error checking completed orders:", error);
//       }
//     };

//     checkCompletedOrder();
//   }, [user]);

//   const handleBookNow = (tour) => {
//     const alreadyInCart = cartItems.find((item) => item.id === tour.id);

//     if (alreadyInCart) {
//       toast.info("Item already in cart!");
//       return;
//     }

//     addToCart({
//       ...tour,
//       quantity: 1,
//     });

//     toast.success("Item added to cart!");
//   };

//   return (
//     <section className="shop-container" id="shop">
//       <div className="shop-container__glow shop-container__glow--left"></div>
//       <div className="shop-container__glow shop-container__glow--right"></div>

//       <div className="container">
//         {/* HEADER */}
//         <div className="shop-header">
//           <div className="shop-header__content">
//             <span className="shop-header__label">FITREC STORE</span>

//             <h2 className="shop-header__title">
//               Made for
//               <span> Runners.</span>
//             </h2>

//             <p className="shop-header__description">
//               Official FitRec stickers designed for people who move, train and
//               keep going.
//             </p>
//           </div>

//           {!hasCompletedOrder && (
//             <div className="shop-header__badge">
//               <FaGift />
//               <span>Get bonuses on your first order!</span>
//             </div>
//           )}
//         </div>

//         {/* PRODUCTS */}
//         <div className="shop-slider-wrapper">
//           <Swiper
//             slidesPerView={1}
//             spaceBetween={24}
//             // modules={[Autoplay, Navigation]}
//             modules={[Navigation]}
//             loop={tours.length > 2}
//             // autoplay={{
//             //   delay: 5000,
//             //   disableOnInteraction: false,
//             // }}
//             navigation={{
//               prevEl: ".shop-prev",
//               nextEl: ".shop-next",
//             }}
//             breakpoints={{
//               1200: {
//                 slidesPerView: 2,
//               },
//               768: {
//                 slidesPerView: 2,
//               },
//               0: {
//                 slidesPerView: 1,
//               },
//             }}
//             className="shop-slider">
//            {tours.map((tour) => (
//               <SwiperSlide key={tour.id}>
//                 <article className="shop-card">
//                   {/* IMAGE */}
//                   <div className="shop-card__image-wrapper">
//                     <div className="shop-card__image-glow"></div>

//                     <img
//                       src={tour.image}
//                       alt={tour.title}
//                       className="shop-card__image"
//                     />

//                     <div className="shop-card__badge">FITREC</div>

//                     {/* <button
//                       type="button"
//                       className="shop-card__cart"
//                       onClick={() => handleBookNow(tour)}
//                       aria-label={`Add ${tour.title} to cart`}
//                     >
//                       <FaShoppingBag />
//                     </button> */}
//                   </div>

//                   {/* CONTENT */}
//                   <div className="shop-card__content">
//                     <div className="shop-card__top">
//                       <span className="shop-card__category">FITREC GEAR</span>

//                       {/* <div className="shop-card__rating">
//                         <FaStar />
//                         <span>{tour.rating}</span>
//                       </div> */}
//                     </div>

//                     <h3 className="shop-card__title">{tour.title}</h3>

//                     <p className="shop-card__description">{tour.description}</p>

//                     <div className="shop-card__meta">
//                       <div className="shop-card__size">
//                         <IoResize />
//                         <span>{tour.size}</span>
//                       </div>
//                     </div>

//                     <div className="shop-card__bottom">
//                       <div className="shop-card__price">{tour.price}</div>

//                       <button
//                         type="button"
//                         className="shop-card__button"
//                         onClick={() => handleBookNow(tour)}>
//                         <span>Add to cart</span>
//                         <FaShoppingBag />
//                       </button>
//                     </div>
//                   </div>
//                 </article>
//               </SwiperSlide>
//             ))}
//           </Swiper>

//           {/* NAVIGATION */}
//           <div className="shop-navigation">
//             <button
//               type="button"
//               className="shop-prev"
//               aria-label="Previous product">
//               ←
//             </button>

//             <button
//               type="button"
//               className="shop-next"
//               aria-label="Next product">
//               →
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Shop;



import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { collection, getDocs, limit, query } from "firebase/firestore";
import {
    FiArrowRight,
    FiCheck,
    FiChevronRight,
    FiPackage,
    FiSearch,
    FiShoppingBag,
    FiSliders,
    FiX,
} from "react-icons/fi";
import { FaGift } from "react-icons/fa6";
import { IoResize } from "react-icons/io5";

import tourData from "../../../../data/Shop.json";
import { CartContext } from "../../../../context/CartContext";
import { db } from "../../../../firebase";
import { useAuth } from "../../../account/AuthContext";

import "./shop.scss";

const getNumericPrice = (price) => {
    if (typeof price === "number") return price;

    const normalized = String(price ?? "")
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "");

    const result = Number.parseFloat(normalized);

    return Number.isFinite(result) ? result : 0;
};

const Shop = () => {
    const { cartItems = [], addToCart } = useContext(CartContext);
    const { user } = useAuth();

    const [hasPreviousOrder, setHasPreviousOrder] = useState(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("default");

    const products = useMemo(() => tourData, []);

    useEffect(() => {
        let active = true;

        const checkOrders = async () => {
            if (!user?.uid) {
                setHasPreviousOrder(null);
                return;
            }

            setHasPreviousOrder(null);

            try {
                const ordersRef = collection(
                    db,
                    "users",
                    user.uid,
                    "orders"
                );

                const snapshot = await getDocs(
                    query(ordersRef, limit(1))
                );

                if (active) {
                    setHasPreviousOrder(!snapshot.empty);
                }
            } catch (error) {
                console.error("Error checking orders:", error);
                if (active) setHasPreviousOrder(null);
            }
        };

        checkOrders();

        return () => {
            active = false;
        };
    }, [user?.uid]);

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();

        const result = products.filter((product) => {
            const searchableText = [
                product.title,
                product.description,
                product.size,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(term);
        });

        if (sortBy === "price-low") {
            result.sort(
                (a, b) =>
                    getNumericPrice(a.price) -
                    getNumericPrice(b.price)
            );
        }

        if (sortBy === "price-high") {
            result.sort(
                (a, b) =>
                    getNumericPrice(b.price) -
                    getNumericPrice(a.price)
            );
        }

        if (sortBy === "name") {
            result.sort((a, b) =>
                String(a.title).localeCompare(String(b.title))
            );
        }

        return result;
    }, [products, search, sortBy]);

    const isInCart = (productId) =>
        cartItems.some(
            (item) => String(item.id) === String(productId)
        );

    const handleAddToCart = (product) => {
        if (isInCart(product.id)) {
            toast.info("Item already in cart!");
            return;
        }

        addToCart({
            ...product,
            quantity: 1,
        });

        toast.success("Item added to cart!");
    };

    const clearFilters = () => {
        setSearch("");
        setSortBy("default");
    };

    return (
        <main className="shop-page">
            <div
                className="shop-page__ambient shop-page__ambient--one"
                aria-hidden="true"
            />
            <div
                className="shop-page__ambient shop-page__ambient--two"
                aria-hidden="true"
            />

            <div className="container shop-page__container">
                {/* BREADCRUMBS */}
                {/* <nav
                    className="shop-breadcrumbs"
                    aria-label="Breadcrumb"
                >
                    <Link to="/">Home</Link>
                    <FiChevronRight />
                    <span aria-current="page">Shop</span>
                </nav> */}

                {/* HERO */}
                <header className="shop-hero">
                    <div className="shop-hero__main">
                        {/* <div className="shop-hero__eyebrow">
                            <span className="shop-hero__eyebrow-line" />
                            OFFICIAL FITRACK STORE
                        </div> */}

                        <h1 className="shop-hero__title">
                            Gear for
                            <br />
                            <span>Every Move.</span>
                        </h1>

                        <p className="shop-hero__description">
                            More than just gear. A reminder to keep
                            moving, push your limits, and celebrate
                            every milestone. Discover official
                            FiTrack merchandise.
                        </p>

                        <div className="shop-hero__actions">
                            <a
                                href="#shop-products"
                                className="shop-hero__explore"
                            >
                                Explore collection
                                <FiArrowRight />
                            </a>

                            <Link
                                to="/cart"
                                className="shop-hero__cart"
                            >
                                <FiShoppingBag />
                                <span>My cart</span>
                                <span className="shop-hero__cart-count">
                                    {cartItems.reduce(
                                        (total, item) =>
                                            total +
                                            (Number(item.quantity) || 1),
                                        0
                                    )}
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* <div className="shop-hero__visual" aria-hidden="true">
                        <div className="shop-hero__visual-ring shop-hero__visual-ring--outer" />
                        <div className="shop-hero__visual-ring shop-hero__visual-ring--inner" />

                        <div className="shop-hero__visual-content">
                            <span>MOVE.</span>
                            <span>TRACK.</span>
                            <span>REPEAT.</span>
                        </div>

                        <div className="shop-hero__visual-caption">
                            FITRACK / OFFICIAL GOODS
                        </div>
                    </div> */}
                </header>

                {/* PROMO */}
                {hasPreviousOrder === false && (
                    <div className="shop-promo">
                        <div className="shop-promo__icon">
                            <FaGift />
                        </div>

                        <div className="shop-promo__content">
                            <strong>First time shopping with us?</strong>
                            <span>
                                Discover the special bonuses available
                                with your first order.
                            </span>
                        </div>

                        <FiArrowRight className="shop-promo__arrow" />
                    </div>
                )}

                {/* CATALOG */}
                <section
                    className="shop-catalog"
                    id="shop-products"
                    aria-labelledby="shop-catalog-title"
                >
                    <div className="shop-catalog__heading">
                        <div>
                            <span className="shop-section-label">
                                THE COLLECTION
                            </span>

                            <h2 id="shop-catalog-title">
                                Shop <span>FiTrack.</span>
                            </h2>

                            <p>
                                Designed for the journey. Made for
                                those who never stop.
                            </p>
                        </div>

                        <div className="shop-catalog__count">
                            <FiPackage />
                            <span>
                                {products.length}{" "}
                                {products.length === 1
                                    ? "product"
                                    : "products"}
                            </span>
                        </div>
                    </div>

                    {/* TOOLBAR */}
                    <div className="shop-toolbar">
                        <div className="shop-toolbar__search">
                            <FiSearch />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search products..."
                                aria-label="Search products"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    <FiX />
                                </button>
                            )}
                        </div>

                        <div className="shop-toolbar__right">
                            <span className="shop-toolbar__results">
                                Showing {filteredProducts.length} of{" "}
                                {products.length}
                            </span>

                            <div className="shop-toolbar__sort">
                                <FiSliders />

                                <select
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(event.target.value)
                                    }
                                    aria-label="Sort products"
                                >
                                    <option value="default">
                                        Featured
                                    </option>
                                    <option value="price-low">
                                        Price: Low to High
                                    </option>
                                    <option value="price-high">
                                        Price: High to Low
                                    </option>
                                    <option value="name">
                                        Name: A to Z
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCTS */}
                    {filteredProducts.length > 0 ? (
                        <div className="shop-products">
                            {filteredProducts.map((product) => {
                                const inCart = isInCart(product.id);

                                return (
                                    <article
                                        className="shop-product"
                                        key={product.id}
                                    >
                                        <div className="shop-product__media">
                                            <span className="shop-product__tag">
                                                FITRACK ORIGINAL
                                            </span>

                                            <div className="shop-product__media-glow" />

                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="shop-product__body">
                                            <div className="shop-product__category">
                                                OFFICIAL MERCHANDISE
                                            </div>

                                            <h3 className="shop-product__title">
                                                {product.title}
                                            </h3>

                                            <p className="shop-product__description">
                                                {product.description}
                                            </p>

                                            {product.size && (
                                                <div className="shop-product__size">
                                                    <IoResize />
                                                    <span>
                                                        {product.size}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="shop-product__footer">
                                                <div className="shop-product__price">
                                                    <span>PRICE</span>
                                                    <strong>
                                                        {product.price}
                                                    </strong>
                                                </div>

                                                <button
                                                    type="button"
                                                    className={`shop-product__add ${
                                                        inCart
                                                            ? "shop-product__add--added"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleAddToCart(product)
                                                    }
                                                    disabled={inCart}
                                                >
                                                    {inCart ? (
                                                        <>
                                                            <FiCheck />
                                                            <span>Added</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiShoppingBag />
                                                            <span>
                                                                Add to cart
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="shop-empty">
                            <FiSearch />

                            <h3>No products found</h3>

                            <p>
                                Try another search or reset your
                                filters to see all products.
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </section>

                {/* BOTTOM BANNER */}
                <section className="shop-outro">
                    <div className="shop-outro__content">
                        <span>THE FITRACK MINDSET</span>
                        <h2>
                            Every move
                            <br />
                            <em>matters.</em>
                        </h2>
                        <p>
                            Running, cycling, training or exploring.
                            Whatever moves you, make it count.
                        </p>
                    </div>

                    <Link to="/lens" className="shop-outro__link">
                        Explore activities
                        <FiArrowRight />
                    </Link>
                </section>
            </div>
        </main>
    );
};

export default Shop;
