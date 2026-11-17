import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import { FiArrowRight, FiArrowUpRight, FiChevronLeft, FiChevronRight, FiShoppingBag } from "react-icons/fi";
import { toast } from "react-toastify";
import { CartContext } from "../../../../context/CartContext";
import productsData from "../../../../data/Shop.json";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ShopPreview.scss";

const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

const formatPrice = (price) => {
    if (typeof price === "number") return `${price.toLocaleString("uk-UA")} ₴`;
    const value = String(price ?? "").trim();
    return value ? (/[₴]|грн|uah/i.test(value) ? value : `${value} ₴`) : "View details";
};

export default function ShopPreview() {
    const { cartItems = [], addToCart } = useContext(CartContext);
    const products = useMemo(() => shuffle(Array.isArray(productsData) ? productsData : []).slice(0, 8), []);

    const handleBuyNow = (product) => {
        const alreadyInCart = cartItems.some((item) => String(item.id) === String(product.id));
        if (alreadyInCart) {
            toast.info("This product is already in your cart!");
            return;
        }
        addToCart({ ...product, quantity: 1 });
        toast.success(`${product.title} added to cart!`);
    };

    if (!products.length) return null;

    return (
        <section className="ft-shop-preview" aria-labelledby="ft-shop-preview-title">
            <div className="ft-shop-preview__inner">
                <header className="ft-shop-preview__header">
                    <div className="ft-shop-preview__intro">
                        {/* <span className="ft-shop-preview__eyebrow"><span /> OFFICIAL FITRACK STORE</span> */}
                        <h2 id="ft-shop-preview-title">Made for <em>every move.</em></h2>
                        {/* <p>Small details. Big motivation. Discover gear made for your journey.</p> */}
                    </div>
                    <Link className="ft-shop-preview__all" to="/shop">
                        Explore shop <FiArrowUpRight aria-hidden="true" />
                    </Link>
                </header>

                <div className="ft-shop-preview__slider">
                    <Swiper
                        modules={[Navigation, A11y]}
                        spaceBetween={14}
                        slidesPerView={1.15}
                        grabCursor
                        loop={true}
                        navigation={{ prevEl: ".ft-shop-preview__prev", nextEl: ".ft-shop-preview__next" }}
                        pagination={{ clickable: true, el: ".ft-shop-preview__pagination" }}
                        breakpoints={{
                            480: { slidesPerView: 1.6, spaceBetween: 16 },
                            700: { slidesPerView: 2.2, spaceBetween: 18 },
                            1024: { slidesPerView: 3, spaceBetween: 20 },
                        }}
                        className="ft-shop-preview__swiper"
                    >
                        {products.map((product, index) => (
                            <SwiperSlide key={`${product.id ?? product.title}-${index}`}>
                                <article className="ft-shop-preview__card">
                                    <div className="ft-shop-preview__visual">
                                        <span className="ft-shop-preview__category">FITRACK GEAR</span>
                                        {product.image && (
                                            <img src={product.image} alt={product.title || "FiTrack product"} loading="lazy" />
                                        )}
                                        <button
                                            type="button"
                                            className="ft-shop-preview__buy"
                                            onClick={() => handleBuyNow(product)}
                                            aria-label={`Add ${product.title || "product"} to cart`}
                                            title="Add to cart"
                                        >
                                            <FiShoppingBag aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="ft-shop-preview__details">
                                        <div>
                                            <h3>{product.title}</h3>
                                            {product.size && <span className="ft-shop-preview__size">{product.size}</span>}
                                        </div>
                                        <strong>{formatPrice(product.price)}</strong>
                                    </div>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <footer className="ft-shop-preview__footer">
                    <div className="ft-shop-preview__pagination" />
                    <div className="ft-shop-preview__controls">
                        <button type="button" className="ft-shop-preview__prev" aria-label="Previous products"><FiChevronLeft /></button>
                        <button type="button" className="ft-shop-preview__next" aria-label="Next products"><FiChevronRight /></button>
                    </div>
                </footer>
                <Link to="/shop" className="ft-shop-preview__mobile-link">View all products <FiArrowRight /></Link>
            </div>
        </section>
    );
}
