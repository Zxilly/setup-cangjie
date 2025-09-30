import "source-map-support/register";
import { action } from "./action";

if (require.main === module) {
  action();
}
