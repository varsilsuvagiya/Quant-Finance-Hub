import Link from "next/link";
import { Github, Linkedin, User } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span className="text-sm">
              Developed by{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Varsil Suvagiya
              </span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/varsilsuvagiya"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm">GitHub</span>
            </Link>

            <Link
              href="https://www.linkedin.com/in/varsil-suvagiya/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span className="text-sm">LinkedIn</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Quant Finance Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
