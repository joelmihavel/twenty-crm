"use client";

import { ArrowLeft, HomeLine } from "@untitledui/icons";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";

export default function NotFound() {
    const router = useRouter();

    return (
        <section className="flex min-h-screen items-center justify-center bg-primary px-4 md:px-8">
            <EmptyState size="lg">
                <EmptyState.Header>
                    <EmptyState.Illustration type="cloud" color="gray" />
                </EmptyState.Header>
                <EmptyState.Content>
                    <span className="text-sm font-semibold text-brand-secondary">404 error</span>
                    <EmptyState.Title>Page not found</EmptyState.Title>
                    <EmptyState.Description>
                        Sorry, the page you are looking for does not exist or has been moved.
                    </EmptyState.Description>
                </EmptyState.Content>
                <EmptyState.Footer>
                    <Button
                        color="secondary"
                        size="lg"
                        iconLeading={ArrowLeft}
                        onClick={() => router.back()}
                    >
                        Go back
                    </Button>
                    <Button
                        size="lg"
                        iconLeading={HomeLine}
                        onClick={() => router.push("/")}
                    >
                        Take me home
                    </Button>
                </EmptyState.Footer>
            </EmptyState>
        </section>
    );
}
