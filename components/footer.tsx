import Link from "next/link"
import Image from "next/image"
import type { FC } from "react"

const Footer: FC = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 py-6 text-center bg-transparent text-white z-9 w-fit mx-auto">
            <Link
                href="https://omargpax.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <span>Developed by</span>
                <Image
                    alt="omargpax"
                    src="https://creator-badge.vercel.app/start.png"
                    width={20}
                    height={20}
                />
            </Link>
        </footer>
    )
}

export default Footer
