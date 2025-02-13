import { auth } from "@/lib/firebase";
import { useSignOut } from "react-firebase-hooks/auth";
import { Button } from "./ui/button";
import { FaSpinner } from "react-icons/fa6";
import { LogOutIcon } from "lucide-react";

export default function SignOut() {
    const [signOut, loading] = useSignOut(auth);

    if (loading) {
        return <p>Loading...</p>;
    }
    return (
        <Button
            variant={"secondary"}
            className="w-full px-5 flex items-center gap-2 font-semibold rounded-lg bg-[#FFF9F9] border-1 border-[#7B198415] text-["
            onClick={async () => {
                await signOut();
            }}
        >
            {loading && <FaSpinner className="animate-spin" /> }
            <LogOutIcon/>
            Sign out
        </Button>
    );
}
