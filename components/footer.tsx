"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { LogoMark } from "@/components/logo-mark"

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap", "API"],
  Resources: ["Documentation", "Guides", "Blog", "Community", "Templates"],
  Company: ["About", "Careers", "Press", "Partners", "Contact"],
  Legal: ["Privacy", "Terms", "Security", "Cookies", "Licenses"],
}

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <footer ref={ref} className="border-t border-[#122B1A] bg-[#000000]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-8"
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <LogoMark />
              <span className="font-semibold text-white">Validate IQ</span>
            </a>
            <p className="text-sm text-[#6B7280] mb-4">Stop guessing. Start Validating.</p>
            {/* System Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050F09] border border-[#122B1A]">
              <span className="w-2 h-2 rounded-full bg-[#059669] pulse-glow" />
              <span className="text-xs text-[#6B7280]">All Systems Operational</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[#6B7280] hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-[#122B1A] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-[#6B7280]">&copy; {new Date().getFullYear()} Validate IQ, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[#6B7280] hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-[#6B7280] hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="text-sm text-[#6B7280] hover:text-white transition-colors">
              Discord
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
