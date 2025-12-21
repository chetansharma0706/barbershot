import { getChairs } from "@/app/actions/fetchChairs";
import ChairsPage from "./ChairManagement"

const page = async () => {
  
    const chairsPromise = getChairs();
    return (
        <ChairsPage chairsPromise={chairsPromise} />
    );
}

export default page;