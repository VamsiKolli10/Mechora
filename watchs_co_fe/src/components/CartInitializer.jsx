import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "@/features/cart/cartSlice";

// Component to initialize cart on app load
const CartInitializer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, user?.id]);

  return null; // This component doesn't render anything
};

export default CartInitializer;
