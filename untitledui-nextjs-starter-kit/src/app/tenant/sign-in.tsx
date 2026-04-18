"use client";

import { useState } from "react";
import {
    ArrowRight,
    Building02,
    CreditCard02,
    Eye,
    EyeOff,
    Home01,
    Lock01,
    Mail01,
    Users01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export function SignInScreen() {
    const [email, setEmail] = useState("alex@flemp.in");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);

    return (
        <div className="flex min-h-dvh">
            {/* Left — brand panel */}
            <div className="hidden w-[480px] shrink-0 flex-col justify-between bg-brand-section p-10 lg:flex">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-white/15"><Home01 className="size-5 text-fg-white" /></div>
                    <span className="text-md font-semibold text-primary_on-brand">Flemp</span>
                </div>
                <div>
                    <p className="text-display-sm font-semibold text-primary_on-brand">Manage your rental operations with confidence.</p>
                    <p className="mt-4 text-md text-secondary_on-brand">Track properties, tenants, payments, and contracts — all in one place.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <FeaturedIcon icon={Building02} color="brand" theme="dark" size="sm" />
                        <p className="text-sm text-secondary_on-brand">11 properties across Bangalore</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <FeaturedIcon icon={Users01} color="brand" theme="dark" size="sm" />
                        <p className="text-sm text-secondary_on-brand">14 active tenants managed</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <FeaturedIcon icon={CreditCard02} color="brand" theme="dark" size="sm" />
                        <p className="text-sm text-secondary_on-brand">₹23L+ revenue tracked this year</p>
                    </div>
                </div>
                <p className="text-xs text-tertiary_on-brand">&copy; 2026 Flemp. All rights reserved.</p>
            </div>

            {/* Right — sign-in form */}
            <div className="flex flex-1 items-center justify-center bg-primary px-6">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-secondary lg:hidden"><Home01 className="size-6 text-fg-white" /></div>
                        <h1 className="mt-4 text-display-xs font-semibold text-primary lg:mt-0">Sign in to Flemp</h1>
                        <p className="mt-2 text-sm text-tertiary">Enter your credentials to access your dashboard.</p>
                    </div>

                    <div className="mt-8 flex flex-col gap-5">
                        <Input label="Email" placeholder="you@company.com" icon={Mail01} value={email} onChange={setEmail} type="email" size="md" />
                        <div className="relative">
                            <Input
                                label="Password"
                                placeholder="Enter your password"
                                icon={Lock01}
                                value={password}
                                onChange={setPassword}
                                type={showPassword ? "text" : "password"}
                                size="md"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] rounded p-0.5 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-secondary"
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                        <Checkbox label="Remember me" isSelected={remember} onChange={setRemember} size="sm" />
                        <Button color="link-color" size="sm">Forgot password?</Button>
                    </div>

                    {/* Plain <a> link — works without JS hydration */}
                    <a
                        href="/tenant/dashboard"
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 py-2.5 text-md font-semibold text-white shadow-xs transition duration-100 ease-linear hover:bg-brand-solid_hover active:bg-brand-solid_hover"
                    >
                        Sign in <ArrowRight className="size-5" />
                    </a>

                    <div className="relative my-6 flex items-center"><div className="flex-1 border-t border-secondary" /><span className="mx-3 text-xs text-quaternary">or</span><div className="flex-1 border-t border-secondary" /></div>

                    <a
                        href="/tenant/dashboard"
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2.5 text-md font-semibold text-secondary shadow-xs transition duration-100 ease-linear hover:bg-primary_hover active:bg-primary_hover"
                    >
                        Sign in with Google
                    </a>

                    <p className="mt-8 text-center text-sm text-tertiary">
                        Don&apos;t have an account? <Button color="link-color" size="sm">Contact admin</Button>
                    </p>
                    <p className="mt-4 text-center text-xs text-quaternary">v2-mobile-apr10</p>
                </div>
            </div>
        </div>
    );
}
