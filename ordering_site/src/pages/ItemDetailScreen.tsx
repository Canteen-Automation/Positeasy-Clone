import React from 'react';
import type { FoodItem } from '../types';
import { useParams } from 'react-router-dom';
import { AlertCircle, Star } from 'lucide-react';
import Header from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useFood } from '../contexts/FoodContext';
import CartTab from '../components/CartTab';
import { VegNonVegIcon } from '../components/ItemCard';
import './ItemDetailScreen.css';

const ItemDetailScreen: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { cart, addToCart, updateQuantity, getItemQuantity, toggleParcel } = useCart();
  const { foodItems, isLoading: isGlobalLoading } = useFood();
  const [fetchedItem, setFetchedItem] = React.useState<FoodItem | null>(null);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isParcel, setIsParcel] = React.useState(false);
  
  const contextItem = foodItems.find((i) => i.id === itemId);
  const item = contextItem || fetchedItem;

  const cartItem = cart.find((i) => i.id === itemId);
  React.useEffect(() => {
    if (cartItem) {
      setIsParcel(!!cartItem.isParcel);
    }
  }, [cartItem]);

  React.useEffect(() => {
    if (!contextItem && itemId) {
      const fetchItem = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`http://${window.location.hostname}:8080/api/products/${itemId}`);
          if (response.ok) {
            const data = await response.json();
            
            // Map backend product to FoodItem type
            const rawImg = data.imageData?.trim();
            const finalImage = rawImg ? (rawImg.startsWith('data:') ? rawImg : `data:image/png;base64,${rawImg}`) : '';
            
            const stallInfo = data.stalls && data.stalls.length > 0 ? data.stalls[0] : null;
            
            // Fetch product rating stats as well
            let finalRating = 5.0;
            let finalRatingCount = 0;
            try {
              const token = localStorage.getItem('token');
              const statsRes = await fetch(`http://${window.location.hostname}:8080/api/feedback/item-stats?productName=${encodeURIComponent(data.name)}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
              });
              if (statsRes.ok) {
                const statsData = await statsRes.json();
                finalRating = statsData.averageRating || 5.0;
                finalRatingCount = statsData.totalReviews || 0;
              }
            } catch (statsErr) {
              console.error('Error fetching individual product feedback stats:', statsErr);
            }

            const mappedItem: FoodItem = {
              id: data.id.toString(),
              name: data.name,
              description: data.description || 'Quality food prepared with care',
              price: data.price || data.basePrice || 0,
              category: data.category,
              image: finalImage,
              isVeg: data.veg,
              isPopular: data.active,
              stock: data.stock,
              stallId: stallInfo?.id?.toString(),
              stallName: stallInfo?.name,
              rating: finalRating,
              ratingCount: finalRatingCount,
              parcellable: data.parcellable
            };
            setFetchedItem(mappedItem);
          }
        } catch (err) {
          console.error('Error fetching individual product:', err);
        } finally {
          setIsFetching(false);
        }
      };
      fetchItem();
    }
  }, [itemId, contextItem]);

  if (isGlobalLoading || isFetching || !item) {
    if (isGlobalLoading || isFetching) {
      return (
        <div className="container item-loading-wrapper">
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner"></div>
            <p>Loading Delights...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="container item-not-found-wrapper">
        <Header />
        <div className="not-found-content">
          <AlertCircle size={64} className="not-found-icon" />
          <h2>Item Not Found</h2>
          <p>Oops! The item you're looking for seems to have vanished.</p>
          <button className="back-home-btn" onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  const quantity = getItemQuantity(item.id);
  const isLimitReached = item.stock !== undefined && quantity >= item.stock && item.stock > 0;

  // Visual helper values matching mockup metadata
  const rating = item.rating !== undefined ? item.rating : 5.0;
  const ratingCount = item.ratingCount !== undefined ? item.ratingCount : 0;

  return (
    <div className={`container item-detail-page ${item.stock === 0 ? 'out-of-stock' : ''}`}>
      <div className="detail-header-overlay">
        <Header title="" showCart={false} />
      </div>
      
      <main className="safe-area-bottom">
        <div className="item-hero">
          {item.image ? (
            <img src={item.image} alt={item.name} className="item-hero-image" />
          ) : (
            <div className="item-hero-placeholder">
              <span className="placeholder-emoji">🍲</span>
            </div>
          )}
        </div>

        <div className="item-details-content">
          <div className="item-title-section">
            <div className="title-left">
              <div className="detail-title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <VegNonVegIcon isVeg={item.isVeg} />
                <h1 className="item-name-large" style={{ margin: 0 }}>{item.name}</h1>
              </div>
              <p className="item-subtitle" style={{ marginTop: '4px' }}>{item.stallName || 'Unknown Stall'}</p>
            </div>
            
            <div className="title-right" onClick={(e) => e.stopPropagation()}>
              <div className="detail-quantity-pill">
                <button 
                  onClick={() => updateQuantity(item.id, -1)} 
                  disabled={quantity === 0}
                  className="qty-btn"
                >−</button>
                <span className="qty-val">{quantity}</span>
                <button 
                  onClick={() => addToCart(item, isParcel)} 
                  disabled={isLimitReached || item.stock === 0}
                  className="qty-btn"
                >+</button>
              </div>
            </div>
          </div>

          {ratingCount > 0 ? (
            <div className="detail-badges-row">
              <div className="badge-item star">
                <Star size={14} fill="currentColor" />
                <span>{rating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})</span>
              </div>
            </div>
          ) : (
            <div className="detail-badges-row">
              <div className="badge-item star empty-rating">
                <Star size={14} className="text-slate-300" />
                <span>No reviews yet</span>
              </div>
            </div>
          )}

          <div className="item-description-section">
            <p className="item-long-description">
              {item.longDescription || item.description || 'Quality food prepared with fresh ingredients, crafted with care for a premium taste experience.'}
            </p>
          </div>

          {item.parcellable && (
            <div className="item-parcel-option mb-5">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-all select-none">
                <input 
                  type="checkbox" 
                  checked={isParcel} 
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsParcel(checked);
                    if (quantity > 0) {
                      toggleParcel(item.id);
                    }
                  }} 
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-800">Parcel (+🅡5.00)</span>
              </label>
            </div>
          )}

          <div className="item-extra-info">
            <div className="info-row">
              <span className="info-label">Category</span>
              <span className="info-value">{item.category}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dietary</span>
              <span className="info-value">{item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Availability</span>
              <span className={`info-value ${item.stock && item.stock > 0 ? 'green' : 'red'}`}>
                {item.stock && item.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          {isLimitReached && (
            <div className="limit-reached-info">
              <AlertCircle size={18} />
              <span>You have reached the maximum available quantity for this item.</span>
            </div>
          )}
        </div>
      </main>

      <footer className="item-footer">
        <div className="footer-price-info">
          <span className="total-label">Total amount</span>
          <span className="total-value">🅡{((item.price + (isParcel ? 5 : 0)) * Math.max(1, quantity)).toFixed(2)}</span>
        </div>
        
        <div className="footer-action">
          <button 
            className="primary-action-button"
            onClick={() => {
              if (quantity === 0) {
                addToCart(item, isParcel);
              } else {
                // Already in cart, go to cart screen or show visual confirmation
                window.history.back();
              }
            }}
            disabled={item.stock === 0}
          >
            {item.stock === 0 ? 'Sold Out' : 'Add to cart'}
          </button>
        </div>
      </footer>
      <CartTab />
    </div>
  );
};

export default ItemDetailScreen;
