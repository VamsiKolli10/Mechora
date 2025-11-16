import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "@/features/cart/cartSlice";

// Component to initialize cart on app load
const CartInitializer = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch cart when component mounts or when user changes
    if (!cart) {
      dispatch(fetchCart());
    }
  }, [dispatch, cart, user]);

  return null; // This component doesn't render anything
};

export default CartInitializer;

