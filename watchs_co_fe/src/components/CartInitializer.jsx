import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCartState, fetchCart, mergeCart } from "@/features/cart/cartSlice";
import { clearWishlist } from "@/features/wishlist/wishlistSlice";
import { logout } from "@/features/auth/authSlice";
import { selectSessionKey } from "@/utils/sessionIdentity";

const CartInitializer = () => {
  const dispatch = useDispatch();
  const { user, status, authStatus } = useSelector(state => state.auth);
  const ownerKey = useSelector(selectSessionKey);
  const ready = status === "succeeded" && authStatus !== "loading";

  useEffect(() => {
    dispatch(clearCartState({ ownerKey }));
    dispatch(clearWishlist({ ownerKey }));
  }, [dispatch, ownerKey]);

  useEffect(() => {
    if (!ready) return;
    if (user?.id) {
      dispatch(mergeCart()).then(action => {
        if (mergeCart.rejected.match(action) && !action.meta.condition) dispatch(fetchCart());
      });
    } else {
      dispatch(fetchCart());
    }
  }, [dispatch, ownerKey, ready, user?.id]);

  useEffect(() => {
    const expired = () => dispatch(logout());
    window.addEventListener("mechora:session-expired", expired);
    return () => window.removeEventListener("mechora:session-expired", expired);
  }, [dispatch]);
  return null;
};
export default CartInitializer;
