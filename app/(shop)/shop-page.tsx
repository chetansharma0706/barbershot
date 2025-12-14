import ShopView from "./shopPage"; // UI component
import { useShop } from "./shopContext";


export default async function ShopRouter() {
  const shop = useShop()

  return <ShopView shop={shop} />;
}
