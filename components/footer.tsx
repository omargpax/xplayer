import Link from "next/link"
import Image from "next/image"
import type { FC } from "react"

const Footer: FC = () => {
    return (
        <footer className="py-6 text-center mt-auto bg-transparent">
            <Link
                href="https://omargpax.vercel.app"
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