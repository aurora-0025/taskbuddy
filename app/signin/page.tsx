"use client";

import { FcGoogle } from "react-icons/fc";
import { TbClipboardText } from "react-icons/tb";
import mobileBgOnboarding from "../../public/mobile_bg_onboard.png";
import tabletBgOnboarding from "../../public/tablet_bg_onboarding.png";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);
    const router = useRouter();

    useEffect(() => {
      if (user) {
        return router.push("/");
      }
    }, [user])
    

    if (error) {
        return (
            <div>
                <p>Error: {error.message}</p>
            </div>
        );
    }
    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="relative flex h-full w-screen flex-1 flex-col items-center justify-center bg-[#FFF9F9] sm:flex-row">
            <div
                style={{ backgroundImage: `url("${mobileBgOnboarding.src}")` }}
                className="absolute top-0 h-[90vh] w-full bg-cover sm:hidden"
            ></div>
            <div className="flex w-full flex-col items-center justify-center">
                <div className="flex max-w-[400px] flex-col gap-6 p-9">
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center gap-2 text-[#7B1984] sm:justify-start">
                            <TbClipboardText className="h-full w-[30px]" />
                            <h1 className="text-3xl font-bold"> Task Buddy</h1>
                        </div>
                        <p className="text-base font-medium">
                            Streamline your workflow and track progress
                            effortlessly with our all-in-one task management
                            app.
                        </p>
                    </div>
                    <button
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#292929] px-3 py-2 text-white"
                        onClick={() => signInWithGoogle()}
                    >
                        <FcGoogle />
                        Continue With Google
                    </button>
                </div>
            </div>
            <div className="relative hidden h-full w-full sm:block">
                <div
                    style={{ backgroundImage: `url("${tabletBgOnboarding.src}")` }}
                    className="absolute top-[50%] right-0 hidden h-[90vh] w-full -translate-y-[50%] bg-contain bg-right bg-no-repeat sm:block"
                ></div>
            </div>
        </div>
    );
}
